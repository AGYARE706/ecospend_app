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
