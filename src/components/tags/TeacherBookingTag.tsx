"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";
import { ENTITY_DATA } from "@/config/entities";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";

interface TeacherBookingTagProps {
    icon: ReactNode;
    username: string;
    link?: string;
    duration?: string;
    eventCount?: number;
}

export const TeacherBookingTag = ({ icon, username, link, duration, eventCount }: TeacherBookingTagProps) => {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;

    const flagIcon = eventCount !== undefined ? <FlagIcon size={12} className="w-3 h-3" /> : null;
    const durationIcon = duration !== undefined ? <DurationIcon size={12} className="w-3 h-3" /> : null;

    return (
        <Tag
            icon={icon}
            name={username}
            bgColor="#e5e7eb"
            borderColorHex={teacherEntity.color}
            color="#4b5563"
            link={link}
            flagIcon={flagIcon}
            eventCount={eventCount}
            durationIcon={durationIcon}
            duration={duration}
        />
    );
};
