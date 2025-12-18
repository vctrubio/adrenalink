import { getEntityId } from "@/actions/id-actions";
import type { StudentModel } from "@/backend/models";
import { InfoHeader } from "../../InfoHeader";

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getEntityId("student", id);

    if (!result.success) {
        return <InfoHeader title={`Student ${id}`} />;
    }

    const student = result.data as StudentModel;
    const studentName = `${student.schema.firstName} ${student.schema.lastName}`;

    return (
        <>
            <InfoHeader title={studentName} />
            <div className="space-y-4">
                {/* Student details will go here */}
            </div>
        </>
    );
}
