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
import { StatItemUI } from "@/backend/data/StatsData";
import { EVENT_STATUS_CONFIG } from "@/types/status";
import { EventHomeStatusLabel } from "@/src/components/labels/EventHomeStatusLabel";
import { getHMDuration } from "@/getters/duration-getter";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import type { DateGroup } from "./HomePage";
import { CommissionTypeValue } from "@/src/components/ui/badge/commission-type-value";

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
        <div className="space-y-4 max-w-7xl mx-auto">
            {groupedEvents.map((group) => {
                const statsCalculator = new ClassboardStatistics(classboardData, group.date, true);
                const stats = statsCalculator.getDailyLessonStats();
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
                                        // Parse YYYY-MM-DD manually to create a UTC date at 00:00:00
                                        // This ensures getUTCDay() etc return the exact date from the string
                                        const [year, month, day] = group.date.split("-").map(Number);
                                        const date = new Date(Date.UTC(year, month - 1, day));

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
                                    {group.date.split("-")[0]}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 sm:gap-6 text-sm">
                                <StatItemUI
                                    type="completed"
                                    value={`${group.events.filter((e) => e.status === "completed" || e.status === "uncompleted").length}/${group.events.length}`}
                                    hideLabel={true}
                                />
                                <StatItemUI type="students" value={stats.studentCount} hideLabel={true} />
                                <StatItemUI type="teachers" value={stats.teacherCount} hideLabel={true} />
                                <StatItemUI type="duration" value={stats.durationCount} hideLabel={true} />
                                <div className="hidden lg:flex items-center gap-4 border-l border-border/50 pl-4">
                                    <StatItemUI type="revenue" value={stats.revenue.revenue} hideLabel={true} />
                                    <StatItemUI type="commission" value={stats.revenue.commission} hideLabel={true} />
                                    <StatItemUI type="profit" value={stats.revenue.profit} hideLabel={true} variant="profit" />
                                </div>
                                <div className="lg:hidden">
                                    <StatItemUI type="profit" value={stats.revenue.profit} hideLabel={true} variant="profit" />
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
                                                                {event.date.split("T")[1].substring(0, 5)}
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
                                                        {event.date.split("T")[1].substring(0, 5)}
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
                                                                <CommissionTypeValue
                                                                    value={event.commissionValue}
                                                                    type={event.commissionType}
                                                                    as="div"
                                                                    className="!p-0 !bg-transparent !border-none ml-1 scale-90 origin-left"
                                                                />
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
