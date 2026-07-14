package com.ecospend.payment.services;

import com.ecospend.payment.exceptions.PaymentException;
import com.ecospend.payment.repository.WalletAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Thin wrapper over the atomic wallet queries. Runs inside the caller's
 * transaction so a failed downstream step rolls the balance change back.
 */
@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletAccountRepository walletAccountRepository;

    /** Users without a wallet row simply have a zero balance. */
    public BigDecimal balanceOf(UUID userId) {
        return walletAccountRepository.findById(userId)
                .map(account -> account.getBalance())
                .orElse(BigDecimal.ZERO);
    }

    public void credit(UUID userId, BigDecimal amount) {
        walletAccountRepository.credit(userId, amount);
    }

    public void debit(UUID userId, BigDecimal amount) {
        int updated = walletAccountRepository.debitIfSufficient(userId, amount);
        if (updated == 0) {
            throw PaymentException.badRequest("Insufficient wallet balance");
        }
    }
}
