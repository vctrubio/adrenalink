import { getTeachers } from "@/actions/databoard-action";
import { getTeacherDataboardCountStatus } from "@/getters/databoard-getter";
import { ClientDataHeader } from "@/src/components/databoard/ClientDataHeader";
import { TeacherRow } from "@/src/components/databoard/rows/TeacherRow";

export default async function TeachersPage() {
    const result = await getTeachers();

    if (!result.success) {
        return <div>Error loading teachers: {result.error}</div>;
    }

    const status = getTeacherDataboardCountStatus(result.data);

    return (
        <div className="p-8">
            <ClientDataHeader entityId="teacher" status={status} data={result.data} rowComponent={TeacherRow} />
        </div>
    );
}
