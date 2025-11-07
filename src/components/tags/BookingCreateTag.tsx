"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";
import { ENTITY_DATA } from "@/config/entities";

interface BookingCreateTagProps {
    icon: ReactNode;
    onClick?: () => void;
}

export const BookingCreateTag = ({ icon, onClick }: BookingCreateTagProps) => {
    const bookingEntity = ENTITY_DATA.find(e => e.id === "booking")!;

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            console.log("Creating new booking...");
        }
    };

    return (
        <div onClick={handleClick}>
            <Tag
                icon={icon}
                name="Create"
                bgColor="#e5e7eb"
                borderColorHex={bookingEntity.color}
                color="#4b5563"
            />
        </div>
    );
};
