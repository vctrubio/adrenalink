"use client";

import BookingIcon from "@/public/appSvgs/BookingIcon";
import { STATUS_GREEN, STATUS_ORANGE, STATUS_GREY } from "@/types/status";

interface BookingStatusLabelProps {
    status: string;
    size?: number;
}

export function BookingStatusLabel({ status, size = 16 }: BookingStatusLabelProps) {
    const isCompleted = status === "completed";
    const isUncompleted = status === "uncompleted";

    const bookingIconColor = isCompleted ? STATUS_GREEN : isUncompleted ? STATUS_ORANGE : STATUS_GREY;

    const handleClick = () => {
        console.log("Booking status clicked:", status);
        // TODO: Call action to change status
    };

    return (
        <button
            onClick={handleClick}
            className="flex items-center p-1 rounded transition-colors cursor-pointer hover:bg-opacity-20"
            style={{ backgroundColor: `${bookingIconColor}20` }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${bookingIconColor}30`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${bookingIconColor}20`;
            }}
        >
            <div style={{ color: bookingIconColor }}>
                <BookingIcon size={size} />
            </div>
        </button>
    );
}
