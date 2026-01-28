"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Clock, Wind } from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import type { TransactionEventData } from "@/types/transaction-event";
import { getCompactNumber, getFormattedMoneyNumber } from "@/getters/integer-getter";
import { StatItemUI } from "@/backend/data/StatsData";
import { MonthsPicker, type MonthRange } from "@/src/components/pickers/MonthsPicker";
import { TransactionEventsTable } from "@/src/app/(admin)/(tables)/TransactionEventsTable";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, eachMonthOfInterval, parseISO } from "date-fns";

export function HomeStatistics({ events }: { events: TransactionEventData[] }) {
    const [monthRange, setMonthRange] = useState<MonthRange>(() => {
        const end = new Date();
        const start = subMonths(end, 11);
        return {
            startMonth: format(start, "yyyy-MM"),
            endMonth: format(end, "yyyy-MM"),
        };
    });
    const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);

    // 1. Helper to process any interval into stats
    const getStatsForInterval = (
        groups: Date[],
        startFn: (d: Date) => Date,
        endFn: (d: Date) => Date,
        labelFn: (d: Date) => string,
    ) => {
        return groups.map((date) => {
            const pStart = startFn(date);
            const pEnd = endFn(date);
            const periodEvents = events.filter((e) => {
                const eventDate = new Date(e.event.date);
                return eventDate >= pStart && eventDate <= pEnd;
            });
            const daysInPeriod = eachDayOfInterval({ start: pStart, end: pEnd });
            const activeDays = daysInPeriod.filter((d) => events.some((e) => isSameDay(new Date(e.event.date), d))).length;

            return {
                label: labelFn(date),
                date,
                revenue: periodEvents.reduce((sum, e) => sum + e.financials.studentRevenue, 0),
                profit: periodEvents.reduce((sum, e) => sum + e.financials.profit, 0),
                commission: periodEvents.reduce((sum, e) => sum + e.financials.teacherEarnings, 0),
                lessons: periodEvents.length,
                eventCount: periodEvents.length,
                students: periodEvents.reduce((sum, e) => sum + (e.booking?.students?.length || 0), 0),
                teachers: new Set(periodEvents.map((e) => e.teacher.id || e.teacher.username)).size,
                duration: periodEvents.reduce((sum, e) => sum + e.event.duration, 0),
                activeDays,
                totalDays: daysInPeriod.length,
            };
        });
    };

    // 2. Process tiers
    const overviewData = useMemo(() => {
        const start = startOfMonth(parseISO(`${monthRange.startMonth}-01`));
        const end = endOfMonth(parseISO(`${monthRange.endMonth}-01`));
        const groups = eachMonthOfInterval({ start, end });
        return getStatsForInterval(groups, startOfMonth, endOfMonth, (d) => format(d, "MMM"));
    }, [events, monthRange]);

    // 3. Filtered events for the table
    const tableEvents = useMemo(() => {
        if (selectedMonth) {
            const start = startOfMonth(selectedMonth);
            const end = endOfMonth(selectedMonth);
            return events.filter((e) => {
                const eventDate = new Date(e.event.date);
                return eventDate >= start && eventDate <= end;
            });
        }

        const start = startOfMonth(parseISO(`${monthRange.startMonth}-01`));
        const end = endOfMonth(parseISO(`${monthRange.endMonth}-01`));
        return events.filter((e) => {
            const eventDate = new Date(e.event.date);
            return eventDate >= start && eventDate <= end;
        });
    }, [events, selectedMonth, monthRange]);

    const selectionLabel = selectedMonth
        ? format(selectedMonth, "MMMM yyyy")
        : `Range: ${format(parseISO(`${monthRange.startMonth}-01`), "MMM yyyy")} - ${format(parseISO(`${monthRange.endMonth}-01`), "MMM yyyy")}`;

    const highlights = useMemo(() => {
        if (overviewData.length === 0) return null;

        // Highlights are always based on the FULL monthRange selected
        const totalProfit = overviewData.reduce((sum, d) => sum + d.profit, 0);
        const totalRevenue = overviewData.reduce((sum, d) => sum + d.revenue, 0);
        const totalCommission = overviewData.reduce((sum, d) => sum + d.commission, 0);
        const totalLessons = overviewData.reduce((sum, d) => sum + d.lessons, 0);
        const totalEvents = overviewData.reduce((sum, d) => sum + d.eventCount, 0);
        const totalStudents = overviewData.reduce((sum, d) => sum + d.students, 0);
        const totalDuration = overviewData.reduce((sum, d) => sum + d.duration, 0);
        const totalActiveDays = overviewData.reduce((sum, d) => sum + d.activeDays, 0);
        const totalDays = overviewData.reduce((sum, d) => sum + d.totalDays, 0);

        // Unique teachers across the entire overviewData range
        const rangeStart = overviewData[0].date;
        const rangeEnd = endOfMonth(overviewData[overviewData.length - 1].date);
        const uniqueTeachers = new Set();
        events.forEach((e) => {
            const eventDate = new Date(e.event.date);
            if (eventDate >= rangeStart && eventDate <= rangeEnd) {
                const tId = e.teacher.id || e.teacher.username;
                if (tId) uniqueTeachers.add(tId);
            }
        });

        const equipmentCounts: Record<string, { count: number; duration: number }> = {
            kite: { count: 0, duration: 0 },
            wing: { count: 0, duration: 0 },
            windsurf: { count: 0, duration: 0 },
        };
        const capacityCounts: Record<string, { count: number; duration: number }> = {
            private: { count: 0, duration: 0 },
            semi: { count: 0, duration: 0 },
            group: { count: 0, duration: 0 },
        };
        let totalEventsWithEquipment = 0;

        events.forEach((e) => {
            const eventDate = new Date(e.event.date);
            if (eventDate >= rangeStart && eventDate <= rangeEnd) {
                const studentCount = e.booking?.students?.length || 0;
                const capKey = studentCount === 1 ? "private" : studentCount === 2 ? "semi" : "group";
                capacityCounts[capKey].count++;
                capacityCounts[capKey].duration += e.event.duration;

                const cat = e.packageData.categoryEquipment?.toLowerCase();
                if (cat && cat in equipmentCounts) {
                    equipmentCounts[cat].count++;
                    equipmentCounts[cat].duration += e.event.duration;
                    totalEventsWithEquipment++;
                }
            }
        });

        return {
            totalProfit,
            totalRevenue,
            totalCommission,
            totalLessons,
            totalEvents,
            totalStudents,
            totalDuration,
            windConsistency: (totalActiveDays / totalDays) * 100,
            maxProfit: Math.max(...overviewData.map((d) => d.profit), 1),
            topPeriods: [...overviewData]
                .sort((a, b) => b.profit - a.profit)
                .slice(0, 3)
                .filter((p) => p.profit > 0),
            equipmentStats: EQUIPMENT_CATEGORIES.map((cat) => ({
                ...cat,
                ...equipmentCounts[cat.id],
                percentage: totalEventsWithEquipment > 0 ? (equipmentCounts[cat.id].count / totalEventsWithEquipment) * 100 : 0,
            })).sort((a, b) => b.count - a.count),
            capacityStats: [
                { id: "private", name: "Private", ...capacityCounts.private, color: "#1e40af" },
                { id: "semi", name: "Semi-Private", ...capacityCounts.semi, color: "#3b82f6" },
                { id: "group", name: "Group (3+)", ...capacityCounts.group, color: "#93c5fd" },
            ],
            activeDays: totalActiveDays,
            totalDays,
        };
    }, [overviewData, events]);

    if (!highlights) return null;

    return (
        <div className="space-y-10 py-4 max-w-7xl mx-auto">
            {/* Control & Summary Header */}
            <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <MonthsPicker range={monthRange} onChange={setMonthRange} onMonthClick={() => setSelectedMonth(null)} />
                        {selectedMonth && (
                            <button
                                onClick={() => setSelectedMonth(null)}
                                className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase rounded-lg border border-primary/20 hover:bg-primary/20 transition-all whitespace-nowrap"
                            >
                                Show Range
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-8 pr-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Total Duration
                            </span>
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-muted-foreground/60" />
                                <span className="text-xl font-black text-foreground tabular-nums">
                                    {Math.floor(highlights.totalDuration / 60)}h
                                </span>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total Profit</span>
                            <div className="flex items-center gap-2">
                                <TrendingUp size={14} className="text-emerald-500" />
                                <span className="text-xl font-black text-emerald-500 tabular-nums">
                                    {getFormattedMoneyNumber(highlights.totalProfit)}
                                </span>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Wind Activity</span>
                            <div className="flex items-center gap-2">
                                <Wind size={14} className="text-muted-foreground/60" />
                                <span className="text-xl font-black text-foreground tabular-nums">
                                    {highlights.activeDays}/{highlights.totalDays}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                        <StatItemUI type="students" value={highlights.totalStudents} />
                        <StatItemUI type="lessons" value={highlights.totalLessons} />
                        <StatItemUI type="events" value={highlights.totalEvents} />
                        <StatItemUI type="revenue" value={highlights.totalRevenue} />
                        <StatItemUI type="commission" value={highlights.totalCommission} />

                        <div className="flex items-center gap-3 ml-auto bg-muted/30 px-4 py-2 rounded-2xl border border-border/50">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Gear Mix:</span>
                            {highlights.equipmentStats
                                .filter((s) => s.count > 0)
                                .map((stat) => (
                                    <div
                                        key={stat.id}
                                        className="flex items-center gap-1.5"
                                        title={`${stat.name}: ${stat.count} events`}
                                    >
                                        <stat.icon size={10} style={{ color: stat.color }} />
                                        <span className="text-[10px] font-black text-foreground">{stat.percentage.toFixed(0)}%</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Analytics Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Month Overview Chart */}
                <div className="xl:col-span-2">
                    <DrillDownChart
                        title="Month Overview"
                        subtitle="Click a bar to filter the table below"
                        data={overviewData}
                        maxProfit={highlights.maxProfit}
                        onBarClick={(d: Date) => setSelectedMonth(d)}
                        selectedDate={selectedMonth}
                        highlights={highlights}
                    />
                </div>

                {/* Secondary Stats */}
                <div className="space-y-8">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
                        {/* Compact Badge Header - Relative Top Right */}
                        <div className="absolute top-0 right-0 flex items-center gap-3 bg-muted/30 px-6 py-2.5 rounded-bl-[2rem] border-b border-l border-border/50 z-10">
                            <EquipmentIcon size={12} className="text-purple-500" />
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-foreground">Usage</span>
                        </div>

                        <div className="pt-2">
                            <EquipmentLeaderboard stats={highlights.equipmentStats} />
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
                        {/* Compact Badge Header - Relative Top Right */}
                        <div className="absolute top-0 right-0 flex items-center gap-3 bg-muted/30 px-6 py-2.5 rounded-bl-[2rem] border-b border-l border-border/50 z-10">
                            <HelmetIcon size={12} className="text-yellow-500" />
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-foreground">Grouping</span>
                        </div>

                        <div className="pt-2 space-y-6">
                            {highlights.capacityStats.map((stat) => {
                                const percentage = highlights.totalEvents > 0 ? (stat.count / highlights.totalEvents) * 100 : 0;
                                return (
                                    <div key={stat.id} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                                                <span className="text-[10px] font-black uppercase tracking-tight text-foreground">
                                                    {stat.name}
                                                </span>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                                                    {percentage.toFixed(0)}%
                                                </span>
                                                <span className="text-sm font-black text-foreground tabular-nums">{stat.count}</span>
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                                    {Math.floor(stat.duration / 60)}h
                                                </span>
                                            </div>
                                        </div>
                                        <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, ease: "circOut" }}
                                                className="absolute inset-y-0 left-0 rounded-full"
                                                style={{ backgroundColor: stat.color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Events Table - Conditional */}
            {selectedMonth && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 border-b border-border pb-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="text-primary" size={20} />
                            <h3 className="text-lg font-black uppercase tracking-widest text-foreground">
                                {format(selectedMonth, "MMMM yyyy")}
                            </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-6 bg-muted/30 px-6 py-2 rounded-2xl border border-border/50">
                            <StatItemUI type="events" value={tableEvents.length} hideLabel />
                            <StatItemUI
                                type="students"
                                value={tableEvents.reduce((sum, e) => sum + (e.booking?.students?.length || 0), 0)}
                                hideLabel
                            />
                            <StatItemUI
                                type="teachers"
                                value={new Set(tableEvents.map((e) => e.teacher.id || e.teacher.username)).size}
                                hideLabel
                            />
                            <StatItemUI type="duration" value={tableEvents.reduce((sum, e) => sum + e.event.duration, 0)} hideLabel />
                            <StatItemUI
                                type="revenue"
                                value={tableEvents.reduce((sum, e) => sum + e.financials.studentRevenue, 0)}
                                hideLabel
                            />
                            <StatItemUI
                                type="commission"
                                value={tableEvents.reduce((sum, e) => sum + e.financials.teacherEarnings, 0)}
                                hideLabel
                            />
                            <StatItemUI
                                type="profit"
                                value={tableEvents.reduce((sum, e) => sum + e.financials.profit, 0)}
                                variant="profit"
                                hideLabel
                            />

                            {/* Wind Ratio for selected month */}
                            {(() => {
                                const start = startOfMonth(selectedMonth);
                                const end = endOfMonth(selectedMonth);
                                const days = eachDayOfInterval({ start, end });
                                const active = days.filter((d) => events.some((e) => isSameDay(new Date(e.event.date), d))).length;
                                return (
                                    <div className="flex items-center gap-1.5 opacity-80" title="Wind Days">
                                        <Wind size={12} className="text-muted-foreground" />
                                        <span className="text-xs font-bold text-foreground tabular-nums">
                                            {active}/{days.length}
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    <TransactionEventsTable events={tableEvents} groupBy="week" enableTableLogic={true} />
                </motion.div>
            )}
        </div>
    );
}

function DrillDownChart({ title, subtitle, data, maxProfit, onBarClick, selectedDate, highlights, isDrill = false }: any) {
    return (
        <div
            className={`bg-card border border-border rounded-[3rem] p-8 shadow-sm overflow-hidden relative ${isDrill ? "border-primary/20 bg-muted/5" : ""}`}
        >
            <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <TrendingUp className="text-primary" size={24} />
                        {title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
                </div>
                {!isDrill && (
                    <div className="flex flex-col items-end gap-3">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-70">
                            Top Performers
                        </span>
                        <div className="flex gap-3">
                            {highlights.topPeriods.map((p: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-2xl border border-border/50 transition-colors hover:bg-muted/50"
                                >
                                    <span className="text-[10px] font-black text-foreground uppercase tracking-tight">{p.label}</span>
                                    <div className="w-px h-3 bg-border" />
                                    <span className="text-xs font-black text-emerald-500 tabular-nums">
                                        {getCompactNumber(p.profit)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-end justify-between h-[325px] gap-2 sm:gap-4 relative z-10 px-2">
                {data.map((d: any, i: number) => {
                    const strength = (d.profit / maxProfit) * 100;
                    const isSelected = selectedDate && isSameDay(new Date(d.date), new Date(selectedDate));
                    return (
                        <div
                            key={i}
                            className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer"
                            onClick={() => onBarClick(d.date)}
                        >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 scale-95 group-hover:scale-100">
                                <div className="bg-popover border border-border shadow-2xl rounded-2xl p-4 min-w-[200px] space-y-2">
                                    <p className="text-[10px] font-black text-primary uppercase border-b border-border pb-1 mb-2">
                                        {d.label}
                                    </p>
                                    <StatItemUI type="events" value={d.eventCount} hideLabel={false} />
                                    <StatItemUI type="students" value={d.students} hideLabel={false} />
                                    <StatItemUI type="teachers" value={d.teachers} hideLabel={false} />
                                    <StatItemUI type="duration" value={d.duration} hideLabel={false} />
                                    <StatItemUI type="revenue" value={d.revenue} hideLabel={false} />
                                    <StatItemUI type="commission" value={d.commission} hideLabel={false} />
                                    <StatItemUI type="profit" value={d.profit} variant="profit" hideLabel={false} />

                                    <div className="flex items-center gap-2 pt-1.5 border-t border-border mt-1">
                                        <Wind size={12} className="text-muted-foreground" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Wind:</span>
                                        <span className="text-[10px] font-black text-foreground tabular-nums">
                                            {d.activeDays}/{d.totalDays}d
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(strength, 4)}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05 }}
                                className={`w-full rounded-t-xl relative overflow-hidden transition-all duration-300 ${isSelected
                                    ? "bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] scale-x-110"
                                    : strength > 0
                                        ? "bg-primary/40 group-hover:bg-primary/60"
                                        : "bg-muted/30"
                                    }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                            <span
                                className={`mt-4 text-[9px] font-black uppercase tracking-tighter transition-colors ${isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                            >
                                {d.label}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="absolute inset-0 pt-32 pb-16 px-8 flex flex-col justify-between pointer-events-none opacity-10">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-full h-px bg-border border-dashed" />
                ))}
            </div>
        </div>
    );
}

function EquipmentLeaderboard({ stats }: { stats: any[] }) {
    return (
        <div className="space-y-6">
            {stats.map((stat) => (
                <div key={stat.id} className="space-y-2">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                            <stat.icon size={14} style={{ color: stat.color }} />
                            <span className="text-[10px] font-black uppercase tracking-tight text-foreground">{stat.name}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                                {stat.percentage.toFixed(0)}%
                            </span>
                            <span className="text-sm font-black text-foreground tabular-nums">{stat.count}</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">
                                {Math.floor(stat.duration / 60)}h
                            </span>
                        </div>
                    </div>
                    <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.percentage}%` }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{ backgroundColor: stat.color }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
