import BookingIcon from "@/public/appSvgs/BookingIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { BADGE_STATUS_GREEN, BADGE_ACTION_CYAN, BADGE_BG_OPACITY_DARK } from "@/types/status";

interface StudentStatusBadgeProps {
  bookingCount: number;
  totalEventDuration: number;
  allBookingsCompleted?: boolean;
}

export function StudentStatusBadge({
  bookingCount,
  totalEventDuration,
  allBookingsCompleted = true,
}: StudentStatusBadgeProps) {
  console.log("[StudentStatusBadge]", { bookingCount, totalEventDuration, allBookingsCompleted });
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

  // Show bookings + duration with green background if all completed
  if (allBookingsCompleted) {
    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-foreground"
        style={{
          backgroundColor: `${BADGE_STATUS_GREEN}${BADGE_BG_OPACITY_DARK}`,
        }}
      >
        <BookingIcon size={14} />
        <span>{bookingCount}</span>
        <DurationIcon size={14} />
        <span>{eventDurationHours}h</span>
      </div>
    );
  }

  // Show bookings + duration with blue background if not all completed
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-foreground"
      style={{
        backgroundColor: `${BADGE_ACTION_CYAN}${BADGE_BG_OPACITY_DARK}`,
      }}
    >
      <BookingIcon size={14} />
      <span>{bookingCount}</span>
      <DurationIcon size={14} />
      <span>{eventDurationHours}h</span>
    </div>
  );
}
