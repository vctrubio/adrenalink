"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";

interface EquipmentTagProps {
    icon: ReactNode;
    equipmentType: string;
    capacity: number;
    color: string;
    bgColor: string;
}

export const EquipmentTag = ({ icon, equipmentType, capacity, color, bgColor }: EquipmentTagProps) => {
    const displayText = capacity > 1 ? `${equipmentType} (x${capacity})` : equipmentType;

    return <Tag icon={icon} name={displayText} bgColor={bgColor} borderColorHex={color} color={color} />;
};
