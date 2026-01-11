"use client";

import Image from "next/image";
import { getTodayDateString } from "@/getters/date-getter";

interface ClassboardDateHeaderProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
}

export default function ClassboardDateHeader({ selectedDate, onDateChange }: ClassboardDateHeaderProps) {
    const dateObj = new Date(selectedDate + "T00:00:00");
    const today = new Date(getTodayDateString() + "T00:00:00");

    const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const dayNumber = dateObj.getDate();
    const monthShort = dateObj.toLocaleDateString("en-US", { month: "short" });
    const year = dateObj.getFullYear();
    const fullDateString = dateObj.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });

    const diffDays = Math.round((dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isToday = diffDays === 0;

    const getDayLabel = (): string => {
        if (diffDays === 0) return "TODAY";
        if (diffDays === 1) return "TOMORROW";
        if (diffDays === -1) return "YESTERDAY";
        if (diffDays > 1) return `IN ${diffDays} DAYS`;
        return `${Math.abs(diffDays)} DAYS AGO`;
    };

    const formatDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const goToPreviousDay = () => {
        const newDate = new Date(dateObj);
        newDate.setDate(newDate.getDate() - 1);
        onDateChange(formatDateString(newDate));
    };

    const goToNextDay = () => {
        const newDate = new Date(dateObj);
        newDate.setDate(newDate.getDate() + 1);
        onDateChange(formatDateString(newDate));
    };

    const goToToday = () => {
        onDateChange(getTodayDateString());
    };

    return (
        <div className="max-w-xs border border-border rounded-lg p-4 m-4">
            <div className="flex items-center gap-4">
                {/* Left Side - ADR Logo */}
                <div className="flex-shrink-0">
                    <Image
                        src="/ADR.webp"
                        alt="Adrenalink"
                        width={120}
                        height={120}
                        className="w-32 h-32 object-contain dark:invert"
                    />
                </div>

                {/* Right Side - 3 Rows Date Info */}
                <div className="flex flex-col flex-1">
                    {/* Row 1 - Day of Week with Navigation */}
                    <div className="flex items-center justify-between gap-2 py-2">
                        <button
                            onClick={goToPreviousDay}
                            className="px-2 py-1 rounded hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground"
                            aria-label="Previous day"
                        >
                            ←
                        </button>

                        <span className="text-sm font-semibold text-foreground text-center">{dayOfWeek}</span>

                        <button
                            onClick={goToNextDay}
                            className="px-2 py-1 rounded hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground"
                            aria-label="Next day"
                        >
                            →
                        </button>
                    </div>

                    <div className="border-b border-border" />

                    {/* Row 2 - Today Badge or Relative Info */}
                    <div className="flex items-center justify-center gap-2 py-2">
                        {isToday ? (
                            <span className="text-xs font-semibold text-primary">TODAY</span>
                        ) : (
                            <>
                                <span className="text-xs text-muted-foreground">{getDayLabel()}</span>
                                <button
                                    onClick={goToToday}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-1 hover:underline"
                                >
                                    Go
                                </button>
                            </>
                        )}
                    </div>

                    <div className="border-b border-border" />

                    {/* Row 3 - Calendar Date */}
                    <div className="text-center py-2">
                        <span className="text-sm font-semibold text-foreground">{dayNumber} {monthShort} {year}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
