/**
 * Format large numbers to compact notation (max 3 digits)
 * Examples: 12 → "12", 999 → "999", 1000 → "1k", 2500 → "2.5k", 12000 → "12k"
 */
export function getCompactNumber(num: number): string {
  if (num < 1000) {
    return Math.round(num).toString();
  }

  const divided = num / 1000;
  const rounded = Math.round(divided * 10) / 10;

  // If it's a whole number after rounding, don't show decimal
  if (rounded === Math.floor(rounded)) {
    return `${Math.floor(rounded)}k`;
  }

  return `${rounded}k`;
}
