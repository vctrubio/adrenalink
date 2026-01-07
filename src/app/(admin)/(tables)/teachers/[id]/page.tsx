import { getTeacherId } from "@/supabase/server/teacher-id";
import { TeacherData } from "@/backend/data/TeacherData";
import { TeacherTableGetters } from "@/getters/table-getters";
import { getStat } from "@/backend/RenderStats";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { TeacherLeftColumn } from "./TeacherLeftColumn";
import { TeacherRightColumn } from "./TeacherRightColumn";

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getTeacherId(id);

    if (!result.success || !result.data) {
        return <div>Teacher not found</div>;
    }

    const teacher: TeacherData = result.data;

    const stats = [
        getStat("teacher", `${teacher.schema.first_name} ${teacher.schema.last_name}`, teacher.schema.first_name),
        getStat("lessons", TeacherTableGetters.getLessonCount(teacher)),
        getStat("events", TeacherTableGetters.getEventCount(teacher)),
        getStat("duration", TeacherTableGetters.getTotalDurationMinutes(teacher)),
        getStat("commission", TeacherTableGetters.getCommissionEarned(teacher)),
        getStat("profit", TeacherTableGetters.getProfit(teacher)),
    ].filter(Boolean) as any[];

    return (
        <EntityIdLayout
            stats={stats}
            leftColumn={<TeacherLeftColumn teacher={teacher} />}
            rightColumn={<TeacherRightColumn teacher={teacher} />}
        />
    );
}
