package com.ecospend.expense.repository;

import com.ecospend.expense.models.CoachMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CoachMessageRepository extends JpaRepository<CoachMessage, UUID> {

    List<CoachMessage> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);
}
