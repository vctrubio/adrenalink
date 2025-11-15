import { getTeachers } from "@/actions/databoard-action";
import { DataboardRowsSection } from "@/src/components/databoard/ClientDataHeader";
import { TeacherRow } from "@/src/components/databoard/rows/TeacherRow";

export default async function TeachersPage() {
    const result = await getTeachers();

    if (!result.success) {
        return <div>Error loading teachers: {result.error}</div>;
    }

    return (
        <div>
            <DataboardRowsSection entityId="teacher" data={result.data} rowComponent={TeacherRow} />
        </div>
    );
}
