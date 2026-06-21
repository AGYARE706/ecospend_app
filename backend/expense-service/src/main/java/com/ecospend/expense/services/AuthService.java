package com.ecospend.expense.services;

import com.ecospend.expense.dto.LoginRequest;
import com.ecospend.expense.dto.RegisterRequest;
import com.ecospend.expense.models.AppUser;
import com.ecospend.expense.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Registers a new student on the platform, safely hashing their credentials.
     */
    public AppUser register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email address is already registered across the network!");
        }

        AppUser user = new AppUser();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        // Securely hash the password using BCrypt before database persistence
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("STUDENT");
        user.setCreatedAt(OffsetDateTime.now());

        return userRepository.save(user);
    }

    /**
     * Validates student credentials during platform login.
     * Returns the user entity if verification passes.
     */
    public Optional<AppUser> login(LoginRequest request) {
        Optional<AppUser> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isPresent()) {
            AppUser user = userOpt.get();
            // Verify raw input against the hashed variant in the database
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }
}