package com.ecospend.identity.controller;

import com.ecospend.identity.dto.AuthResponse;
import com.ecospend.identity.dto.PushTokenRequest;
import com.ecospend.identity.dto.UpdateUserProfileRequest;
import com.ecospend.identity.dto.UserProfileResponse;
import com.ecospend.identity.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
