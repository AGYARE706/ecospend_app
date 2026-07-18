package com.ecospend.engagement.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.util.UUID;

@Entity
@Table(name = "user_xp", schema = "engagement_schema")
@Data
public class UserXp {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "total_xp")
    private int totalXp;
}
