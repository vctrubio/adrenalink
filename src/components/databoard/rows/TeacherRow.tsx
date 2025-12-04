"use client";

import { Row, type StatItem } from "@/src/components/ui/row";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { LessonTag, LessonCreateTag } from "@/src/components/tags";
import { TeacherEventEquipmentPopover } from "@/src/components/popover/TeacherEventEquipmentPopover";
import { ENTITY_DATA } from "@/config/entities";
import { TeacherStats, isTeacherLessonReady } from "@/getters/teachers-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import { TEACHER_STATUS_CONFIG, type TeacherStatus } from "@/types/status";
import { updateTeacherActive } from "@/actions/teachers-action";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import type { TeacherModel } from "@/backend/models";
import type { DropdownItemProps } from "@/src/components/ui/dropdown";

export function calculateTeacherGroupStats(teachers: TeacherModel[]): StatItem[] {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
    const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson")!;
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

    const totalLessons = teachers.reduce((sum, teacher) => sum + TeacherStats.getLessonsCount(teacher), 0);
    const totalEvents = teachers.reduce((sum, teacher) => sum + TeacherStats.getEventsCount(teacher), 0);
    const totalMinutes = teachers.reduce((sum, teacher) => sum + (teacher.stats?.total_duration_minutes || 0), 0);
    const totalMoneyEarned = teachers.reduce((sum, teacher) => sum + TeacherStats.getMoneyEarned(teacher), 0);
    const bankColor = totalMoneyEarned >= 0 ? "#10b981" : "#ef4444";

    return [
        { icon: <HeadsetIcon className="w-5 h-5" />, value: teachers.length, color: teacherEntity.color },
        { icon: <LessonIcon className="w-5 h-5" />, value: totalLessons, color: lessonEntity.color },
        { icon: <FlagIcon className="w-5 h-5" />, value: totalEvents, color: eventEntity.color },
        { icon: <DurationIcon className="w-5 h-5" />, value: getPrettyDuration(totalMinutes), color: "#4b5563" },
        { icon: <BankIcon className="w-5 h-5" />, value: Math.abs(totalMoneyEarned), color: bankColor },
    ];
}

const TeacherAction = ({ teacher }: { teacher: TeacherModel }) => {
    const lessons = teacher.relations?.lessons || [];
    const lessonReady = isTeacherLessonReady(teacher);

    return (
        <div className="flex flex-wrap gap-2">
            {lessons.length === 0 && !lessonReady ? null : (
                <>
                    {lessonReady && <LessonCreateTag icon={<LessonIcon className="w-3 h-3" />} onClick={() => console.log("Creating new lesson...")} />}
                    {lessons.map((lesson) => (
                        <LessonTag key={lesson.id} icon={<LessonIcon className="w-3 h-3" />} createdAt={lesson.createdAt} status={lesson.status} />
                    ))}
                </>
            )}
        </div>
    );
};

interface TeacherRowProps {
    item: TeacherModel;
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

function validateActivity(fromStatus: TeacherStatus, toStatus: TeacherStatus): boolean {
    console.log(`checking validation for status update ${fromStatus} to ${toStatus}`);
    return true;
}

export const TeacherRow = ({ item: teacher, isExpanded, onToggle }: TeacherRowProps) => {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
    const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson")!;
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

    const TeacherIcon = teacherEntity.icon;
    const entityColor = teacherEntity.color;
    const iconColor = isExpanded ? entityColor : "#9ca3af";

    const currentStatus = teacher.schema.active ? "active" : "inactive";
    const currentStatusConfig = TEACHER_STATUS_CONFIG[currentStatus];

    const statusDropdownItems: DropdownItemProps[] = (["active", "inactive"] as const).map((status) => ({
        id: status,
        label: TEACHER_STATUS_CONFIG[status].label,
        icon: () => <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TEACHER_STATUS_CONFIG[status].color }} />,
        color: TEACHER_STATUS_CONFIG[status].color,
        onClick: async () => {
            if (validateActivity(currentStatus, status)) {
                await updateTeacherActive(teacher.schema.id, status === "active");
            }
        },
    }));

    const strItems = [
        { label: "First Name", value: teacher.schema.firstName },
        { label: "Last Name", value: teacher.schema.lastName },
        { label: "Phone", value: teacher.schema.phone },
        { label: "Passport", value: teacher.schema.passport },
        { label: "Country", value: teacher.schema.country },
        { label: "Languages", value: teacher.schema.languages.join(", ") },
    ];

    const moneyEarned = TeacherStats.getMoneyEarned(teacher);
    const bankColor = moneyEarned >= 0 ? "#10b981" : "#ef4444";

    const stats: StatItem[] = [
        { icon: <LessonIcon className="w-5 h-5" />, value: TeacherStats.getLessonsCount(teacher), color: lessonEntity.color },
        { icon: <FlagIcon className="w-5 h-5" />, value: TeacherStats.getEventsCount(teacher), color: eventEntity.color },
        { icon: <DurationIcon className="w-5 h-5" />, value: getPrettyDuration(teacher.stats?.total_duration_minutes || 0), color: "#4b5563" },
        { icon: <BankIcon className="w-5 h-5" />, value: Math.abs(moneyEarned), color: bankColor },
    ];

    return (
        <Row
            id={teacher.schema.id}
            entityData={teacher.schema}
            entityBgColor={teacherEntity.bgColor}
            entityColor={teacherEntity.color}
            isExpanded={isExpanded}
            onToggle={onToggle}
            head={{
                avatar: (
                    <div style={{ color: iconColor }}>
                        <TeacherIcon className="w-10 h-10" />
                    </div>
                ),
                name: (
                    <HoverToEntity entity={teacherEntity} id={teacher.schema.username}>
                        {teacher.schema.username}
                    </HoverToEntity>
                ),
                status: currentStatusConfig.label,
                dropdownItems: statusDropdownItems,
                statusColor: currentStatusConfig.color,
            }}
            str={{
                label: "Details",
                items: strItems,
            }}
            action={<TeacherAction teacher={teacher} />}
            popover={<TeacherEventEquipmentPopover teacher={teacher} />}
            stats={stats}
        />
    );
};
