package com.ecospend.identity.controller;

import com.ecospend.identity.dto.AuthResponse;
import com.ecospend.identity.dto.ForgotPasswordRequest;
import com.ecospend.identity.dto.LoginRequest;
import com.ecospend.identity.dto.LoginResponse;
import com.ecospend.identity.dto.RefreshRequest;
import com.ecospend.identity.dto.RegisterRequest;
import com.ecospend.identity.dto.RegisterResponse;
import com.ecospend.identity.dto.ResetPasswordRequest;
import com.ecospend.identity.dto.VerifyOtpRequest;
import com.ecospend.identity.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Exposes authentication endpoints. All routes here are reached
 * directly by the API Gateway without JWT validation (open auth route).
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify-registration-otp")
    public ResponseEntity<AuthResponse> verifyRegistration(
            @Valid @RequestBody VerifyOtpRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.verifyRegistration(
                request, deviceLabel(httpRequest), clientIp(httpRequest)));
    }

    @PostMapping("/resend-registration-otp")
    public ResponseEntity<Map<String, String>> resendRegistrationOtp(
            @Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.resendRegistrationOtp(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        LoginResponse response = authService.login(request, deviceLabel(httpRequest), clientIp(httpRequest));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-login-otp")
    public ResponseEntity<AuthResponse> verifyLoginOtp(
            @Valid @RequestBody VerifyOtpRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.verifyLoginOtp(
                request, deviceLabel(httpRequest), clientIp(httpRequest)));
    }

    @PostMapping("/resend-login-otp")
    public ResponseEntity<Map<String, String>> resendLoginOtp(
            @Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.resendLoginOtp(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        AuthResponse response = authService.refresh(request.refreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Boolean>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    /** Prefers the mobile client's own friendly label (see apiClient.ts); falls back to the raw User-Agent. */
    private static String deviceLabel(HttpServletRequest request) {
        String label = request.getHeader("X-Device-Label");
        return (label != null && !label.isBlank()) ? label : request.getHeader("User-Agent");
    }

    private static String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
