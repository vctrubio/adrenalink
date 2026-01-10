// Domain configuration and utilities
import { RESERVED_SUBDOMAINS } from "@/config/predefinedNames";

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
    id?: string;
}

/**
 * Detects if hostname contains a subdomain for development or production
 * Excludes reserved subdomains that should not be treated as school subdomains
 */
export function detectSubdomain(hostname: string): SubdomainInfo | null {
    const isDevSubdomain = hostname.includes(DOMAINS.DEVELOPMENT) && !hostname.startsWith(BASE_DOMAINS.DEVELOPMENT);
    const isProdSubdomain = hostname.includes(DOMAINS.PRODUCTION) && !hostname.startsWith(BASE_DOMAINS.PRODUCTION);

    if (isDevSubdomain) {
        const subdomain = hostname.split(".")[0];

        // Skip reserved subdomains
        if (RESERVED_SUBDOMAINS.includes(subdomain as any)) {
            return null;
        }

        return {
            subdomain,
            type: "development",
            hostname,
        };
    }

    if (isProdSubdomain) {
        const subdomain = hostname.split(".")[0];

        // Skip reserved subdomains
        if (RESERVED_SUBDOMAINS.includes(subdomain as any)) {
            return null;
        }

        return {
            subdomain,
            type: "production",
            hostname,
        };
    }

    return null;
}
