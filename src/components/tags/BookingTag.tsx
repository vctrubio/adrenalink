"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";
import { ENTITY_DATA } from "@/config/entities";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";

interface BookingTagProps {
    icon: ReactNode;
    dateStart: string | Date;
    dateEnd: string | Date;
    status: "active" | "completed" | "uncompleted";
    link?: string;
}

export const BookingTag = ({ icon, dateStart, dateEnd, status, link }: BookingTagProps) => {
    const bookingEntity = ENTITY_DATA.find(e => e.id === "booking")!;

    const startDateStr = typeof dateStart === "string" ? dateStart : dateStart.toISOString();
    const endDateStr = typeof dateEnd === "string" ? dateEnd : dateEnd.toISOString();

    const isCompleted = status === "completed";
    const isUncompleted = status === "uncompleted";

    const color = isCompleted 
        ? bookingEntity.color 
        : isUncompleted 
            ? "#f59e0b" // Dark orange
            : "#9ca3af";

    const bgColor = isCompleted ? bookingEntity.bgColor : "#e5e7eb";

    return <Tag icon={icon} name={<DateRangeBadge startDate={startDateStr} endDate={endDateStr} showEndDate={false} />} bgColor={bgColor} borderColorHex={bookingEntity.bgColor} color={color} link={link} />;
};
