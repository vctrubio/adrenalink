"use client";

import { type ReactNode } from "react";
import { Tag } from "./tag";
import { ENTITY_DATA } from "@/config/entities";

interface BookingTagProps {
    icon: ReactNode;
    dateStart: string | Date;
    dateEnd: string | Date;
    status: "active" | "completed" | "uncompleted";
    link?: string;
}

const calculateDaysDifference = (start: string | Date, end: string | Date): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    const diffTime = endDay.getTime() - startDay.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

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
