package com.ecospend.vault.services;

import com.ecospend.vault.client.IdentityClient;
import com.ecospend.vault.client.NotificationClient;
import com.ecospend.vault.client.PaymentClient;
import com.ecospend.vault.config.VaultTierPolicy;
import com.ecospend.vault.dto.AmountRequest;
import com.ecospend.vault.dto.ContributionPlanView;
import com.ecospend.vault.dto.CreateGroupVaultRequest;
import com.ecospend.vault.dto.GroupVaultView;
import com.ecospend.vault.dto.MemberPlanStatus;
import com.ecospend.vault.dto.WithdrawalRequestView;
import com.ecospend.vault.exceptions.VaultException;
import com.ecospend.vault.models.*;
import com.ecospend.vault.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupVaultService {

    private static final String INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final GroupVaultRepository groupRepository;
    private final GroupVaultMemberRepository memberRepository;
    private final GroupVaultTransactionRepository transactionRepository;
    private final GroupWithdrawalRequestRepository requestRepository;
    private final GroupWithdrawalVoteRepository voteRepository;
    private final GroupVaultInviteRepository inviteRepository;
    private final GroupVaultActivityRepository activityRepository;
    private final VaultTierPolicy vaultTierPolicy;
    private final PaymentClient paymentClient;
    private final IdentityClient identityClient;
    private final NotificationClient notificationClient;

    @Transactional
    public GroupVaultView create(UUID userId, String tier, CreateGroupVaultRequest request) {
        long memberships = memberRepository.countByUserIdAndStatus(userId, GroupVaultMember.Status.ACTIVE);
        vaultTierPolicy.assertCanJoinOrCreateGroup(tier, memberships);

        GroupVault group = new GroupVault();
        group.setName(request.name());
        group.setCreatorId(userId);
        group.setTargetAmount(request.targetAmount());
        group.setLockedUntil(request.lockedUntil());
        group.setMaxMembers(request.maxMembers() != null ? request.maxMembers() : 8);
        group.setContributionFrequency(normalizeFrequency(request.contributionFrequency()));
        group.setInviteCode(generateUniqueInviteCode());
        group = groupRepository.save(group);

        GroupVaultMember creator = new GroupVaultMember();
        creator.setGroupId(group.getId());
        creator.setUserId(userId);
        memberRepository.save(creator);

        activity(group.getId(), userId, GroupVaultActivity.Type.CREATED, "Group vault created", null);
        inviteMembers(group, userId, request.memberPhones());

        return view(group, userId);
    }

    /**
     * Resolves each invitee phone to a registered user (best-effort) and
     * persists a per-person invite record either way, so the admin can
     * always see who was invited and whether they've joined. Invitees who
     * already have an EcoSpend account are notified immediately with the
     * group's invite code; unresolved numbers simply stay PENDING with no
     * linked user until someone with that phone joins by code.
     */
    private void inviteMembers(GroupVault group, UUID inviterId, List<String> phones) {
        if (phones == null || phones.isEmpty()) {
            return;
        }
        List<String> cleaned = phones.stream()
                .filter(p -> p != null && !p.isBlank())
                .map(String::trim)
                .distinct()
                .toList();
        if (cleaned.isEmpty()) {
            return;
        }

        Map<String, IdentityClient.PhoneMatch> matches = identityClient.lookupByPhone(cleaned).stream()
                .collect(Collectors.toMap(IdentityClient.PhoneMatch::phoneNumber, m -> m));

        for (String phone : cleaned) {
            if (inviteRepository.findByGroupIdAndPhoneNumber(group.getId(), phone).isPresent()) {
                continue;
            }
            IdentityClient.PhoneMatch match = matches.get(phone);

            GroupVaultInvite invite = new GroupVaultInvite();
            invite.setGroupId(group.getId());
            invite.setInvitedBy(inviterId);
            invite.setPhoneNumber(phone);
            invite.setInvitedUserId(match != null ? match.userId() : null);
            inviteRepository.save(invite);

            activity(group.getId(), inviterId, GroupVaultActivity.Type.MEMBER_INVITED,
                    "Invited " + phone + " to join", null);

            if (match != null) {
                notificationClient.send(match.userId(),
                        "You're invited to a Group Vault",
                        "You've been invited to join \"" + group.getName() + "\" on EcoSpend. "
                                + "Use code " + group.getInviteCode() + " to join.",
                        "GROUP_VAULT_INVITE",
                        Map.of("groupVaultId", group.getId().toString(), "inviteCode", group.getInviteCode()));
            }
        }
    }

    public List<GroupVaultView> findMine(UUID userId) {
        return memberRepository.findByUserId(userId).stream()
                .map(m -> view(groupRepository.findById(m.getGroupId()).orElseThrow(), userId))
                .toList();
    }

    public GroupVaultView findOne(UUID userId, UUID groupId) {
        GroupVault group = requireGroup(groupId);
        requireMember(groupId, userId);
        return view(group, userId);
    }

    public GroupVaultView findByInviteCode(String inviteCode) {
        GroupVault group = groupRepository.findByInviteCodeIgnoreCase(inviteCode.trim())
                .orElseThrow(VaultException::notFound);
        return view(group, null);
    }

    public List<GroupVaultTransaction> findTransactions(UUID userId, UUID groupId) {
        requireMember(groupId, userId);
        return transactionRepository.findByGroupIdOrderByCreatedAtDesc(groupId);
    }

    @Transactional
    public GroupVaultView join(UUID userId, String tier, UUID groupId) {
        long memberships = memberRepository.countByUserIdAndStatus(userId, GroupVaultMember.Status.ACTIVE);
        vaultTierPolicy.assertCanJoinOrCreateGroup(tier, memberships);

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

        inviteRepository.findByGroupIdAndInvitedUserId(groupId, userId)
                .filter(invite -> invite.getStatus() == GroupVaultInvite.Status.PENDING)
                .ifPresent(invite -> {
                    invite.setStatus(GroupVaultInvite.Status.JOINED);
                    invite.setJoinedAt(OffsetDateTime.now());
                    inviteRepository.save(invite);
                });

        activity(groupId, userId, GroupVaultActivity.Type.MEMBER_JOINED,
                "A new member joined the group vault", null);
        notifyActiveMembers(groupId, userId, "New member joined",
                "Someone joined \"" + group.getName() + "\".",
                "GROUP_VAULT_ACTIVITY", Map.of("groupVaultId", groupId.toString()));

        return view(group, userId);
    }

    @Transactional
    public GroupVaultView joinByInviteCode(UUID userId, String tier, String inviteCode) {
        GroupVault group = groupRepository.findByInviteCodeIgnoreCase(inviteCode.trim())
                .orElseThrow(VaultException::notFound);
        return join(userId, tier, group.getId());
    }

    @Transactional
    public GroupVaultView deposit(UUID userId, UUID groupId, AmountRequest request) {
        GroupVault group = requireGroup(groupId);
        requireActive(group);
        GroupVaultMember member = requireActiveMember(groupId, userId);

        member.setBalance(member.getBalance().add(request.amount()));
        memberRepository.save(member);
        record(groupId, userId, VaultTransaction.Type.DEPOSIT, request.amount(), request.note());

        activity(groupId, userId, GroupVaultActivity.Type.CONTRIBUTION,
                String.format("Contributed GHS %.2f to the vault", request.amount()), request.amount());
        notifyActiveMembers(groupId, userId, "New contribution",
                String.format("A member contributed GHS %.2f to \"%s\".", request.amount(), group.getName()),
                "GROUP_VAULT_ACTIVITY", Map.of("groupVaultId", groupId.toString()));

        return view(group, userId);
    }

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

            // Net exit payout lands in the member's central wallet.
            paymentClient.creditWallet(userId, payout, "ecospend-gx-" + UUID.randomUUID(),
                    "Group vault exit — " + group.getName()
                            + (early ? " (net of 5% early fee)" : " (net of 2% fee)"));
        }

        member.setBalance(BigDecimal.ZERO);
        member.setStatus(GroupVaultMember.Status.EXITED);
        memberRepository.save(member);

        requestRepository.findByGroupIdAndRequesterIdAndStatus(
                        groupId, userId, GroupWithdrawalRequest.Status.PENDING)
                .forEach(r -> {
                    r.setStatus(GroupWithdrawalRequest.Status.REJECTED);
                    requestRepository.save(r);
                });

        activity(groupId, userId, GroupVaultActivity.Type.MEMBER_EXITED,
                "A member exited the group vault", balance.compareTo(BigDecimal.ZERO) > 0 ? balance : null);
        notifyActiveMembers(groupId, userId, "Member exited",
                "A member exited \"" + group.getName() + "\".",
                "GROUP_VAULT_ACTIVITY", Map.of("groupVaultId", groupId.toString()));

        return view(group, userId);
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

        activity(groupId, userId, GroupVaultActivity.Type.WITHDRAWAL_REQUESTED,
                String.format("Requested a withdrawal of GHS %.2f", request.amount()), request.amount());

        castVote(wr.getId(), userId, true);
        WithdrawalRequestView view = evaluate(wr, group, userId);

        if (view.request().getStatus() == GroupWithdrawalRequest.Status.PENDING) {
            notifyActiveMembers(groupId, userId, "Withdrawal vote needed",
                    String.format("A withdrawal of GHS %.2f from \"%s\" needs your vote.",
                            request.amount(), group.getName()),
                    "GROUP_VAULT_VOTE",
                    Map.of("groupVaultId", groupId.toString(), "requestId", wr.getId().toString()));
        }
        return view;
    }

    public List<WithdrawalRequestView> findWithdrawals(UUID userId, UUID groupId) {
        GroupVault group = requireGroup(groupId);
        requireMember(groupId, userId);
        return requestRepository.findByGroupIdOrderByCreatedAtDesc(groupId).stream()
                .map(r -> currentView(r, group, userId))
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
        activity(groupId, userId, GroupVaultActivity.Type.WITHDRAWAL_VOTE,
                approve ? "Approved a withdrawal request" : "Rejected a withdrawal request", null);
        return evaluate(wr, group, userId);
    }

    private String generateUniqueInviteCode() {
        for (int attempt = 0; attempt < 20; attempt++) {
            StringBuilder code = new StringBuilder(8);
            for (int i = 0; i < 8; i++) {
                code.append(INVITE_ALPHABET.charAt(SECURE_RANDOM.nextInt(INVITE_ALPHABET.length())));
            }
            String candidate = code.toString();
            if (!groupRepository.existsByInviteCodeIgnoreCase(candidate)) {
                return candidate;
            }
        }
        throw VaultException.conflict("Could not generate unique invite code");
    }

    private void castVote(UUID requestId, UUID voterId, boolean approve) {
        GroupWithdrawalVote vote = new GroupWithdrawalVote();
        vote.setRequestId(requestId);
        vote.setVoterId(voterId);
        vote.setApprove(approve);
        voteRepository.save(vote);
    }

    private WithdrawalRequestView evaluate(GroupWithdrawalRequest wr, GroupVault group, UUID viewerId) {
        long active = memberRepository.countByGroupIdAndStatus(
                group.getId(), GroupVaultMember.Status.ACTIVE);
        long approvals = voteRepository.countByRequestIdAndApprove(wr.getId(), true);
        long rejections = voteRepository.countByRequestIdAndApprove(wr.getId(), false);

        if (approvals * 2 > active) {
            execute(wr, group);
        } else if ((active - rejections) * 2 <= active) {
            wr.setStatus(GroupWithdrawalRequest.Status.REJECTED);
            requestRepository.save(wr);

            activity(group.getId(), wr.getRequesterId(), GroupVaultActivity.Type.WITHDRAWAL_REJECTED,
                    String.format("Withdrawal request of GHS %.2f was rejected by the group", wr.getAmount()),
                    wr.getAmount());
            notificationClient.send(wr.getRequesterId(), "Withdrawal request rejected",
                    String.format("Your withdrawal request of GHS %.2f from \"%s\" was rejected by the group.",
                            wr.getAmount(), group.getName()),
                    "GROUP_VAULT_WITHDRAWAL_UPDATE",
                    Map.of("groupVaultId", group.getId().toString(), "requestId", wr.getId().toString()));
        }
        return currentView(wr, group, viewerId);
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

        activity(group.getId(), wr.getRequesterId(), GroupVaultActivity.Type.WITHDRAWAL_EXECUTED,
                String.format("Withdrawal of GHS %.2f was approved and paid out", payout), payout);
        notifyActiveMembers(group.getId(), null, "Withdrawal approved",
                String.format("A withdrawal of GHS %.2f from \"%s\" was approved and paid out.",
                        payout, group.getName()),
                "GROUP_VAULT_WITHDRAWAL_UPDATE",
                Map.of("groupVaultId", group.getId().toString(), "requestId", wr.getId().toString()));

        // The request id keys the wallet credit, so a replayed execution
        // can never pay the requester twice.
        paymentClient.creditWallet(wr.getRequesterId(), payout, "ecospend-gw-" + wr.getId(),
                "Group vault withdrawal — " + group.getName() + " (net of 2% fee)");
    }

    private WithdrawalRequestView currentView(GroupWithdrawalRequest wr, GroupVault group, UUID viewerId) {
        long active = memberRepository.countByGroupIdAndStatus(
                group.getId(), GroupVaultMember.Status.ACTIVE);
        boolean hasVoted = viewerId != null
                && voteRepository.findByRequestIdAndVoterId(wr.getId(), viewerId).isPresent();
        return new WithdrawalRequestView(wr,
                voteRepository.countByRequestIdAndApprove(wr.getId(), true),
                voteRepository.countByRequestIdAndApprove(wr.getId(), false),
                active,
                active / 2 + 1,
                hasVoted);
    }

    /** Sends to every ACTIVE member except {@code excludeUserId} (pass null to notify everyone). */
    private void notifyActiveMembers(UUID groupId, UUID excludeUserId, String title, String body,
                                      String type, Map<String, Object> data) {
        for (GroupVaultMember m : memberRepository.findByGroupIdAndStatus(groupId, GroupVaultMember.Status.ACTIVE)) {
            if (excludeUserId == null || !m.getUserId().equals(excludeUserId)) {
                notificationClient.send(m.getUserId(), title, body, type, data);
            }
        }
    }

    private void activity(UUID groupId, UUID actorUserId, GroupVaultActivity.Type type,
                           String message, BigDecimal amount) {
        GroupVaultActivity entry = new GroupVaultActivity();
        entry.setGroupId(groupId);
        entry.setActorUserId(actorUserId);
        entry.setType(type);
        entry.setMessage(message);
        entry.setAmount(amount);
        activityRepository.save(entry);
    }

    private GroupVaultView view(GroupVault group, UUID viewerId) {
        List<GroupVaultMember> members = memberRepository.findByGroupId(group.getId());
        Map<UUID, String> memberNames = identityClient.lookupByIds(
                members.stream().map(GroupVaultMember::getUserId).distinct().toList());
        BigDecimal total = members.stream()
                .map(GroupVaultMember::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal myContribution = BigDecimal.ZERO;
        if (viewerId != null) {
            myContribution = members.stream()
                    .filter(m -> m.getUserId().equals(viewerId))
                    .map(GroupVaultMember::getBalance)
                    .findFirst()
                    .orElse(BigDecimal.ZERO);
        }

        ContributionPlanView plan = ContributionPlanView.of(group);
        List<MemberPlanStatus> memberPlans = plan == null
                ? List.of()
                : members.stream()
                        .filter(m -> m.getStatus() == GroupVaultMember.Status.ACTIVE)
                        .map(m -> MemberPlanStatus.of(m.getUserId(), m.getBalance(), plan,
                                transactionRepository.findByGroupIdAndUserIdAndTypeOrderByCreatedAtAsc(
                                        group.getId(), m.getUserId(), VaultTransaction.Type.DEPOSIT)))
                        .toList();

        boolean viewerIsMember = viewerId != null
                && members.stream().anyMatch(m -> m.getUserId().equals(viewerId));
        List<GroupVaultActivity> activityLog = viewerIsMember
                ? activityRepository.findByGroupIdOrderByCreatedAtDesc(group.getId())
                : List.of();

        boolean viewerIsAdmin = viewerId != null && viewerId.equals(group.getCreatorId());
        List<GroupVaultInvite> invites = viewerIsAdmin
                ? inviteRepository.findByGroupIdOrderByCreatedAtAsc(group.getId())
                : List.of();

        return new GroupVaultView(
                group, members, total, myContribution, viewerId, plan, memberPlans, invites, activityLog,
                memberNames);
    }

    private static String normalizeFrequency(String frequency) {
        if (frequency == null || frequency.isBlank()) {
            return "MONTHLY";
        }
        String normalized = frequency.trim().toUpperCase();
        if (!normalized.equals("WEEKLY") && !normalized.equals("MONTHLY")) {
            throw VaultException.badRequest("contributionFrequency must be WEEKLY or MONTHLY");
        }
        return normalized;
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
            return;
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
