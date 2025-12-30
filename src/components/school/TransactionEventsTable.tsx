"use client";

import { useState, useMemo } from "react";
import { Check, TrendingUp, TrendingDown, Calendar, Clock, Handshake, Receipt, Activity } from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EquipmentStudentCapacityBadge } from "@/src/components/ui/badge";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { TeacherUsernameCommissionBadge } from "@/src/components/ui/badge/teacher-username-commission";
import { EVENT_STATUS_CONFIG, type EventStatus } from "@/types/status";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { TransactionEventData } from "@/types/transaction-event";
import TransactionEventModal from "@/src/components/modals/TransactionEventModal";
import { getHMDuration } from "@/getters/duration-getter";

// --- Types & Helpers ---

export type GroupingType = "none" | "date" | "week";

interface GroupStats {
    totalDuration: number;
    eventCount: number;
    completedCount: number;
    studentCount: number;
    totalCommissions: number;
    totalRevenue: number;
    totalProfit: number;
    currency: string;
}

function calculateGroupStats(events: TransactionEventData[]): GroupStats {
    return events.reduce(
        (acc, curr) => ({
            totalDuration: acc.totalDuration + curr.event.duration,
            eventCount: acc.eventCount + 1,
            completedCount: acc.completedCount + (curr.event.status === "completed" ? 1 : 0),
            studentCount: acc.studentCount + curr.studentCount,
            totalCommissions: acc.totalCommissions + curr.financials.teacherEarnings,
            totalRevenue: acc.totalRevenue + curr.financials.studentRevenue,
            totalProfit: acc.totalProfit + curr.financials.profit,
            currency: curr.financials.currency,
        }),
        { totalDuration: 0, eventCount: 0, completedCount: 0, studentCount: 0, totalCommissions: 0, totalRevenue: 0, totalProfit: 0, currency: "" },
    );
}

function getWeekKey(dateStr: string) {
    const date = new Date(dateStr);
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${weekNum}`;
}

// --- Sub-components ---

function DesktopHeader() {
    return (
        <thead className="text-[10px] uppercase bg-muted/50 text-muted-foreground border-b border-border">
            <tr>
                <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Date</th>
                <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Time</th>
                <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Dur</th>
                <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Loc</th>
                <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Teacher</th>
                <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Student</th>
                <th className="px-4 py-3 font-medium text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10">Package</th>
                <th className="px-4 py-3 font-medium text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10">PPH</th>
                <th className="px-4 py-3 font-medium text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10">Equip</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 text-right">Comm.</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 text-right">Rev.</th>
                <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10 text-right font-bold">Profit</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
            </tr>
        </thead>
    );
}

function GroupHeaderRow({ title, stats }: { title: string; stats: GroupStats }) {
    return (
        <tr className="bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent border-y border-primary/10">
            <td colSpan={13} className="px-4 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Calendar size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-black text-foreground uppercase tracking-tight">{title}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <StatItem icon={HelmetIcon} label="Students" value={stats.studentCount} />
                        <StatItem icon={FlagIcon} label="Lessons" value={`${stats.completedCount}/${stats.eventCount}`} />
                        <StatItem icon={Clock} label="Duration" value={getHMDuration(stats.totalDuration)} />
                        <StatItem icon={Handshake} label="Comm." value={`${stats.totalCommissions.toFixed(0)} ${stats.currency}`} />
                        <StatItem icon={Receipt} label="Revenue" value={`${stats.totalRevenue.toFixed(0)} ${stats.currency}`} />
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                            <Activity size={12} className="text-emerald-600" strokeWidth={3} />
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Profit:</span>
                            <span className="text-xs font-black text-emerald-700">
                                {stats.totalProfit.toFixed(0)} {stats.currency}
                            </span>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    );
}

function StatItem({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
    return (
        <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
            <Icon size={12} className="text-muted-foreground" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}:</span>
            <span className="text-xs font-bold text-foreground tabular-nums">{value}</span>
        </div>
    );
}

function DesktopRow({ data }: { data: TransactionEventData }) {
    const { event, teacher, leaderStudentName, studentCount, packageData, financials } = data;
    const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const statusConfig = EVENT_STATUS_CONFIG[event.status as EventStatus];

    const EquipmentIcon = EQUIPMENT_CATEGORIES.find((c) => c.id === packageData.categoryEquipment)?.icon;
    const pricePerHour = packageData.durationMinutes / 60 > 0 ? packageData.pricePerStudent / (packageData.durationMinutes / 60) : 0;

    return (
        <tr className="hover:bg-muted/5 transition-colors border-b border-border/40 last:border-0 group/row">
            <td className="px-4 py-3 whitespace-nowrap tabular-nums text-blue-900/60 dark:text-blue-100/60 bg-blue-50/[0.03] dark:bg-blue-900/[0.02]">{dateFormat.format(new Date(event.date))}</td>
            <td className="px-4 py-3 whitespace-nowrap tabular-nums text-blue-900/80 dark:text-blue-100/80 bg-blue-50/[0.03] dark:bg-blue-900/[0.02] font-medium">{timeFormat.format(new Date(event.date))}</td>
            <td className="px-4 py-3 whitespace-nowrap tabular-nums text-blue-900/80 dark:text-blue-100/80 bg-blue-50/[0.03] dark:bg-blue-900/[0.02]">{(event.duration / 60).toFixed(1)}h</td>
            <td className="px-4 py-3 whitespace-nowrap text-muted-foreground bg-blue-50/[0.03] dark:bg-blue-900/[0.02] text-xs">{event.location || "-"}</td>
            <td className="px-4 py-3 whitespace-nowrap font-bold text-blue-600 dark:text-blue-400 bg-blue-50/[0.03] dark:bg-blue-900/[0.02]">{teacher.username}</td>
            <td className="px-4 py-3 whitespace-nowrap text-foreground bg-blue-50/[0.03] dark:bg-blue-900/[0.02]">
                <span className="font-semibold">{leaderStudentName}</span>
                {studentCount > 1 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground ml-1.5">+{studentCount - 1}</span>}
            </td>
            <td className="px-4 py-3 whitespace-nowrap max-w-[150px] truncate text-orange-900/80 dark:text-orange-100/80 bg-orange-50/[0.03] dark:bg-orange-900/[0.02] font-medium italic">{packageData.description}</td>
            <td className="px-4 py-3 whitespace-nowrap tabular-nums text-orange-900/80 dark:text-orange-100/80 bg-orange-50/[0.03] dark:bg-orange-900/[0.02] font-bold">
                {pricePerHour.toFixed(0)} <span className="text-[10px] font-normal">{financials.currency}</span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap bg-orange-50/[0.03] dark:bg-orange-900/[0.02]">
                {EquipmentIcon && <EquipmentStudentCapacityBadge categoryIcon={EquipmentIcon} equipmentCapacity={packageData.capacityEquipment} studentCapacity={packageData.capacityStudents} />}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-right tabular-nums font-medium text-zinc-900/80 dark:text-zinc-100/80 bg-zinc-50/[0.03] dark:bg-zinc-900/[0.02]">{financials.teacherEarnings.toFixed(0)}</td>
            <td className="px-4 py-3 whitespace-nowrap text-right tabular-nums font-medium text-zinc-900/80 dark:text-zinc-100/80 bg-zinc-50/[0.03] dark:bg-zinc-900/[0.02]">{financials.studentRevenue.toFixed(0)}</td>
            <td className="px-4 py-3 whitespace-nowrap text-right tabular-nums font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.02]">{financials.profit.toFixed(0)}</td>
            <td className="px-4 py-3 text-center">
                {statusConfig && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter" style={{ backgroundColor: `${statusConfig.color}15`, color: statusConfig.color }}>
                        {event.status === "completed" && <Check size={10} strokeWidth={4} />}
                        {statusConfig.label}
                    </div>
                )}
            </td>
        </tr>
    );
}

function MobileHeader() {
    return (
        <thead className="text-[10px] uppercase bg-muted/50 text-muted-foreground border-b border-border">
            <tr>
                <th className="px-3 py-2 font-black w-[30%]">Event</th>
                <th className="px-3 py-2 font-black w-[25%]">Teacher</th>
                <th className="px-3 py-2 font-black w-[30%] text-center">Package</th>
                <th className="px-3 py-2 font-black w-[15%] text-right">Profit</th>
            </tr>
        </thead>
    );
}

function MobileRow({ data }: { data: TransactionEventData }) {
    const { event, teacher, packageData, financials } = data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const statusConfig = EVENT_STATUS_CONFIG[event.status as EventStatus];

    return (
        <>
            <tr className="hover:bg-muted/5 transition-colors cursor-pointer active:bg-muted/10 border-b border-border/40" onClick={() => setIsModalOpen(true)}>
                <td className="px-3 py-3 align-middle">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-muted-foreground/60">{new Date(event.date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })}</span>
                            <span className="text-sm font-black text-foreground">{timeFormat.format(new Date(event.date))}</span>
                        </div>
                        <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">+{(event.duration / 60).toFixed(1)}h</span>
                    </div>
                </td>
                <td className="px-3 py-3 align-middle">
                    <TeacherUsernameCommissionBadge
                        teacherIcon={HeadsetIcon}
                        teacherUsername={teacher.username}
                        teacherColor="#22c55e"
                        commissionValue={financials.commissionValue.toString()}
                        commissionType={financials.commissionType}
                        currency={financials.currency}
                        showCurrency={false}
                    />
                </td>
                <td className="px-3 py-3 align-middle text-center">
                    <div className="inline-flex scale-90 origin-center">
                        <EquipmentStudentPackagePriceBadge
                            categoryEquipment={packageData.categoryEquipment}
                            equipmentCapacity={packageData.capacityEquipment}
                            studentCapacity={packageData.capacityStudents}
                            packageDurationHours={packageData.durationMinutes / 60}
                            pricePerHour={packageData.pricePerStudent / (packageData.durationMinutes / 60)}
                        />
                    </div>
                </td>
                <td className="px-3 py-3 align-middle text-right">
                    {statusConfig && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black uppercase tracking-tighter" style={{ backgroundColor: `${statusConfig.color}15`, color: statusConfig.color }}>
                            {financials.profit >= 0 ? <TrendingUp size={12} strokeWidth={4} className="shrink-0" /> : <TrendingDown size={12} strokeWidth={4} className="shrink-0" />}
                            {Math.abs(financials.profit).toFixed(0)}
                        </div>
                    )}
                </td>
            </tr>

            <TransactionEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={data} />
        </>
    );
}

// --- Main component ---

export function TransactionEventsTable({ events = [], groupBy = "none" }: { events: TransactionEventData[]; groupBy?: GroupingType }) {
    const groupedData = useMemo(() => {
        if (!events || events.length === 0) return null;
        if (groupBy === "none") return { "All Transactions": events };

        const groups: Record<string, TransactionEventData[]> = {};
        events.forEach((e) => {
            let key = "";
            const date = new Date(e.event.date);

            if (groupBy === "date") {
                key = e.event.date.split("T")[0];
            } else if (groupBy === "week") {
                key = getWeekKey(e.event.date);
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(e);
        });

        return groups;
    }, [events, groupBy]);

    if (!groupedData) return null;

    const sortedGroupEntries = Object.entries(groupedData).sort((a, b) => b[0].localeCompare(a[0]));

    return (
        <div className="w-full rounded-2xl border border-border shadow-md bg-card overflow-hidden">
            {/* Desktop View */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <DesktopHeader />
                    {sortedGroupEntries.map(([title, groupEvents]) => {
                        const stats = calculateGroupStats(groupEvents);
                        const displayTitle =
                            groupBy === "date" ? new Date(title).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short", year: "numeric" }) : groupBy === "week" ? `Week ${title.split("-W")[1]} of ${title.split("-W")[0]}` : title;

                        return (
                            <tbody key={title} className="divide-y divide-border">
                                {groupBy !== "none" && <GroupHeaderRow title={displayTitle} stats={stats} />}
                                {groupEvents.map((event) => (
                                    <DesktopRow key={event.event.id} data={event} />
                                ))}
                            </tbody>
                        );
                    })}
                </table>
            </div>

            {/* Mobile View */}
            <div className="sm:hidden">
                <table className="w-full text-sm text-left border-collapse">
                    <MobileHeader />
                    {sortedGroupEntries.map(([title, groupEvents]) => {
                        const stats = calculateGroupStats(groupEvents);
                        const displayTitle = groupBy === "date" ? new Date(title).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : title;

                        return (
                            <tbody key={title} className="divide-y divide-border">
                                {groupBy !== "none" && (
                                    <tr className="bg-primary/[0.03]">
                                        <td colSpan={4} className="px-3 py-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{displayTitle}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-muted-foreground">{stats.eventCount} evt</span>
                                                    <span className="text-[10px] font-black text-emerald-600">+{stats.totalProfit.toFixed(0)}</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {groupEvents.map((event) => (
                                    <MobileRow key={event.event.id} data={event} />
                                ))}
                            </tbody>
                        );
                    })}
                </table>
            </div>
        </div>
    );
}
