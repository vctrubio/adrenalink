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
 * @property {string | null} logo - URL to the school's logo image from R2
 *   - First tries to load: `{schoolUsername}/icon.png`
 *   - Falls back to: `admin/icon.png`
 *   - Returns null if neither exists
 * @property {string} currency - The school's currency code (USD, EUR, CHF)
 * @property {string} username - The school's unique username slug
 * @property {string} status - The school's status (active, pending, closed)
 * @property {string} ownerId - UUID of the school owner
 */
export interface SchoolCredentials {
    logo: string | null;
    currency: string;
    username: string;
    status: string;
    ownerId: string;
}
