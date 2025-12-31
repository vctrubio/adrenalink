"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, TrendingUp, LayoutGrid, List, Calendar, Grid3X3, Activity } from "lucide-react";
import type { ClassboardModel } from "@/backend/models/ClassboardModel";
import { ClassboardStatistics } from "@/src/app/(admin)/(classboard)/ClassboardStatistics";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import { SchoolAdranlinkConnectionHeader } from "@/src/components/school/SchoolAdranlinkConnectionHeader";
import { TransactionEventsTable, type GroupingType } from "@/src/components/school/TransactionEventsTable";
import { TransactionEventData } from "@/types/transaction-event";

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

type ViewMode = "grouped" | "table" | "calendar";

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

// --- Sub-components ---

function ViewHeader({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: any }) {
    return (
        <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/5 text-primary border border-primary/10 shadow-sm ring-4 ring-primary/[0.02]">
                <Icon size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
                <h3 className="text-2xl font-black tracking-tighter text-foreground leading-none">{title}</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mt-0.5 flex items-center gap-2">
                    <span className="w-4 h-px bg-primary/20" />
                    {subtitle}
                </p>
            </div>
        </div>
    );
}

function ViewToggle({ mode, setMode, groupBy, setGroupBy }: { mode: ViewMode; setMode: (m: ViewMode) => void; groupBy: GroupingType; setGroupBy: (v: GroupingType) => void }) {
    return (
        <div className="flex items-center gap-3">
            {mode === "table" && (
                <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border w-fit">
                    <button onClick={() => setGroupBy("none")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${groupBy === "none" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                        List
                    </button>
                    <button onClick={() => setGroupBy("date")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${groupBy === "date" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                        Date
                    </button>
                    <button onClick={() => setGroupBy("week")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${groupBy === "week" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                        Week
                    </button>
                </div>
            )}

            <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border w-fit">
                <button onClick={() => setMode("grouped")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "grouped" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    <LayoutGrid size={14} />
                    <span>Grouped</span>
                </button>
                <button onClick={() => setMode("table")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "table" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    <List size={14} />
                    <span>Table</span>
                </button>
                <button onClick={() => setMode("calendar")} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "calendar" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    <Grid3X3 size={14} />
                    <span>Activity</span>
                </button>
            </div>
        </div>
    );
}

function Heatmap({ data, onDateSelect }: { data: Record<string, { count: number; profit: number; duration: number; studentCount: number }>; onDateSelect: (d: string) => void; selectedDate: string | null }) {
    const { weeks, monthLabels } = useMemo(() => {
        const today = new Date();
        const endDate = new Date(today);
        while (endDate.getDay() !== 6) endDate.setDate(endDate.getDate() + 1);

        const startDate = new Date(endDate);
        startDate.setFullYear(endDate.getFullYear() - 1);
        startDate.setDate(startDate.getDate() + 1);
        while (startDate.getDay() !== 0) startDate.setDate(startDate.getDate() - 1);

        const result: { date: string; intensity: number }[][] = [];
        const labels: { name: string; weekIndex: number }[] = [];
        let currentMonth = -1;

        let currentWeek: { date: string; intensity: number }[] = [];
        const iterDate = new Date(startDate);

        let maxVal = 0;
        Object.values(data).forEach((v) => {
            if (v.count > maxVal) maxVal = v.count;
        });

        let weekIdx = 0;
        while (iterDate <= endDate) {
            const dateKey = iterDate.toISOString().split("T")[0];
            const stats = data[dateKey];
            let intensity = 0;

            if (stats && stats.count > 0) {
                intensity = Math.min(4, Math.ceil((stats.count / maxVal) * 4));
            }

            currentWeek.push({ date: dateKey, intensity });

            if (currentWeek.length === 7) {
                const month = new Date(currentWeek[0].date).getMonth();
                if (month !== currentMonth) {
                    currentMonth = month;
                    labels.push({
                        name: new Date(currentWeek[0].date).toLocaleDateString(undefined, { month: "short" }),
                        weekIndex: weekIdx,
                    });
                }
                result.push(currentWeek);
                currentWeek = [];
                weekIdx++;
            }
            iterDate.setDate(iterDate.getDate() + 1);
        }
        return { weeks: result, monthLabels: labels };
    }, [data]);

    const intensityColors = ["bg-muted/20 hover:bg-muted/40", "bg-primary/20", "bg-primary/40", "bg-primary/70", "bg-primary"];

    return (
        <div className="bg-card border border-border rounded-3xl px-6 pb-6 pt-24 shadow-sm">
            <div className="flex flex-col gap-2 min-w-fit -mt-16">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Less</span>
                        <div className="flex gap-1">
                            {intensityColors.map((c, i) => (
                                <div key={i} className={`w-2.5 h-2.5 rounded-sm ${c.split(" ")[0]}`} />
                            ))}
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">More</span>
                    </div>
                </div>

                <div className="relative flex gap-2 h-fit">
                    <div className="absolute -top-5 left-8 right-0 flex text-[9px] font-bold text-muted-foreground uppercase">
                        {monthLabels.map((m, i) => (
                            <span key={i} className="absolute whitespace-nowrap" style={{ left: `${m.weekIndex * 14}px` }}>
                                {m.name}
                            </span>
                        ))}
                    </div>

                    <div className="grid grid-rows-7 gap-1 text-[9px] font-bold text-muted-foreground/30 uppercase pr-2 mt-1">
                        <span className="h-2.5 leading-none">Sun</span>
                        <span className="h-2.5 leading-none opacity-0">Mon</span>
                        <span className="h-2.5 leading-none">Tue</span>
                        <span className="h-2.5 leading-none opacity-0">Wed</span>
                        <span className="h-2.5 leading-none">Thu</span>
                        <span className="h-2.5 leading-none opacity-0">Fri</span>
                        <span className="h-2.5 leading-none">Sat</span>
                    </div>

                    <div className="flex gap-1">
                        {weeks.map((week, wi) => (
                            <div key={wi} className="grid grid-rows-7 gap-1">
                                {week.map((day, di) => {
                                    const stats = data[day.date];
                                    return (
                                        <button key={day.date} onClick={() => onDateSelect(day.date)} className={`w-2.5 h-2.5 rounded-sm transition-all relative group ${intensityColors[day.intensity]}`}>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-popover text-popover-foreground rounded-2xl border border-border shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all flex flex-col gap-2 items-start scale-95 group-hover:scale-100 origin-bottom">
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-b border-border w-full pb-1.5 mb-1">
                                                    {new Date(day.date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <HelmetIcon size={12} className="text-muted-foreground" />
                                                    <span className="text-[11px] font-bold">
                                                        <span className="text-muted-foreground font-medium uppercase text-[9px] mr-1">Students:</span>
                                                        {stats?.studentCount || 0}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <FlagIcon size={12} className="text-muted-foreground" />
                                                    <span className="text-[11px] font-bold">
                                                        <span className="text-muted-foreground font-medium uppercase text-[9px] mr-1">Lessons:</span>
                                                        {stats?.count || 0}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    <DurationIcon size={12} className="text-muted-foreground" />
                                                    <span className="text-[11px] font-bold">
                                                        <span className="text-muted-foreground font-medium uppercase text-[9px] mr-1">Duration:</span>
                                                        {getHMDuration(stats?.duration || 0)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2.5 mt-1 pt-1.5 border-t border-border w-full">
                                                    <TrendingUp size={12} className="text-emerald-500" />
                                                    <span className="text-[11px] font-black text-emerald-600">{stats?.profit.toFixed(0) || 0} PROFIT</span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CalendarView({ events, selectedDate, setSelectedDate }: { events: TransactionEventData[]; selectedDate: string | null; setSelectedDate: (d: string | null) => void }) {
    const dateStats = useMemo(() => {
        const stats: Record<string, { count: number; profit: number; duration: number; studentCount: number }> = {};
        let minDate: Date | null = null;
        let maxDate: Date | null = null;

        events.forEach((e) => {
            const date = new Date(e.event.date);
            const d = e.event.date.split("T")[0];

            if (!minDate || date < minDate) minDate = date;
            if (!maxDate || date > maxDate) maxDate = date;

            if (!stats[d]) stats[d] = { count: 0, profit: 0, duration: 0, studentCount: 0 };
            stats[d].count += 1;
            stats[d].profit += e.financials.profit;
            stats[d].duration += e.event.duration;
            stats[d].studentCount += e.studentCount;
        });

        return { stats, minDate, maxDate };
    }, [events]);

    const filteredEvents = useMemo(() => {
        if (!selectedDate) return [];
        return events.filter((e) => e.event.date.startsWith(selectedDate));
    }, [events, selectedDate]);

    return (
        <div className="space-y-8">
            <Heatmap data={dateStats.stats} onDateSelect={setSelectedDate} selectedDate={selectedDate} />

            <AnimatePresence mode="wait">
                {selectedDate ? (
                    <motion.div key={selectedDate} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <h3 className="text-xl font-black tracking-tight uppercase tracking-tighter flex items-center gap-3">
                                <Calendar size={20} className="text-primary" />
                                {new Date(selectedDate).toLocaleDateString(undefined, {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </h3>
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">{filteredEvents.length} Lessons</span>
                        </div>

                        {filteredEvents.length > 0 ? (
                            <TransactionEventsTable events={filteredEvents} groupBy="none" />
                        ) : (
                            <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl bg-muted/5">
                                <p className="text-muted-foreground font-medium italic">No transactions recorded for this date.</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-20 text-center border-2 border-dashed border-border rounded-3xl bg-muted/5">
                        <Activity size={48} className="mx-auto text-muted-foreground/20 mb-4" strokeWidth={1} />
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Select a day from the heatmap to view details</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function GroupedListView({ groupedEvents, classboardData, expandedDates, toggleDate, router }: { groupedEvents: DateGroup[]; classboardData: ClassboardModel; expandedDates: Record<string, boolean>; toggleDate: (d: string) => void; router: any }) {
    return (
        <div className="space-y-4">
            {groupedEvents.map((group) => {
                const statsCalculator = new ClassboardStatistics(classboardData);
                const stats = statsCalculator.getDailyLessonStats();
                const isExpanded = expandedDates[group.date] ?? false;
                const profit = stats.revenue.profit;

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
                                        <span className="font-semibold text-lg text-foreground">{stats.revenue.revenue.toFixed(0)}</span>
                                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Revenue</span>
                                    </div>
                                    <div className="flex flex-col items-center text-muted-foreground">
                                        <span className="font-medium text-lg">- {stats.revenue.commission.toFixed(0)}</span>
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
    );
}

function TableListView({ events, groupBy }: { events: TransactionEventData[]; groupBy: GroupingType }) {
    return (
        <div className="space-y-4">
            <TransactionEventsTable events={events} groupBy={groupBy} />
        </div>
    );
}

export function HomePage({ classboardData, school }: HomePageProps) {
    const router = useRouter();
    const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
    const [viewMode, setViewMode] = useState<ViewMode>("grouped");
    const [groupBy, setGroupBy] = useState<GroupingType>("none");
    const [selectedActivityDate, setSelectedActivityDate] = useState<string | null>(null);

    const viewConfig = {
        grouped: {
            title: "All Lessons",
            subtitle: "Visible by date",
            icon: LayoutGrid,
        },
        table: {
            title: "A Nicer Looking Table",
            subtitle: "With full transaction details",
            icon: List,
        },
        calendar: {
            title: "Lesson Activity",
            subtitle: "Your History at a glance",
            icon: Grid3X3,
        },
    };

    const globalTotals = useMemo(() => {
        let totalDuration = 0;
        let totalCommissions = 0;
        let totalRevenue = 0;
        let totalProfit = 0;
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
            const stats = new ClassboardStatistics(classboardData).getDailyLessonStats();
            totalDuration += stats.duration;
            totalCommissions += stats.revenue.commission;
            totalRevenue += stats.revenue.revenue;
            totalProfit += stats.revenue.profit;
        });

        return {
            duration: totalDuration,
            commissions: totalCommissions,
            profit: totalProfit,
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

    const allTransactionEvents = useMemo(() => {
        const events: TransactionEventData[] = [];

        Object.values(classboardData).forEach((booking) => {
            const { bookingStudents, lessons, schoolPackage } = booking;
            const leaderStudent = bookingStudents[0]?.student;
            const leaderStudentName = leaderStudent ? `${leaderStudent.firstName} ${leaderStudent.lastName}` : "Unknown";
            const studentCount = bookingStudents.length;
            const studentNames = bookingStudents.map((bs) => `${bs.student.firstName} ${bs.student.lastName}`);

            lessons.forEach((lesson) => {
                lesson.events.forEach((event) => {
                    const durationHours = event.duration / 60;
                    const studentRevenue = schoolPackage.pricePerStudent * durationHours * studentCount;
                    const cph = parseFloat(lesson.commission.cph) || 0;

                    let teacherEarnings = 0;
                    if (lesson.commission.type === "fixed") {
                        teacherEarnings = cph * durationHours;
                    } else {
                        teacherEarnings = studentRevenue * (cph / 100);
                    }

                    events.push({
                        event: {
                            id: event.id,
                            date: event.date,
                            duration: event.duration,
                            location: event.location,
                            status: event.status,
                        },
                        teacher: {
                            username: lesson.teacher.username,
                        },
                        leaderStudentName,
                        studentCount,
                        studentNames,
                        packageData: {
                            description: schoolPackage.description,
                            pricePerStudent: schoolPackage.pricePerStudent,
                            durationMinutes: schoolPackage.durationMinutes,
                            categoryEquipment: schoolPackage.categoryEquipment,
                            capacityEquipment: schoolPackage.capacityEquipment,
                            capacityStudents: schoolPackage.capacityStudents,
                        },
                        financials: {
                            teacherEarnings,
                            studentRevenue,
                            profit: studentRevenue - teacherEarnings,
                            currency: school.currency,
                            commissionType: lesson.commission.type as "fixed" | "percentage",
                            commissionValue: cph,
                        },
                    });
                });
            });
        });

        return events.sort((a, b) => b.event.date.localeCompare(a.event.date));
    }, [classboardData, school.currency]);

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
                                <span className="tracking-wide">
                                    {globalTotals.events} <span className="font-medium lowercase"></span>
                                </span>
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

            <div className="flex items-end justify-between border-b border-border pb-6">
                <ViewHeader {...viewConfig[viewMode]} />
                <ViewToggle mode={viewMode} setMode={setViewMode} groupBy={groupBy} setGroupBy={setGroupBy} />
            </div>

            <div className="space-y-6">
                {viewMode === "grouped" ? (
                    <GroupedListView groupedEvents={groupedEvents} classboardData={classboardData} expandedDates={expandedDates} toggleDate={toggleDate} router={router} />
                ) : viewMode === "table" ? (
                    <TableListView events={allTransactionEvents} groupBy={groupBy} />
                ) : (
                    <CalendarView events={allTransactionEvents} selectedDate={selectedActivityDate} setSelectedDate={setSelectedActivityDate} />
                )}

                {groupedEvents.length === 0 && (
                    <div className="text-center p-12 text-muted-foreground bg-card rounded-2xl border-2 border-border border-dashed">
                        <p className="font-medium">No events found for this school.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
