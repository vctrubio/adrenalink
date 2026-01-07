import { getPackageId } from "@/supabase/server/package-id";
import { PackageData } from "@/backend/data/PackageData";
import { PackageTableGetters } from "@/getters/table-getters";
import { getStat } from "@/backend/RenderStats";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { PackageLeftColumn } from "./PackageLeftColumn";
import { PackageRightColumn } from "./PackageRightColumn";

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getPackageId(id);

    if (!result.success || !result.data) {
        return <div>Package not found</div>;
    }

    const packageData: PackageData = result.data;

    const stats = [
        getStat("package", packageData.schema.description, packageData.schema.description),
        getStat("requests", PackageTableGetters.getRequestCount(packageData)),
        getStat("bookings", PackageTableGetters.getBookingCount(packageData)),
        getStat("students", PackageTableGetters.getTotalStudents(packageData)),
        getStat("revenue", PackageTableGetters.getRevenue(packageData)),
    ].filter(Boolean) as any[];

    return (
        <EntityIdLayout
            stats={stats}
            leftColumn={<PackageLeftColumn packageData={packageData} />}
            rightColumn={<PackageRightColumn packageData={packageData} />}
        />
    );
}
