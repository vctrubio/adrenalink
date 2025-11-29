import { getStudents } from "@/actions/databoard-action";
import { DataboardRowsSection } from "@/src/components/databoard/ClientDataHeader";
import { StudentRow } from "@/src/components/databoard/rows/StudentRow";

export default async function StudentsPage() {
    const result = await getStudents();

    if (!result.success) {
        return <div>Error loading students: {result.error}</div>;
    }

    return (
        <div>
            <DataboardRowsSection entityId="student" data={result.data} rowComponent={StudentRow} />
        </div>
    );
}
