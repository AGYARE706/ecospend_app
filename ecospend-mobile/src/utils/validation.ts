export function normalizePhone(value: string): string {
  return value.replace(/\s/g, '');
}

export function isValidGhanaPhone(value: string): boolean {
  const digits = normalizePhone(value);
  return /^0\d{9}$/.test(digits);
}

export function isValidOtpCode(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}

/**
 * Mirrors the backend's password policy exactly (RegisterRequest /
 * ResetPasswordRequest `@Pattern`): at least 8 characters, one uppercase
 * letter, one lowercase letter, one digit. Returns null when valid, or
 * the first unmet requirement's message otherwise — so the UI can show
 * one clear instruction instead of a generic "invalid password".
 */
export function getPasswordRequirementError(value: string): string | null {
  if (value.length < 8) {
    return 'At least 8 characters';
  }
  if (!/[a-z]/.test(value)) {
    return 'Add a lowercase letter';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Add an uppercase letter';
  }
  if (!/\d/.test(value)) {
    return 'Add a number';
  }
  return null;
}

export function isStrongPassword(value: string): boolean {
  return getPasswordRequirementError(value) === null;
}

/**
 * Converts a loosely-formatted Ghana number (spaces, dashes, +233 prefix)
 * to the bare "0XXXXXXXXX" form that registration stores phone numbers
 * in — so invite-by-phone lookups can match against it exactly.
 */
export function toCanonicalGhanaPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) {
    return digits;
  }
  if (digits.length === 12 && digits.startsWith('233')) {
    return '0' + digits.slice(3);
  }
  if (digits.length === 9) {
    return '0' + digits;
  }
  return digits;
}
