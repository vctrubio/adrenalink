import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { BADGE_STATUS_GREEN, BADGE_ACTION_CYAN, BADGE_BG_OPACITY_DARK } from "@/types/status";
import { memo } from "react";

interface StudentStatusBadgeProps {
    bookingCount: number;
    totalEventDuration: number;
    allBookingsCompleted?: boolean;
    eventCount?: number;
}

export const StudentStatusBadge = memo(function StudentStatusBadge({
    bookingCount,
    totalEventDuration,
    allBookingsCompleted = true,
    eventCount,
}: StudentStatusBadgeProps) {
    // Show "New" if no bookings
    if (bookingCount === 0) {
        return (
            <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-foreground"
                style={{
                    backgroundColor: `${BADGE_STATUS_GREEN}${BADGE_BG_OPACITY_DARK}`,
                }}
            >
                New
            </div>
        );
    }

    const eventDurationHours = Math.round(totalEventDuration / 60);
    const bgColor = allBookingsCompleted ? BADGE_STATUS_GREEN : BADGE_ACTION_CYAN;

    return (
        <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-foreground"
            style={{
                backgroundColor: `${bgColor}${BADGE_BG_OPACITY_DARK}`,
            }}
        >
            <BookingIcon size={14} />
            <span>{bookingCount}</span>
            {eventCount !== undefined && (
                <>
                    <FlagIcon size={14} />
                    <span>{eventCount}</span>
                </>
            )}
            <DurationIcon size={14} />
            <span>{eventDurationHours}h</span>
        </div>
    );
});
