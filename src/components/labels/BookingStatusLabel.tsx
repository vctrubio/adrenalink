"use client";

import BookingIcon from "@/public/appSvgs/BookingIcon";
import { STATUS_GREEN, STATUS_ORANGE, STATUS_GREY } from "@/types/status";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";

interface BookingStatusLabelProps {
    status: string;
    size?: number;
    startDate?: string;
    endDate?: string;
}

export function BookingStatusLabel({ status, size = 16, startDate, endDate }: BookingStatusLabelProps) {
    const isCompleted = status === "completed";
    const isUncompleted = status === "uncompleted";

    const bookingIconColor = isCompleted ? STATUS_GREEN : isUncompleted ? STATUS_ORANGE : STATUS_GREY;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Booking status clicked:", status);
        // TODO: Call action to change status
    };

    return (
        <div onClick={handleClick} className="flex items-center gap-2 p-1 rounded transition-colors cursor-pointer hover:bg-opacity-20">
            <div style={{ color: bookingIconColor }}>
                <BookingIcon size={size} />
            </div>
            {startDate && endDate && <DateRangeBadge startDate={startDate} endDate={endDate} />}
        </div>
    );
}
