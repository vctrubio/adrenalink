"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";
import { ENTITY_DATA } from "@/config/entities";

interface EquipmentCreateTagProps {
    icon: ReactNode;
    onClick?: () => void;
}

export const EquipmentCreateTag = ({ icon, onClick }: EquipmentCreateTagProps) => {
    const equipmentEntity = ENTITY_DATA.find(e => e.id === "equipment")!;

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            console.log("Creating new equipment...");
        }
    };

    return (
        <div onClick={handleClick}>
            <Tag
                icon={icon}
                name="Add Equipment"
                bgColor="#e5e7eb"
                borderColorHex={equipmentEntity.color}
                color="#4b5563"
            />
        </div>
    );
};
