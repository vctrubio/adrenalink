"use client";

import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import { getTodayDateString } from "@/getters/date-getter";

interface ClassboardDatePickerProps {
    selectedDate: string; // "YYYY-MM-DD" format
    onDateChange: (date: string) => void;
}

export function ClassboardDatePicker({ selectedDate, onDateChange }: ClassboardDatePickerProps) {
    // Parse string date to Date object for display
    const dateObj = new Date(selectedDate + "T00:00:00");

    const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const formattedDate = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const isToday = selectedDate === getTodayDateString();

    const formatDateString = (date: Date): string => {
        return date.toISOString().split("T")[0];
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
        <div className="classboard-datepicker">
            {/* Previous Day Arrow - pointing left */}
            <button onClick={goToPreviousDay} className="classboard-datepicker__arrow" aria-label="Previous day">
                <div className="-rotate-[135deg]">
                    <AdranlinkIcon size={18} />
                </div>
            </button>

            {/* Date Display */}
            <div className="classboard-datepicker__display">
                <span className="classboard-datepicker__day">{dayOfWeek}</span>
                <span className="classboard-datepicker__date">{formattedDate}</span>
                {isToday && <span className="classboard-datepicker__today-badge">TODAY</span>}
                {!isToday && (
                    <button onClick={goToToday} className="classboard-datepicker__goto-today">
                        Go to today
                    </button>
                )}
            </div>

            {/* Next Day Arrow - pointing right */}
            <button onClick={goToNextDay} className="classboard-datepicker__arrow" aria-label="Next day">
                <div className="rotate-45">
                    <AdranlinkIcon size={18} />
                </div>
            </button>
        </div>
    );
}
