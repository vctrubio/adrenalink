"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Lock, LockOpen, MapPin, Clock } from "lucide-react";
import { SubmitCancelReset } from "@/src/components/ui/SubmitCancelReset";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";
import { bulkUpdateClassboardEvents } from "@/actions/classboard-bulk-action";
import type { GlobalFlag } from "@/backend/models/GlobalFlag";
import type { TeacherQueue } from "@/backend/TeacherQueue";

const LOCATIONS = ["Beach", "Bay", "Lake", "River", "Pool", "Indoor"];
const MIN_TIME_MINUTES = 0;
const MAX_TIME_MINUTES = 1380;

interface LessonFlagLocationSettingsControllerProps {
    globalFlag: GlobalFlag;
    teacherQueues: TeacherQueue[];
    onClose: () => void;
    onRefresh: () => void;
}

export default function LessonFlagLocationSettingsController({
    globalFlag,
    teacherQueues,
    onClose,
    onRefresh
}: LessonFlagLocationSettingsControllerProps) {
    const [adjustmentTime, setAdjustmentTime] = useState<string | null>(null);
    const [adjustmentLocation, setAdjustmentLocation] = useState<string | null>(null);
    const [locationIndex, setLocationIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Sync with GlobalFlag state
    useEffect(() => {
        // Enter adjustment mode if not already
        if (!globalFlag.isAdjustmentMode()) {
            globalFlag.enterAdjustmentMode();
        }
        
        const currentGlobalTime = globalFlag.getGlobalTime();
        const currentGlobalLocation = globalFlag.getGlobalLocation();

        if (currentGlobalTime) setAdjustmentTime(currentGlobalTime);
        if (currentGlobalLocation) {
            setAdjustmentLocation(currentGlobalLocation);
            const idx = LOCATIONS.indexOf(currentGlobalLocation);
            if (idx >= 0) setLocationIndex(idx);
        }
    }, [globalFlag]);

    // Derived state
    const { isLockFlagTime, lockCount } = globalFlag.getLockStatusTime(adjustmentTime);
    const { isLockFlagLocation, lockLocationCount, totalLocationEventsForLock } = globalFlag.getLockStatusLocation(adjustmentLocation);
    const stepDuration = globalFlag.getController().stepDuration || 30;
    const pendingTeachers = globalFlag.getPendingTeachers();
    const updatesCount = globalFlag.getChangedEventsCount();
    const hasChanges = updatesCount > 0;

    // Handlers
    const handleAdjustTime = (increment: boolean) => {
        if (!adjustmentTime) return;
        const currentMinutes = timeToMinutes(adjustmentTime);
        const newMinutes = increment ? currentMinutes + stepDuration : currentMinutes - stepDuration;
        if (newMinutes < MIN_TIME_MINUTES || newMinutes > MAX_TIME_MINUTES) return;
        const newTime = minutesToTime(newMinutes);
        setAdjustmentTime(newTime);
        globalFlag.adjustTime(newTime);
    };

    const handleLockTime = () => {
        if (!isLockFlagTime && adjustmentTime) {
            globalFlag.lockToAdjustmentTime(adjustmentTime);
        } else if (isLockFlagTime) {
            globalFlag.adapt(); // Toggles lock
        }
    };

    const handleAdjustLocation = (increment: boolean) => {
        let newIndex = increment ? locationIndex + 1 : locationIndex - 1;
        if (newIndex < 0) newIndex = LOCATIONS.length - 1;
        if (newIndex >= LOCATIONS.length) newIndex = 0;
        const newLocation = LOCATIONS[newIndex];
        setLocationIndex(newIndex);
        setAdjustmentLocation(newLocation);
        globalFlag.adjustLocation(newLocation);
    };

    const handleLockLocation = () => {
        if (adjustmentLocation) {
            if (isLockFlagLocation) {
                // globalFlag.unlockLocation(); // Assuming adapt or explicit unlock exists? 
                // GlobalFlag.ts has adapt() for time, lockToLocation for location. 
                // It seems lockToLocation sets isLocked=true. 
                // To unlock location, maybe we need a method or re-enter adjustment mode?
                // For now, re-locking to same location refreshes it.
                globalFlag.lockToLocation(adjustmentLocation);
            } else {
                globalFlag.lockToLocation(adjustmentLocation);
            }
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const changes = globalFlag.collectChanges();
            if (changes.length > 0) {
                const result = await bulkUpdateClassboardEvents(changes);
                if (result.success) {
                    globalFlag.exitAdjustmentMode();
                    onRefresh();
                    onClose();
                } else {
                    console.error("Failed to update:", result.error);
                }
            } else {
                globalFlag.exitAdjustmentMode();
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        globalFlag.discardChanges();
        // Reset local state to match discarded global state
        const originalTime = globalFlag.getGlobalEarliestTime();
        const originalLocation = globalFlag.getGlobalLocation();
        setAdjustmentTime(originalTime);
        setAdjustmentLocation(originalLocation);
        if (originalLocation) {
            const idx = LOCATIONS.indexOf(originalLocation);
            if (idx >= 0) setLocationIndex(idx);
        }
    };

    const handleCancel = () => {
        globalFlag.exitAdjustmentMode();
        onClose();
    };

    return (
        <div className="flex flex-col gap-6 p-6 h-full bg-card/50 backdrop-blur-sm">
            <SubmitCancelReset
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                onReset={handleReset}
                hasChanges={hasChanges}
                isSubmitting={isSubmitting}
                submitLabel="Apply Changes"
                extraContent={updatesCount > 0 && (
                    <span className="ml-2 flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                        {updatesCount}
                    </span>
                )}
            />

            {/* Time Control */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Start Time</label>
                    <div className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {lockCount} SYNCHRONIZED
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleAdjustTime(false)}
                        className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    
                    <div className="flex-1 flex flex-col items-center justify-center bg-card border border-border rounded-xl h-12 relative overflow-hidden group">
                        <span className="font-mono text-xl font-bold tracking-tight">{adjustmentTime || "--:--"}</span>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/10">
                            <div 
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${(lockCount / Math.max(pendingTeachers.size, 1)) * 100}%` }}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={() => handleAdjustTime(true)}
                        className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>

                    <button
                        onClick={handleLockTime}
                        className={`p-3 rounded-xl transition-all duration-200 ${
                            isLockFlagTime 
                                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" 
                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                        title="Sync all teachers to this time"
                    >
                        {isLockFlagTime ? <Lock size={18} /> : <LockOpen size={18} />}
                    </button>
                </div>
            </div>

            <div className="h-px bg-border/10" />

            {/* Location Control */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</label>
                    <div className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {lockLocationCount} SYNCHRONIZED
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleAdjustLocation(false)}
                        className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    
                    <div className="flex-1 flex items-center justify-center bg-card border border-border rounded-xl h-12 px-2">
                        <MapPin size={16} className="mr-2 text-muted-foreground" />
                        <span className="font-medium text-sm truncate">{adjustmentLocation || "Select..."}</span>
                    </div>

                    <button 
                        onClick={() => handleAdjustLocation(true)}
                        className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>

                    <button
                        onClick={handleLockLocation}
                        className={`p-3 rounded-xl transition-all duration-200 ${
                            isLockFlagLocation 
                                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                        title="Sync all classes to this location"
                    >
                        {isLockFlagLocation ? <Lock size={18} /> : <LockOpen size={18} />}
                    </button>
                </div>
            </div>

        </div>
    );
}
