import { getSchoolPackages } from "@/actions/databoard-action";
import { DataboardPageClient } from "@/src/components/databoard/DataboardPageClient";
import { schoolPackageRenderers, calculateSchoolPackageGroupStats } from "@/src/components/databoard/rows/SchoolPackageRow";

export default async function PackagesPage() {
    const result = await getSchoolPackages();

    if (!result.success) {
        return <div>Error loading packages: {result.error}</div>;
    }

    return <DataboardPageClient entityId="schoolPackage" data={result.data} renderers={schoolPackageRenderers} calculateStats={calculateSchoolPackageGroupStats} />;
}
