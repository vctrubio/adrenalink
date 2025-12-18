"use client";

import { usePathname } from "next/navigation";
import { ENTITY_DATA } from "@/config/entities";
import { motion } from "framer-motion";

interface InfoHeaderProps {
    title: string;
}

export function InfoHeader({ title }: InfoHeaderProps) {
    const pathname = usePathname();
    const entitySegment = pathname.split("/").filter(Boolean)[1];

    const entityMap: Record<string, string> = {
        students: "student",
        teachers: "teacher",
        packages: "schoolPackage",
        bookings: "booking",
        lessons: "lesson",
        equipments: "equipment",
    };

    const entityId = entityMap[entitySegment];
    const entity = ENTITY_DATA.find((e) => e.id === entityId);
    const EntityIcon = entity?.icon;
    const entityColor = entity?.color || "#6366f1";

    return (
        <div className="mb-8 flex items-center gap-4">
            {EntityIcon && (
                <div style={{ color: entityColor }}>
                    <EntityIcon className="w-12 h-12" />
                </div>
            )}
            <motion.h1
                key={title}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                }}
                className="text-3xl font-bold"
            >
                {title}
            </motion.h1>
        </div>
    );
}
