"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";
import { ENTITY_DATA } from "@/config/entities";

interface LessonCreateTagProps {
    icon: ReactNode;
    onClick?: () => void;
}

export const LessonCreateTag = ({ icon, onClick }: LessonCreateTagProps) => {
    const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson")!;

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            console.log("Creating new lesson...");
        }
    };

    return (
        <div onClick={handleClick}>
            <Tag
                icon={icon}
                name="Create"
                bgColor={lessonEntity.bgColor}
                borderColorHex={lessonEntity.bgColor}
                color={lessonEntity.color}
            />
        </div>
    );
};
