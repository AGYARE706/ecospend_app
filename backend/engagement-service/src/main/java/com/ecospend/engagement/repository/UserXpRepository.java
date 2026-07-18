package com.ecospend.engagement.repository;

import com.ecospend.engagement.models.UserXp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserXpRepository extends JpaRepository<UserXp, UUID> {
}
