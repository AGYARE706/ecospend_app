package com.ecospend.identity.dto;

import java.util.List;

/** Service-to-service: resolve a batch of phone numbers to registered users. */
public record PhoneLookupRequest(List<String> phoneNumbers) {}
