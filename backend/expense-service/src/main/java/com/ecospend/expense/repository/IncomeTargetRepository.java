package com.ecospend.expense.repository;

import com.ecospend.expense.models.IncomeTarget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface IncomeTargetRepository extends JpaRepository<IncomeTarget, UUID> {
}
