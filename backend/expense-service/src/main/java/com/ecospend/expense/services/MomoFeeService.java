package com.ecospend.expense.services;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

@Service
public class MomoFeeService {

    public Map<String, Object> calculateFee(String provider, BigDecimal amount) {
        BigDecimal fee = BigDecimal.ZERO;
        
        if (amount.compareTo(new BigDecimal("50")) <= 0) {
            fee = new BigDecimal("0.75");
        } else if (amount.compareTo(new BigDecimal("100")) <= 0) {
            fee = new BigDecimal("1.00");
        } else if (amount.compareTo(new BigDecimal("300")) <= 0) {
            fee = new BigDecimal("1.50");
        } else if (amount.compareTo(new BigDecimal("1000")) <= 0) {
            fee = amount.multiply(new BigDecimal("0.02")).min(new BigDecimal("20.00"));
        } else {
            fee = amount.multiply(new BigDecimal("0.02"));
        }

        fee = fee.setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalCost = amount.add(fee);

        return Map.of(
            "provider", provider.toUpperCase(),
            "baseAmount", amount,
            "fee", fee,
            "totalCost", totalCost
        );
    }
}