"use client";

import { type ReactNode } from "react";
import { Tag } from "./tag";
import { ENTITY_DATA } from "@/config/entities";

interface LessonTagProps {
    icon: ReactNode;
    createdAt: string | Date;
    status: "active" | "rest" | "completed" | "uncompleted";
    link?: string;
}

const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const LessonTag = ({ icon, createdAt, status, link }: LessonTagProps) => {
    const lessonEntity = ENTITY_DATA.find(e => e.id === "lesson")!;
    const formattedDate = formatDate(createdAt);

    const isCompleted = status === "completed";
    const color = isCompleted ? lessonEntity.color : "#9ca3af";
    const bgColor = isCompleted ? lessonEntity.bgColor : "#e5e7eb";

    return <Tag icon={icon} name={formattedDate} bgColor={bgColor} borderColorHex={lessonEntity.bgColor} color={color} link={link} />;
};
