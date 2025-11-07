import { getStudents } from "@/actions/databoard-action";
import { ClientDataHeader } from "@/src/components/databoard/ClientDataHeader";
import { StudentRow } from "@/src/components/databoard/rows/StudentRow";

export default async function StudentsPage() {
    const result = await getStudents();

    if (!result.success) {
        return <div>Error loading students: {result.error}</div>;
    }

    console.log("StudentsPage rendered with data:", result.data);

    return (
        <div className="p-8">
            <ClientDataHeader entityId="student" data={result.data} rowComponent={StudentRow} />
        </div>
    );
}
