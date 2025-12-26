import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import type { SchoolPackageModel } from "@/backend/models";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { PackageLeftColumn } from "./PackageLeftColumn";
import { PackageRightColumn } from "./PackageRightColumn";

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const schoolHeader = await getSchoolHeader();

    if (!schoolHeader) {
        return (
            <EntityIdLayout
                leftColumn={<div>School context not found</div>}
                rightColumn={null}
            />
        );
    }

    const result = await getEntityId("schoolPackage", id);

    if (!result.success) {
        return (
            <EntityIdLayout
                leftColumn={<div>Package not found</div>}
                rightColumn={null}
            />
        );
    }

    const schoolPackage = result.data as SchoolPackageModel;

    // Verify package belongs to the school
    if (schoolPackage.schema.schoolId !== schoolHeader.id) {
        return (
            <EntityIdLayout
                leftColumn={<div>You do not have permission to view this package</div>}
                rightColumn={null}
            />
        );
    }

    return (
        <EntityIdLayout
            leftColumn={<PackageLeftColumn schoolPackage={schoolPackage} />}
            rightColumn={<PackageRightColumn schoolPackage={schoolPackage} />}
        />
    );
}
