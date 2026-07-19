package com.ecospend.expense.repository;

import com.ecospend.expense.models.CoachConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CoachConversationRepository extends JpaRepository<CoachConversation, UUID> {

    List<CoachConversation> findByUserIdOrderByUpdatedAtDesc(UUID userId);

    Optional<CoachConversation> findByIdAndUserId(UUID id, UUID userId);
}
