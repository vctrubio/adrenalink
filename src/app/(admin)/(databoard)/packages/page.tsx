import { getSchoolPackagesWithStats } from "@/actions/packages-action";
import { DataboardPageClient } from "@/src/components/databoard/DataboardPageClient";
import { SchoolPackageRow, calculateSchoolPackageGroupStats } from "@/src/components/databoard/rows/SchoolPackageRow";

export default async function SchoolPackagesPage() {
    const result = await getSchoolPackagesWithStats();

    if (!result.success) {
        return <div>Error loading school packages: {result.error}</div>;
    }

    return <DataboardPageClient entityId="schoolPackage" data={result.data} rowComponent={SchoolPackageRow} calculateStats={calculateSchoolPackageGroupStats} />;
}
