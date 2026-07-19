package com.ecospend.notification.models;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, UUID> {

    Optional<DeviceToken> findByExpoPushToken(String expoPushToken);

    List<DeviceToken> findByUserId(UUID userId);

    void deleteByExpoPushToken(String expoPushToken);
}
