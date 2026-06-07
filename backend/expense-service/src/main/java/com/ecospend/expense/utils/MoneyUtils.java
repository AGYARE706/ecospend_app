package com.ecospend.expense.utils;

import java.math.BigDecimal;

public final class MoneyUtils {

    private MoneyUtils() {}

    public static boolean isPositive(BigDecimal amount) {
        return amount != null && amount.compareTo(BigDecimal.ZERO) > 0;
    }
}
