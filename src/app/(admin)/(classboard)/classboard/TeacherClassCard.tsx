"use client";

import { TrendingUp, Trash2, CheckCircle2 } from "lucide-react";
import { useState, useRef, useMemo, useCallback } from "react";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import { ClassboardProgressBar } from "./ClassboardProgressBar";
import type { TeacherStats } from "@/backend/ClassboardStats";
import type { TeacherQueue, ControllerSettings } from "@/backend/TeacherQueue";
import { QueueController } from "@/backend/QueueController";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { SubmitCancelReset } from "@/src/components/ui/SubmitCancelReset";
import { bulkUpdateEventStatus, bulkDeleteClassboardEvents } from "@/actions/classboard-bulk-action";

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
    total: number;
    eventIds?: string[];
}

// Progress bar sub-component - Inline style with Batch Actions
function TeacherEventProgressBar({ progress, totalEvents, completedEvents }: {
    progress: EventProgress,
    totalEvents: number,
    completedEvents: number
}) {
    const { completed, planned, tbc, total, eventIds = [] } = progress;
    const denominator = total > 0 ? total : 1;
    const completedEnd = (completed / denominator) * 100;
    const plannedEnd = completedEnd + (planned / denominator) * 100;
    const tbcEnd = plannedEnd + (tbc / denominator) * 100;

    const completedColor = EVENT_STATUS_CONFIG.completed.color;
    const plannedColor = `${EVENT_STATUS_CONFIG.planned.color}40`;
    const tbcColor = `${EVENT_STATUS_CONFIG.tbc.color}30`;
    const emptyColor = "#1f293720";

    const background = `linear-gradient(to right, ${completedColor} ${completedEnd}%, ${plannedColor} ${completedEnd}% ${plannedEnd}%, ${tbcColor} ${plannedEnd}% ${tbcEnd}%, ${emptyColor} ${tbcEnd}%)`;

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
        try {
            await bulkDeleteClassboardEvents(eventIds);
            setIsDropdownOpen(false);
        } catch (error) {
            console.error("Batch delete failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const dropdownItems: DropdownItemProps[] = [
        {
            id: "mark-completed",
            label: "Mark all as completed",
            icon: CheckCircle2,
            color: "#16a34a",
            onClick: handleMarkAllCompleted,
        },
        {
            id: "delete-all",
            label: "Delete all events",
            icon: Trash2,
            color: "#ef4444",
            onClick: handleDeleteAll,
        }
    ];

    return (
        <div className="flex items-center w-full gap-3 relative">
            <div className="flex-1 h-1 bg-muted/50 rounded-full overflow-hidden">
                <div
                    className="h-full transition-all duration-500 ease-out rounded-full"
                    style={{ background, width: "100%" }}
                />
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
function EventEquipmentStudent({ event }: {
    event: any
}) {
    const categoryEquipment = event.packageData?.categoryEquipment;
    const capacityEquipment = event.packageData?.capacityEquipment || 1;
    const studentCount = event.studentData?.length || 0;

    return (
        <div className="flex items-center gap-1.5 shrink-0">
            {categoryEquipment && (
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
                })()
            )}

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
function TeacherStatsRow({ equipmentCounts, stats }: {
    equipmentCounts: EquipmentCount[],
    stats: TeacherStats
}) {
    const hasEquipment = equipmentCounts && equipmentCounts.length > 0;
    const hasDuration = stats.totalHours && stats.totalHours > 0;
    const hasCommission = stats.earnings?.teacher && stats.earnings.teacher > 0;
    const hasProfit = stats.earnings?.school && stats.earnings.school > 0;
    const hasAnyStats = hasEquipment || hasDuration || hasCommission || hasProfit;

    if (!hasAnyStats) return <div className="text-xs text-muted-foreground text-center py-1">No activity yet</div>;

    const hasMoneyStats = hasDuration || hasCommission || hasProfit;

    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            {/* Equipment Categories */}
            <div className="flex items-center gap-3 flex-wrap">
                {equipmentCounts.map(({ categoryId, count }) => {
                    const config = EQUIPMENT_CATEGORIES.find((c) => c.id === categoryId);
                    if (!config) return null;
                    const CategoryIcon = config.icon;
                    return (
                        <div key={categoryId} className="flex items-center gap-1.5">
                            <div style={{ color: config.color }}>
                                <CategoryIcon size={16} />
                            </div>
                            {count > 1 && <span className="text-sm font-bold text-foreground">{count}</span>}
                        </div>
                    );
                })}
            </div>

            {/* Adaptive Divider: Vertical on desktop, Horizontal line on wrap */}
            {hasEquipment && hasMoneyStats && (
                <>
                    <div className="h-4 w-px bg-border/60 hidden sm:block" />
                    <div className="h-px w-full bg-border/10 sm:hidden" />
                </>
            )}

            {/* Main Money Stats (Duration & Commission) */}
            <div className="flex items-center gap-4 flex-wrap">
                {hasDuration && (
                    <div className="flex items-center gap-1.5">
                        <DurationIcon size={16} className="text-muted-foreground/70 shrink-0" />
                        <span className="text-sm font-bold text-foreground">{getHMDuration(stats.totalHours * 60)}</span>
                    </div>
                )}

                {hasCommission && (
                    <div className="flex items-center gap-1.5">
                        <HandshakeIcon size={16} className="text-muted-foreground/70 shrink-0" />
                        <span className="text-sm font-bold text-foreground">{getCompactNumber(stats.earnings.teacher)}</span>
                    </div>
                )}
            </div>

            {/* Profit / Revenue - wraps below or stays on right */}
            {hasProfit && (
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <TrendingUp size={16} className="text-muted-foreground/70 shrink-0" />
                    <span className="text-sm font-bold text-foreground">{getCompactNumber(stats.earnings.school)}</span>
                </div>
            )}
        </div>
    );
}

export interface TeacherClassCardProps {
    teacherName: string;
    stats: TeacherStats;
    earliestTime: string | null;
    pendingCount: number;
    completedCount: number;
    equipmentCounts: EquipmentCount[];
    eventProgress: EventProgress;
    onClick?: () => void;
    isExpanded?: boolean;
    queue?: TeacherQueue;
    selectedDate?: string;
    controller?: ControllerSettings;
    isAdjustmentMode?: boolean;
    onToggleAdjustment?: (mode: boolean) => void;
    onSubmit?: () => void;
    onReset?: () => void;
    onCancel?: () => void;
    hasChanges?: boolean;
    changedCount?: number;
}

export default function TeacherClassCard({
    teacherName,
    stats,
    earliestTime,
    pendingCount,
    completedCount,
    equipmentCounts,
    eventProgress,
    onClick,
    isExpanded = true,
    queue,
    selectedDate,
    controller,
    isAdjustmentMode = false,
    onToggleAdjustment,
    onSubmit,
    onReset,
    onCancel,
    hasChanges = false,
    changedCount = 0
}: TeacherClassCardProps) {
    const totalEvents = completedCount + pendingCount;
    const [showDangerBorder, setShowDangerBorder] = useState(false);

    // Create QueueController for event modifications
    const queueController = useMemo(() => {
        if (!queue || !controller) return undefined;
        return new QueueController(queue, controller, () => {});
    }, [queue, controller]);

    // Handle header click - toggle collapse or show error if in adjustment mode
    const handleHeaderClick = useCallback((e: React.MouseEvent) => {
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
    }, [isAdjustmentMode, onClick]);

    // Handle icon click - in collapsed view: enter adjustment mode + expand. In expanded view: toggle adjustment mode
    const handleIconClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (queueController) {
            if (isExpanded) {
                // Expanded view: toggle adjustment mode
                onToggleAdjustment?.(!isAdjustmentMode);
            } else {
                // Collapsed view: enter adjustment mode and expand
                onClick?.();
                onToggleAdjustment?.(true);
            }
        }
    }, [queueController, isExpanded, isAdjustmentMode, onClick, onToggleAdjustment]);

    // Get today's events from queue when collapsed
    let todayEvents: any[] = [];

    if (!isExpanded && queue && selectedDate) {
        const allEvents = queue.getAllEvents();
        todayEvents = allEvents.filter((event) => {
            if (!event.eventData.date) return false;
            const eventDate = new Date(event.eventData.date).toISOString().split("T")[0];
            return eventDate === selectedDate;
        });
    }

    // Collapsed view - single line
    if (!isExpanded) {
        // Create synthetic lessons from eventProgress for progress bar
        // eventProgress already has completed, planned, tbc durations calculated
        const syntheticLessons = [
            {
                events: [
                    // Completed events
                    ...Array(completedCount).fill(null).map((_, i) => ({
                        status: "completed",
                        duration: Math.floor(eventProgress.completed / Math.max(completedCount, 1))
                    })),
                    // Pending events
                    ...Array(pendingCount).fill(null).map((_, i) => ({
                        status: "planned",
                        duration: Math.floor(eventProgress.planned / Math.max(pendingCount, 1))
                    }))
                ]
            }
        ];

        return (
            <div
                className="group relative w-full overflow-hidden rounded-xl border border-border transition-colors duration-200"
            >
                {<ClassboardProgressBar lessons={syntheticLessons as any} durationMinutes={eventProgress.total} />}

                <div
                    onClick={handleHeaderClick}
                    className="h-16 flex items-center gap-4 px-6 bg-background cursor-pointer flex-1"
                >
                {/* Icon - Enter adjustment mode and expand if collapsed */}
                <button
                    onClick={handleIconClick}
                    disabled={!queueController}
                    className="flex-shrink-0 transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: TEACHER_COLOR }}
                >
                    <HeadsetIcon size={28} />
                </button>

                {/* Username */}
                <span className="text-xl font-bold text-foreground truncate min-w-0 flex-shrink-0">{teacherName}</span>

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
                        {getHMDuration(stats.totalHours * 60)}
                    </div>
                )}

                {/* Commission */}
                {stats.earnings?.teacher && stats.earnings.teacher > 0 && (
                    <div className="flex items-center gap-1 text-base text-muted-foreground shrink-0">
                        <HandshakeIcon size={18} className="text-muted-foreground/70" />
                        {getCompactNumber(stats.earnings.teacher)}
                    </div>
                )}

                {/* Revenue */}
                {stats.earnings?.school && stats.earnings.school > 0 && (
                    <div className="flex items-center gap-1 text-base text-muted-foreground shrink-0">
                        <TrendingUp size={18} className="text-muted-foreground/70" />
                        {getCompactNumber(stats.earnings.school)}
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Events Equipment and Students */}
                <div className="flex items-center gap-3 shrink-0">
                    {todayEvents.map((event, index) => (
                        <div key={event.id} className="flex items-center gap-3 shrink-0">
                            <EventEquipmentStudent event={event} />
                            {index < todayEvents.length - 1 && (
                                <div className="h-4 w-px bg-border/30" />
                            )}
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
            className="group relative w-full overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-shadow duration-300 hover:shadow-lg cursor-pointer"
        >
            {/* Header: Avatar (Status) + Name/Progress/Time - Toggle collapse */}
            <div
                onClick={handleHeaderClick}
                className="flex items-center gap-4 px-6 py-5 cursor-pointer"
            >
                {/* Left Side: Avatar Icon - Enter adjustment mode */}
                <button
                    onClick={handleIconClick}
                    disabled={!queueController}
                    className="flex-shrink-0 transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full border transition-colors ${isAdjustmentMode ? "bg-cyan-500/10 border-cyan-500/30" : "bg-muted border-border"}`} style={{ color: TEACHER_COLOR }}>
                        <HeadsetIcon size={24} />
                    </div>
                </button>

                {/* Right Side: Name, Progress, and Time - Toggle adjustment mode on click */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-lg font-bold text-foreground truncate tracking-tight leading-tight">{teacherName}</span>
                        {earliestTime && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold shrink-0">
                                <FlagIcon size={12} className="shrink-0" />
                                <span className="font-mono">{earliestTime}</span>
                            </div>
                        )}
                    </div>
                    <TeacherEventProgressBar
                        progress={eventProgress}
                        totalEvents={totalEvents}
                        completedEvents={completedCount}
                    />
                </div>
            </div>

            {/* Footer - Stats (enter mode) or Controls */}
            <div className="px-4 pb-4">
                {isAdjustmentMode ? (
                    <SubmitCancelReset
                        onSubmit={onSubmit || (() => onToggleAdjustment?.(false))}
                        onCancel={onCancel || (() => onToggleAdjustment?.(false))}
                        onReset={onReset || (() => {})}
                        hasChanges={hasChanges}
                        submitLabel="Save"
                        extraContent={changedCount > 0 && <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-white/25 text-white text-[10px] font-extrabold ml-1.5 shadow-sm border border-white/10">{changedCount}</span>}
                    />
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleAdjustment?.(true);
                        }}
                        className={`w-full rounded-xl p-3 transition-all duration-200 ${
                            showDangerBorder
                                ? "border-2 border-red-500 bg-red-500/10"
                                : "border border-border/50 bg-muted/50 hover:bg-muted"
                        }`}
                    >
                        <TeacherStatsRow equipmentCounts={equipmentCounts} stats={stats} />
                    </button>
                )}
            </div>
        </div>
    );
}




