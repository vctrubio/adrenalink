"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { 
    TrendingUp, 
    Calendar, 
    Users, 
    Clock, 
    Zap, 
    Wind,
    ChevronLeft,
    ChevronRight,
    Trophy,
    Target
} from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import type { TransactionEventData } from "@/types/transaction-event";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import { StatItemUI } from "@/backend/data/StatsData";
import { 
    format, 
    startOfWeek, 
    endOfWeek, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    isSameDay,
    subMonths,
    addMonths,
    subWeeks,
    addWeeks,
    startOfYear,
    endOfYear,
    eachWeekOfInterval,
    eachMonthOfInterval
} from "date-fns";

type StatsPeriod = "day" | "week" | "month";

interface PeriodData {
    label: string;
    date: Date;
    revenue: number;
    profit: number;
    lessons: number;
    students: number;
    duration: number;
    activeDays: number;
    totalDays: number;
}

interface EquipmentStat extends React.ComponentType<any> {
    id: string;
    name: string;
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
    count: number;
    percentage: number;
}

export function HomeStatistics({ events }: { events: TransactionEventData[] }) {
    const [period, setPeriod] = useState<StatsPeriod>("week");
    const [viewDate, setViewDate] = useState(new Date());

    // 1. Process data based on period
    const statsData = useMemo(() => {
        let interval: { start: Date; end: Date };
        let groups: Date[];

        if (period === "day") {
            interval = { start: startOfMonth(viewDate), end: endOfMonth(viewDate) };
            groups = eachDayOfInterval(interval);
        } else if (period === "week") {
            // Show last 12 weeks
            interval = { start: subWeeks(viewDate, 11), end: endOfWeek(viewDate) };
            groups = eachWeekOfInterval(interval);
        } else {
            // Show current year
            interval = { start: startOfYear(viewDate), end: endOfYear(viewDate) };
            groups = eachMonthOfInterval(interval);
        }

        return groups.map(date => {
            let periodStart: Date, periodEnd: Date;
            let label: string;

            if (period === "day") {
                periodStart = date;
                periodEnd = date;
                label = format(date, "MMM d");
            } else if (period === "week") {
                periodStart = startOfWeek(date);
                periodEnd = endOfWeek(date);
                label = `W${format(date, "w")}`;
            } else {
                periodStart = startOfMonth(date);
                periodEnd = endOfMonth(date);
                label = format(date, "MMM");
            }

            const periodEvents = events.filter(e => {
                const eventDate = new Date(e.event.date);
                return eventDate >= periodStart && eventDate <= periodEnd;
            });

            const daysInPeriod = eachDayOfInterval({ start: periodStart, end: periodEnd });
            const activeDays = daysInPeriod.filter(d => 
                events.some(e => isSameDay(new Date(e.event.date), d))
            ).length;

            return {
                label,
                date,
                revenue: periodEvents.reduce((sum, e) => sum + e.financials.studentRevenue, 0),
                profit: periodEvents.reduce((sum, e) => sum + e.financials.profit, 0),
                commission: periodEvents.reduce((sum, e) => sum + e.financials.teacherEarnings, 0),
                lessons: periodEvents.length,
                eventCount: periodEvents.length, // Each TransactionEventData is one event
                students: periodEvents.reduce((sum, e) => sum + (e.booking?.students?.length || 0), 0),
                duration: periodEvents.reduce((sum, e) => sum + e.event.duration, 0),
                activeDays,
                totalDays: daysInPeriod.length
            };
        });
    }, [events, period, viewDate]);

    // 2. Calculate global highlights for the current view
    const highlights = useMemo(() => {
        if (statsData.length === 0) return null;
        
        const totalProfit = statsData.reduce((sum, d) => sum + d.profit, 0);
        const totalRevenue = statsData.reduce((sum, d) => sum + d.revenue, 0);
        const totalCommission = statsData.reduce((sum, d) => sum + d.commission, 0);
        const totalLessons = statsData.reduce((sum, d) => sum + d.lessons, 0);
        const totalEvents = statsData.reduce((sum, d) => sum + d.eventCount, 0);
        const totalStudents = statsData.reduce((sum, d) => sum + d.students, 0);
        const totalDuration = statsData.reduce((sum, d) => sum + d.duration, 0);
        const totalActiveDays = statsData.reduce((sum, d) => sum + d.activeDays, 0);
        const totalDays = statsData.reduce((sum, d) => sum + d.totalDays, 0);

        // Equipment & Capacity Distribution
        const equipmentCounts: Record<string, number> = { kite: 0, wing: 0, windsurf: 0 };
        const capacityCounts: Record<string, { count: number; duration: number }> = {
            private: { count: 0, duration: 0 },
            semi: { count: 0, duration: 0 },
            group: { count: 0, duration: 0 }
        };
        let totalEventsWithEquipment = 0;

        let rangeStart: Date, rangeEnd: Date;
        if (period === "day") {
            rangeStart = startOfMonth(viewDate);
            rangeEnd = endOfMonth(viewDate);
        } else if (period === "week") {
            rangeStart = subWeeks(viewDate, 11);
            rangeEnd = endOfWeek(viewDate);
        } else {
            rangeStart = startOfYear(viewDate);
            rangeEnd = endOfYear(viewDate);
        }

        events.forEach(e => {
            const eventDate = new Date(e.event.date);
            if (eventDate >= rangeStart && eventDate <= rangeEnd) {
                // Capacity Grouping
                const studentCount = e.booking?.students?.length || 0;
                let capKey = "private";
                if (studentCount === 2) capKey = "semi";
                else if (studentCount >= 3) capKey = "group";
                
                capacityCounts[capKey].count++;
                capacityCounts[capKey].duration += e.event.duration;

                // Equipment
                const cat = e.packageData.categoryEquipment?.toLowerCase();
                if (cat && cat in equipmentCounts) {
                    equipmentCounts[cat]++;
                    totalEventsWithEquipment++;
                }
            }
        });

        const capacityStats = [
            { id: "private", name: "Private", ...capacityCounts.private, color: "#1e40af" },
            { id: "semi", name: "Semi-Private", ...capacityCounts.semi, color: "#3b82f6" },
            { id: "group", name: "Group (3+)", ...capacityCounts.group, color: "#93c5fd" }
        ];

        const equipmentStats = EQUIPMENT_CATEGORIES.map(cat => ({
            ...cat,
            count: equipmentCounts[cat.id] || 0,
            percentage: totalEventsWithEquipment > 0 ? ((equipmentCounts[cat.id] || 0) / totalEventsWithEquipment) * 100 : 0
        })).sort((a, b) => b.count - a.count);
        
        const maxProfit = Math.max(...statsData.map(d => d.profit), 1);
        const bestPeriod = statsData.find(d => d.profit === Math.max(...statsData.map(p => p.profit)));

        const topPeriods = [...statsData]
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 3)
            .filter(p => p.profit > 0);

        return {
            totalProfit,
            totalRevenue,
            totalCommission,
            totalLessons,
            totalEvents,
            totalStudents,
            totalDuration,
            windConsistency: (totalActiveDays / totalDays) * 100,
            maxProfit,
            bestPeriod,
            equipmentStats,
            capacityStats,
            topPeriods,
            activeDays: totalActiveDays,
            totalDays
        };
    }, [statsData, events, period, viewDate]);

    const navigate = (direction: "prev" | "next") => {
        const amount = direction === "prev" ? -1 : 1;
        if (period === "day") setViewDate((prev) => addMonths(prev, amount));
        else if (period === "week") setViewDate((prev) => addWeeks(prev, amount * 4));
        else setViewDate((prev) => addMonths(prev, amount * 12));
    };

    if (!highlights) return null;

    return (
        <div className="space-y-10 py-4 max-w-7xl mx-auto">
            {/* Control & Summary Header */}
            <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <StatsControls 
                        period={period} 
                        setPeriod={setPeriod} 
                        viewDate={viewDate} 
                        navigate={navigate} 
                    />
                    
                    <div className="flex items-center gap-8 pr-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total Duration</span>
                            <span className="text-xl font-black text-foreground tabular-nums">
                                {Math.floor(highlights.totalDuration / 60)}h
                            </span>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total Profit</span>
                            <span className="text-xl font-black text-emerald-500 tabular-nums">
                                {getCompactNumber(highlights.totalProfit)}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Wind Activity</span>
                            <span className="text-xl font-black text-foreground tabular-nums">
                                {highlights.activeDays}/{highlights.totalDays}
                            </span>
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
                            {highlights.equipmentStats.filter(s => s.count > 0).map(stat => (
                                <div key={stat.id} className="flex items-center gap-1.5" title={`${stat.name}: ${stat.count} events`}>
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
                {/* Strength Chart */}
                <div className="xl:col-span-2 bg-card border border-border rounded-[3rem] p-8 shadow-sm overflow-hidden relative">
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                                <TrendingUp className="text-primary" size={24} />
                                Revenue Strength
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium">Performance relative to best {period}</p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-70">Top Performers</span>
                            <div className="flex gap-3">
                                {highlights.topPeriods.map((p, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-2xl border border-border/50 transition-colors hover:bg-muted/50">
                                        <span className="text-[10px] font-black text-foreground uppercase tracking-tight">{p.label}</span>
                                        <div className="w-px h-3 bg-border" />
                                        <span className="text-xs font-black text-emerald-500 tabular-nums">{getCompactNumber(p.profit)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end justify-between h-[300px] gap-2 sm:gap-4 relative z-10 px-2">
                        {statsData.map((d, i) => {
                            const strength = (d.profit / highlights.maxProfit) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 scale-95 group-hover:scale-100">
                                        <div className="bg-popover border border-border shadow-2xl rounded-2xl p-4 min-w-[180px] space-y-2">
                                            <p className="text-[10px] font-black text-primary uppercase border-b border-border pb-1 mb-2">{d.label}</p>
                                            <StatItemUI type="profit" value={d.profit} variant="profit" hideLabel={false} />
                                            <StatItemUI type="lessons" value={d.lessons} hideLabel={false} />
                                            <StatItemUI type="students" value={d.students} hideLabel={false} />
                                            <StatItemUI type="duration" value={d.duration} hideLabel={false} />
                                            <StatItemUI type="events" labelOverride="Wind" value={`${d.activeDays}/${d.totalDays}d`} hideLabel={false} />
                                        </div>
                                    </div>

                                    {/* Bar */}
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(strength, 4)}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                                        className={`w-full rounded-t-2xl relative overflow-hidden transition-all duration-500 ${
                                            strength > 80 ? "bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]" :
                                            strength > 40 ? "bg-primary/60" :
                                            strength > 0 ? "bg-primary/30" : "bg-muted/30"
                                        }`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                    
                                    <span className="mt-4 text-[9px] font-black text-muted-foreground uppercase group-hover:text-primary transition-colors tracking-tighter">
                                        {d.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="absolute inset-0 pt-32 pb-16 px-8 flex flex-col justify-between pointer-events-none opacity-20">
                        {[1, 2, 3, 4].map((i) => <div key={i} className="w-full h-px bg-border border-dashed" />)}
                    </div>
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
                            <HelmetIcon size={12} className="text-primary" />
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
                                                <span className="text-[10px] font-black uppercase tracking-tight text-foreground">{stat.name}</span>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-[10px] font-bold text-muted-foreground tabular-nums">{percentage.toFixed(0)}%</span>
                                                <span className="text-sm font-black text-foreground tabular-nums">{stat.count}</span>
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase">{Math.floor(stat.duration / 60)}h</span>
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
        </div>
    );
}

function StatsControls({ 
    period, 
    setPeriod, 
    viewDate, 
    navigate 
}: { 
    period: StatsPeriod; 
    setPeriod: (p: StatsPeriod) => void; 
    viewDate: Date; 
    navigate: (d: "prev" | "next") => void; 
}) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center bg-muted/50 p-1 rounded-2xl border border-border">
                {(["day", "week", "month"] as const).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? "bg-background shadow-lg text-primary scale-105" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        {p}s
                    </button>
                ))}
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
                <button onClick={() => navigate("prev")} className="p-2 hover:bg-muted rounded-full transition-colors">
                    <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-black uppercase tracking-tighter text-foreground min-w-[120px] text-center">
                    {period === "day" ? format(viewDate, "MMMM yyyy") : 
                     period === "week" ? `${format(subWeeks(viewDate, 11), "MMM d")} - ${format(viewDate, "MMM d, yyyy")}` :
                     format(viewDate, "yyyy")}
                </span>
                <button onClick={() => navigate("next")} className="p-2 hover:bg-muted rounded-full transition-colors">
                    <ChevronRight size={18} />
                </button>
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
                            <span className="text-[10px] font-bold text-muted-foreground tabular-nums">{stat.percentage.toFixed(0)}%</span>
                            <span className="text-sm font-black text-foreground tabular-nums">{stat.count}</span>
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
