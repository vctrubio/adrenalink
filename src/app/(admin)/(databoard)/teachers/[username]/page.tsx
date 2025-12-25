import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import type { TeacherModel } from "@/backend/models";
import { EntityHeaderRow } from "@/src/components/databoard/EntityHeaderRow";
import { TeacherIdStats } from "@/src/components/databoard/stats/TeacherIdStats";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { TeacherLeftColumn } from "./TeacherLeftColumn";
import { TeacherRightColumnV2 } from "./TeacherRightColumnV2";

export default async function TeacherDetailPage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const schoolHeader = await getSchoolHeader();

    if (!schoolHeader) {
        return (
            <EntityIdLayout
                header={
                    <EntityHeaderRow
                        entityId="teacher"
                        entityName={`Teacher ${username}`}
                        stats={[]}
                    />
                }
                leftColumn={<div>School context not found</div>}
                rightColumn={null}
            />
        );
    }

    const result = await getEntityId("teacher", username);

    if (!result.success) {
        return (
            <EntityIdLayout
                header={
                    <EntityHeaderRow
                        entityId="teacher"
                        entityName={`Teacher ${username}`}
                        stats={[]}
                    />
                }
                leftColumn={<div>Teacher not found</div>}
                rightColumn={null}
            />
        );
    }

    const teacher = result.data as TeacherModel;

    // Verify teacher belongs to the school
    if (teacher.updateForm.schoolId !== schoolHeader.id) {
        return (
            <EntityIdLayout
                header={
                    <EntityHeaderRow
                        entityId="teacher"
                        entityName={`Teacher ${username}`}
                        stats={[]}
                    />
                }
                leftColumn={<div>You do not have permission to view this teacher</div>}
                rightColumn={null}
            />
        );
    }

    const teacherStats = TeacherIdStats.getStats(teacher);
    const entityName = `${teacher.updateForm.firstName} ${teacher.updateForm.lastName}`;

    return (
        <EntityIdLayout
            header={
                <EntityHeaderRow
                    entityId="teacher"
                    entityName={entityName}
                    stats={teacherStats}
                />
            }
            leftColumn={<TeacherLeftColumn teacher={teacher} />}
            rightColumn={<TeacherRightColumnV2 teacher={teacher} />}
        />
    );
}
