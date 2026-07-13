package com.ecospend.expense.services;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class MomoFeeService {

    public BigDecimal calculateFee(BigDecimal amount, String provider) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        if ("MTN".equalsIgnoreCase(provider) || "TELECEL".equalsIgnoreCase(provider) || "AT".equalsIgnoreCase(provider)) {
            BigDecimal fee = amount.multiply(new BigDecimal("0.01"));
            BigDecimal maxCap = new BigDecimal("10.00");
            return fee.compareTo(maxCap) > 0 ? maxCap : fee;
        }

        return BigDecimal.ZERO;
    }
}