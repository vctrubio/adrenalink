import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import { MasterAdminLayout } from "@/src/components/layouts/MasterAdminLayout";
import type { SchoolPackageModel } from "@/backend/models";
import { PackageLeftColumn } from "./PackageLeftColumn";
import { PackageStatsColumns } from "./PackageStatsColumns";

export default async function PackageDetailPage({ params }: { params: { id: string } }) {
    const schoolHeader = await getSchoolHeader();

    if (!schoolHeader) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: School context not found</div>
            </div>
        );
    }

    const result = await getEntityId("schoolPackage", params.id);

    if (!result.success) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: {result.error}</div>
            </div>
        );
    }

    const schoolPackage = result.data as SchoolPackageModel;

    // Verify package belongs to the school
    if (schoolPackage.schema.schoolId !== schoolHeader.id) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: You do not have permission to view this package</div>
            </div>
        );
    }

    return (
        <MasterAdminLayout
            controller={<PackageLeftColumn schoolPackage={schoolPackage} />}
            form={
                <>
                    <PackageStatsColumns schoolPackage={schoolPackage} />
                </>
            }
        />
    );
}
