"use client";

import { useState } from "react";
import { Flag, ChevronLeft, ChevronRight, X } from "lucide-react";
import { timeToMinutes, minutesToTime } from "@/getters/timezone-getter";

interface GlobalFlagAdjustmentProps {
    globalEarliestTime: string | null;
    isAdjustmentMode: boolean;
    onEnterAdjustmentMode: () => void;
    onExitAdjustmentMode: () => void;
    onTimeAdjustment: (newTime: string) => void;
}

export default function GlobalFlagAdjustment({
    globalEarliestTime,
    isAdjustmentMode,
    onEnterAdjustmentMode,
    onExitAdjustmentMode,
    onTimeAdjustment,
}: GlobalFlagAdjustmentProps) {
    const [adjustmentTime, setAdjustmentTime] = useState(globalEarliestTime);

    const handleAdjustTime = (increment: boolean) => {
        if (!adjustmentTime) return;

        const currentMinutes = timeToMinutes(adjustmentTime);
        const newMinutes = increment ? currentMinutes + 30 : currentMinutes - 30;

        if (newMinutes < 0 || newMinutes > 1380) return;

        const newTime = minutesToTime(newMinutes);
        setAdjustmentTime(newTime);
        onTimeAdjustment(newTime);
    };

    const handleExit = () => {
        setAdjustmentTime(globalEarliestTime);
        onExitAdjustmentMode();
    };

    if (!globalEarliestTime) return null;

    if (isAdjustmentMode) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Flag className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Global Time Adjustment</span>

                <div className="flex items-center gap-2 ml-auto">
                    <button
                        onClick={() => handleAdjustTime(false)}
                        className="p-1.5 border border-blue-300 dark:border-blue-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        title="30 minutes earlier"
                    >
                        <ChevronLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>

                    <div className="text-center min-w-[60px]">
                        <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                            {adjustmentTime}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">earliest</div>
                    </div>

                    <button
                        onClick={() => handleAdjustTime(true)}
                        className="p-1.5 border border-blue-300 dark:border-blue-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        title="30 minutes later"
                    >
                        <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>

                    <button
                        onClick={handleExit}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors ml-2"
                        title="Exit adjustment mode"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={onEnterAdjustmentMode}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg transition-colors border border-transparent hover:border-border"
            title="Click to adjust all event times globally"
        >
            <Flag className="w-4 h-4" />
            <span className="text-sm font-semibold">{globalEarliestTime}</span>
            <span className="text-xs text-muted-foreground">Global Earliest</span>
        </button>
    );
}
