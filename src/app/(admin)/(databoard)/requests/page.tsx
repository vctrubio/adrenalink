import { getStudentPackagesWithStats } from "@/actions/student-package-action";
import { DataboardRowsSection } from "@/src/components/databoard/ClientDataHeader";
import { StudentPackageRow } from "@/src/components/databoard/rows/StudentPackageRow";

export default async function StudentPackagesRequestsPage() {
    const result = await getStudentPackagesWithStats();

    if (!result.success) {
        return <div>Error loading student package requests: {result.error}</div>;
    }

    console.log("StudentPackagesRequestsPage rendered with data:", result.data);

    return (
        <div>
            <DataboardRowsSection entityId="studentPackage" data={result.data} rowComponent={StudentPackageRow} />
        </div>
    );
}
