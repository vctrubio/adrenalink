"use client";

import { TrendingUpDown, Trash2, CheckCircle2 } from "lucide-react";
import { useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import { useClassboardContext, optimisticEventToNode } from "@/src/providers/classboard-provider";
import { ClassboardProgressBar } from "./ClassboardProgressBar";
import type { TeacherStats } from "@/backend/classboard/ClassboardStatistics";
import { TeacherQueue, type ControllerSettings } from "@/backend/classboard/TeacherQueue";
import type { TeacherViewMode } from "@/types/classboard-teacher-queue";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { SubmitCancelReset } from "@/src/components/ui/SubmitCancelReset";
import { bulkUpdateEventStatus, bulkDeleteClassboardEvents, bulkUpdateClassboardEvents } from "@/supabase/server/classboard";

import { AnimatedCounter } from "@/src/components/ui/AnimatedCounter";

// Muted green - softer than entity color
const TEACHER_COLOR = "#16a34a";
// Muted amber - softer than student entity color
const STUDENT_COLOR = "#ca8a04";

// Aggregated equipment counts from events
export interface EquipmentCount {
    categoryId: string;
    count: number;
}

// Event progress by status (in minutes)
export interface EventProgress {
    completed: number;
    planned: number;
    tbc: number;
    uncompleted: number;
    total: number;
    eventIds?: string[];
}

// Progress bar sub-component - Inline style with Batch Actions
function TeacherEventProgressBar({
    progress,
    queue,
    controller,
    globalFlag,
    onBulkAction,
}: {
    progress: EventProgress;
    queue?: TeacherQueue;
    controller?: ControllerSettings;
    globalFlag: any;
    onBulkAction?: (ids: string[], action: "delete" | "update") => void;
}) {
    const { completed, planned, tbc, uncompleted, total, eventIds = [] } = progress;
    const totalEvents = eventIds.length;
    const completedEvents = queue ? queue.getAllEvents().filter((e) => e.eventData.status === "completed").length : 0;

    // Dropdown Logic
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownTriggerRef = useRef<HTMLDivElement>(null);

    const handleMarkAllCompleted = async () => {
        if (eventIds.length === 0) return;
        setIsLoading(true);
        try {
            await bulkUpdateEventStatus(eventIds, "completed");
            setIsDropdownOpen(false);
        } catch (error) {
            console.error("Batch update failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        if (eventIds.length === 0) return;
        setIsLoading(true);
        if (onBulkAction) onBulkAction(eventIds, "delete");
        try {
            await bulkDeleteClassboardEvents(eventIds);
            setIsDropdownOpen(false);
        } catch (error) {
            console.error("Batch delete failed", error);
            if (onBulkAction) onBulkAction([], "delete");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptimiseQueue = async () => {
        if (!queue || !controller) return;
        setIsLoading(true);
        try {
            // Use the existing QueueController from globalFlag if available
            const qc = globalFlag.getQueueController(queue.teacher.id);

            if (qc) {
                console.log(`🔧 [TeacherClassCard] Optimising queue locally for ${queue.teacher.username}`);
                qc.optimiseQueue();

                if (!qc.isLocked()) {
                    controller.locked = true;
                    globalFlag.triggerRefresh();
                }
            } else {
                // Direct Action: Submit immediately if not in edit mode
                const result = queue.optimiseQueue(controller.gapMinutes);
                if (result.updates.length > 0) {
                    await bulkUpdateClassboardEvents(result.updates);
                    toast.success("Queue Optimised");
                } else {
                    toast.success("Already optimised");
                }
            }

            setIsDropdownOpen(false);
        } catch (error) {
            console.error("Queue optimisation failed", error);
            toast.error("Failed to optimise queue");
        } finally {
            setIsLoading(false);
        }
    };

    const isOptimised = queue && controller ? queue.isQueueOptimised(controller.gapMinutes) : false;

    const dropdownItems: DropdownItemProps[] = [
        {
            id: "mark-completed",
            label: "Mark all as completed",
            icon: CheckCircle2,
            color: "#16a34a",
            onClick: (e) => {
                e?.stopPropagation();
                handleMarkAllCompleted();
            },
        },
        {
            id: "delete-all",
            label: "Delete all events",
            icon: Trash2,
            color: "#ef4444",
            onClick: (e) => {
                e?.stopPropagation();
                handleDeleteAll();
            },
        },
        ...(queue && controller && !isOptimised
            ? [
                  {
                      id: "optimise-queue",
                      label: isLoading ? "Optimising..." : "Optimise queue",
                      icon: CheckCircle2,
                      color: "#2563eb",
                      onClick: (e) => {
                          e?.stopPropagation();
                          handleOptimiseQueue();
                      },
                  },
              ]
            : []),
    ];

    const counts = { completed, planned, tbc, uncompleted };

    return (
        <div className="flex items-center w-full gap-3 relative">
            <div className="flex-1 rounded-full overflow-hidden">
                <ClassboardProgressBar durationMinutes={total} counts={counts} />
            </div>

            {/* Clickable Progress Label acting as Dropdown Trigger */}
            <div
                ref={dropdownTriggerRef}
                className={`text-[9px] font-bold whitespace-nowrap tracking-tighter cursor-pointer select-none transition-colors rounded px-1 -mr-1
                    ${isDropdownOpen ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                }}
            >
                {completedEvents}/{totalEvents} COMPLETED
            </div>

            {/* Custom Backdrop to stop propagation on close-click */}
            {isDropdownOpen && (
                <div
                    className="fixed inset-0 z-[9997]"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsDropdownOpen(false);
                    }}
                />
            )}

            <Dropdown
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                items={dropdownItems}
                align="right"
                triggerRef={dropdownTriggerRef}
            />
        </div>
    );
}

// Equipment and Students sub-component - for a single event
function EventEquipmentStudent({ event }: { event: any }) {
    const categoryEquipment = event.categoryEquipment;
    const capacityEquipment = event.capacityEquipment || 1;
    const studentCount = event.bookingStudents?.length || 0;

    return (
        <div className="flex items-center gap-1.5 shrink-0">
            {categoryEquipment &&
                (() => {
                    const config = EQUIPMENT_CATEGORIES.find((c) => c.id === categoryEquipment);
                    if (!config) return null;
                    const CategoryIcon = config.icon;
                    return (
                        <div className="flex items-center gap-0.5" style={{ color: config.color }}>
                            <CategoryIcon size={18} />
                            {capacityEquipment > 1 && <span className="text-sm font-semibold">{capacityEquipment}</span>}
                        </div>
                    );
                })()}

            {studentCount > 0 && (
                <div className="flex items-center gap-0.5" style={{ color: STUDENT_COLOR }}>
                    <HelmetIcon size={18} />
                    {studentCount > 1 && <span className="text-sm font-semibold">{studentCount}</span>}
                </div>
            )}
        </div>
    );
}

// Stats row sub-component
function TeacherStatsRow({ equipmentCounts, stats }: { equipmentCounts: EquipmentCount[]; stats: TeacherStats }) {
    const hasEquipment = equipmentCounts && equipmentCounts.length > 0;
    const hasDuration = stats.totalHours && stats.totalHours > 0;
    const hasCommission = stats.totalRevenue?.commission && stats.totalRevenue.commission > 0;
    const hasProfit = stats.totalRevenue?.revenue && stats.totalRevenue.revenue > 0;
    const hasAnyStats = hasEquipment || hasDuration || hasCommission || hasProfit;

    if (!hasAnyStats) {
        return (
            <div className="text-xs text-muted-foreground text-center py-1 font-medium tracking-tight italic opacity-50">
                No activity yet
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between w-full gap-2 px-1">
            {/* Left: Equipment Categories */}
            <div className="flex items-center gap-3">
                <AnimatePresence mode="popLayout">
                    {equipmentCounts.map(({ categoryId, count }) => {
                        const config = EQUIPMENT_CATEGORIES.find((c) => c.id === categoryId);
                        if (!config) return null;
                        const CategoryIcon = config.icon;
                        return (
                            <motion.div
                                key={categoryId}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1"
                            >
                                <div style={{ color: config.color }}>
                                    <CategoryIcon size={16} />
                                </div>
                                <span className="text-sm font-bold text-foreground">
                                    <AnimatedCounter value={count} />
                                </span>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Right: Main Money Stats (Duration, Commission, Profit) */}
            <div className="flex items-center gap-4">
                {hasDuration && (
                    <div className="flex items-center gap-1">
                        <DurationIcon size={16} className="text-muted-foreground/70 shrink-0" />
                        <span className="text-sm font-bold text-foreground">
                            <AnimatedCounter value={stats.totalHours * 60} formatter={getHMDuration} />
                        </span>
                    </div>
                )}

                {hasCommission && (
                    <div className="flex items-center gap-1">
                        <HandshakeIcon size={16} className="text-muted-foreground/70 shrink-0" />
                        <span className="text-sm font-bold text-foreground">
                            <AnimatedCounter value={stats.totalRevenue.commission} formatter={getCompactNumber} />
                        </span>
                    </div>
                )}

                {hasProfit && (
                    <div className="flex items-center gap-1">
                        <TrendingUpDown size={16} className="text-muted-foreground/70 shrink-0" />
                        <span className="text-sm font-bold text-foreground">
                            <AnimatedCounter value={stats.totalRevenue.revenue} formatter={getCompactNumber} />
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export interface TeacherClassCardProps {
    queue: TeacherQueue;
    onClick?: () => void;
    viewMode: TeacherViewMode;
    onToggleAdjustment?: (mode: boolean) => void;
    onSubmit?: () => void;
    onReset?: () => void;
    onCancel?: () => void;
    hasChanges?: boolean;
    changedCount?: number;
    isSubmitting?: boolean;
    onBulkAction?: (ids: string[], action: "delete" | "update") => void;
}

export default function TeacherClassCard({
    queue,
    onClick,
    viewMode,
    onToggleAdjustment,
    onSubmit,
    onReset,
    onCancel,
    hasChanges = false,
    changedCount = 0,
    isSubmitting = false,
    onBulkAction,
}: TeacherClassCardProps) {
    const { controller, selectedDate, globalFlag } = useClassboardContext();

    const isAdjustmentMode = viewMode === "adjustment";
    const isExpanded = viewMode !== "collapsed";

    // Derive all data from queue
    const teacherName = queue.teacher.username;
    const earliestTime = queue.getEarliestTime();

    // Stats calculated from real events only (avoid flicker)
    const stats = useMemo(() => {
        // Include deleted events in stats so the placeholders don't flash during deletion
        return queue.getStats({ includeDeleted: true });
    }, [queue, queue.version]);

    const equipmentCounts = useMemo(() => {
        // Include deleted events so icons stay visible while spinning
        const events = queue.getAllEvents({ includeDeleted: true });
        const counts = new Map<string, number>();

        // Process confirmed events only (avoid flicker)
        events.forEach((event) => {
            if (event.categoryEquipment) {
                const current = counts.get(event.categoryEquipment) || 0;
                counts.set(event.categoryEquipment, current + 1); // Count events, not capacity
            }
        });

        return Array.from(counts.entries()).map(([categoryId, count]) => ({
            categoryId,
            count,
        }));
    }, [queue, queue.version]);

    const eventProgress = useMemo(() => {
        // Progress bar should also show the deleting state
        const events = queue.getAllEvents({ includeDeleted: true });
        let completed = 0;
        let planned = 0;
        let tbc = 0;
        let uncompleted = 0;
        const eventIds: string[] = [];

        events.forEach((event) => {
            eventIds.push(event.id);
            const duration = event.eventData.duration;

            if (event.eventData.status === "completed") {
                completed += duration;
            } else if (event.eventData.status === "planned") {
                planned += duration;
            } else if (event.eventData.status === "tbc") {
                tbc += duration;
            } else if (event.eventData.status === "uncompleted") {
                uncompleted += duration;
            }
        });

        const total = completed + planned + tbc + uncompleted;

        return {
            completed,
            planned,
            tbc,
            uncompleted,
            total,
            eventIds,
        };
    }, [queue, queue.version]);

    const completedCount = useMemo(
        () => queue.getAllEvents({ includeDeleted: true }).filter((e) => e.eventData.status === "completed").length,
        [queue, queue.version],
    );
    const pendingCount = useMemo(
        () => queue.getAllEvents({ includeDeleted: true }).filter((e) => e.eventData.status !== "completed").length,
        [queue, queue.version],
    );
    const totalEvents = completedCount + pendingCount;
    const [showDangerBorder, setShowDangerBorder] = useState(false);

    // Handle header click - toggle collapse or show error if in adjustment mode
    const handleHeaderClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (isAdjustmentMode) {
                // Can't collapse while in adjustment mode
                console.log("Can't exit because in adjustment mode");
                setShowDangerBorder(true);
                setTimeout(() => setShowDangerBorder(false), 1000);
            } else {
                // Toggle collapse/expand
                onClick?.();
            }
        },
        [isAdjustmentMode, onClick],
    );

    // Handle icon click - in collapsed view: enter adjustment mode + expand. In expanded view: toggle adjustment mode
    const handleIconClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (isExpanded) {
                // Expanded view: toggle adjustment mode
                onToggleAdjustment?.(!isAdjustmentMode);
            } else {
                // Collapsed view: enter adjustment mode and expand
                onClick?.();
                onToggleAdjustment?.(true);
            }
        },
        [isExpanded, isAdjustmentMode, onClick, onToggleAdjustment],
    );

    // Get events from queue for equipment display (already filtered by date in ClientClassboard)
    const todayEvents = useMemo(() => queue.getAllEvents({ includeDeleted: true }), [queue, queue.version]);

    // Collapsed view - single line
    const progressBarCounts = useMemo(
        () => ({
            completed: eventProgress.completed,
            planned: eventProgress.planned,
            tbc: eventProgress.tbc,
            uncompleted: eventProgress.uncompleted,
        }),
        [eventProgress],
    );

    if (!isExpanded) {
        return (
            <div
                className={`group relative w-full overflow-hidden rounded-xl border border-border transition-colors duration-200 ${!queue.isActive ? "opacity-70 grayscale-[0.5]" : ""}`}
            >
                {<ClassboardProgressBar counts={progressBarCounts} durationMinutes={eventProgress.total} />}

                <div onClick={handleHeaderClick} className="h-16 flex items-center gap-4 px-6 bg-background cursor-pointer flex-1">
                    {/* Icon - Enter adjustment mode and expand if collapsed */}
                    <button
                        onClick={handleIconClick}
                        className="flex-shrink-0 transition-opacity hover:opacity-80"
                        style={{ color: !queue.isActive ? "rgb(var(--muted-foreground))" : TEACHER_COLOR }}
                    >
                        <HeadsetIcon size={28} />
                    </button>

                    {/* Username */}
                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                        <span className="text-xl font-bold text-foreground truncate">{teacherName}</span>
                        {!queue.isActive && (
                            <span className="text-[8px] bg-muted px-1 py-0.5 rounded font-black text-muted-foreground uppercase tracking-widest">
                                Inactive
                            </span>
                        )}
                    </div>

                    {/* Time */}
                    {earliestTime && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground font-mono shrink-0">
                            <FlagIcon size={14} />
                            {earliestTime}
                        </div>
                    )}

                    {/* Duration */}
                    {stats.totalHours && stats.totalHours > 0 && (
                        <div className="flex items-center gap-1 text-base text-muted-foreground shrink-0">
                            <DurationIcon size={18} className="text-muted-foreground/70" />
                            <span className="font-bold">
                                <AnimatedCounter value={stats.totalHours * 60} formatter={getHMDuration} />
                            </span>
                        </div>
                    )}

                    {/* Commission */}
                    {stats.totalRevenue?.commission && stats.totalRevenue.commission > 0 && (
                        <div className="flex items-center gap-1 text-base text-muted-foreground shrink-0">
                            <HandshakeIcon size={18} className="text-muted-foreground/70" />
                            <span className="font-bold">
                                <AnimatedCounter value={stats.totalRevenue.commission} formatter={getCompactNumber} />
                            </span>
                        </div>
                    )}

                    {/* Revenue */}
                    {stats.totalRevenue?.revenue && stats.totalRevenue.revenue > 0 && (
                        <div className="flex items-center gap-1 text-base text-muted-foreground shrink-0">
                            <TrendingUpDown size={18} className="text-muted-foreground/70" />
                            <span className="font-bold">
                                <AnimatedCounter value={stats.totalRevenue.revenue} formatter={getCompactNumber} />
                            </span>
                        </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Events Equipment and Students */}
                    <div className="flex items-center gap-3 shrink-0">
                        {todayEvents.map((event, index) => (
                            <div key={event.id} className="flex items-center gap-3 shrink-0">
                                <EventEquipmentStudent event={event} />
                                {index < todayEvents.length - 1 && <div className="h-4 w-px bg-border/30" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Expanded view
    return (
        <div
            onClick={onClick}
            className={`group relative w-full overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-all duration-300 hover:shadow-lg cursor-pointer ${!queue.isActive ? "opacity-75 grayscale-[0.3]" : ""}`}
        >
            {/* Header: Avatar (Status) + Name/Progress/Time - Toggle collapse */}
            <div onClick={handleHeaderClick} className="flex items-center gap-4 px-6 py-5 cursor-pointer">
                {/* Left Side: Avatar Icon - Enter adjustment mode */}
                <button onClick={handleIconClick} className="flex-shrink-0 transition-opacity hover:opacity-80">
                    <div
                        className={`w-12 h-12 flex items-center justify-center rounded-full border transition-colors ${isAdjustmentMode ? "bg-cyan-500/10 border-cyan-500/30" : "bg-muted border-border"}`}
                        style={{ color: !queue.isActive ? "rgb(var(--muted-foreground))" : TEACHER_COLOR }}
                    >
                        <HeadsetIcon size={24} />
                    </div>
                </button>

                {/* Right Side: Name, Progress, and Time - Toggle adjustment mode on click */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-lg font-bold text-foreground truncate tracking-tight leading-tight">
                                {teacherName}
                            </span>
                            {!queue.isActive && (
                                <span className="text-[8px] bg-muted px-1 py-0.5 rounded font-black text-muted-foreground uppercase tracking-widest">
                                    Inactive
                                </span>
                            )}
                        </div>
                        {earliestTime && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold shrink-0">
                                <FlagIcon size={12} className="shrink-0" />
                                <span className="font-mono">{earliestTime}</span>
                            </div>
                        )}
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                        <TeacherEventProgressBar
                            progress={eventProgress}
                            queue={queue}
                            controller={controller}
                            globalFlag={globalFlag}
                            onBulkAction={onBulkAction}
                        />
                    </div>
                </div>
            </div>

            {/* Footer - Stats (enter mode) or Controls */}
            <div className="px-2 pb-2">
                {isAdjustmentMode ? (
                    <SubmitCancelReset
                        onSubmit={onSubmit || (() => onToggleAdjustment?.(false))}
                        onCancel={onCancel || (() => onToggleAdjustment?.(false))}
                        onReset={onReset || (() => {})}
                        hasChanges={hasChanges}
                        isSubmitting={isSubmitting}
                        submitLabel="Save"
                        extraContent={
                            changedCount > 0 && (
                                <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-white/25 text-white text-[10px] font-extrabold ml-1.5 shadow-sm border border-white/10">
                                    {changedCount}
                                </span>
                            )
                        }
                    />
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleAdjustment?.(true);
                        }}
                        className={`w-full rounded-xl p-3 transition-all duration-200 ${showDangerBorder ? "border-2 border-red-500 bg-red-500/10" : "border border-border/50 bg-muted/50 hover:bg-muted"}`}
                    >
                        <TeacherStatsRow equipmentCounts={equipmentCounts} stats={stats} />
                    </button>
                )}
            </div>
        </div>
    );
}
