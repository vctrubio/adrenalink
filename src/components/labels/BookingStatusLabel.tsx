"use client";

import BookingIcon from "@/public/appSvgs/BookingIcon";
import { STATUS_GREEN, STATUS_ORANGE, STATUS_GREY } from "@/types/status";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { ENTITY_DATA } from "@/config/entities";

interface BookingStatusLabelProps {
    status: string;
    bookingId?: string;
    size?: number;
    startDate?: string;
    endDate?: string;
}

export function BookingStatusLabel({ status, bookingId, size = 16, startDate, endDate }: BookingStatusLabelProps) {
    const isCompleted = status === "completed";
    const isUncompleted = status === "uncompleted";

    const bookingIconColor = isCompleted ? STATUS_GREEN : isUncompleted ? STATUS_ORANGE : STATUS_GREY;
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;

    const content = (
        <div className="flex items-center gap-2 p-1 rounded transition-colors cursor-pointer hover:bg-opacity-20">
            <div style={{ color: bookingIconColor }}>
                <BookingIcon size={size} />
            </div>
            {startDate && endDate && <DateRangeBadge startDate={startDate} endDate={endDate} />}
        </div>
    );

    if (bookingId) {
        return (
            <HoverToEntity entity={bookingEntity} id={bookingId}>
                {content}
            </HoverToEntity>
        );
    }

    return content;
}
