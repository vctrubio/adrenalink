import { getEntityId } from "@/actions/id-actions";
import type { TeacherModel } from "@/backend/models";
import { InfoHeader } from "../../InfoHeader";

export default async function TeacherPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getEntityId("teacher", id);

    if (!result.success) {
        return <InfoHeader title={`Teacher ${id}`} />;
    }

    const teacher = result.data as TeacherModel;
    const teacherName = `${teacher.schema.firstName} ${teacher.schema.lastName}`;

    return (
        <>
            <InfoHeader title={teacherName} />
            <div className="space-y-4">
                {/* Teacher details will go here */}
            </div>
        </>
    );
}
