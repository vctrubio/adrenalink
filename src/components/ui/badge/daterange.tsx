import { BADGE_ACTION_CYAN, BADGE_BG_OPACITY_MEDIUM } from "@/types/status";

interface DateRangeBadgeProps {
    startDate: string;
    endDate: string;
}

export function DateRangeBadge({ startDate, endDate }: DateRangeBadgeProps) {
    if (!startDate || !endDate) {
        return <span>Booking Dates</span>;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const startFormatted = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endFormatted = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Check if dates are the same day
    const isSameDay = start.toDateString() === end.toDateString();

    if (isSameDay) {
        return (
            <div className="flex items-center gap-2">
                <span>{startFormatted}</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold text-foreground" style={{ backgroundColor: `${BADGE_ACTION_CYAN}${BADGE_BG_OPACITY_MEDIUM}` }}>One Day</span>
            </div>
        );
    }

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const diffDaysText = `+${diffDays + 1}`;

    return (
        <div className="flex items-center gap-2">
            <span>
                {startFormatted} - {endFormatted}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold text-foreground" style={{ backgroundColor: `${BADGE_ACTION_CYAN}${BADGE_BG_OPACITY_MEDIUM}` }}>{diffDaysText}</span>
        </div>
    );
}
