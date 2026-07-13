package com.ecospend.identity.controller;

import com.ecospend.identity.dto.AuthResponse;
import com.ecospend.identity.dto.ChangePasswordRequest;
import com.ecospend.identity.dto.PushTokenRequest;
import com.ecospend.identity.dto.SessionResponse;
import com.ecospend.identity.dto.UpdateUserProfileRequest;
import com.ecospend.identity.dto.UserProfileResponse;
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

    @PutMapping("/push-token")
    public ResponseEntity<Void> savePushToken(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody PushTokenRequest request) {

        userService.savePushToken(userId, request.pushToken());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/upgrade-to-plus")
    public ResponseEntity<AuthResponse> upgradeToPlus(
            @RequestHeader("X-User-Id") UUID userId) {

        AuthResponse response = userService.upgradeToPlus(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/password")
    public ResponseEntity<AuthResponse> changePassword(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        return ResponseEntity.ok(userService.changePassword(userId, request));
    }

    @GetMapping("/me/sessions")
    public ResponseEntity<List<SessionResponse>> listSessions(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader(value = "X-Session-Token", required = false) String currentToken) {
        return ResponseEntity.ok(userService.listSessions(userId, currentToken));
    }

    @DeleteMapping("/me/sessions/{sessionId}")
    public ResponseEntity<Void> revokeSession(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID sessionId) {
        userService.revokeSession(userId, sessionId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount(
            @RequestHeader("X-User-Id") UUID userId) {
        userService.deleteAccount(userId);
        return ResponseEntity.noContent().build();
    }
}
