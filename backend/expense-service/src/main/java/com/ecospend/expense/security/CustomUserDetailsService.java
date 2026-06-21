package com.ecospend.expense.security;

import com.ecospend.expense.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 1. Fetch user from your database
        return userRepository.findByEmail(email)
                // 2. Map your AppUser entity to a Spring Security 'User' object
                .map(user -> new User(
                        user.getEmail(),
                        user.getPassword(),
                        Collections.emptyList() // Add roles/authorities here if needed
                ))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}