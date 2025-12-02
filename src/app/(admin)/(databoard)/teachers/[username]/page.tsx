import { getEntityId } from "@/actions/id-actions";
import { getSchoolIdFromHeader } from "@/types/headers";
import { MasterAdminLayout } from "@/src/components/layouts/MasterAdminLayout";
import { getTeacherLessonStats } from "@/getters/teacher-lesson-stats-getter";
import type { TeacherModel } from "@/backend/models";
import { TeacherLeftColumn } from "./TeacherLeftColumn";
import { TeacherLessonStats } from "./TeacherLessonStats";
import { TeacherStatsColumns } from "./TeacherStatsColumns";

export default async function TeacherDetailPage({ params }: { params: { username: string } }) {
    const schoolId = await getSchoolIdFromHeader();

    if (!schoolId) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: School context not found</div>
            </div>
        );
    }

    const result = await getEntityId("teacher", params.username);

    if (!result.success) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: {result.error}</div>
            </div>
        );
    }

    const teacher = result.data as TeacherModel;
    const lessonStats = getTeacherLessonStats(teacher);

    // Verify teacher belongs to the school
    if (teacher.updateForm.schoolId !== schoolId) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: You do not have permission to view this teacher</div>
            </div>
        );
    }

    return (
        <MasterAdminLayout
            controller={<TeacherLeftColumn teacher={teacher} />}
            form={
                <>
                    <TeacherStatsColumns teacher={teacher} />

                    {/* Teacher Lesson Stats */}
                    <TeacherLessonStats lessons={lessonStats} />
                </>
            }
        />
    );
}
