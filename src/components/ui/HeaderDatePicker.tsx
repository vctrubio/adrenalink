"use client";

import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { getTodayDateString } from "@/getters/date-getter";
import { getCompactNumber } from "@/getters/integer-getter";

function getRelativeDays(selectedDate: string): number {
    const selectedDateObj = new Date(selectedDate + "T00:00:00");
    const todayObj = new Date(getTodayDateString() + "T00:00:00");
    const diffTime = selectedDateObj.getTime() - todayObj.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

function getRelativeLabel(diffDays: number): string {
    if (diffDays > 0) return `+${getCompactNumber(diffDays)}d`;
    if (diffDays < 0) return `${getCompactNumber(diffDays)}d`;
    return "";
}

interface HeaderDatePickerProps {
    selectedDate: string; // "YYYY-MM-DD" format
    onDateChange: (date: string) => void;
}

export function HeaderDatePicker({ selectedDate, onDateChange }: HeaderDatePickerProps) {
    const dateObj = new Date(selectedDate + "T00:00:00");

    const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const dayNumber = dateObj.getDate();
    const monthShort = dateObj.toLocaleDateString("en-US", { month: "short" });

    const diffDays = getRelativeDays(selectedDate);
    const isToday = diffDays === 0;
    const relativeLabel = getRelativeLabel(diffDays);

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
        <div className="flex items-center gap-5">
            {/* Previous Day Arrow */}
            <button
                onClick={goToPreviousDay}
                className="p-3 rounded-full bg-muted hover:bg-muted/80 border border-border hover:border-primary/30 transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label="Previous day"
            >
                <div className="-rotate-[135deg]">
                    <AdranlinkIcon size={18} className="text-muted-foreground" />
                </div>
            </button>

            {/* Date Display */}
            <div className="flex items-center gap-4">
                {/* Big Day Number */}
                <div className="flex flex-col items-center">
                    <span className="text-4xl font-black text-foreground leading-none">{dayNumber}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{monthShort}</span>
                </div>

                {/* Day of Week & Status */}
                <div className="flex flex-col gap-1">
                    <span className="text-xl font-bold text-foreground">{dayOfWeek}</span>
                    <div className="flex items-center gap-2">
                        {isToday ? (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-full">
                                TODAY
                            </span>
                        ) : (
                            <>
                                <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-muted text-muted-foreground border border-border rounded-full">
                                    {relativeLabel}
                                </span>
                                <button
                                    onClick={goToToday}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                                >
                                    Today
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Next Day Arrow */}
            <button
                onClick={goToNextDay}
                className="p-3 rounded-full bg-muted hover:bg-muted/80 border border-border hover:border-primary/30 transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label="Next day"
            >
                <div className="rotate-45">
                    <AdranlinkIcon size={18} className="text-muted-foreground" />
                </div>
            </button>
        </div>
    );
}
