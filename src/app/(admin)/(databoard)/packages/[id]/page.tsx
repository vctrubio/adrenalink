import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import type { SchoolPackageModel } from "@/backend/models";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { PackageIdStats } from "@/src/components/databoard/stats/PackageIdStats";
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

    const stats = PackageIdStats.getStats(schoolPackage);

    return (
        <EntityIdLayout
            stats={stats}
            leftColumn={<PackageLeftColumn schoolPackage={schoolPackage} />}
            rightColumn={<PackageRightColumn schoolPackage={schoolPackage} />}
        />
    );
}
