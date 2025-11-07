"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";
import { ENTITY_DATA } from "@/config/entities";

interface TeacherBookingTagProps {
    icon: ReactNode;
    username: string;
    link?: string;
}

export const TeacherBookingTag = ({ icon, username, link }: TeacherBookingTagProps) => {
    const teacherEntity = ENTITY_DATA.find(e => e.id === "teacher")!;

    return <Tag icon={icon} name={username} bgColor="#e5e7eb" borderColorHex={teacherEntity.color} color="#4b5563" link={link} />;
};
