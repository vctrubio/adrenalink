"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";
import { ENTITY_DATA } from "@/config/entities";

interface PricePerHourTagProps {
    icon: ReactNode;
    pricePerHour: number;
}

export const PricePerHourTag = ({ icon, pricePerHour }: PricePerHourTagProps) => {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
    const displayText = `$${pricePerHour.toFixed(2)}/hr`;

    return <Tag icon={icon} name={displayText} bgColor={packageEntity.bgColor} borderColorHex={packageEntity.color} color={packageEntity.color} />;
};
