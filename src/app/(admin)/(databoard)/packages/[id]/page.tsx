import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import type { SchoolPackageModel } from "@/backend/models";
import { SchoolPackageDataboard } from "@/getters/databoard-getter";
import { createStat } from "@/src/components/databoard/stats/stat-factory";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { PackageLeftColumn } from "./PackageLeftColumn";
import { PackageRightColumn } from "./PackageRightColumn";

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const schoolHeader = await getSchoolHeader();

    if (!schoolHeader) {
        return <div>School context not found</div>;
    }

    const result = await getEntityId("schoolPackage", id);

    if (!result.success) {
        return <div>Package not found</div>;
    }

    const schoolPackage = result.data as SchoolPackageModel;

    // Verify package belongs to the school
    if (schoolPackage.schema.schoolId !== schoolHeader.id) {
        return <div>You do not have permission to view this package</div>;
    }

    // Use stat-factory as single source of truth for presentation
    const stats = [
        createStat("events", SchoolPackageDataboard.getEventCount(schoolPackage), "Events"),
        createStat("duration", SchoolPackageDataboard.getDurationMinutes(schoolPackage), "Duration"),
        createStat("profit", SchoolPackageDataboard.getRevenue(schoolPackage), "Profit"),
    ].filter(Boolean) as any[];

    return (
        <EntityIdLayout
            stats={stats}
            leftColumn={<PackageLeftColumn schoolPackage={schoolPackage} />}
            rightColumn={<PackageRightColumn schoolPackage={schoolPackage} />}
        />
    );
}
