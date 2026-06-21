package com.ecospend.expense.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;

@Entity
@Table(name = "app_users")
@Data
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // This matches the Long userId we used in Expenses and Savings!

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password; // We will hash this before saving it!

    private String role; // e.g., "STUDENT" or "ADMIN"

    private OffsetDateTime createdAt;
}