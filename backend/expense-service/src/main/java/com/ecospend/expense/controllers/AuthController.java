package com.ecospend.expense.controllers;

import com.ecospend.expense.dto.LoginRequest;
import com.ecospend.expense.dto.RegisterRequest;
import com.ecospend.expense.models.AppUser;
import com.ecospend.expense.security.JwtService;
import com.ecospend.expense.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    // 1. Registration Endpoint
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            AppUser savedUser = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (RuntimeException ex) {
            // Returns a 400 Bad Request if validation fails (e.g., user exists)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
        }
    }

    // 2. Login Endpoint
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        // We delegate the authentication logic to the AuthService
        return authService.login(request)
                .map(user -> {
                    // Logic: If user is authenticated, generate token
                    String token = jwtService.generateToken(user.getEmail());

                    // Return a clean JSON object
                    return ResponseEntity.ok(Map.of(
                            "token", token,
                            "fullName", user.getFullName(),
                            "email", user.getEmail()));
                })
                .orElseGet(() ->
                // Return a 401 Unauthorized if authentication fails
                ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid email or password.")));
    }
}