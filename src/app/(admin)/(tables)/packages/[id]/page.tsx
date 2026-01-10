import { getPackageId } from "@/supabase/server/package-id";
import { PackageData } from "@/backend/data/PackageData";
import { PackageTableGetters } from "@/getters/table-getters";
import { getStat } from "@/backend/RenderStats";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { PackageLeftColumn } from "./PackageLeftColumn";
import { PackageRightColumn } from "./PackageRightColumn";

import { TableLayout } from "../../TableLayout";
import type { TableStat } from "../../TablesHeaderStats";

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getPackageId(id);

    if (!result.success || !result.data) {
        return <div>Package not found</div>;
    }

    const packageData: PackageData = result.data;

    const stats: TableStat[] = [
        {
            type: "package",
            value: packageData.schema.description,
            desc: "Package Name",
        },
        {
            type: "bookings",
            value: PackageTableGetters.getBookingCount(packageData),
            label: "Bookings",
            desc: "Total bookings",
        },
        {
            type: "requests",
            value: PackageTableGetters.getRequestCount(packageData),
            label: "Requests",
            desc: "Total requests",
        },
        {
            type: "revenue",
            value: PackageTableGetters.getRevenue(packageData),
            desc: "Total revenue",
        },
    ];

    return (
        <TableLayout stats={stats} showSearch={false}>
            <EntityIdLayout
                stats={stats}
                leftColumn={<PackageLeftColumn packageData={packageData} />}
                rightColumn={<PackageRightColumn packageData={packageData} />}
            />
        </TableLayout>
    );
}
