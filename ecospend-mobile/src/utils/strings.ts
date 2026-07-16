/** Capitalizes the first letter of each word; leaves the rest untouched. */
export function capitalizeWords(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}
