"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";
import { ENTITY_DATA } from "@/config/entities";
import { calculateDaysDifference, formatDate } from "@/getters/date-getter";

interface BookingTagProps {
    icon: ReactNode;
    dateStart: string | Date;
    dateEnd: string | Date;
    status: "active" | "completed" | "uncompleted";
    link?: string;
}

export const BookingTag = ({ icon, dateStart, dateEnd, status, link }: BookingTagProps) => {
    const bookingEntity = ENTITY_DATA.find(e => e.id === "booking")!;
    const daysDifference = calculateDaysDifference(dateStart, dateEnd);
    const startDateFormatted = formatDate(dateStart);

    const name = daysDifference > 0 ? `${startDateFormatted} +${daysDifference}` : startDateFormatted;

    const isCompleted = status === "completed";
    const color = isCompleted ? bookingEntity.color : "#9ca3af";
    const bgColor = isCompleted ? bookingEntity.bgColor : "#e5e7eb";

    return <Tag icon={icon} name={name} bgColor={bgColor} borderColorHex={bookingEntity.bgColor} color={color} link={link} />;
};
