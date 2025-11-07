import { getTeachers } from "@/actions/databoard-action";
import { ClientDataHeader } from "@/src/components/databoard/ClientDataHeader";
import { TeacherRow } from "@/src/components/databoard/rows/TeacherRow";

export default async function TeachersPage() {
    const result = await getTeachers();

    if (!result.success) {
        return <div>Error loading teachers: {result.error}</div>;
    }

    return (
        <div className="p-8">
            <ClientDataHeader entityId="teacher" data={result.data} rowComponent={TeacherRow} />
        </div>
    );
}
