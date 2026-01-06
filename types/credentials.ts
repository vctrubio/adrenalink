/**
 * @file School credentials type definitions
 * 
 * This file defines the structure of school credentials that are fetched
 * from the database and R2 storage, then provided to the application
 * via context/provider pattern.
 */

/**
 * School credentials object containing essential school information
 * and branding assets.
 *
 * @property {string} id - The school's UUID (primary key)
 * @property {string | null} logoUrl - URL to the school's icon image from CDN
 *   - First tries to load: `{schoolUsername}/icon.png`
 *   - Falls back to: `admin/icon.png`
 * @property {string | null} bannerUrl - URL to the school's banner image from CDN
 *   - First tries to load: `{schoolUsername}/banner.png`
 *   - Falls back to: `admin/banner.png`
 * @property {string} currency - The school's currency code (USD, EUR, CHF)
 * @property {string} name - The school's display name
 * @property {string} username - The school's unique username slug
 * @property {string} status - The school's status (active, pending, closed)
 * @property {string} ownerId - UUID of the school owner
 * @property {string} country - The school's country
 * @property {string | null} timezone - The school's timezone
 */
export interface SchoolCredentials {
    id: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    currency: string;
    name: string;
    username: string;
    status: string;
    ownerId: string;
    country: string;
    timezone: string | null;
}
