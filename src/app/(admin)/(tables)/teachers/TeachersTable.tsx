"use client";

import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { COUNTRIES } from "@/config/countries";
import { MasterTable, type ColumnDef, type MobileColumnDef, type GroupStats, type GroupingType } from "../MasterTable";
import { TeacherStatusLabel } from "@/src/components/labels/TeacherStatusLabel";
import { BrandSizeCategoryList } from "@/src/components/ui/badge/brand-size-category";
import { TeacherStatusBadge } from "@/src/components/ui/badge";
import { SportActivityList } from "@/src/components/ui/badge/sport-activity";
import { getHMDuration } from "@/getters/duration-getter";
import type { TeacherTableData } from "@/supabase/server/teachers";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import ReactCountryFlag from "react-country-flag";
import { TrendingUp, TrendingDown, Check } from "lucide-react";

const HEADER_CLASSES = {
    yellow: "px-4 py-3 font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10",
    blue: "px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    green: "px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10",
    purple: "px-4 py-3 font-medium text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10",
    zinc: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    center: "px-4 py-3 font-medium text-center",
} as const;

export function TeachersTable({ teachers = [] }: { teachers: TeacherTableData[] }) {
    const desktopColumns: ColumnDef<TeacherTableData>[] = [
        {
            header: "Teacher Profile",
            headerClassName: HEADER_CLASSES.green,
            render: (data) => (
                <div className="flex flex-col gap-1.5 items-start">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-foreground whitespace-nowrap">{data.firstName} {data.lastName}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1" title={data.country}>
                                <ReactCountryFlag countryCode={getCountryCode(data.country)} svg style={{ width: '1em', height: '1em' }} />
                                <span>{data.country}</span>
                            </div>
                            <span>•</span>
                            <span className="truncate max-w-[150px]">{data.languages.join(", ")}</span>
                        </div>
                    </div>
                    <TeacherStatusLabel 
                        teacherId={data.id} 
                        isActive={data.active} 
                    />
                </div>
            ),
        },
        {
            header: "Status",
            headerClassName: HEADER_CLASSES.zinc,
            render: (data) => (
                <TeacherStatusBadge 
                    totalLessons={data.lessonStats.totalLessons} 
                    plannedLessons={data.lessonStats.plannedLessons} 
                />
            ),
        },
        {
            header: "Activity",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => <SportActivityList stats={data.activityStats} />,
        },
        {
            header: "Financials",
            headerClassName: HEADER_CLASSES.zinc,
            render: (data) => {
                const earned = data.financialStats.totalCommissions;
                const paid = data.financialStats.totalPayments;
                const balance = earned - paid;
                const isSettled = Math.abs(balance) < 1;

                return (
                    <div className="flex items-center gap-4 text-xs font-bold tabular-nums">
                        <div className="flex items-center gap-1.5" title="Total Earned (Commissions)">
                            <HandshakeIcon size={14} className="text-muted-foreground/40" />
                            <span className="text-foreground">{earned.toFixed(0)}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Total Paid">
                            <TrendingUp size={14} className="text-muted-foreground/40" />
                            <span className="text-foreground">{paid.toFixed(0)}</span>
                        </div>
                        {!isSettled && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600">
                                <TrendingDown size={12} />
                                <span>{balance.toFixed(0)} due</span>
                            </div>
                        )}
                        {isSettled && earned > 0 && (
                            <div className="text-emerald-600 flex items-center gap-1">
                                <Check size={12} strokeWidth={3} />
                                <span className="text-[10px] uppercase font-black">Settled</span>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            header: "Assigned Gear",
            headerClassName: HEADER_CLASSES.purple,
            render: (data) => (
                <BrandSizeCategoryList 
                    equipments={data.equipments.map(e => {
                        const config = EQUIPMENT_CATEGORIES.find(c => c.id === e.category);
                        return {
                            id: e.id,
                            brand: e.brand,
                            model: e.model,
                            size: e.size,
                            icon: config?.icon
                        };
                    })}
                    showIcon={true}
                />
            ),
        },
    ];

    const mobileColumns: MobileColumnDef<TeacherTableData>[] = [
        {
            label: "Teacher",
            render: (data) => (
                <div className="flex flex-col gap-1">
                    <div className="font-bold text-sm">{data.firstName} {data.lastName}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ReactCountryFlag countryCode={getCountryCode(data.country)} svg style={{ width: '1em', height: '1em' }} />
                        <span>{data.country}</span>
                    </div>
                    <TeacherStatusLabel 
                        teacherId={data.id} 
                        isActive={data.active} 
                    />
                </div>
            ),
        },
        {
            label: "Stats",
            render: (data) => {
                const stats = Object.values(data.activityStats).reduce(
                    (acc, curr) => ({
                        count: acc.count + curr.count,
                        durationMinutes: acc.durationMinutes + curr.durationMinutes,
                    }),
                    { count: 0, durationMinutes: 0 }
                );
                
                return (
                    <div className="flex flex-col gap-1 text-[10px] font-bold">
                        <div className="flex items-center gap-1">
                            <FlagIcon size={10} />
                            <span>{stats.count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <DurationIcon size={10} />
                            <span>{(stats.durationMinutes / 60).toFixed(1)}h</span>
                        </div>
                    </div>
                );
            },
        },
        {
            label: "Balance",
            render: (data) => {
                const balance = data.financialStats.totalCommissions - data.financialStats.totalPayments;
                return (
                    <span className={`text-xs font-black ${balance > 1 ? "text-rose-600" : "text-emerald-600"}`}>
                        {balance > 1 ? balance.toFixed(0) : "Paid"}
                    </span>
                );
            },
        },
    ];

    return (
        <MasterTable
            rows={teachers}
            columns={desktopColumns}
            mobileColumns={mobileColumns}
            groupBy="all"
            showGroupToggle={false}
        />
    );
}

// Helper to attempt mapping country name to code (simple fallback)
function getCountryCode(countryName: string): string {
    const country = COUNTRIES.find(c => c.name.toLowerCase() === countryName.toLowerCase() || c.label.toLowerCase() === countryName.toLowerCase());
    return country?.code || "US";
}