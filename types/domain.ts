// Domain configuration and utilities

export const DOMAINS = {
    DEVELOPMENT: ".lvh.me:3000",
    PRODUCTION: ".adrenalink.tech",
} as const;

export const BASE_DOMAINS = {
    DEVELOPMENT: "lvh.me",
    PRODUCTION: "adrenalink.tech",
} as const;

export type DomainType = "development" | "production";

export interface SubdomainInfo {
    subdomain: string;
    type: DomainType;
    hostname: string;
}

/**
 * Detects if hostname contains a subdomain for development or production
 */
export function detectSubdomain(hostname: string): SubdomainInfo | null {
    const isDevSubdomain = hostname.includes(DOMAINS.DEVELOPMENT) && !hostname.startsWith(BASE_DOMAINS.DEVELOPMENT);
    const isProdSubdomain = hostname.includes(DOMAINS.PRODUCTION) && !hostname.startsWith(BASE_DOMAINS.PRODUCTION);
    
    if (isDevSubdomain) {
        return {
            subdomain: hostname.split(".")[0],
            type: "development",
            hostname
        };
    }
    
    if (isProdSubdomain) {
        return {
            subdomain: hostname.split(".")[0],
            type: "production",
            hostname
        };
    }
    
    return null;
}

/**
 * Checks if hostname is a subdomain (either dev or prod)
 */
export function isSubdomain(hostname: string): boolean {
    return detectSubdomain(hostname) !== null;
}

/**
 * Gets the subdomain name from hostname
 */
export function getSubdomainName(hostname: string): string | null {
    const info = detectSubdomain(hostname);
    return info?.subdomain || null;
}

/**
 * Gets the domain type (development/production)
 */
export function getDomainType(hostname: string): DomainType | null {
    const info = detectSubdomain(hostname);
    return info?.type || null;
}