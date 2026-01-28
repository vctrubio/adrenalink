/**
 * Format large numbers to compact notation (max 3 digits)
 * Examples: 12 → "12", 999 → "999", 1000 → "1k", 2500 → "2.5k", 12000 → "12k"
 * Handles both positive and negative numbers, returns absolute value formatted
 */
export function getCompactNumber(num: number): string {
    const absNum = Math.abs(num);

    if (absNum < 1000) {
        return Math.round(absNum).toString();
    }

    const divided = absNum / 1000;
    const rounded = Math.round(divided * 10) / 10;

    // If it's a whole number after rounding, don't show decimal
    if (rounded === Math.floor(rounded)) {
        return `${Math.floor(rounded)}k`;
    }

    return `${rounded}k`;
}

/**
 * Format number to show 2 decimals only when needed
 * Examples: 2 → "2", 180 → "180", 2.99 → "2.99", 2.5 → "2.50"
 */
export function getPPP(num: number): string {
    // If it's a whole number, return without decimals
    if (num % 1 === 0) {
        return num.toString();
    }
    // Otherwise, show 2 decimals
    return num.toFixed(2);
}

/**
 * Format number with thousands separator (dot) and decimals (comma)
 * Example: 1234.56 → "1.234,56"
 * Optionally appends currency: (1234.56, "USD") → "1.234,56 USD"
 */
export function getFormattedMoneyNumber(num: number, currency?: string): string {
    const formatted = num.toLocaleString("de-DE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    return currency ? `${formatted} ${currency}` : formatted;
}
