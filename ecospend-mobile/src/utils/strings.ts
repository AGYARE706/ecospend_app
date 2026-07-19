/** Capitalizes the first letter of each word; leaves the rest untouched. */
export function capitalizeWords(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

/** "0241234567" -> "024 *** 4567" — for showing where a code was sent without exposing the full number. */
export function maskPhone(phone: string): string {
  if (phone.length < 4) {
    return phone;
  }
  return `${phone.slice(0, 3)} *** ${phone.slice(-4)}`;
}
