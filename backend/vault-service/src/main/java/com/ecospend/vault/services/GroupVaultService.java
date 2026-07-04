package com.ecospend.vault.services;

import com.ecospend.vault.dto.AmountRequest;
import com.ecospend.vault.dto.CreateGroupVaultRequest;
import com.ecospend.vault.dto.GroupVaultView;
import com.ecospend.vault.dto.WithdrawalRequestView;
import com.ecospend.vault.exceptions.VaultException;
import com.ecospend.vault.models.*;
import com.ecospend.vault.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Group Vault — a digital version of Ghana's traditional susu.
 *
 * 2-8 users pool savings toward a shared goal. Each member's
 * contributions are tracked on their own balance: withdrawals need
 * majority approval of active members, and a member who exits early
 * pays the 5% early-exit fee only on their own balance, so other
 * members' funds remain fully protected.
 */
@Service
@RequiredArgsConstructor
public class GroupVaultService {

    private final GroupVaultRepository groupRepository;
    private final GroupVaultMemberRepository memberRepository;
    private final GroupVaultTransactionRepository transactionRepository;
    private final GroupWithdrawalRequestRepository requestRepository;
    private final GroupWithdrawalVoteRepository voteRepository;

    @Transactional
    public GroupVaultView create(UUID userId, CreateGroupVaultRequest request) {
        GroupVault group = new GroupVault();
        group.setName(request.name());
        group.setCreatorId(userId);
        group.setTargetAmount(request.targetAmount());
        group.setLockedUntil(request.lockedUntil());
        group.setMaxMembers(request.maxMembers() != null ? request.maxMembers() : 8);
        group = groupRepository.save(group);

        GroupVaultMember creator = new GroupVaultMember();
        creator.setGroupId(group.getId());
        creator.setUserId(userId);
        memberRepository.save(creator);

        return view(group);
    }

    public List<GroupVaultView> findMine(UUID userId) {
        return memberRepository.findByUserId(userId).stream()
                .map(m -> view(groupRepository.findById(m.getGroupId()).orElseThrow()))
                .toList();
    }

    public GroupVaultView findOne(UUID userId, UUID groupId) {
        GroupVault group = requireGroup(groupId);
        requireMember(groupId, userId); // any member (incl. exited) can view
        return view(group);
    }

    public List<GroupVaultTransaction> findTransactions(UUID userId, UUID groupId) {
        requireMember(groupId, userId);
        return transactionRepository.findByGroupIdOrderByCreatedAtDesc(groupId);
    }

    @Transactional
    public GroupVaultView join(UUID userId, UUID groupId) {
        GroupVault group = requireGroup(groupId);
        requireActive(group);

        if (memberRepository.findByGroupIdAndUserId(groupId, userId).isPresent()) {
            throw VaultException.conflict("Already a member of this group vault");
        }
        if (memberRepository.countByGroupId(groupId) >= group.getMaxMembers()) {
            throw VaultException.conflict("Group vault is full (max " + group.getMaxMembers() + " members)");
        }

        GroupVaultMember member = new GroupVaultMember();
        member.setGroupId(groupId);
        member.setUserId(userId);
        memberRepository.save(member);
        return view(group);
    }

    @Transactional
    public GroupVaultView deposit(UUID userId, UUID groupId, AmountRequest request) {
        GroupVault group = requireGroup(groupId);
        requireActive(group);
        GroupVaultMember member = requireActiveMember(groupId, userId);

        member.setBalance(member.getBalance().add(request.amount()));
        memberRepository.save(member);
        record(groupId, userId, VaultTransaction.Type.DEPOSIT, request.amount(), request.note());
        return view(group);
    }

    /**
     * Early exit: no approval needed, the member takes their own balance
     * minus the 5% early-exit fee (2% sustainability fee after maturity).
     */
    @Transactional
    public GroupVaultView exit(UUID userId, UUID groupId) {
        GroupVault group = requireGroup(groupId);
        GroupVaultMember member = requireActiveMember(groupId, userId);

        BigDecimal balance = member.getBalance();
        if (balance.compareTo(BigDecimal.ZERO) > 0) {
            boolean early = LocalDate.now().isBefore(group.getLockedUntil());
            BigDecimal rate = early ? Fees.EARLY_EXIT_FEE_RATE : Fees.WITHDRAWAL_FEE_RATE;
            BigDecimal fee = Fees.feeOn(balance, rate);
            BigDecimal payout = balance.subtract(fee);

            record(groupId, userId,
                    early ? VaultTransaction.Type.PENALTY : VaultTransaction.Type.FEE,
                    fee, early ? "Early exit fee (5% of own balance)" : "Platform sustainability fee (2%)");
            record(groupId, userId, VaultTransaction.Type.WITHDRAWAL, payout, "Exit payout");
        }

        member.setBalance(BigDecimal.ZERO);
        member.setStatus(GroupVaultMember.Status.EXITED);
        memberRepository.save(member);

        // A leaving member's pending withdrawal requests are void
        requestRepository.findByGroupIdAndRequesterIdAndStatus(
                        groupId, userId, GroupWithdrawalRequest.Status.PENDING)
                .forEach(r -> {
                    r.setStatus(GroupWithdrawalRequest.Status.REJECTED);
                    requestRepository.save(r);
                });

        return view(group);
    }

    @Transactional
    public WithdrawalRequestView requestWithdrawal(UUID userId, UUID groupId, AmountRequest request) {
        GroupVault group = requireGroup(groupId);
        requireActive(group);
        GroupVaultMember member = requireActiveMember(groupId, userId);

        if (member.getBalance().compareTo(request.amount()) < 0) {
            throw VaultException.badRequest("Withdrawal exceeds your own balance in this group vault");
        }
        if (!requestRepository.findByGroupIdAndRequesterIdAndStatus(
                groupId, userId, GroupWithdrawalRequest.Status.PENDING).isEmpty()) {
            throw VaultException.conflict("You already have a pending withdrawal request");
        }

        GroupWithdrawalRequest wr = new GroupWithdrawalRequest();
        wr.setGroupId(groupId);
        wr.setRequesterId(userId);
        wr.setAmount(request.amount());
        wr = requestRepository.save(wr);

        // The requester implicitly approves their own request
        castVote(wr.getId(), userId, true);
        return evaluate(wr, group);
    }

    public List<WithdrawalRequestView> findWithdrawals(UUID userId, UUID groupId) {
        GroupVault group = requireGroup(groupId);
        requireMember(groupId, userId);
        return requestRepository.findByGroupIdOrderByCreatedAtDesc(groupId).stream()
                .map(r -> currentView(r, group))
                .toList();
    }

    @Transactional
    public WithdrawalRequestView vote(UUID userId, UUID groupId, UUID requestId, boolean approve) {
        GroupVault group = requireGroup(groupId);
        requireActiveMember(groupId, userId);

        GroupWithdrawalRequest wr = requestRepository.findById(requestId)
                .filter(r -> r.getGroupId().equals(groupId))
                .orElseThrow(VaultException::notFound);
        if (wr.getStatus() != GroupWithdrawalRequest.Status.PENDING) {
            throw VaultException.conflict("Withdrawal request is already " + wr.getStatus());
        }
        if (voteRepository.findByRequestIdAndVoterId(requestId, userId).isPresent()) {
            throw VaultException.conflict("You have already voted on this request");
        }

        castVote(requestId, userId, approve);
        return evaluate(wr, group);
    }

    // --- internals ---

    private void castVote(UUID requestId, UUID voterId, boolean approve) {
        GroupWithdrawalVote vote = new GroupWithdrawalVote();
        vote.setRequestId(requestId);
        vote.setVoterId(voterId);
        vote.setApprove(approve);
        voteRepository.save(vote);
    }

    /**
     * Executes the request once approvals form a strict majority of
     * active members; rejects it once that becomes impossible.
     */
    private WithdrawalRequestView evaluate(GroupWithdrawalRequest wr, GroupVault group) {
        long active = memberRepository.countByGroupIdAndStatus(
                group.getId(), GroupVaultMember.Status.ACTIVE);
        long approvals = voteRepository.countByRequestIdAndApprove(wr.getId(), true);
        long rejections = voteRepository.countByRequestIdAndApprove(wr.getId(), false);

        if (approvals * 2 > active) {
            execute(wr, group);
        } else if ((active - rejections) * 2 <= active) {
            wr.setStatus(GroupWithdrawalRequest.Status.REJECTED);
            requestRepository.save(wr);
        }
        return currentView(wr, group);
    }

    private void execute(GroupWithdrawalRequest wr, GroupVault group) {
        GroupVaultMember member = requireActiveMember(group.getId(), wr.getRequesterId());
        if (member.getBalance().compareTo(wr.getAmount()) < 0) {
            wr.setStatus(GroupWithdrawalRequest.Status.REJECTED);
            requestRepository.save(wr);
            return;
        }

        BigDecimal fee = Fees.feeOn(wr.getAmount(), Fees.WITHDRAWAL_FEE_RATE);
        BigDecimal payout = wr.getAmount().subtract(fee);

        member.setBalance(member.getBalance().subtract(wr.getAmount()));
        memberRepository.save(member);
        record(group.getId(), wr.getRequesterId(), VaultTransaction.Type.FEE,
                fee, "Platform sustainability fee (2%)");
        record(group.getId(), wr.getRequesterId(), VaultTransaction.Type.WITHDRAWAL,
                payout, "Approved withdrawal payout");

        wr.setStatus(GroupWithdrawalRequest.Status.EXECUTED);
        requestRepository.save(wr);
    }

    private WithdrawalRequestView currentView(GroupWithdrawalRequest wr, GroupVault group) {
        long active = memberRepository.countByGroupIdAndStatus(
                group.getId(), GroupVaultMember.Status.ACTIVE);
        return new WithdrawalRequestView(wr,
                voteRepository.countByRequestIdAndApprove(wr.getId(), true),
                voteRepository.countByRequestIdAndApprove(wr.getId(), false),
                active,
                active / 2 + 1);
    }

    private GroupVaultView view(GroupVault group) {
        List<GroupVaultMember> members = memberRepository.findByGroupId(group.getId());
        BigDecimal total = members.stream()
                .map(GroupVaultMember::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new GroupVaultView(group, members, total);
    }

    private GroupVault requireGroup(UUID groupId) {
        return groupRepository.findById(groupId).orElseThrow(VaultException::notFound);
    }

    private void requireActive(GroupVault group) {
        if (group.getStatus() != GroupVault.Status.ACTIVE) {
            throw VaultException.conflict("Group vault is " + group.getStatus());
        }
    }

    private GroupVaultMember requireMember(UUID groupId, UUID userId) {
        return memberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(VaultException::notFound);
    }

    private GroupVaultMember requireActiveMember(UUID groupId, UUID userId) {
        GroupVaultMember member = requireMember(groupId, userId);
        if (member.getStatus() != GroupVaultMember.Status.ACTIVE) {
            throw VaultException.conflict("You have exited this group vault");
        }
        return member;
    }

    private void record(UUID groupId, UUID userId, VaultTransaction.Type type,
                        BigDecimal amount, String note) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return; // fees on tiny amounts can round to 0.00; nothing to record
        }
        GroupVaultTransaction tx = new GroupVaultTransaction();
        tx.setGroupId(groupId);
        tx.setUserId(userId);
        tx.setType(type);
        tx.setAmount(amount);
        tx.setNote(note);
        transactionRepository.save(tx);
    }
}
