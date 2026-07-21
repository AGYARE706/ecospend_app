package com.ecospend.expense.services;

import com.ecospend.expense.client.GrokClient;
import com.ecospend.expense.client.VaultClient;
import com.ecospend.expense.dto.TransactionSummaryResponse;
import com.ecospend.expense.models.BudgetEnvelope;
import com.ecospend.expense.models.IncomeTarget;
import com.ecospend.expense.models.SavingsGoal;
import com.ecospend.expense.models.Transaction;
import com.ecospend.expense.repository.BudgetEnvelopeRepository;
import com.ecospend.expense.repository.IncomeTargetRepository;
import com.ecospend.expense.repository.SavingsGoalRepository;
import com.ecospend.expense.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Defines and executes the real-data "tools" the AI coach can call. Every
 * execution method is scoped to a userId supplied by the caller (from the
 * authenticated request) — tool input from the model is never trusted to
 * carry its own user identity, so the model cannot query anyone else's data.
 */
@Service
public class CoachToolService {

    public static final String GET_SPENDING_SUMMARY = "get_spending_summary";
    public static final String GET_BUDGET_STATUS = "get_budget_status";
    public static final String LIST_RECENT_TRANSACTIONS = "list_recent_transactions";
    public static final String GET_GOALS_PROGRESS = "get_goals_progress";
    public static final String GET_INCOME_TARGET_STATUS = "get_income_target_status";
    public static final String GET_VAULT_SUMMARY = "get_vault_summary";

    private final TransactionRepository transactionRepository;
    private final BudgetEnvelopeRepository budgetEnvelopeRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final IncomeTargetRepository incomeTargetRepository;
    private final VaultClient vaultClient;

    public CoachToolService(TransactionRepository transactionRepository,
            BudgetEnvelopeRepository budgetEnvelopeRepository,
            SavingsGoalRepository savingsGoalRepository,
            IncomeTargetRepository incomeTargetRepository,
            VaultClient vaultClient) {
        this.transactionRepository = transactionRepository;
        this.budgetEnvelopeRepository = budgetEnvelopeRepository;
        this.savingsGoalRepository = savingsGoalRepository;
        this.incomeTargetRepository = incomeTargetRepository;
        this.vaultClient = vaultClient;
    }

    public List<GrokClient.ToolSpec> tools() {
        return List.of(
                new GrokClient.ToolSpec(
                        GET_SPENDING_SUMMARY,
                        "Get total income, total expense, net balance and transaction count for a "
                                + "given month. Call this when the user asks about overall spending/income for a "
                                + "specific or the current month. Defaults to the current month/year if omitted.",
                        objectSchema(Map.of(
                                "month", property("integer", "Month number 1-12. Defaults to the current month."),
                                "year", property("integer", "Four-digit year. Defaults to the current year.")))),
                new GrokClient.ToolSpec(
                        GET_BUDGET_STATUS,
                        "Get every budget envelope (category, monthly limit, amount spent so far, "
                                + "percent used) for the current month. Call this whenever the user asks whether "
                                + "they are on track, over budget, or overspending in any category.",
                        objectSchema(Map.of())),
                new GrokClient.ToolSpec(
                        LIST_RECENT_TRANSACTIONS,
                        "List the user's most recent transactions, newest first, optionally filtered "
                                + "to one category. Call this when the user asks about specific recent purchases "
                                + "or wants examples backing up a spending claim.",
                        objectSchema(Map.of(
                                "category", property("string", "Only include transactions in this category. Omit for all categories."),
                                "limit", property("integer", "Max transactions to return. Defaults to 10.")))),
                new GrokClient.ToolSpec(
                        GET_GOALS_PROGRESS,
                        "Get every savings goal (name, target amount, current amount, deadline, days "
                                + "remaining, completed flag). Call this when the user asks about savings goals or "
                                + "whether they are on track to reach one.",
                        objectSchema(Map.of())),
                new GrokClient.ToolSpec(
                        GET_INCOME_TARGET_STATUS,
                        "Get the user's expected monthly income target versus their actual recorded "
                                + "income so far this month. Call this when the user asks about income, pay, or "
                                + "whether they're earning what they expect.",
                        objectSchema(Map.of())),
                new GrokClient.ToolSpec(
                        GET_VAULT_SUMMARY,
                        "Get the user's personal locked savings vaults and group (susu) vaults, with "
                                + "balances and targets. Call this when the user asks about their vaults, locked "
                                + "savings, or group susu contributions.",
                        objectSchema(Map.of())));
    }

    /** A JSON-Schema object node: {@code { "type": "object", "properties": {...} }}. */
    private static Map<String, Object> objectSchema(Map<String, Object> properties) {
        return Map.of("type", "object", "properties", properties);
    }

    /** A single JSON-Schema property: {@code { "type": <type>, "description": <desc> }}. */
    private static Map<String, Object> property(String type, String description) {
        return Map.of("type", type, "description", description);
    }

    public Object execute(String toolName, Map<String, Object> input, UUID userId) {
        return switch (toolName) {
            case GET_SPENDING_SUMMARY -> getSpendingSummary(input, userId);
            case GET_BUDGET_STATUS -> getBudgetStatus(userId);
            case LIST_RECENT_TRANSACTIONS -> listRecentTransactions(input, userId);
            case GET_GOALS_PROGRESS -> getGoalsProgress(userId);
            case GET_INCOME_TARGET_STATUS -> getIncomeTargetStatus(userId);
            case GET_VAULT_SUMMARY -> vaultClient.getSummaryJson(userId);
            default -> "Unknown tool: " + toolName;
        };
    }

    private Map<String, Object> getSpendingSummary(Map<String, Object> input, UUID userId) {
        LocalDate now = LocalDate.now();
        int month = intField(input, "month").orElse(now.getMonthValue());
        int year = intField(input, "year").orElse(now.getYear());
        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        TransactionSummaryResponse summary = FinanceAggregations.summarize(transactions, month, year);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("month", month);
        result.put("year", year);
        result.put("totalIncome", summary.totalIncome());
        result.put("totalExpense", summary.totalExpense());
        result.put("netBalance", summary.netBalance());
        result.put("transactionCount", summary.transactionCount());
        return result;
    }

    private List<Map<String, Object>> getBudgetStatus(UUID userId) {
        LocalDate now = LocalDate.now();
        return budgetEnvelopeRepository
                .findByUserIdAndMonthAndYear(userId, now.getMonthValue(), now.getYear()).stream()
                .map(this::envelopeToMap)
                .toList();
    }

    private Map<String, Object> envelopeToMap(BudgetEnvelope envelope) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("category", envelope.getCategory());
        m.put("monthlyLimit", envelope.getBudgetLimit());
        m.put("currentSpend", envelope.getCurrentSpent());
        BigDecimal percentUsed = envelope.getBudgetLimit() != null && envelope.getBudgetLimit().signum() > 0
                ? envelope.getCurrentSpent().multiply(BigDecimal.valueOf(100))
                        .divide(envelope.getBudgetLimit(), 0, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        m.put("percentUsed", percentUsed);
        m.put("month", envelope.getMonth());
        m.put("year", envelope.getYear());
        return m;
    }

    private List<Map<String, Object>> listRecentTransactions(Map<String, Object> input, UUID userId) {
        Optional<String> category = stringField(input, "category");
        int limit = intField(input, "limit").orElse(10);

        return transactionRepository.findByUserId(userId).stream()
                .filter(t -> category.isEmpty() || category.get().equalsIgnoreCase(t.getCategory()))
                .sorted(Comparator.comparing(Transaction::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(limit)
                .map(t -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("date", t.getCreatedAt() != null ? t.getCreatedAt().toLocalDate().toString() : null);
                    m.put("type", t.getType());
                    m.put("category", t.getCategory());
                    m.put("amount", t.getAmount());
                    m.put("notes", t.getNotes());
                    return m;
                })
                .toList();
    }

    private List<Map<String, Object>> getGoalsProgress(UUID userId) {
        LocalDate today = LocalDate.now();
        return savingsGoalRepository.findByUserId(userId).stream()
                .map(g -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", g.getName());
                    m.put("targetAmount", g.getTargetAmount());
                    m.put("currentAmount", g.getCurrentAmount());
                    m.put("deadline", g.getDeadline() != null ? g.getDeadline().toString() : null);
                    m.put("daysRemaining", g.getDeadline() != null ? ChronoUnit.DAYS.between(today, g.getDeadline()) : null);
                    m.put("completed", g.getCompletedAt() != null);
                    return m;
                })
                .toList();
    }

    private Map<String, Object> getIncomeTargetStatus(UUID userId) {
        BigDecimal target = incomeTargetRepository.findById(userId)
                .map(IncomeTarget::getMonthlyAmount)
                .orElse(BigDecimal.ZERO);
        LocalDate now = LocalDate.now();
        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        TransactionSummaryResponse summary = FinanceAggregations.summarize(transactions, now.getMonthValue(), now.getYear());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("monthlyTarget", target);
        result.put("actualIncomeThisMonth", summary.totalIncome());
        result.put("shortfall", target.subtract(summary.totalIncome()).max(BigDecimal.ZERO));
        return result;
    }

    private static Optional<Integer> intField(Map<String, Object> input, String key) {
        Object value = input.get(key);
        return value instanceof Number number ? Optional.of(number.intValue()) : Optional.empty();
    }

    private static Optional<String> stringField(Map<String, Object> input, String key) {
        Object value = input.get(key);
        return value instanceof String text ? Optional.of(text) : Optional.empty();
    }
}
