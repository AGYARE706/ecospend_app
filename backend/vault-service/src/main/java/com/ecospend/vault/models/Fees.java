package com.ecospend.vault.models;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Platform fee rates, shown to users before any withdrawal
 * (full transparency, no hidden charges).
 */
public final class Fees {

    /** Platform sustainability fee on successful on-time or late withdrawal. */
    public static final BigDecimal WITHDRAWAL_FEE_RATE = new BigDecimal("0.02");

    /** Early-exit penalty when breaking a vault before its unlock date. */
    public static final BigDecimal EARLY_EXIT_FEE_RATE = new BigDecimal("0.05");

    public static BigDecimal feeOn(BigDecimal amount, BigDecimal rate) {
        return amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }

    private Fees() {}
}
