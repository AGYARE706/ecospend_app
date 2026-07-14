package com.ecospend.expense.controllers;

import com.ecospend.expense.dto.InternalTransactionRequest;
import com.ecospend.expense.exception.BadRequestException;
import com.ecospend.expense.models.Transaction;
import com.ecospend.expense.services.TransactionRecorder;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Service-to-service surface. The API Gateway returns 403 for every
 * /internal/ path, so only services on the Docker network can reach it.
 */
@RestController
@RequestMapping("/finance/internal")
public class InternalFinanceController {

    private final TransactionRecorder transactionRecorder;

    public InternalFinanceController(TransactionRecorder transactionRecorder) {
        this.transactionRecorder = transactionRecorder;
    }

    @PostMapping("/transactions")
    public ResponseEntity<Transaction> recordTransaction(
            @Valid @RequestBody InternalTransactionRequest request) {
        String type = request.type().toUpperCase();
        if (!type.equals("INCOME") && !type.equals("EXPENSE")) {
            throw new BadRequestException("type must be INCOME or EXPENSE");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionRecorder.record(
                request.userId(), request.amount(), type, request.category(), request.notes()));
    }
}
