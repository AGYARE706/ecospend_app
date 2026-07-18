package com.ecospend.identity.controller;

import com.ecospend.identity.dto.AuthResponse;
import com.ecospend.identity.dto.PushTokenRequest;
import com.ecospend.identity.dto.SessionView;
import com.ecospend.identity.dto.UpdateProfilePhotoRequest;
import com.ecospend.identity.dto.UpdateSetupCompletedRequest;
import com.ecospend.identity.dto.UpdateTwoFactorRequest;
import com.ecospend.identity.dto.UpdateUserProfileRequest;
import com.ecospend.identity.dto.UserProfileResponse;
import com.ecospend.identity.service.AuthService;
import com.ecospend.identity.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMe(
            @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(userService.getMe(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateMe(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody UpdateUserProfileRequest request) {
        return ResponseEntity.ok(userService.updateMe(userId, request));
    }

    @PutMapping("/me/photo")
    public ResponseEntity<UserProfileResponse> updatePhoto(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody UpdateProfilePhotoRequest request) {
        return ResponseEntity.ok(userService.updatePhoto(userId, request.photoBase64()));
    }

    @PutMapping("/push-token")
    public ResponseEntity<Void> savePushToken(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody PushTokenRequest request) {

        userService.savePushToken(userId, request.pushToken());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/me/two-factor")
    public ResponseEntity<UserProfileResponse> updateTwoFactor(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody UpdateTwoFactorRequest request) {
        return ResponseEntity.ok(userService.setTwoFactorEnabled(userId, request.enabled()));
    }

    @PutMapping("/me/setup-completed")
    public ResponseEntity<UserProfileResponse> updateSetupCompleted(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody UpdateSetupCompletedRequest request) {
        return ResponseEntity.ok(userService.setSetupCompleted(userId, request.completed()));
    }

    @GetMapping("/me/sessions")
    public ResponseEntity<List<SessionView>> listSessions(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader(value = "X-Refresh-Token", required = false) String currentRefreshToken) {
        return ResponseEntity.ok(authService.listActiveSessions(userId, currentRefreshToken));
    }

    @DeleteMapping("/me/sessions/{sessionId}")
    public ResponseEntity<Void> revokeSession(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID sessionId) {
        authService.revokeSession(userId, sessionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/login-history")
    public ResponseEntity<List<SessionView>> loginHistory(
            @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(authService.getLoginHistory(userId));
    }

    @PostMapping("/upgrade-to-plus")
    public ResponseEntity<AuthResponse> upgradeToPlus(
            @RequestHeader("X-User-Id") UUID userId) {

        AuthResponse response = userService.upgradeToPlus(userId);
        return ResponseEntity.ok(response);
    }
}
