import type { PackageTableData, PackageTableStats } from "@/config/tables";

/**
 * Aggregates statistics for a list of packages
 */
export function getAggregatePackages(packages: PackageTableData[]): PackageTableStats {
    return packages.reduce(
        (acc, curr) => ({
            packageCount: acc.packageCount + 1,
            totalBookings: acc.totalBookings + curr.stats.totalBookings,
            totalRequests: acc.totalRequests + curr.stats.totalRequests,
            totalRevenue: acc.totalRevenue + curr.stats.totalRevenue,
        }),
        {
            packageCount: 0,
            totalBookings: 0,
            totalRequests: 0,
            totalRevenue: 0,
        }
    );
}
