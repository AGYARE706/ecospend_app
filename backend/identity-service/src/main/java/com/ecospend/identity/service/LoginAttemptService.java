package com.ecospend.identity.service;

import com.ecospend.identity.entity.User;
import com.ecospend.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Records a failed login attempt in its own, independently-committed
 * transaction (REQUIRES_NEW). AuthService.login() throws right after
 * calling this to reject the request, and Spring rolls back the entire
 * enclosing @Transactional method on any RuntimeException by default —
 * without REQUIRES_NEW here, that rollback would silently undo the very
 * counter update this exists to make stick.
 */
@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registerFailedAttempt(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
        if (user.getFailedLoginAttempts() >= MAX_LOGIN_ATTEMPTS) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES));
        }
        userRepository.save(user);
    }
}
