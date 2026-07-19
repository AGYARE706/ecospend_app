package com.ecospend.payment.repository;

import com.ecospend.payment.models.WalletAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.UUID;

public interface WalletAccountRepository extends JpaRepository<WalletAccount, UUID> {

    /**
     * Upsert credit: creates the wallet row on first touch, otherwise adds
     * to the existing balance — atomic under concurrent credits.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "INSERT INTO {h-schema}wallet_accounts (user_id, balance, created_at, updated_at) "
            + "VALUES (:userId, :amount, now(), now()) "
            + "ON CONFLICT (user_id) DO UPDATE "
            + "SET balance = wallet_accounts.balance + :amount, updated_at = now()",
            nativeQuery = true)
    int credit(@Param("userId") UUID userId, @Param("amount") BigDecimal amount);

    /**
     * Atomic conditional debit: returns 1 only when the balance covered
     * the amount, so a debit can never overdraw the wallet.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = "UPDATE {h-schema}wallet_accounts "
            + "SET balance = balance - :amount, updated_at = now() "
            + "WHERE user_id = :userId AND balance >= :amount",
            nativeQuery = true)
    int debitIfSufficient(@Param("userId") UUID userId, @Param("amount") BigDecimal amount);
}
