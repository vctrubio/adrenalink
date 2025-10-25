// CDN asset URL construction utilities

const CDN_BASE_URL = "https://cdn.adrenalink.tech";
const ADMIN_FOLDER = "admin";

export type AssetType = "icon" | "banner";

/**
 * Constructs asset URL following convention-based naming
 * @param username - School username or "admin" for fallback
 * @param type - Asset type: "icon" or "banner"
 * @returns Full CDN URL for the asset
 */
export function getAssetUrl(username: string, type: AssetType): string {
    const filename = `${type}.png`;
    return `${CDN_BASE_URL}/${username}/${filename}`;
}

/**
 * Gets school-specific asset URL with admin fallback
 * @param username - School username
 * @param type - Asset type: "icon" or "banner"
 * @returns School asset URL
 */
export function getSchoolAssetUrl(username: string, type: AssetType): string {
    return getAssetUrl(username, type);
}

/**
 * Gets admin fallback asset URL
 * @param type - Asset type: "icon" or "banner"
 * @returns Admin asset URL
 */
export function getAdminAssetUrl(type: AssetType): string {
    return getAssetUrl(ADMIN_FOLDER, type);
}

/**
 * Checks if an asset exists at the given URL
 */
async function assetExists(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Gets asset URLs for a school with fallback logic
 */
export async function getSchoolAssets(username: string) {
    const schoolIconUrl = getSchoolAssetUrl(username, "icon");
    const schoolBannerUrl = getSchoolAssetUrl(username, "banner");

    const [iconExists, bannerExists] = await Promise.all([assetExists(schoolIconUrl), assetExists(schoolBannerUrl)]);

    const assets = {
        iconUrl: iconExists ? schoolIconUrl : getAdminAssetUrl("icon"),
        bannerUrl: bannerExists ? schoolBannerUrl : getAdminAssetUrl("banner"),
    };

    return assets;
}
