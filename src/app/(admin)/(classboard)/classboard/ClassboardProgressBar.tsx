"use client";

import { getBookingProgressBar } from "@/getters/booking-progress-getter";
import type { ClassboardLesson } from "@/backend/models/ClassboardModel";

interface ClassboardProgressBarProps {
    lessons: ClassboardLesson[];
    durationMinutes: number;
}

export function ClassboardProgressBar({ lessons, durationMinutes }: ClassboardProgressBarProps) {
    const progressStyle = getBookingProgressBar(lessons, durationMinutes);
    return (
        <div className="h-1.5 w-full bg-muted">
            <div className="h-full transition-all duration-500 ease-out" style={{ ...progressStyle }} />
        </div>
    );
}
