import { getStudents } from "@/actions/databoard-action";
import { getSchoolHeader } from "@/types/headers";
import { DataboardPageClient } from "@/src/components/databoard/DataboardPageClient";
import { StudentRow, calculateStudentGroupStats } from "@/src/components/databoard/rows/StudentRow";

export default async function StudentsPage() {
    const result = await getStudents();
    const schoolHeader = await getSchoolHeader();

    if (!result.success) {
        return <div>Error loading students: {result.error}</div>;
    }

    return (
        <DataboardPageClient
            entityId="student"
            data={result.data}
            rowComponent={StudentRow}
            calculateStats={calculateStudentGroupStats}
            schoolId={schoolHeader?.id}
        />
    );
}
