package com.ecospend.expense.controllers;

import com.ecospend.expense.services.MomoFeeService; // <-- Updated import
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final MomoFeeService momoFeeService; // <-- Updated type name

    @GetMapping("/momo-fee")
    public ResponseEntity<Map<String, Object>> getMomoFee(
            @RequestParam String provider,
            @RequestParam BigDecimal amount,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {

        if (userId != null) {
            System.out.println("Gateway verified request from User ID: " + userId);
        }

        return ResponseEntity.ok(momoFeeService.calculateFee(provider, amount));
    }
}