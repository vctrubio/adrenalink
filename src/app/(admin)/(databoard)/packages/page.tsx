import { getSchoolPackages } from "@/actions/databoard-action";
import { DataboardPageClient } from "@/src/components/databoard/DataboardPageClient";

export default async function PackagesPage() {
    const result = await getSchoolPackages();

    if (!result.success) {
        return <div>Error loading packages: {result.error}</div>;
    }

    return <DataboardPageClient entityId="schoolPackage" data={result.data} />;
}
