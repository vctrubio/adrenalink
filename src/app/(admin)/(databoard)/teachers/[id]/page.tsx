import { getEntityId } from "@/actions/id-actions";
import { getSchoolHeader } from "@/types/headers";
import type { TeacherModel } from "@/backend/models";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { TeacherLeftColumn } from "./TeacherLeftColumn";
import { TeacherRightColumn } from "./TeacherRightColumn";

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const schoolHeader = await getSchoolHeader();

    if (!schoolHeader) {
        return <EntityIdLayout leftColumn={<div>School context not found</div>} rightColumn={null} />;
    }

    const result = await getEntityId("teacher", id);

    if (!result.success) {
        return <EntityIdLayout leftColumn={<div>Teacher not found</div>} rightColumn={null} />;
    }

    const teacher = result.data as TeacherModel;

    // Verify teacher belongs to the school
    if (teacher.updateForm.schoolId !== schoolHeader.id) {
        return <EntityIdLayout leftColumn={<div>You do not have permission to view this teacher</div>} rightColumn={null} />;
    }

    return <EntityIdLayout leftColumn={<TeacherLeftColumn teacher={teacher} />} rightColumn={<TeacherRightColumn teacher={teacher} />} />;
}
