"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";
import { ENTITY_DATA } from "@/config/entities";
import { formatDate } from "@/getters/date-getter";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";

interface LessonTagProps {
    icon: ReactNode;
    createdAt: string | Date;
    status: "active" | "rest" | "completed" | "uncompleted";
    link?: string;
    duration?: string;
    eventCount?: number;
}

export const LessonTag = ({ icon, createdAt, status, link, duration, eventCount }: LessonTagProps) => {
    const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson")!;
        const formattedDate = formatDate(createdAt);
        
        const flagIcon = eventCount !== undefined ? <FlagIcon size={12} className="w-3 h-3" /> : null;
        const durationIcon = duration !== undefined ? <DurationIcon size={12} className="w-3 h-3" /> : null;
        
        const displayName = formattedDate;
    const isCompleted = status === "completed";
    const color = isCompleted ? lessonEntity.color : "#9ca3af";
    const bgColor = isCompleted ? lessonEntity.bgColor : "#e5e7eb";

    return <Tag icon={icon} name={displayName} bgColor={bgColor} borderColorHex={lessonEntity.bgColor} color={color} link={link} flagIcon={flagIcon} eventCount={eventCount} durationIcon={durationIcon} duration={duration} />;
};
