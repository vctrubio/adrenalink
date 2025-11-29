import { getEntityId } from "@/actions/id-actions";
import { getSchoolIdFromHeader } from "@/types/headers";
import { MasterAdminLayout } from "@/src/components/layouts/MasterAdminLayout";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getTeacherLessonStats } from "@/getters/teacher-lesson-stats-getter";
import type { TeacherModel } from "@/backend/models";
import { TeacherLeftColumn } from "./TeacherLeftColumn";
import { TeacherLessonStats } from "./TeacherLessonStats";
import { StatsCard } from "@/src/components/cards/StatsCard";
import { ENTITY_DATA } from "@/config/entities";

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

    const eventEntity = ENTITY_DATA.find((e) => e.id === "event");
    const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson");

    const statsData = [
        {
            icon: "calendar",
            label: "Total Events",
            value: teacher.stats?.events_count || 0,
            color: eventEntity?.color,
        },
        {
            icon: "clock",
            label: "Total Duration",
            value: getPrettyDuration(teacher.stats?.total_duration_minutes || 0),
            color: "#f59e0b",
        },
        {
            icon: "book-open",
            label: "Lessons",
            value: teacher.stats?.lessons_count || 0,
            color: lessonEntity?.color,
        },
    ];

    return (
        <MasterAdminLayout
            controller={<TeacherLeftColumn teacher={teacher} />}
            form={
                <>
                    <StatsCard title="Statistics" stats={statsData} />

                    {/* Financial Info */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Financial</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Earnings</p>
                                <p className="text-xl font-bold text-green-600">${teacher.stats?.money_in || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Payouts</p>
                                <p className="text-xl font-bold text-red-600">${teacher.stats?.money_out || 0}</p>
                            </div>
                            <div className="border-t border-border pt-4">
                                <p className="text-sm text-muted-foreground">Balance</p>
                                <p className="text-xl font-bold" style={{ color: (teacher.stats?.money_in || 0) - (teacher.stats?.money_out || 0) >= 0 ? "#10b981" : "#ef4444" }}>
                                    ${(teacher.stats?.money_in || 0) - (teacher.stats?.money_out || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Teacher Lesson Stats */}
                    <TeacherLessonStats lessons={lessonStats} />
                </>
            }
        />
    );
}
