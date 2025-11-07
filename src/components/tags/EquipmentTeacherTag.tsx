"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";
import { ENTITY_DATA } from "@/config/entities";

interface EquipmentTeacherTagProps {
    icon: ReactNode;
    username: string;
    hours: number;
    link?: string;
}

export const EquipmentTeacherTag = ({ icon, username, hours, link }: EquipmentTeacherTagProps) => {
    const teacherEntity = ENTITY_DATA.find(e => e.id === "teacher")!;
    const displayText = `${username} (${Math.round(hours)}h)`;

    return <Tag icon={icon} name={displayText} bgColor="#e5e7eb" borderColorHex={teacherEntity.color} color="#4b5563" link={link} />;
};
