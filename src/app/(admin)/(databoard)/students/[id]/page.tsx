import { getEntityId } from "@/actions/id-actions";
import type { StudentModel } from "@/backend/models";
import { EntityHeaderRow } from "@/src/components/databoard/EntityHeaderRow";
import { StudentIdStats } from "@/src/components/databoard/stats/StudentIdStats";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { StudentLeftColumn } from "./StudentLeftColumn";
import { StudentRightColumn } from "./StudentRightColumn";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getEntityId("student", id);

    if (!result.success) {
        return (
            <EntityIdLayout
                header={
                    <EntityHeaderRow
                        entityId="student"
                        entityName={`Student ${id}`}
                        stats={[]}
                    />
                }
                leftColumn={<div>Student not found</div>}
                rightColumn={null}
            />
        );
    }

    const student = result.data as StudentModel;
    const studentStats = StudentIdStats.getStats(student);
    const entityName = `${student.updateForm.firstName} ${student.updateForm.lastName}`;

    return (
        <EntityIdLayout
            header={
                <EntityHeaderRow
                    entityId="student"
                    entityName={entityName}
                    stats={studentStats}
                />
            }
            leftColumn={<StudentLeftColumn student={student} />}
            rightColumn={<StudentRightColumn student={student} />}
        />
    );
}
