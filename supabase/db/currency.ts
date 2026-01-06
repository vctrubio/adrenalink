/**
 * Currency Symbol Mapping
 * Maps currency codes to their symbols
 */
export const CURRENCY_MAP: Record<string, string> = {
    USD: "$",
    EUR: "€",
    CHF: "CHF",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    SGD: "S$",
    HKD: "HK$",
    NZD: "NZ$",
    INR: "₹",
    MXN: "$",
    BRL: "R$",
};

/**
 * Get currency symbol by code
 * Falls back to JPY symbol (¥) if code not found
 */
export function getCurrencySymbol(code?: string | null): string {
    if (!code) return CURRENCY_MAP.JPY;
    return CURRENCY_MAP[code.toUpperCase()] || CURRENCY_MAP.JPY;
}
