"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, TrendingUp } from "lucide-react";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import { ClassboardStatistics } from "@/backend/ClassboardStatistics";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import { SchoolAdranlinkConnectionHeader } from "@/src/components/school/SchoolAdranlinkConnectionHeader";

interface HomePageProps {
    classboardData: ClassboardModel;
    school: {
        name: string;
        username: string;
        country: string;
        timezone: string | null;
        currency: string;
    };
}

interface DateEvent {
    id: string;
    date: string;
    lessonId: string;
    location: string | null;
    duration: number;
    status: string;
    teacherName: string;
    packageName: string;
    categoryEquipment: string;
    capacityEquipment: number;
    capacityStudents: number;
    packageDurationMinutes: number;
    pricePerStudent: number;
}

interface DateGroup {
    date: string;
    events: DateEvent[];
}

export function HomePage({ classboardData, school }: HomePageProps) {
    const router = useRouter();
    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

    const globalTotals = useMemo(() => {
        let totalDuration = 0;
        let totalCommissions = 0;
        let totalRevenue = 0;
        let totalEvents = 0;

        const dates = new Set<string>();
        Object.values(classboardData).forEach((b) => {
            b.lessons.forEach((l) => {
                l.events.forEach((e) => {
                    dates.add(e.date.split("T")[0]);
                    totalEvents++;
                });
            });
        });

        dates.forEach((date) => {
            const stats = new ClassboardStatistics(classboardData, date).getHeaderStats();
            totalDuration += stats.duration;
            totalCommissions += stats.commissions;
            totalRevenue += stats.revenue;
        });

        return {
            duration: totalDuration,
            commissions: totalCommissions,
            profit: totalRevenue - totalCommissions,
            events: totalEvents,
        };
    }, [classboardData]);

    const groupedEvents = useMemo(() => {
        const groups: Record<string, DateGroup> = {};

        Object.values(classboardData).forEach((booking) => {
            booking.lessons.forEach((lesson) => {
                lesson.events.forEach((event) => {
                    const dateKey = event.date.split("T")[0];

                    if (!groups[dateKey]) {
                        groups[dateKey] = {
                            date: dateKey,
                            events: [],
                        };
                    }

                    groups[dateKey].events.push({
                        id: event.id,
                        date: event.date,
                        lessonId: event.lessonId,
                        location: event.location,
                        duration: event.duration,
                        status: event.status,
                        teacherName: `${lesson.teacher.firstName} ${lesson.teacher.lastName}`,
                        packageName: booking.schoolPackage.description,
                        categoryEquipment: booking.schoolPackage.categoryEquipment,
                        capacityEquipment: booking.schoolPackage.capacityEquipment,
                        capacityStudents: booking.schoolPackage.capacityStudents,
                        packageDurationMinutes: booking.schoolPackage.durationMinutes,
                        pricePerStudent: booking.schoolPackage.pricePerStudent,
                    });
                });
            });
        });

        return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
    }, [classboardData]);

    const toggleDate = (date: string) => {
        setExpandedDates((prev) => ({
            ...prev,
            [date]: !prev[date],
        }));
    };

    return (
        <div className="space-y-10">
            <header className="pb-4">
                <SchoolAdranlinkConnectionHeader
                    schoolName={school.name}
                    username={school.username}
                    country={school.country}
                    timezone={school.timezone}
                    currency={school.currency}
                    titleSub="Home of Adrenaline Activity"
                    description={
                        <>
                            Managing your Lessons{" "}
                            <span className="text-muted-foreground/40">
                                <span className="italic">with easy</span> synchronization.
                            </span>
                        </>
                    }
                    hideEventId={true}
                    customBadges={
                        <div className="px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-4 text-[10px] font-bold text-primary shadow-sm">
                            <div className="flex items-center gap-1.5">
                                <FlagIcon size={14} />
                                <span className="tracking-wide">{globalTotals.events}</span>
                            </div>
                            <div className="w-px h-3 bg-primary/20" />
                            <div className="flex items-center gap-1.5">
                                <DurationIcon size={14} />
                                <span className="tracking-wide">{getHMDuration(globalTotals.duration)}</span>
                            </div>
                            <div className="w-px h-3 bg-primary/20" />
                            <div className="flex items-center gap-1.5">
                                <HandshakeIcon size={14} />
                                <span className="tracking-wide">{getCompactNumber(globalTotals.commissions)} </span>
                            </div>
                            <div className="w-px h-3 bg-primary/20" />
                            <div className="flex items-center gap-1.5">
                                <TrendingUp size={14} strokeWidth={3} />
                                <span className="tracking-tight">{getCompactNumber(globalTotals.profit)} </span>
                            </div>
                        </div>
                    }
                />
            </header>

            <div className="space-y-4">
                {groupedEvents.map((group) => {
                    const statsCalculator = new ClassboardStatistics(classboardData, group.date);
                    const stats = statsCalculator.getHeaderStats();
                    const isExpanded = expandedDates[group.date] ?? false;
                    const profit = stats.revenue - stats.commissions;

                    return (
                        <div key={group.date} className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => toggleDate(group.date)}>
                                <div className="flex flex-col gap-1 min-w-[140px]">
                                    <span className="font-bold text-xl tracking-tight">
                                        {new Date(group.date).toLocaleDateString(undefined, {
                                            weekday: "short",
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </span>
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{new Date(group.date).getFullYear()}</span>
                                </div>

                                <div className="flex items-center gap-4 sm:gap-8 text-sm">
                                    <div className="flex flex-col items-center min-w-[60px]">
                                        <span className="font-semibold text-lg text-foreground">
                                            {group.events.filter((e) => e.status === "completed").length}/{group.events.length}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Completed</span>
                                    </div>

                                    <div className="flex flex-col items-center text-emerald-600 dark:text-emerald-400 pl-4 border-l border-border/50 lg:hidden">
                                        <span className="font-bold text-lg">{profit.toFixed(0)}</span>
                                        <span className="text-[10px] uppercase tracking-wider font-medium">Profit</span>
                                    </div>

                                    <div className="hidden sm:flex items-center gap-6 pl-6 border-l border-border/50">
                                        <div className="flex flex-col items-center">
                                            <span className="font-semibold text-lg text-foreground">{stats.students}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Students</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="font-semibold text-lg text-foreground">{stats.teachers}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Teachers</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="font-semibold text-lg text-foreground">{getHMDuration(stats.duration)}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Duration</span>
                                        </div>
                                    </div>

                                    <div className="hidden lg:flex items-center gap-6 pl-6 border-l border-border/50">
                                        <div className="flex flex-col items-center">
                                            <span className="font-semibold text-lg text-foreground">{stats.revenue.toFixed(0)}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Revenue</span>
                                        </div>
                                        <div className="flex flex-col items-center text-muted-foreground">
                                            <span className="font-medium text-lg">- {stats.commissions.toFixed(0)}</span>
                                            <span className="text-[10px] uppercase tracking-wider font-medium">Comm.</span>
                                        </div>
                                        <div className="h-8 w-px bg-border/60 rotate-12 mx-1" />
                                        <div className="flex flex-col items-center text-emerald-600 dark:text-emerald-400">
                                            <span className="font-bold text-lg">= {profit.toFixed(0)}</span>
                                            <span className="text-[10px] uppercase tracking-wider font-medium">Profit</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="ml-4 shrink-0">
                                    <ToggleAdranalinkIcon isOpen={isExpanded} />
                                </div>
                            </div>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        <div className="border-t border-border divide-y divide-border bg-muted/10">
                                            {group.events.map((event) => (
                                                <motion.div
                                                    key={event.id}
                                                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-accent/5 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group/row"
                                                    onClick={() => router.push(`/example?id=${event.id}`)}
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                                                        <div className="text-sm font-mono text-muted-foreground tabular-nums">{new Date(event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                                                        <div>
                                                            <div className="font-semibold mb-1 group-hover/row:text-primary transition-colors">{event.packageName}</div>
                                                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                                <div className="flex items-center gap-1.5">
                                                                    <HeadsetIcon size={14} className="text-muted-foreground/70" />
                                                                    <span>{event.teacherName}</span>
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
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 self-end sm:self-auto">
                                                        <EquipmentStudentPackagePriceBadge
                                                            categoryEquipment={event.categoryEquipment}
                                                            equipmentCapacity={event.capacityEquipment}
                                                            studentCapacity={event.capacityStudents}
                                                            packageDurationHours={event.packageDurationMinutes / 60}
                                                            pricePerHour={event.pricePerStudent / (event.packageDurationMinutes / 60)}
                                                        />

                                                        <span
                                                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${event.status === "completed"
                                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                                : event.status === "planned"
                                                                    ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
                                                                    : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                                                                }`}
                                                        >
                                                            {event.status}
                                                        </span>
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

            {groupedEvents.length === 0 && (
                <div className="text-center p-12 text-muted-foreground bg-card rounded-2xl border-2 border-border border-dashed">
                    <p className="font-medium">No events found for this school.</p>
                    <p className="text-sm mt-1">Try refreshing or adjusting your search filters.</p>
                </div>
            )}
        </div>
    );
}
