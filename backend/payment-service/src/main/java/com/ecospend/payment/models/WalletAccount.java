package com.ecospend.payment.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * The user's central wallet balance. Rows are created lazily on first
 * credit; all balance mutations go through atomic UPDATE queries in
 * {@link com.ecospend.payment.repository.WalletAccountRepository} so
 * concurrent moves can never overdraw or lose an update.
 */
@Entity
@Table(name = "wallet_accounts")
@Getter
@Setter
@NoArgsConstructor
public class WalletAccount {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
