"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";
import { ENTITY_DATA } from "@/config/entities";

interface TeacherBookingCreateTagProps {
    icon: ReactNode;
    onClick?: () => void;
}

export const TeacherBookingCreateTag = ({ icon, onClick }: TeacherBookingCreateTagProps) => {
    const teacherEntity = ENTITY_DATA.find(e => e.id === "teacher")!;

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            console.log("Creating new teacher lesson...");
        }
    };

    return (
        <div onClick={handleClick}>
            <Tag
                icon={icon}
                name="Assign"
                bgColor="#e5e7eb"
                borderColorHex={teacherEntity.color}
                color="#4b5563"
            />
        </div>
    );
};
