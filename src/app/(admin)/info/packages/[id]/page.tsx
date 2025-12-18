import { getEntityId } from "@/actions/id-actions";
import type { SchoolPackageModel } from "@/backend/models";
import { InfoHeader } from "../../InfoHeader";

export default async function PackagePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getEntityId("schoolPackage", id);

    if (!result.success) {
        return <InfoHeader title={`Package ${id}`} />;
    }

    const pkg = result.data as SchoolPackageModel;
    const packageTitle = pkg.schema.description;

    return (
        <>
            <InfoHeader title={packageTitle} />
            <div className="space-y-4">
                {/* Package details will go here */}
            </div>
        </>
    );
}
