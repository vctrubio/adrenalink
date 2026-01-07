import type { PackageWithUsageStats, PackageTableStats } from "@/config/tables";

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
