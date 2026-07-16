package com.ecospend.identity.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * The photo as a data URI (e.g. "data:image/jpeg;base64,...") — the
 * mobile client compresses/resizes before upload, so this is small
 * enough to carry as plain JSON rather than a multipart upload.
 */
public record UpdateProfilePhotoRequest(
        @NotBlank String photoBase64
) {}
