package com.ecospend.identity.dto;

import java.util.UUID;

/** One resolved match from a phone-number lookup — unmatched numbers are simply omitted. */
public record UserLookupResult(String phoneNumber, UUID userId, String name) {}
