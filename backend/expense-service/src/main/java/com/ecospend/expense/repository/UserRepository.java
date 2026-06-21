package com.ecospend.expense.repository;

import com.ecospend.expense.models.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<AppUser, Long> {

    /**
     * Spring Data JPA will automatically write the SQL query
     * to find a user by their email address for login.
     */
    Optional<AppUser> findByEmail(String email);

    boolean existsByEmail(String email);
}