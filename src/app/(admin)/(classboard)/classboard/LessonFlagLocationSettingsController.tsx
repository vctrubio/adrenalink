"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Lock, LockOpen, MapPin, Clock, Zap, X } from "lucide-react";
import { SubmitCancelReset } from "@/src/components/ui/SubmitCancelReset";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";
import { bulkUpdateClassboardEvents } from "@/actions/classboard-bulk-action";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import type { GlobalFlag } from "@/backend/models/GlobalFlag";
import type { TeacherQueue } from "@/src/app/(admin)/(classboard)/TeacherQueue";

const LOCATIONS = ["Beach", "Bay", "Lake", "River", "Pool", "Indoor"];
const MIN_TIME_MINUTES = 0;
const MAX_TIME_MINUTES = 1380;

interface LessonFlagLocationSettingsControllerProps {
    globalFlag: GlobalFlag;
    teacherQueues: TeacherQueue[];
    onClose: () => void;
    onRefresh: () => void;
}

/**
 * LessonFlagLocationSettingsController - Redesigned global adjustment panel.
 *
 * DESIGN PRINCIPLES:
 * 1. Bulk Actions: Primary controls at the top adjust ALL pending teachers in the queue.
 * 2. Selective Release: Individual teachers can be saved and removed from the global session one-by-one.
 * 3. Session Persistence: Opening/closing the sidebar does not reset adjustments; the state is
 *    centrally managed by the globalFlag instance.
 * 4. Data Safety: "Reset" restores the exact state captured at the start of the session.
 */
export default function LessonFlagLocationSettingsController({ globalFlag, teacherQueues, onClose, onRefresh }: LessonFlagLocationSettingsControllerProps) {
    const [adjustmentTime, setAdjustmentTime] = useState<string | null>(null);
    const [adjustmentLocation, setAdjustmentLocation] = useState<string | null>(null);
    const [locationIndex, setLocationIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Sync: Sync local UI state with the centralized global session
    useEffect(() => {
        const currentGlobalTime = globalFlag.getGlobalTime();
        const currentGlobalLocation = globalFlag.getGlobalLocation();

        if (currentGlobalTime) setAdjustmentTime(currentGlobalTime);
        if (currentGlobalLocation) {
            setAdjustmentLocation(currentGlobalLocation);
            const idx = LOCATIONS.indexOf(currentGlobalLocation);
            if (idx >= 0) setLocationIndex(idx);
        }
    }, [globalFlag]);

    const { lockCount } = globalFlag.getLockStatusTime(adjustmentTime);
    const { lockLocationCount, totalLocationEventsForLock } = globalFlag.getLockStatusLocation(adjustmentLocation);
    const isLockFlagTime = globalFlag.isLockedTime;
    const isLockFlagLocation = globalFlag.isLockedLocation;
    const stepDuration = globalFlag.getController().stepDuration || 30;
    const pendingTeachers = globalFlag.getPendingTeachers();
    const updatesCount = globalFlag.getChangedEventsCount();
    const hasChanges = updatesCount > 0;

    // Persists changes for a specific teacher and removes them from the global queue
    const handleIndividualSubmit = async (teacherId: string) => {
        const changes = globalFlag.collectChangesForTeacher(teacherId);
        globalFlag.setSubmitting(teacherId, true);

        try {
            if (changes.length > 0) {
                const result = await bulkUpdateClassboardEvents(changes);
                if (!result.success) return;
            }

            globalFlag.optOut(teacherId);
            onRefresh();
        } finally {
            globalFlag.setSubmitting(teacherId, false);
        }
    };

    const handleAdjustTime = (increment: boolean) => {
        if (!adjustmentTime) return;
        const currentMinutes = timeToMinutes(adjustmentTime);
        const newMinutes = increment ? currentMinutes + stepDuration : currentMinutes - stepDuration;
        if (newMinutes < MIN_TIME_MINUTES || newMinutes > MAX_TIME_MINUTES) return;
        const newTime = minutesToTime(newMinutes);
        setAdjustmentTime(newTime);
        globalFlag.adjustTime(newTime);
        
        // If time is locked, apply the adjustment to all locked teachers
        if (isLockFlagTime) {
            globalFlag.lockToAdjustmentTime(newTime);
        }
    };

    const handleLockTime = () => {
        if (isLockFlagTime) {
            // If locked, unlock it
            globalFlag.unlockTime();
        } else if (adjustmentTime) {
            // If not locked, lock to the current adjustment time
            globalFlag.lockToAdjustmentTime(adjustmentTime);
        }
    };

    const handleAdjustLocation = (increment: boolean) => {
        let newIndex = increment ? locationIndex + 1 : locationIndex - 1;
        if (newIndex < 0) newIndex = LOCATIONS.length - 1;
        if (newIndex >= LOCATIONS.length) newIndex = 0;
        const newLocation = LOCATIONS[newIndex];
        setLocationIndex(newIndex);
        setAdjustmentLocation(newLocation);
        
        // If location is locked, apply the adjustment to all teachers
        if (isLockFlagLocation) {
            globalFlag.adjustLocation(newLocation);
        }
    };

    const handleLockLocation = () => {
        if (isLockFlagLocation) {
            // If locked, unlock it
            globalFlag.unlockLocation();
        } else if (adjustmentLocation) {
            // If not locked, lock to the current adjustment location
            globalFlag.lockToLocation(adjustmentLocation);
        }
    };

    // Bulk submit for ALL remaining pending teachers
    const handleSubmitAll = async () => {
        setIsSubmitting(true);
        try {
            const changes = globalFlag.collectChanges();
            if (changes.length > 0) {
                const result = await bulkUpdateClassboardEvents(changes);
                if (!result.success) return;
            }
            globalFlag.exitAdjustmentMode();
            onRefresh();
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        globalFlag.discardChanges();
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
        globalFlag.exitAdjustmentMode(true); // true = discard changes
        onClose();
    };

    return (
        <div className="flex flex-col gap-6 px-4 py-2 h-full bg-card/50 backdrop-blur-sm">
            <SubmitCancelReset
                onSubmit={handleSubmitAll}
                onCancel={handleCancel}
                onReset={handleReset}
                hasChanges={hasChanges}
                isSubmitting={isSubmitting}
                submitLabel="Apply Changes"
                extraContent={updatesCount > 0 && <span className="ml-2 flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-white/20 text-white text-[10px] font-bold">{updatesCount}</span>}
            />

            {/* Time Adjustment Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Start Time</label>
                    <div className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{lockCount} SYNCHRONIZED</div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => handleAdjustTime(false)} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <div className="flex-1 flex flex-col items-center justify-center bg-card border border-zinc-200 dark:border-zinc-700 rounded-xl h-12 relative overflow-hidden group">
                        <span className="font-mono text-xl font-bold tracking-tight">{adjustmentTime || "--:--"}</span>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-600/10">
                            <div className="h-full bg-cyan-600 transition-all duration-300" style={{ width: `${(lockCount / Math.max(pendingTeachers.size, 1)) * 100}%` }} />
                        </div>
                    </div>
                    <button onClick={() => handleAdjustTime(true)} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <ChevronRight size={18} />
                    </button>
                    <button onClick={handleLockTime} className={`p-3 rounded-xl transition-all duration-200 ${isLockFlagTime ? "bg-cyan-600 text-white shadow-lg" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                        {isLockFlagTime ? <Lock size={18} /> : <LockOpen size={18} />}
                    </button>
                </div>
            </div>

            <div className="h-px bg-border/10" />

            {/* Location Adjustment Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</label>
                    <div className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{lockLocationCount} SYNCHRONIZED</div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleAdjustLocation(false)} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <div className="flex-1 flex items-center justify-center bg-card border border-zinc-200 dark:border-zinc-700 rounded-xl h-12 relative overflow-hidden group">
                        <div className="flex items-center justify-center w-full h-full px-2">
                            <MapPin size={16} className="mr-2 text-muted-foreground" />
                            <span className="font-medium text-sm truncate">{adjustmentLocation || "Select..."}</span>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-600/10">
                            <div className="h-full bg-cyan-600 transition-all duration-300" style={{ width: `${(lockLocationCount / Math.max(totalLocationEventsForLock, 1)) * 100}%` }} />
                        </div>
                    </div>
                    <button onClick={() => handleAdjustLocation(true)} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                        <ChevronRight size={18} />
                    </button>
                    <button onClick={handleLockLocation} className={`p-3 rounded-xl transition-all duration-200 ${isLockFlagLocation ? "bg-cyan-600 text-white shadow-lg" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                        {isLockFlagLocation ? <Lock size={18} /> : <LockOpen size={18} />}
                    </button>
                </div>
            </div>

            <div className="h-px bg-border/10" />

            {/* Live Queue Section */}
            <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Active Queue ({pendingTeachers.size})</label>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                    {teacherQueues
                        .filter((q) => pendingTeachers.has(q.teacher.id))
                        .map((q) => {
                            const controller = globalFlag.getControllerForTeacher(q.teacher.id);
                            const activeQueue = controller?.getQueue() ?? q;
                            const firstTime = activeQueue.getEarliestTime();
                            const isIndividualSubmitting = globalFlag.isSubmitting(q.teacher.id);
                            const individualChanges = globalFlag.collectChangesForTeacher(q.teacher.id);
                            const hasIndividualChanges = individualChanges.length > 0;
                            const isMatchingGlobal = firstTime === adjustmentTime;

                            return (
                                <div key={q.teacher.id} className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 shadow-sm animate-in slide-in-from-left-2 duration-200">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <HeadsetIcon size={16} className="text-muted-foreground shrink-0" />
                                            <span className="font-bold text-sm tracking-tight truncate">{q.teacher.username}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <FlagIcon size={14} className={isMatchingGlobal ? "text-cyan-500" : "text-primary/60"} />
                                            <span className={`font-mono text-xs font-bold ${isMatchingGlobal ? "text-cyan-600" : "text-primary"}`}>{firstTime || "--:--"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 ml-2">
                                        <button onClick={() => globalFlag.optOut(q.teacher.id)} className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors" title="Remove from queue without saving">
                                            <X size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleIndividualSubmit(q.teacher.id)}
                                            disabled={!hasIndividualChanges || isIndividualSubmitting}
                                            className={`p-2 rounded-lg transition-all shadow-sm ${hasIndividualChanges ? "bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-500/20" : "bg-muted/30 text-muted-foreground/30 cursor-not-allowed"}`}
                                            title={hasIndividualChanges ? `Submit changes for ${q.teacher.username}` : "No changes to submit"}
                                        >
                                            {isIndividualSubmitting ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Zap size={14} className={hasIndividualChanges ? "fill-current" : ""} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
