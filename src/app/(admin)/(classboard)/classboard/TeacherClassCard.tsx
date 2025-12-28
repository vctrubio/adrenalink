"use client";

import { TrendingUp } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import { bulkUpdateClassboardEvents } from "@/actions/classboard-bulk-action";
const TeacherBatchUpdateDropdown = dynamic(() => import("./TeacherBatchUpdateDropdown"), { ssr: false });
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import type { TeacherStats } from "@/backend/ClassboardStats";

// Muted green - softer than entity color
const TEACHER_COLOR = "#16a34a";
const EMPTY_COLOR = "#374151";

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
}

// Progress bar sub-component with x/y completed and dropdown
function TeacherEventProgressBar({ progress, totalEvents, completedEvents, onBatchClick, onLabelClick, labelActive }: {
    progress: EventProgress,
    totalEvents: number,
    completedEvents: number,
    onBatchClick: () => void,
    onLabelClick: () => void,
    labelActive: boolean
}) {
    const { completed, planned, tbc, total } = progress;
    const denominator = total > 0 ? total : 1;
    const completedEnd = (completed / denominator) * 100;
    const plannedEnd = completedEnd + (planned / denominator) * 100;
    const tbcEnd = plannedEnd + (tbc / denominator) * 100;
    const background = `linear-gradient(to right, ${EVENT_STATUS_CONFIG.completed.color} ${completedEnd}%, ${EVENT_STATUS_CONFIG.planned.color} ${completedEnd}% ${plannedEnd}%, ${EVENT_STATUS_CONFIG.tbc.color} ${plannedEnd}% ${tbcEnd}%, ${EMPTY_COLOR} ${tbcEnd}%)`;
    return (
        <div className="flex items-center w-full gap-2">
            <div className="flex-1 relative cursor-pointer group" onClick={onBatchClick}>
                <div className="h-1.5 w-full bg-muted rounded">
                    <div
                        className="h-full transition-all duration-500 ease-out rounded"
                        style={{ background, width: "100%" }}
                    />
                </div>
            </div>
            <span
                className={`ml-2 text-xs min-w-[70px] text-right px-2 py-1 rounded cursor-pointer transition-all duration-200 ${labelActive ? "bg-primary/10 text-primary shadow" : "text-muted-foreground hover:bg-muted/40 hover:text-primary"}`}
                onClick={e => {
                    e.stopPropagation();
                    onLabelClick();
                }}
                tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { onLabelClick(); } }}
                aria-label="Batch update events"
            >
                {completedEvents}/{totalEvents} completed
            </span>
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
}

export default function TeacherClassCard({ 
    teacherName, 
    stats, 
    earliestTime, 
    pendingCount, 
    completedCount,
    equipmentCounts,
    eventProgress,
    onClick 
}: TeacherClassCardProps) {
    // Only show stats if any are nonzero/defined
    const hasStats = (
        (equipmentCounts && equipmentCounts.length > 0) ||
        (stats.totalHours && stats.totalHours > 0) ||
        (stats.earnings?.teacher && stats.earnings.teacher > 0) ||
        (stats.earnings?.school && stats.earnings.school > 0)
    );


    // Dropdown state for batch update
    const [showBatchDropdown, setShowBatchDropdown] = useState(false);
    // Animate label on hover/click
    const [labelActive, setLabelActive] = useState(false);

    // Handler for progress bar click (optional, can be used for future features)
    const handleBatchClick = () => {};
    // Handler for x/y completed label click
    const handleLabelClick = () => setShowBatchDropdown(v => !v);

    // For event progress: count of completed and total events
    const totalEvents = completedCount + pendingCount;
    const completedEvents = completedCount;

    return (
        <div className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={onClick}>
            {/* Progress Bar - at top, with x/y completed and batch dropdown */}
            <div className="relative px-3 pt-3">
                <TeacherEventProgressBar
                    progress={eventProgress}
                    totalEvents={totalEvents}
                    completedEvents={completedEvents}
                    onBatchClick={handleBatchClick}
                    onLabelClick={handleLabelClick}
                    labelActive={labelActive || showBatchDropdown}
                />
                {showBatchDropdown && (
                    <div className="absolute right-0 top-7 z-20">
                        <TeacherBatchUpdateDropdown
                            eventIds={eventProgress.eventIds || []}
                            onClose={() => setShowBatchDropdown(false)}
                        />
                    </div>
                )}
            </div>

            {/* Header: Teacher Name Row */}
            <div className="flex items-center gap-2 p-3 pb-2">
                <div style={{ color: TEACHER_COLOR }}>
                    <HeadsetIcon size={24} />
                </div>
                <span className="font-semibold text-foreground truncate flex-1 tracking-wider text-lg">{teacherName}</span>
            </div>

            {/* Stats Row - only show if we have stats */}
            {hasStats && (
                <div className="flex items-center justify-start gap-2 px-3 py-2 bg-muted">
                    {/* Equipment Categories (like the badge) */}
                    {equipmentCounts.map(({ categoryId, count }) => {
                        const config = EQUIPMENT_CATEGORIES.find((c) => c.id === categoryId);
                        if (!config) return null;
                        const CategoryIcon = config.icon;
                        return (
                            <div key={categoryId} className="flex items-center gap-1">
                                <div style={{ color: config.color }}>
                                    <CategoryIcon size={16} />
                                </div>
                                {count > 1 && <span className="text-sm text-foreground">{count}</span>}
                            </div>
                        );
                    })}

                    {/* Divider - border with padding, only if there are stats */}
                    {(stats.totalHours > 0 || (stats.earnings?.teacher && stats.earnings.teacher > 0) || (stats.earnings?.school && stats.earnings.school > 0)) && (
                        <span className="border-l border-zinc-300 dark:border-zinc-600 py-2" />
                    )}

                    {/* Duration */}
                    {stats.totalHours > 0 && (
                        <div className="flex items-center gap-1">
                            <DurationIcon size={16} className="text-muted-foreground shrink-0" />
                            <span className="text-sm font-semibold text-foreground">{getHMDuration(stats.totalHours * 60)}</span>
                        </div>
                    )}
   {/* Divider - border with padding, only if there are stats */}
                    {(stats.totalHours > 0 || (stats.earnings?.teacher && stats.earnings.teacher > 0) || (stats.earnings?.school && stats.earnings.school > 0)) && (
                        <span className="border-l border-transparent bg-background/60 py-2 mx-1 w-px" />
                    )}
                    {/* Commission */}
                    {stats.earnings?.teacher > 0 && (
                        <div className="flex items-center gap-1">
                            <HandshakeIcon size={16} className="text-muted-foreground shrink-0" />
                            <span className="text-sm font-semibold text-foreground">{getCompactNumber(stats.earnings.teacher)}</span>
                        </div>
                    )}
   {/* Divider - border with padding, only if there are stats */}
                    {(stats.totalHours > 0 || (stats.earnings?.teacher && stats.earnings.teacher > 0) || (stats.earnings?.school && stats.earnings.school > 0)) && (
                        <span className="border-l border-transparent bg-background/60 py-2 mx-1 w-px" />
                    )}
                    {/* Profit */}
                    {stats.earnings?.school > 0 && (
                        <div className="flex items-center gap-1">
                            <TrendingUp size={16} className="text-muted-foreground shrink-0" />
                            <span className="text-sm font-semibold text-foreground">{getCompactNumber(stats.earnings.school)}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Footer: Earliest Start Time */}
            {earliestTime && (
                <div className="flex items-center justify-center gap-2 p-2 text-xs text-muted-foreground border-t border-border/50">
                    <FlagIcon size={14} className="text-muted-foreground" />
                    <span className="font-mono font-medium text-foreground">{earliestTime}</span>
                </div>
            )}
        </div>
    );
}
