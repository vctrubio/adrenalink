import type { PackageWithUsageStats, PackageTableStats, PackageTableData } from "@/config/tables";

export type PackageData = PackageTableData;
export type PackageRelations = any;
export type PackageUpdateForm = any;

/**
 * Calculate stats for a single package record
 */
export function calculatePackageStats(pkg: PackageWithUsageStats): PackageTableStats {
    return {
        packageCount: 1,
        totalBookings: pkg.usageStats.bookingCount,
        totalRequests: pkg.usageStats.requestCount,
        totalRevenue: pkg.usageStats.revenue,
    };
}
