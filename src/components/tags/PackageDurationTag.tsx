"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";
import { ENTITY_DATA } from "@/config/entities";

interface PackageDurationTagProps {
    icon: ReactNode;
    durationText: string;
}

export const PackageDurationTag = ({ icon, durationText }: PackageDurationTagProps) => {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;

    return <Tag icon={icon} name={durationText} bgColor={packageEntity.bgColor} borderColorHex={packageEntity.color} color={packageEntity.color} />;
};
