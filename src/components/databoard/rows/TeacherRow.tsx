"use client";

import { Row, type StatItem } from "@/src/components/ui/row";
import { LessonTag } from "@/src/components/ui/tag";
import { ENTITY_DATA } from "@/config/entities";
import { getTeacherLessonsCount, getTeacherEventsCount, getTeacherTotalHours, getTeacherMoneyEarned } from "@/getters/teachers-getter";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import type { TeacherModel } from "@/backend/models";

const TeacherAction = ({ teacher }: { teacher: TeacherModel }) => {
    const lessons = teacher.relations?.lessons || [];

    if (lessons.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {lessons.map((lesson) => (
                <LessonTag
                    key={lesson.id}
                    icon={<LessonIcon className="w-3 h-3" />}
                    createdAt={lesson.createdAt}
                    status={lesson.status}
                />
            ))}
        </div>
    );
};

interface TeacherRowProps {
    student: TeacherModel;
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

export const TeacherRow = ({ student: teacher, isExpanded, onToggle }: TeacherRowProps) => {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
    const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson")!;
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

    const TeacherIcon = teacherEntity.icon;
    const entityColor = teacherEntity.color;
    const iconColor = isExpanded ? entityColor : "#9ca3af";

    const status = teacher.schema.active ? "Active Teacher" : "Inactive Teacher";

    const strItems = [
        { label: "First Name", value: teacher.schema.firstName },
        { label: "Last Name", value: teacher.schema.lastName },
        { label: "Phone", value: teacher.schema.phone },
        { label: "Passport", value: teacher.schema.passport },
        { label: "Country", value: teacher.schema.country },
        { label: "Languages", value: teacher.schema.languages.join(", ") },
    ];

    const moneyEarned = getTeacherMoneyEarned(teacher);
    const bankColor = moneyEarned >= 0 ? "#10b981" : "#ef4444";

    const stats: StatItem[] = [
        { icon: <LessonIcon className="w-5 h-5" />, value: getTeacherLessonsCount(teacher), color: lessonEntity.color },
        { icon: <FlagIcon className="w-5 h-5" />, value: getTeacherEventsCount(teacher), color: eventEntity.color },
        { icon: <DurationIcon className="w-5 h-5" />, value: getTeacherTotalHours(teacher), color: "#4b5563" },
        { icon: <BankIcon className="w-5 h-5" />, value: moneyEarned, color: bankColor },
    ];

    return (
        <Row
            id={teacher.schema.id}
            entityName={teacherEntity.name}
            entityBgColor={teacherEntity.bgColor}
            isExpanded={isExpanded}
            onToggle={onToggle}
            head={{
                avatar: (
                    <div style={{ color: iconColor }}>
                        <TeacherIcon className="w-10 h-10" />
                    </div>
                ),
                name: teacher.schema.username,
                status,
            }}
            str={{
                label: "Details",
                items: strItems,
            }}
            action={<TeacherAction teacher={teacher} />}
            stats={stats}
        />
    );
};
