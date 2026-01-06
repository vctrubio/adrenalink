"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Activity, TrendingUp } from "lucide-react";
import { TransactionEventsTable } from "@/src/app/(admin)/(tables)/TransactionEventsTable";
import type { TransactionEventData } from "@/types/transaction-event";
import { getHMDuration } from "@/getters/duration-getter";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";

interface HomeActivityProps {
    events: TransactionEventData[];
}

function Heatmap({ data, onDateSelect, selectedDate }: { data: Record<string, { count: number; profit: number; duration: number; studentCount: number }>; onDateSelect: (d: string) => void; selectedDate: string | null }) {
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
                                        <button key={day.date} onClick={() => onDateSelect(day.date)} className={`w-2.5 h-2.5 rounded-sm transition-all relative group ${intensityColors[day.intensity]} ${selectedDate === day.date ? "ring-2 ring-primary ring-offset-2" : ""}`}>
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

export function HomeActivity({ events }: HomeActivityProps) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const dateStats = useMemo(() => {
        const stats: Record<string, { count: number; profit: number; duration: number; studentCount: number }> = {};
        events.forEach((e) => {
            const d = e.event.date.split("T")[0];
            if (!stats[d]) stats[d] = { count: 0, profit: 0, duration: 0, studentCount: 0 };
            stats[d].count += 1;
            stats[d].profit += e.financials.profit;
            stats[d].duration += e.event.duration;
            stats[d].studentCount += e.studentCount;
        });
        return stats;
    }, [events]);

    const filteredEvents = useMemo(() => {
        if (!selectedDate) return [];
        return events.filter((e) => e.event.date.startsWith(selectedDate));
    }, [events, selectedDate]);

    return (
        <div className="space-y-8">
            <Heatmap data={dateStats} onDateSelect={setSelectedDate} selectedDate={selectedDate} />

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
