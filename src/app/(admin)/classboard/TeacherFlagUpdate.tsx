"use client";

import { Flag, X } from "lucide-react";

interface TeacherFlagUpdateProps {
    teacherUsername: string;
    earliestTime: string | null;
    inGlobalAdjustmentMode: boolean;
    isOptedOutOfGlobalUpdate: boolean;
    onFlagClick: () => void;
    onOptOut: (teacherUsername: string) => void;
    onOptIn: (teacherUsername: string) => void;
}

export default function TeacherFlagUpdate({
    teacherUsername,
    earliestTime,
    inGlobalAdjustmentMode,
    isOptedOutOfGlobalUpdate,
    onFlagClick,
    onOptOut,
    onOptIn,
}: TeacherFlagUpdateProps) {
    if (!earliestTime) return null;

    const handleClick = () => {
        if (inGlobalAdjustmentMode) {
            if (isOptedOutOfGlobalUpdate) {
                onOptIn(teacherUsername);
            } else {
                onOptOut(teacherUsername);
            }
        } else {
            onFlagClick();
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-colors ${
                inGlobalAdjustmentMode
                    ? isOptedOutOfGlobalUpdate
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 hover:bg-red-150 dark:hover:bg-red-900/50"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 hover:bg-blue-150 dark:hover:bg-blue-900/50"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent"
            }`}
            title={
                inGlobalAdjustmentMode
                    ? isOptedOutOfGlobalUpdate
                        ? "Click to apply global update to this teacher"
                        : "Click to skip global update for this teacher"
                    : "Click to edit queue independently"
            }
        >
            <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold">{earliestTime}</span>
            </div>
            {inGlobalAdjustmentMode && isOptedOutOfGlobalUpdate && (
                <X className="w-4 h-4 flex-shrink-0" />
            )}
        </button>
    );
}
