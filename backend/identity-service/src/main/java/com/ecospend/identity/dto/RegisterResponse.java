package com.ecospend.identity.dto;

/** Registration no longer returns tokens directly — the phone must be verified first. */
public record RegisterResponse(String phone) {}
