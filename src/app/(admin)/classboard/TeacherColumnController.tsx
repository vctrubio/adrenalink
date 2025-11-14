"use client";

import { Eye, EyeOff } from "lucide-react";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { TeacherStats } from "@/backend/ClassboardStats";

interface TeacherColumnControllerProps {
    username: string;
    stats: TeacherStats;
    columnViewMode: "view" | "queue";
    inGlobalAdjustmentMode: boolean;
    isOptedOutOfGlobalUpdate: boolean;
    earliestTime: string | null;
    onIconClick: () => void;
    onEditSchedule: () => void;
    onSubmit: () => void;
    onReset: () => void;
    onCancel: () => void;
}

export default function TeacherColumnController({
    username,
    stats,
    columnViewMode,
    inGlobalAdjustmentMode,
    isOptedOutOfGlobalUpdate,
    earliestTime,
    onIconClick,
    onEditSchedule,
    onSubmit,
    onReset,
    onCancel,
}: TeacherColumnControllerProps) {
    return (
        <div className="p-4 border-b border-border space-y-3">
            {/* Header: Teacher Name + Eye Icon */}
            <div className="flex items-center gap-4">
                <HeadsetIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="text-xl font-bold text-foreground truncate">{username}</div>
                <button
                    onClick={onIconClick}
                    className="ml-auto p-1.5 rounded hover:bg-muted/50 transition-colors flex-shrink-0"
                    title={
                        inGlobalAdjustmentMode
                            ? isOptedOutOfGlobalUpdate
                                ? "Opted out - click to sync with global time"
                                : "Opted in - click to use custom time"
                            : columnViewMode === "view"
                            ? "View mode - click to edit"
                            : "Edit mode - click to view"
                    }
                >
                    {inGlobalAdjustmentMode ? (
                        isOptedOutOfGlobalUpdate ? (
                            <EyeOff className="w-5 h-5 text-orange-500" />
                        ) : (
                            <Eye className="w-5 h-5 text-green-500" />
                        )
                    ) : columnViewMode === "view" ? (
                        <Eye className="w-5 h-5 text-muted-foreground" />
                    ) : (
                        <EyeOff className="w-5 h-5 text-muted-foreground" />
                    )}
                </button>
            </div>

            {/* Time Flag Display */}
            {earliestTime && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Earliest:</span>
                    <span className="font-mono font-semibold text-foreground">{earliestTime}</span>
                </div>
            )}

            {/* Statistics Panel */}
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col">
                    <span className="text-muted-foreground">Events</span>
                    <span className="font-semibold text-foreground">{stats.eventCount}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold text-foreground">{getPrettyDuration(stats.totalDuration)}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-muted-foreground">Teacher €</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">€{stats.earnings.teacher.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-muted-foreground">School €</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">€{stats.earnings.school.toFixed(2)}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                {columnViewMode === "view" ? (
                    <button
                        onClick={onEditSchedule}
                        disabled={stats.eventCount === 0}
                        className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                            stats.eventCount === 0
                                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                        title={stats.eventCount === 0 ? "No events to edit" : "Edit schedule"}
                    >
                        Edit Schedule
                    </button>
                ) : (
                    <>
                        <button
                            onClick={onSubmit}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                            Submit
                        </button>
                        <button
                            onClick={onReset}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Reset
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
