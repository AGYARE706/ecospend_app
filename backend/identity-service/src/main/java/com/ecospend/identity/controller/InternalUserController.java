package com.ecospend.identity.controller;

import com.ecospend.identity.dto.IdLookupRequest;
import com.ecospend.identity.dto.PhoneLookupRequest;
import com.ecospend.identity.dto.UserLookupResult;
import com.ecospend.identity.service.SubscriptionRenewalService;
import com.ecospend.identity.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Internal (service-to-service) user lookups. The API Gateway denies every
 * /internal/ path, so this is only reachable from other services on the
 * Docker network — never from the mobile client.
 */
@RestController
@RequestMapping("/users/internal")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserService userService;
    private final SubscriptionRenewalService subscriptionRenewalService;

    @PostMapping("/lookup-by-phone")
    public ResponseEntity<List<UserLookupResult>> lookupByPhone(@RequestBody PhoneLookupRequest request) {
        return ResponseEntity.ok(userService.lookupByPhone(request.phoneNumbers()));
    }

    @PostMapping("/lookup-by-ids")
    public ResponseEntity<List<UserLookupResult>> lookupByIds(@RequestBody IdLookupRequest request) {
        return ResponseEntity.ok(userService.lookupByIds(request.userIds()));
    }

    /** Manually triggers the daily subscription-renewal sweep — the cron already fires at 08:00. */
    @PostMapping("/run-subscription-renewals")
    public ResponseEntity<Map<String, Integer>> runSubscriptionRenewals() {
        SubscriptionRenewalService.Result result = subscriptionRenewalService.run();
        return ResponseEntity.ok(Map.of("renewed", result.renewed(), "lapsed", result.lapsed()));
    }
}
