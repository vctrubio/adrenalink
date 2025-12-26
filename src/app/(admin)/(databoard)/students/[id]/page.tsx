import { getEntityId } from "@/actions/id-actions";
import type { StudentModel } from "@/backend/models";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { StudentLeftColumn } from "./StudentLeftColumn";
import { StudentRightColumn } from "./StudentRightColumn";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getEntityId("student", id);

    if (!result.success) {
        return (
            <EntityIdLayout
                leftColumn={<div>Student not found</div>}
                rightColumn={null}
            />
        );
    }

    const student = result.data as StudentModel;

    return (
        <EntityIdLayout
            leftColumn={<StudentLeftColumn student={student} />}
            rightColumn={<StudentRightColumn student={student} />}
        />
    );
}
