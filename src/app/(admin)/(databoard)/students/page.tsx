import { getStudents } from "@/actions/databoard-action";
import { DataboardPageClient } from "@/src/components/databoard/DataboardPageClient";
import { StudentRow, calculateStudentGroupStats } from "@/src/components/databoard/rows/StudentRow";

export default async function StudentsPage() {
    const result = await getStudents();

    if (!result.success) {
        return <div>Error loading students: {result.error}</div>;
    }

    return (
        <DataboardPageClient
            entityId="student"
            data={result.data}
            rowComponent={StudentRow}
            calculateStats={calculateStudentGroupStats}
        />
    );
}
