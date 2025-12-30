"use client";

import { useState } from "react";
import { Check, TrendingUp, TrendingDown } from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { EquipmentStudentCapacityBadge } from "@/src/components/ui/badge";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { EquipmentStudentCommissionBadge } from "@/src/components/ui/badge/equipment-student-commission";
import { TeacherUsernameCommissionBadge } from "@/src/components/ui/badge/teacher-username-commission";
import { EVENT_STATUS_CONFIG, type EventStatus } from "@/types/status";
import { EventDurationTag } from "@/src/components/tags/EventDurationTag";
import { TeacherCommissionBadge } from "@/src/components/ui/badge/teacher-commission";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { TransactionEventData } from "@/types/transaction-event";
import TransactionEventModal from "@/src/components/modals/TransactionEventModal";

// --- Sub-components ---

function DesktopHeader() {
    return (
        <thead className="text-[10px] uppercase bg-muted/50 text-muted-foreground border-b border-border">
            <tr>
                <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Date</th>
                <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Time</th>
                <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Dur</th>
                <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Teacher</th>
                <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Student</th>
                <th className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">Loc</th>
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

function DateHeaderRow({ date }: { date: string }) {
    return (
        <tr className="bg-muted/20 border-y border-border/50">
            <td colSpan={13} className="px-4 py-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {new Date(date).toLocaleDateString(undefined, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })}
                </span>
            </td>
        </tr>
    );
}

function DesktopRow({ data }: { data: TransactionEventData }) {
    const { event, teacher, leaderStudentName, studentCount, packageData, financials } = data;
    const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
    const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const statusConfig = EVENT_STATUS_CONFIG[event.status as EventStatus];
    
    const EquipmentIcon = EQUIPMENT_CATEGORIES.find(c => c.id === packageData.categoryEquipment)?.icon;
    const pricePerHour = (packageData.durationMinutes / 60) > 0 ? packageData.pricePerStudent / (packageData.durationMinutes / 60) : 0;

    return (
        <tr className="hover:bg-muted/5 transition-colors">
            <td className="px-4 py-3 whitespace-nowrap tabular-nums text-blue-900/80 dark:text-blue-100/80 bg-blue-50/10 dark:bg-blue-900/5">{dateFormat.format(new Date(event.date))}</td>
            <td className="px-4 py-3 whitespace-nowrap tabular-nums text-blue-900/80 dark:text-blue-100/80 bg-blue-50/10 dark:bg-blue-900/5">{timeFormat.format(new Date(event.date))}</td>
            <td className="px-4 py-3 whitespace-nowrap tabular-nums text-blue-900/80 dark:text-blue-100/80 bg-blue-50/10 dark:bg-blue-900/5">{(event.duration / 60).toFixed(1)}h</td>
            <td className="px-4 py-3 whitespace-nowrap font-medium text-blue-900/80 dark:text-blue-100/80 bg-blue-50/10 dark:bg-blue-900/5">{teacher.username}</td>
            <td className="px-4 py-3 whitespace-nowrap text-blue-900/80 dark:text-blue-100/80 bg-blue-50/10 dark:bg-blue-900/5">
                <span className="font-medium">{leaderStudentName}</span>
                {studentCount > 1 && <span className="text-xs text-muted-foreground ml-1">+{studentCount - 1}</span>}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-blue-900/80 dark:text-blue-100/80 bg-blue-50/10 dark:bg-blue-900/5">{event.location || "-"}</td>
            <td className="px-4 py-3 whitespace-nowrap max-w-[150px] truncate text-orange-900/80 dark:text-orange-100/80 bg-orange-50/10 dark:bg-orange-900/5">{packageData.description}</td>
            <td className="px-4 py-3 whitespace-nowrap tabular-nums text-orange-900/80 dark:text-orange-100/80 bg-orange-50/10 dark:bg-orange-900/5">{pricePerHour.toFixed(0)} {financials.currency}</td>
            <td className="px-4 py-3 whitespace-nowrap bg-orange-50/10 dark:bg-orange-900/5">
                {EquipmentIcon && <EquipmentStudentCapacityBadge categoryIcon={EquipmentIcon} equipmentCapacity={packageData.capacityEquipment} studentCapacity={packageData.capacityStudents} />}
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-right tabular-nums font-medium text-zinc-900/80 dark:text-zinc-100/80 bg-zinc-50/10 dark:bg-zinc-900/5">{financials.teacherEarnings.toFixed(0)} {financials.currency}</td>
            <td className="px-4 py-3 whitespace-nowrap text-right tabular-nums font-medium text-zinc-900/80 dark:text-zinc-100/80 bg-zinc-50/10 dark:bg-zinc-900/5">{financials.studentRevenue.toFixed(0)} {financials.currency}</td>
            <td className="px-4 py-3 whitespace-nowrap text-right tabular-nums font-bold text-emerald-600 dark:text-emerald-400 bg-zinc-50/10 dark:bg-zinc-900/5">{financials.profit.toFixed(0)} {financials.currency}</td>
            <td className="px-4 py-3 text-center">
                {statusConfig && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tight" style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}>
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
        <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
            <tr>
                <th className="px-3 py-2 font-medium w-[30%]">Event</th>
                <th className="px-3 py-2 font-medium w-[25%]">Teacher</th>
                <th className="px-3 py-2 font-medium w-[30%] text-center">Package</th>
                <th className="px-3 py-2 font-medium w-[15%] text-right">Profit</th>
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
            <tr 
                className="hover:bg-muted/5 transition-colors cursor-pointer active:bg-muted/10"
                onClick={() => setIsModalOpen(true)}
            >
                <td className="px-3 py-3 align-middle">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-xs font-bold text-muted-foreground">{new Date(event.date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })}</span>
                        <span className="text-sm font-bold text-foreground">{timeFormat.format(new Date(event.date))}</span>
                        <span className="text-xs font-bold text-foreground">+{(event.duration / 60).toFixed(1)}h</span>
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
                    <div className="inline-flex">
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
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-tight" style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}>
                            {financials.profit >= 0 ? <TrendingUp size={12} strokeWidth={3} className="shrink-0" /> : <TrendingDown size={12} strokeWidth={3} className="shrink-0" />}
                            {Math.abs(financials.profit).toFixed(0)}
                        </div>
                    )}
                </td>
            </tr>

            <TransactionEventModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={data}
            />
        </>
    );
}

// --- Main component ---

export function TransactionEventsTable({ events = [], groupByDate = false }: { events: TransactionEventData[]; groupByDate?: boolean }) {
    const renderedRows = () => {
        if (!events || events.length === 0) return null;
        
        if (!groupByDate) {
            return events.map((event) => <DesktopRow key={event.event.id} data={event} />);
        }

        const groups: Record<string, TransactionEventData[]> = {};
        events.forEach((e) => {
            const dateKey = e.event.date.split("T")[0];
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(e);
        });

        return Object.entries(groups)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([date, groupEvents]) => (
                <tbody key={date} className="divide-y divide-border">
                    <DateHeaderRow date={date} />
                    {groupEvents.map((event) => (
                        <DesktopRow key={event.event.id} data={event} />
                    ))}
                </tbody>
            ));
    };

    const renderedMobileRows = () => {
        if (!events || events.length === 0) return null;

        if (!groupByDate) {
            return events.map((event) => <MobileRow key={event.event.id} data={event} />);
        }

        const groups: Record<string, TransactionEventData[]> = {};
        events.forEach((e) => {
            const dateKey = e.event.date.split("T")[0];
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(e);
        });

        return Object.entries(groups)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([date, groupEvents]) => (
                <tbody key={date} className="divide-y divide-border">
                    <tr className="bg-muted/20">
                        <td colSpan={4} className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </td>
                    </tr>
                    {groupEvents.map((event) => (
                        <MobileRow key={event.event.id} data={event} />
                    ))}
                </tbody>
            ));
    };

    return (
        <div className="w-full rounded-xl border border-border shadow-sm bg-card overflow-hidden">
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <DesktopHeader />
                    {groupByDate ? renderedRows() : <tbody className="divide-y divide-border">{renderedRows()}</tbody>}
                </table>
            </div>
            <div className="sm:hidden">
                <table className="w-full text-sm text-left border-collapse">
                    <MobileHeader />
                    {groupByDate ? renderedMobileRows() : <tbody className="divide-y divide-border">{renderedMobileRows()}</tbody>}
                </table>
            </div>
        </div>
    );
}
