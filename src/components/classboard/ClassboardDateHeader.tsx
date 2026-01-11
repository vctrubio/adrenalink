"use client";

import { Play, Share2, RefreshCw } from "lucide-react";
import { getTodayDateString } from "@/getters/date-getter";
import { cn } from "@/src/lib/utils";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";

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
        <div className="flex items-stretch bg-card border border-border rounded-xl overflow-hidden shadow-sm select-none">
            {/* Main Content: Navigation & Date */}
            <div className="flex-1 flex items-center justify-center gap-6 py-6 px-4 relative">
                {/* Previous Button */}
                <button
                    onClick={handlePreviousDay}
                    className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-slate-800 dark:hover:border-slate-200 bg-transparent flex items-center justify-center transition-all group active:scale-95"
                >
                    <Play 
                        size={12} 
                        className="rotate-180 text-slate-400 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-slate-200 fill-current transition-colors" 
                        strokeWidth={3}
                    />
                </button>

                {/* Date Display */}
                <div className="flex items-center gap-6">
                    {/* Date Number Block */}
                    <div className="flex flex-col items-center leading-none">
                        <span className="text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tighter">
                            {dayNumber}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 ml-1">
                            {monthShort}
                        </span>
                    </div>

                    {/* Day Info Block */}
                    <div className="flex flex-col items-start gap-0.5">
                        <span className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-none">
                            {dayName}
                        </span>
                        
                        <div className="flex items-center gap-2 h-4">
                            {/* Relative Badge (Tomorrow, Yesterday, or -Xd/Xd) */}
                            {showBadge && (
                                <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-full min-w-[28px] text-center">
                                    {badgeText}
                                </span>
                            )}

                            {/* Today Label (Underlined when active) */}
                            {isToday && (
                                <span className="text-[10px] font-black text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white pb-0.5 tracking-wider">
                                    TODAY
                                </span>
                            )}

                            {/* Always show Today button as a shortcut if not today */}
                            {!isToday && (
                                <button 
                                    onClick={handleToday}
                                    className="text-[9px] font-black text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider border-b border-transparent hover:border-slate-900 dark:hover:border-white"
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
                    className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-slate-800 dark:hover:border-slate-200 bg-transparent flex items-center justify-center transition-all group active:scale-95"
                >
                    <Play 
                        size={12} 
                        className="text-slate-400 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-slate-200 fill-current transition-colors" 
                        strokeWidth={3}
                    />
                </button>
            </div>

            {/* Right Side: Technical Action Strip */}
            <div className="w-10 bg-slate-900 dark:bg-white flex flex-col divide-y divide-white/10 dark:divide-slate-200 flex-shrink-0">
                <button className="flex-1 flex items-center justify-center text-white dark:text-slate-900 hover:bg-white/10 dark:hover:bg-slate-50 transition-colors group">
                    <ToggleAdranalinkIcon isOpen={false} variant="sm" className="scale-75 opacity-80 group-hover:opacity-100" />
                </button>
                <button className="flex-1 flex items-center justify-center text-white dark:text-slate-900 hover:bg-white/10 dark:hover:bg-slate-50 transition-colors group">
                    <Share2 size={12} strokeWidth={3} className="opacity-80 group-hover:opacity-100" />
                </button>
                <button className="flex-1 flex items-center justify-center text-white dark:text-slate-900 hover:bg-white/10 dark:hover:bg-slate-50 transition-colors group">
                    <RefreshCw size={12} strokeWidth={3} className="opacity-80 group-hover:opacity-100" />
                </button>
            </div>
        </div>
    );
}
