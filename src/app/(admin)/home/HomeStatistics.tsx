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
import type { TransactionEventData } from "@/types/transaction-event";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
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
                lessons: periodEvents.length,
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
        const totalLessons = statsData.reduce((sum, d) => sum + d.lessons, 0);
        const totalActiveDays = statsData.reduce((sum, d) => sum + d.activeDays, 0);
        const totalDays = statsData.reduce((sum, d) => sum + d.totalDays, 0);
        
        const maxProfit = Math.max(...statsData.map(d => d.profit), 1);
        const bestPeriod = statsData.find(d => d.profit === Math.max(...statsData.map(p => p.profit)));

        return {
            totalProfit,
            totalLessons,
            windConsistency: (totalActiveDays / totalDays) * 100,
            maxProfit,
            bestPeriod
        };
    }, [statsData]);

    const navigate = (direction: "prev" | "next") => {
        const amount = direction === "prev" ? -1 : 1;
        if (period === "day") setViewDate((prev) => addMonths(prev, amount));
        else if (period === "week") setViewDate((prev) => addWeeks(prev, amount * 4));
        else setViewDate((prev) => addMonths(prev, amount * 12));
    };

    if (!highlights) return null;

    return (
        <div className="space-y-10 py-4 max-w-7xl mx-auto">
            {/* Control Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-card border border-border p-6 rounded-[2.5rem] shadow-sm">
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

                <div className="flex items-center gap-8 pr-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total Profit</span>
                        <span className="text-xl font-black text-emerald-500 tabular-nums">
                            {getCompactNumber(highlights.totalProfit)}
                        </span>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Wind Activity</span>
                        <div className="flex items-center gap-2">
                            <Wind size={14} className="text-blue-400" />
                            <span className="text-xl font-black text-blue-500 tabular-nums">
                                {highlights.windConsistency.toFixed(0)}%
                            </span>
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
                        <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20">
                            <Trophy size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase">Best: {highlights.bestPeriod?.label}</span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between h-[300px] gap-2 sm:gap-4 relative z-10 px-2">
                        {statsData.map((d, i) => {
                            const strength = (d.profit / highlights.maxProfit) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 scale-95 group-hover:scale-100">
                                        <div className="bg-popover border border-border shadow-2xl rounded-2xl p-4 min-w-[160px] space-y-2">
                                            <p className="text-[10px] font-black text-primary uppercase border-b border-border pb-1 mb-2">{d.label}</p>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase">Profit</span>
                                                <span className="text-sm font-black text-emerald-500">{getCompactNumber(d.profit)}</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase">Lessons</span>
                                                <span className="text-sm font-black text-foreground">{d.lessons}</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase">Wind</span>
                                                <span className="text-sm font-black text-blue-500">{d.activeDays}/{d.totalDays}d</span>
                                            </div>
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
                                        {/* Animated overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                    
                                    {/* Label */}
                                    <span className="mt-4 text-[9px] font-black text-muted-foreground uppercase group-hover:text-primary transition-colors tracking-tighter">
                                        {d.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Grid Lines */}
                    <div className="absolute inset-0 pt-32 pb-16 px-8 flex flex-col justify-between pointer-events-none opacity-20">
                        {[1, 2, 3, 4].map((i) => <div key={i} className="w-full h-px bg-border border-dashed" />)}
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="space-y-8">
                    {/* Active Days Card */}
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Wind size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-tight">Wind Consistency</h4>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase">Active days vs total days</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="relative h-4 bg-muted/30 rounded-full overflow-hidden border border-border/50">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${highlights.windConsistency}%` }}
                                    transition={{ duration: 1.2, ease: "circOut" }}
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                                />
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Active Status</span>
                                    <span className="text-2xl font-black text-blue-500 tracking-tighter uppercase">
                                        {highlights.windConsistency > 70 ? "Excellent" : 
                                         highlights.windConsistency > 40 ? "Moderate" : "Calm"}
                                    </span>
                                </div>
                                <span className="text-3xl font-black text-foreground tabular-nums tracking-tighter">
                                    {highlights.windConsistency.toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Efficiency Card */}
                    <div className="bg-foreground text-background rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                        <Target className="absolute -bottom-10 -right-10 w-40 h-40 opacity-10 rotate-12" />
                        
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-background/10 flex items-center justify-center">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-tight">Time Output</h4>
                                    <p className="text-[10px] text-background/60 font-medium uppercase">Total instructional hours</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-background/5 rounded-2xl p-4 border border-background/10">
                                    <span className="block text-[9px] font-bold text-background/40 uppercase tracking-widest mb-1">Total Hours</span>
                                    <span className="text-xl font-black tabular-nums">
                                        {Math.floor(statsData.reduce((sum, d) => sum + d.duration, 0) / 60)}h
                                    </span>
                                </div>
                                <div className="bg-background/5 rounded-2xl p-4 border border-background/10">
                                    <span className="block text-[9px] font-bold text-background/40 uppercase tracking-widest mb-1">Students</span>
                                    <span className="text-xl font-black tabular-nums">
                                        {statsData.reduce((sum, d) => sum + d.students, 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MiniStatCard 
                    icon={Calendar} 
                    label="Lessons" 
                    value={highlights.totalLessons} 
                    subValue={`Avg ${(highlights.totalLessons / statsData.length).toFixed(1)} / ${period}`}
                    color="primary"
                />
                <MiniStatCard 
                    icon={Users} 
                    label="Active Students" 
                    value={statsData.reduce((sum, d) => sum + d.students, 0)} 
                    color="blue"
                />
                <MiniStatCard 
                    icon={Zap} 
                    label="Peak Profit" 
                    value={getCompactNumber(highlights.maxProfit)} 
                    subValue={`Best ${period}`}
                    color="emerald"
                />
                <MiniStatCard 
                    icon={Wind} 
                    label="Wind Days" 
                    value={statsData.reduce((sum, d) => sum + d.activeDays, 0)} 
                    subValue={`Out of ${statsData.reduce((sum, d) => sum + d.totalDays, 0)} days`}
                    color="cyan"
                />
            </div>
        </div>
    );
}

function MiniStatCard({ 
    icon: Icon, 
    label, 
    value, 
    subValue,
    color 
}: { 
    icon: React.ElementType; 
    label: string; 
    value: string | number; 
    subValue?: string;
    color: string; 
}) {
    const colorClasses: Record<string, string> = {
        primary: "text-primary bg-primary/10",
        blue: "text-blue-500 bg-blue-500/10",
        emerald: "text-emerald-500 bg-emerald-500/10",
        cyan: "text-cyan-500 bg-cyan-500/10"
    };

    return (
        <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex items-center gap-5 group hover:border-primary/30 transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${colorClasses[color]}`}>
                <Icon size={20} />
            </div>
            <div className="min-w-0">
                <span className="block text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{label}</span>
                <span className="block text-xl font-black text-foreground tabular-nums truncate">{value}</span>
                {subValue && <span className="block text-[9px] text-muted-foreground/60 font-medium uppercase truncate">{subValue}</span>}
            </div>
        </div>
    );
}
