"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";
import { ClassboardStatistics } from "@/backend/classboard/ClassboardStatistics";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { BrandSizeCategoryList, BrandSizeCategoryListHorizontal } from "@/src/components/ui/badge/brand-size-category";
import { STAT_CONFIGS, getDashboardStatsDisplay } from "@/backend/RenderStats";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import { EventHomeStatusLabel } from "@/src/components/labels/EventHomeStatusLabel";
import { getHMDuration } from "@/getters/duration-getter";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import type { DateGroup } from "./HomePage";

interface HomeGroupedProps {
    groupedEvents: DateGroup[];
    classboardData: ClassboardModel;
}

export function HomeGrouped({ groupedEvents, classboardData }: HomeGroupedProps) {
    const router = useRouter();
    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

    const toggleDate = (date: string) => {
        setExpandedDates((prev) => ({
            ...prev,
            [date]: !prev[date],
        }));
    };

    if (groupedEvents.length === 0) {
        return (
            <div className="text-center p-12 text-muted-foreground bg-card rounded-2xl border-2 border-border border-dashed">
                <p className="font-medium">No events found for this school.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {groupedEvents.map((group) => {
                const statsCalculator = new ClassboardStatistics(classboardData, group.date, true);
                const stats = statsCalculator.getDailyLessonStats();
                const displayStats = getDashboardStatsDisplay(stats);
                const isExpanded = expandedDates[group.date] ?? false;

                return (
                    <div key={group.date} className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
                        <div
                            className="flex items-center justify-between p-5 cursor-pointer hover:bg-accent/5 transition-colors"
                            onClick={() => toggleDate(group.date)}
                        >
                            <div className="flex flex-col gap-1 min-w-[140px]">
                                <span className="font-bold text-xl tracking-tight">
                                    {(() => {
                                        const date = new Date(group.date + "T00:00:00");
                                        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                                        const months = [
                                            "Jan",
                                            "Feb",
                                            "Mar",
                                            "Apr",
                                            "May",
                                            "Jun",
                                            "Jul",
                                            "Aug",
                                            "Sep",
                                            "Oct",
                                            "Nov",
                                            "Dec",
                                        ];
                                        return `${weekdays[date.getUTCDay()]} ${date.getUTCDate()} ${months[date.getUTCMonth()]}`;
                                    })()}
                                </span>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {new Date(group.date + "T00:00:00").getUTCFullYear()}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 sm:gap-8 text-sm">
                                <div className="flex flex-col items-center min-w-[60px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="2xl:hidden flex items-center gap-1.5">
                                            <displayStats.completed.Icon size={14} className="text-muted-foreground/70" />
                                            <span className="font-semibold text-lg text-foreground">
                                                {
                                                    group.events.filter((e) => e.status === "completed" || e.status === "uncompleted")
                                                        .length
                                                }
                                                /{group.events.length}
                                            </span>
                                        </div>
                                        <span className="hidden 2xl:inline font-semibold text-lg text-foreground">
                                            {group.events.filter((e) => e.status === "completed" || e.status === "uncompleted").length}
                                            /{group.events.length}
                                        </span>
                                    </div>
                                    <div className="hidden 2xl:flex items-center gap-1">
                                        <displayStats.completed.Icon size={12} className="text-muted-foreground/70" />
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                            {displayStats.completed.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center text-emerald-600 dark:text-emerald-400 pl-4 border-l border-border/50 lg:hidden">
                                    <div className="flex items-center gap-1.5">
                                        <displayStats.profit.Icon size={14} />
                                        <span className="font-bold text-lg">{displayStats.profit.formatted}</span>
                                    </div>
                                    <div className="hidden 2xl:flex items-center gap-1">
                                        <displayStats.profit.Icon size={12} />
                                        <span className="text-[10px] uppercase tracking-wider font-medium">
                                            {displayStats.profit.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="hidden sm:flex items-center gap-6 pl-6 border-l border-border/50">
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-1.5">
                                            <displayStats.students.Icon size={14} className="2xl:hidden text-muted-foreground/70" />
                                            <span className="font-semibold text-lg text-foreground">
                                                {displayStats.students.formatted}
                                            </span>
                                        </div>
                                        <div className="hidden 2xl:flex items-center gap-1">
                                            <displayStats.students.Icon size={12} className="text-muted-foreground/70" />
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                                {displayStats.students.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-1.5">
                                            <displayStats.teachers.Icon size={14} className="2xl:hidden text-muted-foreground/70" />
                                            <span className="font-semibold text-lg text-foreground">
                                                {displayStats.teachers.formatted}
                                            </span>
                                        </div>
                                        <div className="hidden 2xl:flex items-center gap-1">
                                            <displayStats.teachers.Icon size={12} className="text-muted-foreground/70" />
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                                {displayStats.teachers.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-1.5">
                                            <displayStats.duration.Icon size={14} className="2xl:hidden text-muted-foreground/70" />
                                            <span className="font-semibold text-lg text-foreground">
                                                {displayStats.duration.formatted}
                                            </span>
                                        </div>
                                        <div className="hidden 2xl:flex items-center gap-1">
                                            <displayStats.duration.Icon size={12} className="text-muted-foreground/70" />
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                                {displayStats.duration.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden lg:flex items-center gap-6 pl-6 border-l border-border/50">
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-1.5">
                                            <displayStats.revenue.Icon size={14} className="2xl:hidden text-muted-foreground/70" />
                                            <span className="font-semibold text-lg text-foreground">
                                                {displayStats.revenue.formatted}
                                            </span>
                                        </div>
                                        <div className="hidden 2xl:flex items-center gap-1">
                                            <displayStats.revenue.Icon size={12} className="text-muted-foreground/70" />
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                                {displayStats.revenue.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <displayStats.commission.Icon size={14} className="2xl:hidden text-muted-foreground/70" />
                                            <span className="font-medium text-lg">- {displayStats.commission.formatted}</span>
                                        </div>
                                        <div className="hidden 2xl:flex items-center gap-1">
                                            <displayStats.commission.Icon size={12} className="text-muted-foreground/70" />
                                            <span className="text-[10px] uppercase tracking-wider font-medium">
                                                {displayStats.commission.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-border/60 rotate-12 mx-1" />
                                    <div className="flex flex-col items-center text-emerald-600 dark:text-emerald-400">
                                        <div className="flex items-center gap-1.5">
                                            <displayStats.profit.Icon size={16} className="2xl:hidden" />
                                            <span className="font-bold text-lg">= {displayStats.profit.formatted}</span>
                                        </div>
                                        <div className="hidden 2xl:flex items-center gap-1">
                                            <displayStats.profit.Icon size={12} />
                                            <span className="text-[10px] uppercase tracking-wider font-medium">
                                                {displayStats.profit.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="ml-4 shrink-0">
                                <ToggleAdranalinkIcon isOpen={isExpanded} />
                            </div>
                        </div>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="border-t border-border divide-y divide-border bg-muted/10">
                                        {group.events.map((event) => (
                                            <motion.div
                                                key={event.id}
                                                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-accent/5 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group/row"
                                                onClick={() => router.push(`/transaction?id=${event.id}`)}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                                                    <div className="sm:hidden flex items-center justify-between w-full mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div style={{ color: EVENT_STATUS_CONFIG[event.status].color }}>
                                                                <FlagIcon size={16} className="opacity-80" />
                                                            </div>
                                                            <span className="text-sm font-mono text-muted-foreground tabular-nums">
                                                                {new Date(event.date).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </span>
                                                        </div>
                                                        <EquipmentStudentPackagePriceBadge
                                                            categoryEquipment={event.categoryEquipment}
                                                            equipmentCapacity={event.capacityEquipment}
                                                            studentCapacity={event.capacityStudents}
                                                            packageDurationHours={event.packageDurationMinutes / 60}
                                                            pricePerHour={event.pricePerStudent / (event.packageDurationMinutes / 60)}
                                                        />
                                                    </div>
                                                    <div className="hidden sm:block text-sm font-mono text-muted-foreground tabular-nums">
                                                        {new Date(event.date).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </div>
                                                    <div>
                                                        <div className="mb-1 group-hover/row:text-primary transition-colors flex items-center gap-2">
                                                            <span>{event.packageName}</span>
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-yellow-student text-foreground">
                                                                <span className="font-semibold text-foreground">
                                                                    {event.leaderStudentName}
                                                                </span>
                                                                {event.capacityStudents > 1 && (
                                                                    <span className="text-[10px] font-bold">
                                                                        +{event.capacityStudents - 1}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                            <div className="flex items-center gap-1.5">
                                                                <HeadsetIcon size={14} className="text-muted-foreground/70" />
                                                                <span>{event.teacherUsername}</span>
                                                            </div>
                                                            <span className="opacity-30">•</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <MapPin size={14} className="text-muted-foreground/70" />
                                                                <span>{event.location || "No location"}</span>
                                                            </div>
                                                            <span className="opacity-30">•</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <DurationIcon size={14} className="text-muted-foreground/70" />
                                                                <span>{getHMDuration(event.duration)}</span>
                                                            </div>
                                                        </div>

                                                        {/* Mobile Equipment */}
                                                        <BrandSizeCategoryListHorizontal
                                                            equipments={event.equipments}
                                                            className="mt-2 sm:hidden"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="hidden sm:flex items-center gap-6 self-end sm:self-auto">
                                                    {/* Desktop Equipment */}
                                                    <div className="min-w-[90px]">
                                                        <BrandSizeCategoryList equipments={event.equipments} />
                                                    </div>

                                                    <EquipmentStudentPackagePriceBadge
                                                        categoryEquipment={event.categoryEquipment}
                                                        equipmentCapacity={event.capacityEquipment}
                                                        studentCapacity={event.capacityStudents}
                                                        packageDurationHours={event.packageDurationMinutes / 60}
                                                        pricePerHour={event.pricePerStudent / (event.packageDurationMinutes / 60)}
                                                    />

                                                    <EventHomeStatusLabel eventId={event.id} status={event.status} />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
