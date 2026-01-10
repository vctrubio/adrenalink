import { getTeacherId } from "@/supabase/server/teacher-id";
import { TeacherData } from "@/backend/data/TeacherData";
import { TeacherTableGetters } from "@/getters/table-getters";
import { getStat } from "@/backend/RenderStats";
import { EntityIdLayout } from "@/src/components/layouts/EntityIdLayout";
import { TeacherLeftColumn } from "./TeacherLeftColumn";
import { TeacherRightColumn } from "./TeacherRightColumn";

import { TableLayout } from "../../TableLayout";
import type { TableStat } from "../../TablesHeaderStats";

export default async function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getTeacherId(id);

    if (!result.success || !result.data) {
        return <div>Teacher not found</div>;
    }

    const teacher: TeacherData = result.data;

    const stats: TableStat[] = [
        {
            type: "teachers",
            value: `${teacher.schema.first_name} ${teacher.schema.last_name}`,
            desc: "Instructor Profile",
        },
        {
            type: "lessons",
            value: TeacherTableGetters.getLessonCount(teacher),
            desc: "Total lessons taught",
        },
        {
            type: "duration",
            value: TeacherTableGetters.getTotalDurationMinutes(teacher),
            desc: "Total instruction time",
        },
        {
            type: "commission",
            value: TeacherTableGetters.getCommissionEarned(teacher),
            desc: "Total earned commissions",
        },
    ];

    return (
        <TableLayout stats={stats} showSearch={false}>
            <EntityIdLayout
                stats={stats}
                leftColumn={<TeacherLeftColumn teacher={teacher} />}
                rightColumn={<TeacherRightColumn teacher={teacher} />}
            />
        </TableLayout>
    );
}
