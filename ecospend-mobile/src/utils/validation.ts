export function normalizePhone(value: string): string {
  return value.replace(/\s/g, '');
}

export function isValidGhanaPhone(value: string): boolean {
  const digits = normalizePhone(value);
  return /^0\d{9}$/.test(digits);
}
