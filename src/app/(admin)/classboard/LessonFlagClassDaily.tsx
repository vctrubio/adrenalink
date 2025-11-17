"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Lock, LockOpen, MapPin } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";
import type { TeacherQueue } from "@/backend/TeacherQueue";
import type { GlobalFlag } from "@/backend/models/GlobalFlag";

const MIN_TIME_MINUTES = 0;
const MAX_TIME_MINUTES = 1380;

interface LessonFlagClassDailyProps {
    globalFlag: GlobalFlag;
    teacherQueues: TeacherQueue[];
    onSubmit: () => Promise<void>;
}

export default function LessonFlagClassDaily({ globalFlag, teacherQueues, onSubmit }: LessonFlagClassDailyProps) {
    const [adjustmentTime, setAdjustmentTime] = useState<string | null>(null);
    const [adjustmentLocation, setAdjustmentLocation] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLockFlagTime, setIsLockFlagTime] = useState(false);
    const [isLockFlagLocation, setIsLockFlagLocation] = useState(false);
    const [lockCount, setLockCount] = useState(0);
    const [lockLocationCount, setLockLocationCount] = useState(0);
    const [totalLocationEventsForLock, setTotalLocationEventsForLock] = useState(0);

    const isAdjustmentMode = globalFlag.isAdjustmentMode();
    const stepDuration = globalFlag.getController().stepDuration || 30;
    const globalEarliestTime = globalFlag.getGlobalEarliestTime();
    const globalLocation = globalFlag.getGlobalLocation();
    const globalTime = globalFlag.getGlobalTime();
    const pendingTeachers = globalFlag.getPendingTeachers();
    const totalTeachers = pendingTeachers.size;

    const handleAdjustTime = (increment: boolean) => {
        if (!adjustmentTime) return;
        const currentMinutes = timeToMinutes(adjustmentTime);
        const newMinutes = increment ? currentMinutes + stepDuration : currentMinutes - stepDuration;
        if (newMinutes < MIN_TIME_MINUTES || newMinutes > MAX_TIME_MINUTES) return;
        const newTime = minutesToTime(newMinutes);
        setAdjustmentTime(newTime);
        globalFlag.adjustTime(newTime);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        globalFlag.discardChanges();
        const currentGlobalLocation = globalFlag.getGlobalLocation();
        setAdjustmentLocation(currentGlobalLocation);
        const currentGlobalTime = globalFlag.getGlobalEarliestTime();
        setAdjustmentTime(currentGlobalTime);
    };

    const handleCancel = () => {
        globalFlag.discardChanges();
        const currentGlobalLocation = globalFlag.getGlobalLocation();
        setAdjustmentLocation(currentGlobalLocation);
        const currentGlobalTime = globalFlag.getGlobalEarliestTime();
        setAdjustmentTime(currentGlobalTime);
        globalFlag.exitAdjustmentMode();
    };

    const handleLockToggle = () => {
        if (!isLockFlagTime && adjustmentTime) {
            globalFlag.lockToAdjustmentTime(adjustmentTime);
        }
    };

    const handleAdjustLocation = (newLocation: string) => {
        if (newLocation !== adjustmentLocation) {
            setAdjustmentLocation(newLocation);
            globalFlag.adjustLocation(newLocation);
        }
    };

    const handleLockLocationToggle = () => {
        if (adjustmentLocation) {
            globalFlag.lockToLocation(adjustmentLocation);
        }
    };

    if (!globalEarliestTime && !globalLocation) {
        return null;
    }

    if (isAdjustmentMode) {
        return (
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                {/* Header */}
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Adjust Schedule</h3>
                    <p className="text-sm text-muted-foreground">Fine-tune timing and location for all lessons</p>
                </div>

                {/* Time Adjustment */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <FlagIcon className="w-6 h-6 text-foreground flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground">Time</span>
                    </div>

                    <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-4">
                        <button
                            onClick={() => handleAdjustTime(false)}
                            className="p-1.5 rounded hover:bg-muted transition-colors text-foreground"
                            title={`${stepDuration} minutes earlier`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <input
                            type="time"
                            value={adjustmentTime || ""}
                            onChange={(e) => {
                                const newTime = e.target.value;
                                setAdjustmentTime(newTime);
                                globalFlag.adjustTime(newTime);
                            }}
                            className="px-3 py-2 text-sm font-semibold text-center rounded border border-input bg-background text-foreground"
                        />

                        <button
                            onClick={() => handleAdjustTime(true)}
                            className="p-1.5 rounded hover:bg-muted transition-colors text-foreground"
                            title={`${stepDuration} minutes later`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="flex-1" />

                        <button
                            onClick={handleLockToggle}
                            disabled={isLockFlagTime}
                            className={`p-2 rounded transition-colors flex-shrink-0 ${isLockFlagTime ? "border border-foreground text-foreground opacity-50 cursor-not-allowed" : "bg-blue-600/20 text-blue-600 hover:bg-blue-600/30"}`}
                            title={isLockFlagTime ? "All lessons synchronized" : "Synchronize all lessons"}
                        >
                            {isLockFlagTime ? <Lock className="w-5 h-5" /> : <LockOpen className="w-5 h-5" />}
                        </button>

                        <div className="text-center min-w-[60px]">
                            <div className="text-sm font-bold text-foreground">
                                {lockCount}/{totalTeachers}
                            </div>
                            <div className="text-xs text-muted-foreground">Sync</div>
                        </div>
                    </div>
                </div>

                {/* Location Adjustment */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <MapPin className="w-6 h-6 text-foreground flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground">Location</span>
                    </div>

                    <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-4">
                        <input
                            type="text"
                            value={adjustmentLocation || ""}
                            onChange={(e) => handleAdjustLocation(e.target.value)}
                            placeholder="Set location..."
                            className="px-3 py-2 text-sm rounded border border-input bg-background text-foreground placeholder-muted-foreground flex-1"
                        />

                        <button
                            onClick={handleLockLocationToggle}
                            disabled={isLockFlagLocation}
                            className={`p-2 rounded transition-colors flex-shrink-0 ${isLockFlagLocation ? "border border-foreground text-foreground opacity-50 cursor-not-allowed" : "bg-blue-600/20 text-blue-600 hover:bg-blue-600/30"}`}
                            title={isLockFlagLocation ? "All locations synchronized" : "Synchronize all locations"}
                        >
                            {isLockFlagLocation ? <Lock className="w-5 h-5" /> : <LockOpen className="w-5 h-5" />}
                        </button>

                        <div className="text-center min-w-[60px]">
                            <div className="text-sm font-bold text-foreground">
                                {lockLocationCount}/{totalLocationEventsForLock}
                            </div>
                            <div className="text-xs text-muted-foreground">Sync</div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Saving..." : "Submit"}
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-6 py-3 bg-red-600/20 text-red-600 rounded-lg hover:bg-red-600/30 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-1">Lesson Schedule</h3>
                <p className="text-sm text-muted-foreground">Global time and location settings for all lessons</p>
            </div>

            {/* Grid Layout: Time and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Time Card */}
                <button
                    onClick={() => globalFlag.enterAdjustmentMode()}
                    className="group text-left p-4 rounded-lg border border-border hover:border-blue-500/50 hover:bg-muted/50 transition-all duration-200 cursor-pointer"
                    title="Click to adjust time"
                >
                    <div className="flex items-start gap-3 mb-3">
                        <FlagIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Time</div>
                            <div className="text-2xl font-bold text-foreground group-hover:text-blue-600 transition-colors">{globalEarliestTime}</div>
                            <div className="text-xs text-muted-foreground mt-2">Global earliest</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div>
                            <div className="text-xs text-muted-foreground mb-0.5">Status</div>
                            <div className="text-sm font-semibold text-foreground">Adapted</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{Math.round((lockCount / totalTeachers) * 100)}%</div>
                            <div className="text-xs text-muted-foreground">{lockCount}/{totalTeachers}</div>
                        </div>
                    </div>
                </button>

                {/* Location Card */}
                <button
                    onClick={() => globalFlag.enterAdjustmentMode()}
                    className="group text-left p-4 rounded-lg border border-border hover:border-green-500/50 hover:bg-muted/50 transition-all duration-200 cursor-pointer"
                    title="Click to adjust location"
                >
                    <div className="flex items-start gap-3 mb-3">
                        <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Location</div>
                            <div className="text-2xl font-bold text-foreground group-hover:text-green-600 transition-colors truncate">{globalLocation || "-"}</div>
                            <div className="text-xs text-muted-foreground mt-2">Global location</div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div>
                            <div className="text-xs text-muted-foreground mb-0.5">Status</div>
                            <div className="text-sm font-semibold text-foreground">Adapted</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-green-600 dark:text-green-400">{Math.round((lockLocationCount / totalLocationEventsForLock) * 100)}%</div>
                            <div className="text-xs text-muted-foreground">{lockLocationCount}/{totalLocationEventsForLock}</div>
                        </div>
                    </div>
                </button>
            </div>

            {/* Info Footer */}
            <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-xs text-muted-foreground text-center">Click to adjust time and location for all lessons</p>
            </div>
        </div>
    );
}
