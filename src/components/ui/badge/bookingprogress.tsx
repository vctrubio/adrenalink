import { getHMDuration } from "@/getters/duration-getter";

interface BookingProgressBadgeProps {
    usedMinutes: number;
    totalMinutes: number;
    background: string;
}

export function BookingProgressBadge({ usedMinutes, totalMinutes, background }: BookingProgressBadgeProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full overflow-hidden" style={{ background }} />
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-foreground bg-muted">
                {getHMDuration(usedMinutes, false)}/{getHMDuration(totalMinutes)}
            </span>
        </div>
    );
}
