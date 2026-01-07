import { getPackagesTable } from "@/supabase/server/packages";
import { PackagesTable } from "./PackagesTable";
import { TablesPageClient } from "@/src/components/tables/TablesPageClient";
import type { TableStat } from "@/src/components/tables/TablesHeaderStats";

export default async function PackagesMasterTablePage() {
    const packages = await getPackagesTable();

    // Calculate stats
    const totalPackages = packages.length;
    let totalBookings = 0;

    packages.forEach(p => {
        totalBookings += p.usageStats.bookingCount;
    });

    const stats: TableStat[] = [
        { type: "package", value: totalPackages },
        { type: "bookings", value: totalBookings, label: "Usage" }
    ];

    return (
        <TablesPageClient
            title="Packages Master Table"
            description="Manage school packages, lesson pricing, and student capacity."
            stats={stats}
        >
            <PackagesTable packages={packages} />
        </TablesPageClient>
    );
}