"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { 
    Clock, 
    Activity,
    Users, 
    TrendingUp, 
} from "lucide-react";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import type { TransactionEventData } from "@/types/transaction-event";
import { getHMDuration } from "@/getters/duration-getter";
import { getFormattedMoneyNumber, getCompactNumber } from "@/getters/integer-getter";
import { StatItemUI } from "@/backend/data/StatsData";
import { MonthsPicker, type MonthRange } from "@/src/components/pickers/MonthsPicker";
import { SportEquipmentDurationBadge } from "@/src/components/ui/badge/sport-equipment-duration";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";
import { PackageEquipmentFilters, filterByStatus } from "@/src/components/PackageEquipmentFilters";
import { EquipmentEventsTable } from "@/src/app/(admin)/(tables)/EquipmentEventsTable";
import {
    format,
    startOfMonth,
    endOfMonth,
    subMonths,
    parseISO,
    eachMonthOfInterval,
} from "date-fns";

export function HomeEquipment({ events }: { events: TransactionEventData[] }) {
    const { status, setStatus } = useTablesController();
    const [monthRange, setMonthRange] = useState<MonthRange>(() => {
        const end = new Date();
        const start = subMonths(end, 11);
        return {
            startMonth: format(start, "yyyy-MM"),
            endMonth: format(end, "yyyy-MM"),
        };
    });
    const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);

    // 1. Process data for overview and highlights
    const highlights = useMemo(() => {
        const start = startOfMonth(parseISO(`${monthRange.startMonth}-01`));
        const end = endOfMonth(parseISO(`${monthRange.endMonth}-01`));
        const months = eachMonthOfInterval({ start, end });

        const filteredEvents = events.filter((e) => {
            const date = new Date(e.event.date);
            const inDateRange = date >= start && date <= end;
            if (!inDateRange) return false;

            // Apply status filter (Lesson/Rental/Category)
            return filterByStatus(e.packageData, status);
        });

        const totalDuration = filteredEvents.reduce((sum, e) => sum + e.event.duration, 0);
        
        // Categorize by equipment
        const equipmentUsage: Record<string, { 
            duration: number; 
            count: number; 
            rentalCount: number; 
            lessonCount: number;
            lessonDuration: number;
            rentalDuration: number;
        }> = {};
        EQUIPMENT_CATEGORIES.forEach(cat => {
            equipmentUsage[cat.id] = { 
                duration: 0, 
                count: 0, 
                rentalCount: 0, 
                lessonCount: 0,
                lessonDuration: 0,
                rentalDuration: 0
            };
        });

        // Categorize by teacher
        const teacherUsage: Record<string, { 
            username: string; 
            duration: number; 
            count: number;
            revenue: number;
            categories: Record<string, { count: number; duration: number }>
        }> = {};

        filteredEvents.forEach(e => {
            const cat = e.packageData.categoryEquipment?.toLowerCase();
            const duration = e.event.duration;
            const revenue = e.financials.studentRevenue;
            const isRental = e.packageData.description?.toLowerCase().includes("rental");
            const tId = e.teacher.id || e.teacher.username;

            if (cat && equipmentUsage[cat]) {
                equipmentUsage[cat].duration += duration;
                equipmentUsage[cat].count++;
                if (isRental) {
                    equipmentUsage[cat].rentalCount++;
                    equipmentUsage[cat].rentalDuration += duration;
                } else {
                    equipmentUsage[cat].lessonCount++;
                    equipmentUsage[cat].lessonDuration += duration;
                }
            }

            if (tId) {
                if (!teacherUsage[tId]) {
                    teacherUsage[tId] = { username: e.teacher.username, duration: 0, count: 0, revenue: 0, categories: {} };
                }
                teacherUsage[tId].duration += duration;
                teacherUsage[tId].count++;
                teacherUsage[tId].revenue += revenue;

                if (cat) {
                    if (!teacherUsage[tId].categories[cat]) {
                        teacherUsage[tId].categories[cat] = { count: 0, duration: 0 };
                    }
                    teacherUsage[tId].categories[cat].count++;
                    teacherUsage[tId].categories[cat].duration += duration;
                }
            }
        });

        const monthlyTrend = months.map(m => {
            const mStart = startOfMonth(m);
            const mEnd = endOfMonth(m);
            const mEvents = filteredEvents.filter(e => {
                const d = new Date(e.event.date);
                return d >= mStart && d <= mEnd;
            });

            const categoryDurations: Record<string, number> = {};
            EQUIPMENT_CATEGORIES.forEach(cat => {
                categoryDurations[cat.id] = mEvents
                    .filter(e => e.packageData.categoryEquipment?.toLowerCase() === cat.id)
                    .reduce((sum, e) => sum + e.event.duration, 0);
            });

            return {
                label: format(m, "MMM"),
                date: m,
                duration: mEvents.reduce((sum, e) => sum + e.event.duration, 0),
                categoryDurations,
            };
        });

        const sortedTeachers = Object.entries(teacherUsage)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 10);

        return {
            totalDuration,
            totalEvents: filteredEvents.length,
            equipmentStats: EQUIPMENT_CATEGORIES.map(cat => ({
                ...cat,
                ...equipmentUsage[cat.id],
                percentage: totalDuration > 0 ? (equipmentUsage[cat.id].duration / totalDuration) * 100 : 0
            })).sort((a, b) => b.duration - a.duration),
            teacherStats: sortedTeachers,
            monthlyTrend,
            maxMonthlyDuration: Math.max(...monthlyTrend.map(t => t.duration), 1),
            totalLessons: filteredEvents.filter(e => !e.packageData.description?.toLowerCase().includes("rental")).length,
            totalRentals: filteredEvents.filter(e => e.packageData.description?.toLowerCase().includes("rental")).length,
        };
    }, [events, monthRange, status]);

    return (
        <div className="space-y-10 py-4 max-w-7xl mx-auto">
            {/* Control & Summary Header */}
            <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <MonthsPicker range={monthRange} onChange={setMonthRange} onMonthClick={() => setSelectedMonth(null)} />
                    </div>

                    <div className="flex items-center gap-8 pr-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Operational Hours
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
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Lessons vs Rentals</span>
                            <div className="flex items-center gap-2">
                                <Activity size={14} className="text-primary" />
                                <span className="text-xl font-black text-foreground tabular-nums">
                                    {highlights.totalLessons} / {highlights.totalRentals}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                        <div className="flex items-center gap-6">
                            {highlights.equipmentStats
                                .filter((s) => s.count > 0)
                                .map((stat) => (
                                    <div
                                        key={stat.id}
                                        className="flex items-center gap-3 bg-muted/20 px-4 py-2 rounded-xl border border-border/50"
                                        title={`${stat.name}: ${getHMDuration(stat.duration)} total`}
                                    >
                                        <stat.icon size={18} style={{ color: stat.color }} />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-foreground uppercase leading-none mb-1.5">{stat.name}</span>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1" title="Lesson Hours">
                                                    <HelmetIcon size={10} className="text-yellow-500" />
                                                    <span className="text-[9px] font-black text-foreground tabular-nums">
                                                        {Math.floor(stat.lessonDuration / 60)}h
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1" title="Rental Hours">
                                                    <HelmetIcon size={10} rental={true} />
                                                    <span className="text-[9px] font-black text-foreground tabular-nums">
                                                        {Math.floor(stat.rentalDuration / 60)}h
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                        
                        <div className="ml-auto">
                            <PackageEquipmentFilters />
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Analytics Grid */}
            <div className="flex flex-col xl:flex-row gap-8 items-stretch">
                {/* Usage Trend Line Chart */}
                <div className="w-full xl:flex-[2]">
                    <LineChartContainer 
                        title="Usage Intensity" 
                        subtitle="Operational hours trend by equipment category"
                        data={highlights.monthlyTrend}
                        maxVal={highlights.maxMonthlyDuration}
                        className="h-full"
                    />
                </div>

                {/* Right Column: Teacher Leaderboard */}
                <div className="w-full xl:flex-[1]">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 flex items-center gap-3 bg-muted/30 px-6 py-2.5 rounded-bl-[2rem] border-b border-l border-border/50 z-10">
                            <HeadsetIcon size={12} className="text-[#22c55e]" />
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-foreground">Instructor Usage</span>
                        </div>

                        <div className="pt-6 space-y-8">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Teacher Usage</h4>
                            {highlights.teacherStats.map((teacher, idx) => (
                                <div key={teacher.id} className="space-y-3 group">
                                    {/* Teacher Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-muted-foreground/40 w-4">0{idx + 1}</span>
                                            <div className="flex items-center gap-2">
                                                <HeadsetIcon size={14} className="text-[#22c55e]" />
                                                <span className="text-xs font-bold tracking-tight text-foreground hover:text-primary transition-colors cursor-pointer">
                                                    {teacher.username}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md border border-border/50" title="Total Events">
                                                <FlagIcon size={10} className="text-muted-foreground" />
                                                <span className="text-[10px] font-black text-foreground tabular-nums">
                                                    {teacher.count}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md border border-border/50" title="Total Duration">
                                                <Clock size={10} className="text-muted-foreground" />
                                                <span className="text-[10px] font-black text-foreground tabular-nums">
                                                    {getHMDuration(teacher.duration)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-md border border-border/50" title="Generated Revenue">
                                                <TrendingUp size={10} className="text-muted-foreground" />
                                                <span className="text-[10px] font-black text-foreground tabular-nums">
                                                    {getCompactNumber(teacher.revenue)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category Specific Badges */}
                                    <div className="flex flex-wrap gap-1.5 pl-7">
                                        {Object.entries(teacher.categories)
                                            .sort((a, b) => b[1].duration - a[1].duration)
                                            .map(([cat, stats]) => (
                                                <SportEquipmentDurationBadge 
                                                    key={cat}
                                                    category={cat}
                                                    count={stats.count}
                                                    durationMinutes={stats.duration}
                                                    useCategoryColor={true}
                                                    className="scale-90 origin-left"
                                                />
                                            ))}
                                    </div>

                                    {/* Taller Segmented Equipment Bar with Internal Labels */}
                                    <div className="pl-7 pr-2">
                                        <div className="flex h-6 w-full rounded-xl overflow-hidden bg-muted/20 border border-border/30">
                                            {Object.entries(teacher.categories)
                                                .sort((a, b) => b[1].duration - a[1].duration)
                                                .map(([catId, stats], idx, arr) => {
                                                    const config = EQUIPMENT_CATEGORIES.find((c) => c.id === catId);
                                                    const percentage = (stats.duration / teacher.duration) * 100;
                                                    if (percentage < 5) return null; // Hide internal labels for very small segments
                                                    const Icon = config?.icon || Activity;
                                                    
                                                    return (
                                                        <motion.div 
                                                            key={catId}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percentage}%` }}
                                                            className={`h-full flex items-center justify-center gap-1.5 px-1 ${idx < arr.length - 1 ? 'border-r border-background/20' : ''}`}
                                                            style={{ backgroundColor: config?.color }}
                                                            title={`${config?.name}: ${Math.round(percentage)}%`}
                                                        >
                                                            <div className="text-white/90">
                                                                <Icon size={12} />
                                                            </div>
                                                            <span className="text-[9px] font-black text-white/90 tabular-nums leading-none">
                                                                {Math.round(percentage)}%
                                                            </span>
                                                        </motion.div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Equipment Usage Table */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4 border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                        <Activity className="text-primary" size={20} />
                        <h3 className="text-lg font-black uppercase tracking-widest text-foreground">
                            Usage Log
                        </h3>
                    </div>
                </div>
                
                <EquipmentEventsTable events={events} />
            </div>
        </div>
    );
}

function LineChartContainer({ title, subtitle, data, maxVal, className = "" }: { title: string, subtitle: string, data: any[], maxVal: number, className?: string }) {
    const chartHeight = 350;
    const chartWidth = 700;
    const padding = 40;
    const leftPadding = 60;

    const getPoints = (getValue: (d: any) => number) => {
        if (data.length === 0) return "";
        const step = (chartWidth - padding - leftPadding) / Math.max(data.length - 1, 1);
        return data.map((d, i) => {
            const x = leftPadding + i * step;
            const y = chartHeight - padding - (getValue(d) / maxVal) * (chartHeight - padding * 2);
            return `${x},${y}`;
        }).join(" ");
    };

    const totalPoints = useMemo(() => getPoints(d => d.duration), [data, maxVal]);

    return (
        <div className={`bg-card border border-border rounded-[3rem] p-8 shadow-sm overflow-hidden relative ${className}`}>
            <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <TrendingUp className="text-primary" size={24} />
                        {title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
                </div>
                <div className="flex flex-wrap gap-4 justify-end max-w-[300px]">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-[10px] font-black uppercase text-muted-foreground">Total</span>
                    </div>
                    {EQUIPMENT_CATEGORIES.map(cat => (
                        <div key={cat.id} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="text-[10px] font-black uppercase text-muted-foreground">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative h-[350px] w-full">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                    {/* Y-axis values */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                        const val = Math.round((p * maxVal) / 60);
                        const y = chartHeight - padding - p * (chartHeight - padding * 2);
                        return (
                            <text 
                                key={`y-${i}`}
                                x={leftPadding - 10}
                                y={y + 4}
                                textAnchor="end"
                                className="text-[10px] font-bold fill-muted-foreground/60 tabular-nums"
                            >
                                {val}h
                            </text>
                        );
                    })}

                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                        <line 
                            key={i}
                            x1={leftPadding} 
                            y1={chartHeight - padding - p * (chartHeight - padding * 2)} 
                            x2={chartWidth - padding} 
                            y2={chartHeight - padding - p * (chartHeight - padding * 2)} 
                            stroke="currentColor" 
                            strokeWidth="1" 
                            className="text-border" 
                            strokeDasharray="4 4"
                        />
                    ))}

                    {/* Category Lines */}
                    {EQUIPMENT_CATEGORIES.map(cat => {
                        const points = getPoints(d => d.categoryDurations[cat.id] || 0);
                        if (!points) return null;
                        return (
                            <motion.polyline
                                key={cat.id}
                                fill="none"
                                stroke={cat.color}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={points}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.6 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                        );
                    })}

                    {/* Total Main Line */}
                    <motion.polyline
                        fill="none"
                        stroke="currentColor"
                        className="text-primary"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={totalPoints}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    />

                    {/* Data Points */}
                    {data.map((d, i) => {
                        const step = (chartWidth - padding - leftPadding) / Math.max(data.length - 1, 1);
                        const x = leftPadding + i * step;
                        const y = chartHeight - padding - (d.duration / maxVal) * (chartHeight - padding * 2);
                        return (
                            <g key={i} className="group cursor-pointer">
                                <circle 
                                    cx={x} 
                                    cy={y} 
                                    r="6" 
                                    className="fill-background stroke-primary stroke-2" 
                                />
                                <text 
                                    x={x} 
                                    y={chartHeight - padding + 20} 
                                    className="text-[10px] font-black fill-muted-foreground uppercase"
                                    textAnchor="middle"
                                >
                                    {d.label}
                                </text>
                                
                                <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <rect 
                                        x={x - 50} 
                                        y={y - 70} 
                                        width="100" 
                                        height="60" 
                                        rx="8" 
                                        className="fill-popover stroke-border shadow-xl" 
                                    />
                                    <text x={x} y={y - 50} className="text-[10px] font-black fill-primary" textAnchor="middle">
                                        Total: {Math.floor(d.duration / 60)}h
                                    </text>
                                    {EQUIPMENT_CATEGORIES.map((cat, catIdx) => (
                                        <text 
                                            key={cat.id} 
                                            x={x} 
                                            y={y - 35 + catIdx * 12} 
                                            className="text-[8px] font-bold" 
                                            style={{ fill: cat.color }} 
                                            textAnchor="middle"
                                        >
                                            {cat.name}: {Math.floor((d.categoryDurations[cat.id] || 0) / 60)}h
                                        </text>
                                    ))}
                                </g>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}