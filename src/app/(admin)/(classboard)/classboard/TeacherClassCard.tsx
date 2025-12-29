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

    // Use lighter/muted colors for incomplete segments
    const completedColor = EVENT_STATUS_CONFIG.completed.color;
    const plannedColor = `${EVENT_STATUS_CONFIG.planned.color}40`;
    const tbcColor = `${EVENT_STATUS_CONFIG.tbc.color}30`;
    const emptyColor = "#1f293720";

    const background = `linear-gradient(to right, ${completedColor} ${completedEnd}%, ${plannedColor} ${completedEnd}% ${plannedEnd}%, ${tbcColor} ${plannedEnd}% ${tbcEnd}%, ${emptyColor} ${tbcEnd}%)`;

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

// Stats row sub-component with logic for showing/hiding stats
function TeacherStatsRow({ equipmentCounts, stats }: {
    equipmentCounts: EquipmentCount[],
    stats: TeacherStats
}) {
    const hasEquipment = equipmentCounts && equipmentCounts.length > 0;
    const hasDuration = stats.totalHours && stats.totalHours > 0;
    const hasCommission = stats.earnings?.teacher && stats.earnings.teacher > 0;
    const hasProfit = stats.earnings?.school && stats.earnings.school > 0;
    const hasAnyStats = hasEquipment || hasDuration || hasCommission || hasProfit;

    if (!hasAnyStats) return null;

    const hasMoneyStats = hasDuration || hasCommission || hasProfit;

    return (
        <div className="flex items-center justify-start gap-2 px-3 py-2 bg-muted">
            {/* Equipment Categories */}
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

            {/* Divider after equipment if we have money stats */}
            {hasEquipment && hasMoneyStats && (
                <span className="border-l border-zinc-300 dark:border-zinc-600 py-2" />
            )}

            {/* Duration */}
            {hasDuration && (
                <div className="flex items-center gap-1">
                    <DurationIcon size={16} className="text-muted-foreground shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{getHMDuration(stats.totalHours * 60)}</span>
                </div>
            )}

            {/* Divider after duration */}
            {hasDuration && (hasCommission || hasProfit) && (
                <span className="border-l border-transparent bg-background/60 py-2 mx-1 w-px" />
            )}

            {/* Commission */}
            {hasCommission && (
                <div className="flex items-center gap-1">
                    <HandshakeIcon size={16} className="text-muted-foreground shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{getCompactNumber(stats.earnings.teacher)}</span>
                </div>
            )}

            {/* Divider after commission */}
            {hasCommission && hasProfit && (
                <span className="border-l border-transparent bg-background/60 py-2 mx-1 w-px" />
            )}

            {/* Profit */}
            {hasProfit && (
                <div className="flex items-center gap-1">
                    <TrendingUp size={16} className="text-muted-foreground shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{getCompactNumber(stats.earnings.school)}</span>
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
    const [showBatchDropdown, setShowBatchDropdown] = useState(false);
    const totalEvents = completedCount + pendingCount;

    return (
        <div className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={onClick}>
            {/* Progress Bar */}
            <div className="relative px-3 pt-3">
                <TeacherEventProgressBar
                    progress={eventProgress}
                    totalEvents={totalEvents}
                    completedEvents={completedCount}
                    onBatchClick={() => {}}
                    onLabelClick={() => setShowBatchDropdown(v => !v)}
                    labelActive={showBatchDropdown}
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

            {/* Header: Teacher Name */}
            <div className="flex items-center gap-2 p-3 pb-2">
                <div style={{ color: TEACHER_COLOR }}>
                    <HeadsetIcon size={24} />
                </div>
                <span className="font-semibold text-foreground truncate flex-1 tracking-wider text-lg">{teacherName}</span>
            </div>

            {/* Stats Row */}
            <TeacherStatsRow equipmentCounts={equipmentCounts} stats={stats} />

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
