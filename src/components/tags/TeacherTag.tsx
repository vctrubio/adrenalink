"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";
import { ENTITY_DATA } from "@/config/entities";

interface TeacherTagProps {
    icon: ReactNode;
    username: string;
    id: string;
}

export const TeacherTag = ({ icon, username, id }: TeacherTagProps) => {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;

    return (
        <Tag
            icon={icon}
            name={username}
            bgColor={teacherEntity.bgColor}
            borderColorHex={teacherEntity.bgColor}
            color={teacherEntity.color}
            link={`/teachers/${username}`}
        />
    );
};
