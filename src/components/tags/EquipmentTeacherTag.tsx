"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";
import { ENTITY_DATA } from "@/config/entities";
import DurationIcon from "@/public/appSvgs/DurationIcon";

interface EquipmentTeacherTagProps {
    icon: ReactNode;
    username: string;
    hours: number;
    link?: string;
    duration?: string;
}

export const EquipmentTeacherTag = ({ icon, username, hours, link, duration }: EquipmentTeacherTagProps) => {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
    const displayText = username;
    const durationIcon = duration ? <DurationIcon className="w-3 h-3" /> : null;

    return (
        <Tag
            icon={icon}
            name={displayText}
            bgColor="#e5e7eb"
            borderColorHex={teacherEntity.color}
            color="#4b5563"
            link={link}
            durationIcon={durationIcon}
            duration={duration}
        />
    );
};
