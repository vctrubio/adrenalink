import { getStudents } from "@/actions/databoard-action";
import { DataboardRowsSection } from "@/src/components/databoard/ClientDataHeader";
import { StudentRow } from "@/src/components/databoard/rows/StudentRow";
import type { StudentType } from "@/drizzle/schema";

export default async function StudentsPage() {
    const result = await getStudents();

    if (!result.success) {
        return <div>Error loading students: {result.error}</div>;
    }

    return (
        <DataboardRowsSection<StudentType>
            entityId="student"
            data={result.data}
            rowComponent={StudentRow}
        />
    );
}
