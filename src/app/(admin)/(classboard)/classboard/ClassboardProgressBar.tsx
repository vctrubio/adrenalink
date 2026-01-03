"use client";

import { getProgressColor, type EventStatusMinutes } from "@/getters/booking-progress-getter";

interface ClassboardProgressBarProps {
    durationMinutes: number;
    counts: EventStatusMinutes;
}

export function ClassboardProgressBar({ durationMinutes, counts }: ClassboardProgressBarProps) {
    const background = getProgressColor(counts, durationMinutes);

    return (
        <div className="h-1.5 w-full bg-muted">
            <div className="h-full transition-all duration-500 ease-out" style={{ background }} />
        </div>
    );
}
