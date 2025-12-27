"use client";

import { motion } from "framer-motion";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { ENTITY_DATA } from "@/config/entities";
import type { TeacherModel } from "@/backend/models";

interface TeacherModalListRowProps {
    teacher: TeacherModel;
    index: number;
    isFocused: boolean;
    isHovered: boolean;
    onFocus: () => void;
    onHover: () => void;
    onHoverEnd: () => void;
    onClick: () => void;
    statusBadge?: React.ReactNode;
    accentColor?: string;
    iconColor?: string;
    layoutId?: string;
}

export function TeacherModalListRow({
    teacher,
    index,
    isFocused,
    isHovered,
    onFocus,
    onHover,
    onHoverEnd,
    onClick,
    statusBadge,
    accentColor,
    iconColor,
    layoutId = "teacher-row-indicator"
}: TeacherModalListRowProps) {
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
    const color = accentColor || teacherEntity?.color;
    const iconColorFinal = iconColor || color;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.02 }}
            onClick={() => {
                onFocus();
                onClick();
            }}
            onMouseEnter={onHover}
            onMouseLeave={onHoverEnd}
            className={`
                flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer relative group
                ${isFocused ? "popup-row-focused" : "popup-row"}
            `}
        >
            {isFocused && (
                <motion.div
                    layoutId={layoutId}
                    className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary"
                    style={{ backgroundColor: color }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                />
            )}

            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                    style={{ color: iconColorFinal }}
                    className="flex-shrink-0 transition-colors"
                >
                    <HeadsetIcon size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className={`font-medium truncate ${isFocused ? "popup-text-primary font-bold" : "popup-text-primary"}`}>
                        {teacher.schema.username}
                    </span>
                    <span className="text-xs popup-text-tertiary">
                        {teacher.schema.firstName} {teacher.schema.lastName}
                    </span>
                </div>
            </div>

            {statusBadge && (
                <div className="flex items-center gap-2 flex-shrink-0">
                    {statusBadge}
                </div>
            )}
        </motion.div>
    );
}
