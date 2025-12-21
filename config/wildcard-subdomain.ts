/**
 * Wildcard Subdomain Configuration
 *
 * This file manages subdomain routing configuration for both development and production.
 *
 * Development: Uses lvh.me:3000 for easy local testing
 * Production: Uses actual domain.com for live subdomains
 */

import { RESERVED_USERNAMES } from "@/config/predefinedNames";
import { DOMAINS, BASE_DOMAINS } from "@/types/domain";

interface SubdomainConfig {
    /** Main domain (without subdomain) */
    mainDomain: string;
    /** Port for development (empty string for production) */
    port: string;
    /** Protocol (http for dev, https for production) */
    protocol: string;
    /** Example subdomain for documentation */
    exampleSubdomain: string;
    /** List of reserved subdomains that should route to main site */
    reservedSubdomains: string[];
}

const isDevelopment = process.env.NODE_ENV === "development";

const DEVELOPMENT_CONFIG: SubdomainConfig = {
    mainDomain: BASE_DOMAINS.DEVELOPMENT,
    port: ":3000",
    protocol: "http",
    exampleSubdomain: "mit",
    reservedSubdomains: RESERVED_USERNAMES,
};

const PRODUCTION_CONFIG: SubdomainConfig = {
    mainDomain: BASE_DOMAINS.PRODUCTION,
    port: "",
    protocol: "https",
    exampleSubdomain: "mit",
    reservedSubdomains: RESERVED_USERNAMES,
};

// Export the active configuration
export const SUBDOMAIN_CONFIG = isDevelopment ? DEVELOPMENT_CONFIG : PRODUCTION_CONFIG;

/**
 * Generate subdomain URL for a school username
 * @param username - School username
 * @returns Full subdomain URL
 *
 * @example
 * // Development: "http://mit.lvh.me:3000"
 * // Production: "https://mit.adrenalink.tech"
 * getSubdomainUrl('mit')
 */
export function getSubdomainUrl(username: string): string {
    const { protocol, mainDomain, port } = SUBDOMAIN_CONFIG;
    return `${protocol}://${username}.${mainDomain}${port}`;
}

/**
 * Check if current hostname is the main domain
 * @param hostname - Request hostname
 * @returns true if main domain, false if subdomain
 */
export function isMainDomain(hostname: string): boolean {
    const { mainDomain, port, reservedSubdomains } = SUBDOMAIN_CONFIG;

    // Handle development scenarios
    if (isDevelopment) {
        if (hostname === `localhost${port}` || hostname === `${mainDomain}${port}`) {
            return true;
        }
    } else {
        // Production
        if (hostname === mainDomain) {
            return true;
        }
    }

    // Check for reserved subdomains
    const subdomain = extractSubdomain(hostname);
    return reservedSubdomains.includes(subdomain);
}

/**
 * Extract subdomain from hostname
 * @param hostname - Request hostname
 * @returns Extracted subdomain or empty string
 *
 * @example
 * extractSubdomain('mit.lvh.me:3000') // returns 'mit'
 * extractSubdomain('mit.adrenalink.tech') // returns 'mit'
 */
export function extractSubdomain(hostname: string): string {
    const parts = hostname.split(".");

    if (parts.length < 2) {
        return "";
    }

    const subdomain = parts[0];

    // Skip if it's localhost or main domain
    if (subdomain === "localhost" || subdomain === "www") {
        return "";
    }

    return subdomain;
}

/**
 * Get the portal route path for middleware rewriting
 * @param username - School username
 * @param pathname - Original pathname
 * @returns Portal route path
 */
export function getPortalPath(username: string, pathname = "/"): string {
    // Route to dedicated subdomain page with username as search param
    return `/subdomain?username=${encodeURIComponent(username)}`;
}

/**
 * Validate if a subdomain is allowed
 * @param subdomain - Subdomain to validate
 * @returns true if valid subdomain
 */
export function isValidSubdomain(subdomain: string): boolean {
    if (!subdomain) return false;

    // Basic validation: alphanumeric and hyphens/underscores only
    const validPattern = /^[a-z0-9_-]+$/i;

    if (!validPattern.test(subdomain)) {
        return false;
    }

    // Not a reserved subdomain
    return !SUBDOMAIN_CONFIG.reservedSubdomains.includes(subdomain.toLowerCase());
}

// Export individual config values for convenience
export const { mainDomain, port, protocol, exampleSubdomain, reservedSubdomains } = SUBDOMAIN_CONFIG;
