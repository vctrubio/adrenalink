"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";
import { ENTITY_DATA } from "@/config/entities";

interface StudentTagProps {
    icon: ReactNode;
    firstName: string;
    lastName: string;
    id: string;
}

export const StudentTag = ({ icon, firstName, lastName, id }: StudentTagProps) => {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const name = `${firstName} ${lastName}`;

    return (
        <Tag
            icon={icon}
            name={name}
            bgColor={studentEntity.bgColor}
            borderColorHex={studentEntity.bgColor}
            color={studentEntity.color}
            link={`/students/${id}`}
        />
    );
};
