import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import type { SchoolPackageModel } from "@/backend/models";
import { EntityHeaderRow } from "@/src/components/databoard/EntityHeaderRow";
import { PackageIdStats } from "@/src/components/databoard/stats/PackageIdStats";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { PackageLeftColumnV2 } from "./PackageLeftColumnV2";
import { PackageRightColumn } from "./PackageRightColumn";

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const schoolHeader = await getSchoolHeader();

    if (!schoolHeader) {
        return (
            <EntityIdLayout
                header={
                    <EntityHeaderRow
                        entityId="schoolPackage"
                        entityName={`Package ${id}`}
                        stats={[]}
                    />
                }
                leftColumn={<div>School context not found</div>}
                rightColumn={null}
            />
        );
    }

    const result = await getEntityId("schoolPackage", id);

    if (!result.success) {
        return (
            <EntityIdLayout
                header={
                    <EntityHeaderRow
                        entityId="schoolPackage"
                        entityName={`Package ${id}`}
                        stats={[]}
                    />
                }
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
                header={
                    <EntityHeaderRow
                        entityId="schoolPackage"
                        entityName={`Package ${id}`}
                        stats={[]}
                    />
                }
                leftColumn={<div>You do not have permission to view this package</div>}
                rightColumn={null}
            />
        );
    }

    const packageStats = PackageIdStats.getStats(schoolPackage);
    const entityName = schoolPackage.schema.description || "Package";

    return (
        <EntityIdLayout
            header={
                <EntityHeaderRow
                    entityId="schoolPackage"
                    entityName={entityName}
                    stats={packageStats}
                />
            }
            leftColumn={<PackageLeftColumnV2 schoolPackage={schoolPackage} />}
            rightColumn={<PackageRightColumn schoolPackage={schoolPackage} />}
        />
    );
}
