import { getEntityId } from "@/actions/id-actions";
import type { StudentModel } from "@/backend/models";
import { StudentIdStats } from "@/src/components/databoard/stats/StudentIdStats";
import { StudentDetailWrapper } from "./StudentDetailWrapper";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getEntityId("student", id);

    if (!result.success) {
        return <div>Student not found</div>;
    }

    const student = result.data as StudentModel;
    const stats = StudentIdStats.getStats(student);

    return <StudentDetailWrapper student={student} stats={stats} />;
}
