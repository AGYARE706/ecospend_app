package com.ecospend.vault.models;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Platform fee rates, shown to users before any withdrawal
 * (full transparency, no hidden charges).
 */
public final class Fees {

    /** Platform sustainability fee on an on-time withdrawal that actually hit its target. */
    public static final BigDecimal WITHDRAWAL_FEE_RATE = new BigDecimal("0.02");

    /** On-time withdrawal, but the balance never reached the target — the commitment wasn't kept, even though the date was. */
    public static final BigDecimal SHORTFALL_FEE_RATE = new BigDecimal("0.04");

    /** Early-exit penalty when breaking a vault before its unlock date. */
    public static final BigDecimal EARLY_EXIT_FEE_RATE = new BigDecimal("0.05");

    public static BigDecimal feeOn(BigDecimal amount, BigDecimal rate) {
        return amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }

    private Fees() {}
}
