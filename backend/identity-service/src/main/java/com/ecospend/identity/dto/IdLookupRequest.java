package com.ecospend.identity.dto;

import java.util.List;
import java.util.UUID;

/** Service-to-service: resolve a batch of user ids to their current names. */
public record IdLookupRequest(List<UUID> userIds) {}
