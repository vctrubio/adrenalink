"use client";

import { Play } from "lucide-react";
import { getTodayDateString } from "@/getters/date-getter";

interface ClassboardDateHeaderProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
}

export default function ClassboardDateHeader({ selectedDate, onDateChange }: ClassboardDateHeaderProps) {
    const dateObj = new Date(selectedDate + "T00:00:00");
    const today = new Date(getTodayDateString() + "T00:00:00");

    // Formatters
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const dayNumber = dateObj.getDate();
    const monthShort = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    
    // Time difference logic
    const diffTime = dateObj.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const isToday = diffDays === 0;

    const formatDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handlePreviousDay = () => {
        const newDate = new Date(dateObj);
        newDate.setDate(newDate.getDate() - 1);
        onDateChange(formatDateString(newDate));
    };

    const handleNextDay = () => {
        const newDate = new Date(dateObj);
        newDate.setDate(newDate.getDate() + 1);
        onDateChange(formatDateString(newDate));
    };

    const handleToday = () => {
        onDateChange(getTodayDateString());
    };

    // Format relative days badge text (e.g., "19d", "-2d")
    const showBadge = diffDays !== 0;
    const badgeText = diffDays === 1 ? "Tomorrow" : diffDays === -1 ? "Yesterday" : `${diffDays > 0 ? "+" : "-"}${Math.abs(diffDays)}d`;

    return (
        <div className="flex items-center justify-center gap-6 py-4 select-none">
            {/* Previous Button */}
            <button
                onClick={handlePreviousDay}
                className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all group active:scale-95"
            >
                <Play 
                    size={16} 
                    className="rotate-180 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200 fill-current opacity-80" 
                    strokeWidth={2.5}
                />
            </button>

            {/* Date Display */}
            <div className="flex items-center gap-5">
                {/* Date Number Block */}
                <div className="flex flex-col items-center leading-none">
                    <span className="text-4xl font-serif font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                        {dayNumber}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        {monthShort}
                    </span>
                </div>

                {/* Day Info Block */}
                <div className="flex flex-col items-start gap-1">
                    <span className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-none">
                        {dayName}
                    </span>
                    
                    <div className="flex items-center gap-2 h-5">
                        {/* Today Label (Underlined when active) */}
                        {isToday && (
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 underline decoration-2 underline-offset-4 mr-1">
                                Today
                            </span>
                        )}

                        {/* Relative Badge (Tomorrow, Yesterday, or -Xd/Xd) */}
                        {showBadge && (
                            <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[28px] text-center">
                                {badgeText}
                            </span>
                        )}

                        {/* Always show Today button as a shortcut if not today */}
                        {!isToday && (
                            <button 
                                onClick={handleToday}
                                className="text-xs text-slate-400 hover:text-primary transition-colors font-medium ml-1"
                            >
                                Today
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Next Button */}
            <button
                onClick={handleNextDay}
                className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all group active:scale-95"
            >
                <Play 
                    size={16} 
                    className="text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200 fill-current opacity-80" 
                    strokeWidth={2.5}
                />
            </button>
        </div>
    );
}
