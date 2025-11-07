import { getSchoolPackagesWithStats } from "@/actions/packages-action";
import { ClientDataHeader } from "@/src/components/databoard/ClientDataHeader";
import { SchoolPackageRow } from "@/src/components/databoard/rows/SchoolPackageRow";

export default async function SchoolPackagesPage() {
    const result = await getSchoolPackagesWithStats();

    if (!result.success) {
        return <div>Error loading school packages: {result.error}</div>;
    }

    console.log("SchoolPackagesPage rendered with data:", result.data);

    return (
        <div className="p-8">
            <ClientDataHeader entityId="schoolPackage" data={result.data} rowComponent={SchoolPackageRow} />
        </div>
    );
}
