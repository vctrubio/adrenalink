"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Lock, LockOpen, MapPin, Zap, X, Minus, Plus, Clock } from "lucide-react";
import { SubmitCancelReset } from "@/src/components/ui/SubmitCancelReset";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";
import { bulkUpdateClassboardEvents } from "@/supabase/server/classboard";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";

// ============ SUB-COMPONENTS ============

const AdjustmentSection = ({
    label,
    value,
    lockCount,
    totalCount,
    onAdjust,
    onToggleLock,
    isLocked,
    icon: Icon,
    isMono = false,
}: {
    label: string;
    value: string;
    lockCount: number;
    totalCount: number;
    onAdjust: (inc: boolean) => void;
    onToggleLock: () => void;
    isLocked: boolean;
    icon?: any;
    isMono?: boolean;
}) => (
    <div className="space-y-3">
        <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
            <div className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                {lockCount}/{totalCount} SYNCHRONIZED
            </div>
        </div>

        <div className="flex items-center gap-2">
            <button onClick={() => onAdjust(false)} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <ChevronLeft size={18} />
            </button>
            <div className="flex-1 flex items-center justify-center bg-card border border-zinc-200 dark:border-zinc-700 rounded-xl h-12 relative overflow-hidden group">
                <div className="flex items-center justify-center w-full h-full px-2 gap-2">
                    {Icon && <Icon size={16} className="text-muted-foreground shrink-0" />}
                    <span className={`${isMono ? "font-mono text-xl" : "text-sm font-medium"} font-bold tracking-tight truncate`}>
                        {value || "--:--"}
                    </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-600/10">
                    <div
                        className="h-full bg-cyan-600 transition-all duration-300"
                        style={{ width: `${(lockCount / Math.max(totalCount, 1)) * 100}%` }}
                    />
                </div>
            </div>
            <button onClick={() => onAdjust(true)} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <ChevronRight size={18} />
            </button>
            <button
                onClick={onToggleLock}
                className={`p-3 rounded-xl transition-all duration-200 ${isLocked ? "bg-cyan-600 text-white shadow-lg" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
            >
                {isLocked ? <Lock size={18} /> : <LockOpen size={18} />}
            </button>
        </div>
    </div>
);

const OptimisationSection = ({
    optimised,
    total,
    gapMinutes,
    onGapChange,
    onOptimise,
    isFullyOptimised,
}: {
    optimised: number;
    total: number;
    gapMinutes: number;
    onGapChange: (delta: number) => void;
    onOptimise: () => void;
    isFullyOptimised: boolean;
}) => (
    <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Optimisation ({optimised}/{total})
        </label>

        <div className="space-y-3">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider ml-1">Gap Duration</label>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onGapChange(-5)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-border/40 hover:border-border/80"
                >
                    <Minus size={14} />
                </button>
                <div className="flex-1 bg-background/50 border border-border/40 rounded-lg px-3 py-2 text-center text-sm font-mono font-bold flex items-center justify-center gap-2">
                    <Clock size={14} className="text-muted-foreground/40" />
                    {gapMinutes}m
                </div>
                <button
                    onClick={() => onGapChange(5)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-border/40 hover:border-border/80"
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>

        <button
            onClick={onOptimise}
            disabled={isFullyOptimised}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                isFullyOptimised
                    ? "bg-green-500/10 border-green-500/30 cursor-default shadow-none"
                    : "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 active:scale-95 cursor-pointer shadow-sm"
            }`}
        >
            <svg
                className={`w-4 h-4 ${isFullyOptimised ? "text-green-500" : "text-blue-500"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                {isFullyOptimised ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                )}
            </svg>
            <span
                className={`text-[10px] font-black uppercase tracking-wider ${isFullyOptimised ? "text-green-500/80" : "text-blue-500"}`}
            >
                {isFullyOptimised ? `${total} Events Synced` : `Optimise ${total} Events`}
            </span>
        </button>
    </div>
);

const ActiveQueueSection = ({
    teachers,
    pendingTeachers,
    globalFlag,
    adjustmentTime,
    onIndividualSubmit,
}: {
    teachers: any[];
    pendingTeachers: Set<string>;
    globalFlag: any;
    adjustmentTime: string | null;
    onIndividualSubmit: (id: string) => void;
}) => (
    <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Active Queue ({pendingTeachers.size})
        </label>
        <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
            {teachers
                .filter((q) => pendingTeachers.has(q.teacher.id))
                .map((q) => {
                    const controller = globalFlag.getQueueController(q.teacher.id);
                    const activeQueue = controller?.getQueue() ?? q;
                    const firstTime = activeQueue.getEarliestTime();
                    const isSubmitting = globalFlag.isSubmitting(q.teacher.id);
                    const hasChanges = globalFlag.collectChangesForTeacher(q.teacher.id).length > 0;
                    const isMatchingGlobal = firstTime === adjustmentTime;

                    return (
                        <div
                            key={q.teacher.id}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 shadow-sm animate-in slide-in-from-left-2 duration-200"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <HeadsetIcon size={16} className="text-muted-foreground shrink-0" />
                                    <span className="font-bold text-sm tracking-tight truncate">{q.teacher.username}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <FlagIcon size={14} className={isMatchingGlobal ? "text-cyan-500" : "text-primary/60"} />
                                    <span
                                        className={`font-mono text-xs font-bold ${isMatchingGlobal ? "text-cyan-600" : "text-primary"}`}
                                    >
                                        {firstTime || "--:--"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 ml-2">
                                <button
                                    onClick={() => globalFlag.optOut(q.teacher.id)}
                                    className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                                <button
                                    onClick={() => onIndividualSubmit(q.teacher.id)}
                                    disabled={!hasChanges || isSubmitting}
                                    className={`p-2 rounded-lg transition-all shadow-sm ${hasChanges ? "bg-cyan-600 text-white hover:bg-cyan-700 shadow-cyan-500/20" : "bg-muted/30 text-muted-foreground/30 cursor-not-allowed"}`}
                                >
                                    {isSubmitting ? (
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Zap size={14} className={hasChanges ? "fill-current" : ""} />
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
        </div>
    </div>
);

// ============ MAIN COMPONENT ============

/**
 * LessonFlagLocationSettingsController - Global adjustment panel.
 * Reads ALL state from GlobalFlag (single source of truth)
 */
export default function LessonFlagLocationSettingsController() {
    const { globalFlag } = useClassboardContext();

    // Configuration from Controller
    const controller = globalFlag.getController();
    const LOCATIONS = controller.locationOptions || ["Beach", "Bay", "Lake", "River", "Pool", "Indoor"];
    const MIN_TIME = controller.minTimeMinutes ?? 0;
    const MAX_TIME = controller.maxTimeMinutes ?? 1380;

    const [adjustmentTime, setAdjustmentTime] = useState<string | null>(null);
    const [adjustmentLocation, setAdjustmentLocation] = useState<string | null>(null);
    const [locationIndex, setLocationIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [manuallyUnlockedTime, setManuallyUnlockedTime] = useState(false);
    const [manuallyUnlockedLocation, setManuallyUnlockedLocation] = useState(false);

    // Ongoing Sync with Global Session
    useEffect(() => {
        const currentGlobalTime = globalFlag.getGlobalTime();
        const currentGlobalLocation = globalFlag.getGlobalLocation();

        if (currentGlobalTime) setAdjustmentTime(currentGlobalTime);
        if (currentGlobalLocation) {
            setAdjustmentLocation(currentGlobalLocation);
            const idx = LOCATIONS.indexOf(currentGlobalLocation);
            if (idx >= 0) setLocationIndex(idx);
        }
    }, [globalFlag, LOCATIONS]);

    // Computed Lock Status
    const timeLock = globalFlag.getLockStatusTime(adjustmentTime);
    const locLock = globalFlag.getLockStatusLocation(adjustmentLocation);
    const isLockFlagTime = globalFlag.isLockedTime;
    const isLockFlagLocation = globalFlag.isLockedLocation;

    // Auto-lock Logic
    useEffect(() => {
        if (timeLock.lockCount === timeLock.totalTeachers && timeLock.totalTeachers > 0) {
            if (!isLockFlagTime && !manuallyUnlockedTime) {
                globalFlag.isLockedTime = true;
                globalFlag.triggerRefresh();
            }
        } else {
            if (manuallyUnlockedTime) setManuallyUnlockedTime(false);
            if (isLockFlagTime) globalFlag.unlockTime();
        }

        if (locLock.synchronizedTeachersCount === locLock.totalTeachers && locLock.totalTeachers > 0) {
            if (!isLockFlagLocation && !manuallyUnlockedLocation) {
                globalFlag.isLockedLocation = true;
                globalFlag.triggerRefresh();
            }
        } else {
            if (manuallyUnlockedLocation) setManuallyUnlockedLocation(false);
            if (isLockFlagLocation) globalFlag.unlockLocation();
        }
    }, [timeLock, locLock, isLockFlagTime, isLockFlagLocation, manuallyUnlockedTime, manuallyUnlockedLocation, globalFlag]);

    // Handlers
    const handleIndividualSubmit = async (teacherId: string) => {
        const changes = globalFlag.collectChangesForTeacher(teacherId);
        globalFlag.setSubmitting(teacherId, true);
        try {
            if (changes.length > 0) await bulkUpdateClassboardEvents(changes);
            globalFlag.optOut(teacherId);
        } finally {
            globalFlag.setSubmitting(teacherId, false);
        }
    };

    const handleAdjustTime = (increment: boolean) => {
        if (!adjustmentTime) return;
        const totalMins = timeToMinutes(adjustmentTime) + (increment ? controller.stepDuration : -controller.stepDuration);
        if (totalMins < MIN_TIME || totalMins > MAX_TIME) return;
        const newTime = minutesToTime(totalMins);
        setAdjustmentTime(newTime);
        globalFlag.adjustTime(newTime);
    };

    const handleToggleTimeLock = () => {
        if (isLockFlagTime) {
            setManuallyUnlockedTime(true);
            globalFlag.unlockTime();
        } else if (adjustmentTime) {
            setManuallyUnlockedTime(false);
            globalFlag.lockToAdjustmentTime(adjustmentTime);
        }
    };

    const handleAdjustLocation = (increment: boolean) => {
        let nextIdx = increment ? locationIndex + 1 : locationIndex - 1;
        if (nextIdx < 0) nextIdx = LOCATIONS.length - 1;
        if (nextIdx >= LOCATIONS.length) nextIdx = 0;
        const newLocation = LOCATIONS[nextIdx];
        setLocationIndex(nextIdx);
        setAdjustmentLocation(newLocation);
        globalFlag.adjustLocation(newLocation);
    };

    const handleToggleLocationLock = () => {
        if (isLockFlagLocation) {
            setManuallyUnlockedLocation(true);
            globalFlag.unlockLocation();
        } else if (adjustmentLocation) {
            setManuallyUnlockedLocation(false);
            globalFlag.lockToLocation(adjustmentLocation);
        }
    };

    const handleSubmitAll = async () => {
        setIsSubmitting(true);
        try {
            const changes = globalFlag.collectChanges();
            if (changes.length > 0) await bulkUpdateClassboardEvents(changes);
            globalFlag.exitAdjustmentMode();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        globalFlag.discardChanges();
        setAdjustmentTime(globalFlag.getGlobalEarliestTime());
        setAdjustmentLocation(globalFlag.getGlobalLocation());
    };

    const pendingTeachers = globalFlag.getPendingTeachers();
    const updatesCount = globalFlag.getChangedEventsCount();
    const optimisation = globalFlag.getOptimisationStats();

    return (
        <div className="flex flex-col gap-6 px-4 py-2 h-full bg-card/50 backdrop-blur-sm">
            <SubmitCancelReset
                onSubmit={handleSubmitAll}
                onCancel={() => globalFlag.exitAdjustmentMode(true)}
                onReset={handleReset}
                hasChanges={updatesCount > 0}
                isSubmitting={isSubmitting}
                submitLabel="Apply Changes"
                extraContent={
                    updatesCount > 0 && (
                        <span className="ml-2 flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                            {updatesCount}
                        </span>
                    )
                }
            />

            <AdjustmentSection
                label="Start Time"
                value={adjustmentTime || ""}
                lockCount={timeLock.lockCount}
                totalCount={timeLock.totalTeachers}
                onAdjust={handleAdjustTime}
                onToggleLock={handleToggleTimeLock}
                isLocked={isLockFlagTime}
                isMono
            />

            <div className="h-px bg-border/10" />

            <AdjustmentSection
                label="Location"
                value={adjustmentLocation || ""}
                lockCount={locLock.synchronizedTeachersCount}
                totalCount={locLock.totalTeachers}
                onAdjust={handleAdjustLocation}
                onToggleLock={handleToggleLocationLock}
                isLocked={isLockFlagLocation}
                icon={MapPin}
            />

            <div className="h-px bg-border/10" />

            <OptimisationSection
                optimised={optimisation.optimised}
                total={optimisation.total}
                gapMinutes={controller.gapMinutes}
                onGapChange={(d) => globalFlag.updateController({ gapMinutes: Math.max(0, (controller.gapMinutes || 0) + d) })}
                onOptimise={() => globalFlag.optimiseAllQueues()}
                isFullyOptimised={
                    optimisation.optimised === optimisation.total && optimisation.total > 0 && isLockFlagTime && isLockFlagLocation
                }
            />

            <div className="h-px bg-border/10" />

            <ActiveQueueSection
                teachers={globalFlag.getTeacherQueues()}
                pendingTeachers={pendingTeachers}
                globalFlag={globalFlag}
                adjustmentTime={adjustmentTime}
                onIndividualSubmit={handleIndividualSubmit}
            />
        </div>
    );
}
