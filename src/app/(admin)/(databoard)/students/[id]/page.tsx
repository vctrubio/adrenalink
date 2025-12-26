import { getEntityId } from "@/actions/id-actions";
import type { StudentModel } from "@/backend/models";
import { EntityHeaderRow } from "@/src/components/databoard/EntityHeaderRow";
import { StudentIdStats } from "@/src/components/databoard/stats/StudentIdStats";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { StudentLeftColumnV2 } from "./StudentLeftColumnV2";
import { StudentRightColumnV2 } from "./StudentRightColumnV2";

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
            leftColumn={<StudentLeftColumnV2 student={student} />}
            rightColumn={<StudentRightColumnV2 student={student} />}
        />
    );
}
