/**
 * CDN Image Management
 * Centralized functions for verifying and fetching school assets from Cloudflare R2
 * With caching to minimize HEAD requests to CDN
 */

import { cache } from "react";
import { logger } from "@/backend/logger";

// In-memory cache for CDN image verification results
// Map structure: schoolUsername -> { bannerUrl, iconUrl, timestamp }
const CDN_IMAGE_CACHE = new Map<string, { bannerUrl: string; iconUrl: string; timestamp: number }>();

// Cache TTL: 1 hour (3600000 ms)
const CACHE_TTL = 3600000;

/**
 * Check if CDN images exist via HEAD requests and return both URLs
 * Results are cached in-memory to minimize unnecessary HEAD requests
 *
 * @param username - School username
 * @returns Object with bannerUrl and iconUrl (verified or fallback to /admin/)
 */
async function getCDNImagesImpl(username: string): Promise<{ bannerUrl: string; iconUrl: string }> {
    // Check cache first
    const cached = CDN_IMAGE_CACHE.get(username);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        logger.debug("CDN cache hit", { username, bannerUrl: cached.bannerUrl, iconUrl: cached.iconUrl });
        return { bannerUrl: cached.bannerUrl, iconUrl: cached.iconUrl };
    }

    const customBannerUrl = `https://cdn.adrenalink.tech/${username}/banner.png`;
    const customIconUrl = `https://cdn.adrenalink.tech/${username}/icon.png`;
    const adminBannerUrl = "https://cdn.adrenalink.tech/admin/banner.png";
    const adminIconUrl = "https://cdn.adrenalink.tech/admin/icon.png";

    let bannerUrl = adminBannerUrl;
    let iconUrl = adminIconUrl;

    try {
        logger.debug("Checking CDN for custom assets", { username });
        const [bannerRes, iconRes] = await Promise.all([
            fetch(customBannerUrl, { method: "HEAD" }),
            fetch(customIconUrl, { method: "HEAD" }),
        ]);

        if (bannerRes.ok) {
            bannerUrl = customBannerUrl;
            logger.debug("Found custom banner", { username });
        } else {
            logger.debug("Custom banner not found, using admin fallback", { username, status: bannerRes.status });
        }

        if (iconRes.ok) {
            iconUrl = customIconUrl;
            logger.debug("Found custom icon", { username });
        } else {
            logger.debug("Custom icon not found, using admin fallback", { username, status: iconRes.status });
        }
    } catch (err) {
        logger.warn("Failed to check CDN images", { username, error: err });
        logger.debug("Using admin fallbacks", { bannerUrl: adminBannerUrl, iconUrl: adminIconUrl });
    }

    // Store in cache
    CDN_IMAGE_CACHE.set(username, {
        bannerUrl,
        iconUrl,
        timestamp: Date.now(),
    });

    logger.debug("CDN cache stored", { username, bannerUrl, iconUrl });
    return { bannerUrl, iconUrl };
}

// Use React's cache() for request-level deduplication
// This prevents multiple calls to getCDNImages in the same request
export const getCDNImages = cache(getCDNImagesImpl);
