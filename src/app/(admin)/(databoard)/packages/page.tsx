import { getSchoolPackagesWithStats } from "@/actions/packages-action";
import { DataboardRowsSection } from "@/src/components/databoard/ClientDataHeader";
import { SchoolPackageRow } from "@/src/components/databoard/rows/SchoolPackageRow";

export default async function SchoolPackagesPage() {
    const result = await getSchoolPackagesWithStats();

    if (!result.success) {
        return <div>Error loading school packages: {result.error}</div>;
    }

    return (
        <div>
            <DataboardRowsSection entityId="schoolPackage" data={result.data} rowComponent={SchoolPackageRow} />
        </div>
    );
}
