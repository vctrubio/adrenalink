"use client";

import { useMemo } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { MasterTable, type ColumnDef, type MobileColumnDef, type GroupingType, type GroupStats } from "../MasterTable";
import { StatItemUI } from "@/backend/data/StatsData";
import { type TeacherTableData } from "@/config/tables";
import { SportEquipmentDurationList } from "@/src/components/ui/badge/sport-equipment-duration";
import { BrandSizeCategoryList } from "@/src/components/ui/badge/brand-size-category";
import { ActiveTeacherLessonBadge } from "@/src/components/ui/badge/active-teacher-lesson";
import { TeacherActiveLesson } from "@/src/components/ui/badge/teacher-active-lesson";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import ReactCountryFlag from "react-country-flag";
import Link from "next/link";
import { COUNTRIES } from "@/config/countries";
import { Calendar } from "lucide-react";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";

import { filterTeachers } from "@/types/searching-entities";
import { useTableLogic } from "@/src/hooks/useTableLogic";
import { TableGroupHeader, TableMobileGroupHeader } from "@/src/components/tables/TableGroupHeader";
import { TableActions } from "../MasterTable";
import { AnimatePresence, motion } from "framer-motion";
import { useTablesController } from "../layout";

const HEADER_CLASSES = {
    yellow: "px-4 py-3 font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10",
    blue: "px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    green: "px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10",
    purple: "px-4 py-3 font-medium text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10",
    zinc: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    center: "px-4 py-3 font-medium text-center",
} as const;

export function TeachersTable({ teachers = [] }: { teachers: TeacherTableData[] }) {
    const { showActions } = useTablesController();
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;

    const { filteredRows: filteredTeachers, masterTableGroupBy } = useTableLogic({
        data: teachers,
        filterSearch: filterTeachers,
        filterStatus: (teacher, status) => {
            if (status === "Free") return teacher.stats.totalLessons === 0;
            if (status === "Ongoing") return teacher.lessons.some((l) => l.status === "active" || l.status === "rest");
            return true; // "All"
        },
    });

    // Transform rows based on grouping (Activity-based grouping)
    const displayRows = useMemo(() => {
        if (masterTableGroupBy === "all") return filteredTeachers;

        const activityRows: (TeacherTableData & { period: string; periodStats: any })[] = [];

        filteredTeachers.forEach((teacher) => {
            const periods: Record<
                string,
                { lessons: any[]; duration: number; commission: number; payments: number; categoryStats: any }
            > = {};

            teacher.lessons.forEach((lesson) => {
                const date = lesson.dateCreated || (teacher as any).createdAt;
                if (!date) return;

                const periodKey = getPeriodKey(date, masterTableGroupBy);
                if (!periods[periodKey]) {
                    periods[periodKey] = { lessons: [], duration: 0, commission: 0, payments: 0, categoryStats: {} };
                }

                periods[periodKey].lessons.push(lesson);
                periods[periodKey].duration += lesson.events.totalDuration;
                periods[periodKey].commission += parseFloat(lesson.commission.cph) * (lesson.events.totalDuration / 60);

                const cat = lesson.category;
                if (!periods[periodKey].categoryStats[cat]) {
                    periods[periodKey].categoryStats[cat] = { count: 0, duration: 0 };
                }
                periods[periodKey].categoryStats[cat].count += 1;
                periods[periodKey].categoryStats[cat].duration += lesson.events.totalDuration;
            });

            Object.entries(periods).forEach(([period, stats]) => {
                activityRows.push({
                    ...teacher,
                    period,
                    stats: {
                        ...teacher.stats,
                        totalLessons: stats.lessons.length,
                        totalDurationMinutes: stats.duration,
                        totalCommissions: stats.commission,
                        totalPayments: 0,
                    },
                    activityStats: Object.fromEntries(
                        Object.entries(stats.categoryStats).map(([cat, s]: [string, any]) => [
                            cat,
                            { count: s.count, durationMinutes: s.duration },
                        ]),
                    ),
                } as any);
            });
        });

        return activityRows;
    }, [filteredTeachers, masterTableGroupBy]);

    const getGroupKey = (row: any, groupBy: GroupingType) => {
        if (groupBy === "all") return "";
        return row.period || "";
    };

    const calculateStats = (groupRows: any[]): GroupStats => {
        return groupRows.reduce(
            (acc, curr) => {
                const newStats = {
                    teacherCount: acc.teacherCount + 1,
                    totalLessons: acc.totalLessons + curr.stats.totalLessons,
                    totalCommissions: acc.totalCommissions + curr.stats.totalCommissions,
                    totalPayments: acc.totalPayments + curr.stats.totalPayments,
                    categoryStats: { ...acc.categoryStats },
                };

                Object.entries(curr.activityStats).forEach(([category, stats]: [string, any]) => {
                    if (!newStats.categoryStats[category]) {
                        newStats.categoryStats[category] = { count: 0, durationMinutes: 0 };
                    }
                    newStats.categoryStats[category].count += stats.count;
                    newStats.categoryStats[category].durationMinutes += stats.durationMinutes;
                });

                return newStats;
            },
            {
                teacherCount: 0,
                totalLessons: 0,
                totalCommissions: 0,
                totalPayments: 0,
                categoryStats: {} as Record<string, { count: number; durationMinutes: number }>,
            },
        );
    };

    const GroupHeaderStats = ({ stats, hideLabel = false }: { stats: GroupStats; hideLabel?: boolean }) => (
        <>
            <StatItemUI type="teachers" value={stats.teacherCount} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="lessons" value={stats.totalLessons} hideLabel={hideLabel} iconColor={false} />

            {Object.entries(stats.categoryStats as Record<string, { count: number }>).map(([catId, stat]) => {
                const config = EQUIPMENT_CATEGORIES.find((c) => c.id === catId);
                const Icon = config?.icon || Calendar;

                return (
                    <div
                        key={catId}
                        className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity"
                        title={`${config?.label || catId} Events`}
                    >
                        <span className="text-muted-foreground">
                            <Icon size={12} />
                        </span>
                        <span className="tabular-nums text-xs font-bold text-foreground">{stat.count}</span>
                    </div>
                );
            })}

            <StatItemUI type="commission" value={stats.totalCommissions} hideLabel={hideLabel} variant="primary" iconColor={false} />
        </>
    );

    const renderGroupHeader = (title: string, stats: GroupStats, groupBy: GroupingType) => (
        <TableGroupHeader title={title} stats={stats} groupBy={groupBy}>
            <GroupHeaderStats stats={stats} />
        </TableGroupHeader>
    );

    const renderMobileGroupHeader = (title: string, stats: GroupStats, groupBy: GroupingType) => (
        <TableMobileGroupHeader title={title} stats={stats} groupBy={groupBy}>
            <GroupHeaderStats stats={stats} hideLabel />
        </TableMobileGroupHeader>
    );

    const desktopColumns: ColumnDef<TeacherTableData>[] = [
        {
            header: "Teacher Profile",
            headerClassName: HEADER_CLASSES.green,
            render: (data) => (
                <div className="flex flex-col gap-1 items-start">
                    <Link href={`${teacherEntity.link}/${data.id}`} className="flex items-center gap-2 group">
                        <HeadsetIcon
                            size={16}
                            className={data.active ? "text-emerald-500" : "text-muted-foreground/50"}
                            title={data.active ? "Active" : "Inactive"}
                        />
                        <span className="font-bold text-foreground text-sm normal-case group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
                            {data.username}
                        </span>
                    </Link>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-tight">
                        <div className="flex items-center" title={data.country}>
                            <ReactCountryFlag
                                countryCode={getCountryCode(data.country)}
                                svg
                                style={{ width: "1.2em", height: "1.2em" }}
                                                            />
                                                        </div>
                                                                                    {data.languages && data.languages.length > 0 && (
                                                                                        <div className="flex gap-1.5 overflow-hidden normal-case">
                                                                                            {data.languages.map((lang) => (
                                                                                                <span key={lang} className="truncate">
                                                                                                    {lang}
                                                                                                </span>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}                                                    </div>                </div>
            ),
        },
        {
            header: "Equipment",
            headerClassName: HEADER_CLASSES.purple,
            render: (data) => (
                <div className="flex flex-row flex-wrap gap-3 max-w-[300px]">
                    <BrandSizeCategoryList
                        equipments={data.equipments.map((e) => {
                            const config = EQUIPMENT_CATEGORIES.find((c) => c.id === e.category);
                            return {
                                id: e.id,
                                brand: e.brand,
                                model: e.model,
                                size: e.size,
                                icon: config?.icon,
                            };
                        })}
                        showIcon={true}
                    />
                </div>
            ),
        },
        {
            header: "Lessons",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => {
                const activeTeacherLessons = data.lessons.filter((l) => l.status === "active" || l.status === "rest");

                return (
                    <div className="flex flex-col gap-2">
                        {activeTeacherLessons.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pb-2 mb-1 border-b border-border/40 max-h-[150px] overflow-y-auto custom-scrollbar">
                                {activeTeacherLessons.map((l) => (
                                    <ActiveTeacherLessonBadge
                                        key={l.id}
                                        bookingId={l.bookingId}
                                        category={l.category}
                                        leaderName={l.leaderStudentName}
                                        capacity={l.capacityStudents}
                                        status={l.status}
                                        commission={l.commission}
                                    />
                                ))}
                            </div>
                        )}
                        <SportEquipmentDurationList stats={data.activityStats} />
                    </div>
                );
            },
        },
        {
            header: "Status",
            headerClassName: HEADER_CLASSES.zinc,
            render: (data) => (
                <div className="flex items-center justify-center min-w-[140px]">
                    <AnimatePresence mode="wait">
                        {showActions ? (
                            <motion.div
                                key="actions"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1.1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                            >
                                <TableActions id={data.id} type="teacher" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="status"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-5 scale-110"
                            >
                                <StatItemUI type="lessons" value={data.stats.totalLessons} iconColor={true} hideLabel={true} />
                                <StatItemUI type="duration" value={data.stats.totalDurationMinutes} iconColor={true} hideLabel={true} />
                                <StatItemUI type="commission" value={data.stats.totalCommissions} iconColor={true} hideLabel={true} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ),
        },
    ];

    const mobileColumns: MobileColumnDef<TeacherTableData>[] = [
// ... existing ...
        {
            label: "Status",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => {
                return (
                    <div className="scale-90 origin-right flex justify-end min-w-[100px]">
                        <AnimatePresence mode="wait">
                            {showActions ? (
                                <motion.div
                                    key="actions"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <TableActions id={data.id} type="teacher" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="status"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.15 }}
                                    className="flex flex-col items-end gap-2"
                                >
                                    <div className="flex gap-3">
                                        <StatItemUI type="lessons" value={data.stats.totalLessons} iconColor={true} hideLabel={true} />
                                        <StatItemUI type="duration" value={data.stats.totalDurationMinutes} iconColor={true} hideLabel={true} />
                                    </div>
                                    <StatItemUI type="commission" value={data.stats.totalCommissions} iconColor={true} hideLabel={true} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            },
        },
        {
            label: "Equipment",
            headerClassName: HEADER_CLASSES.purple,
            render: (data) => (
                <div className="scale-90 origin-right flex justify-end">
                    <BrandSizeCategoryList
                        equipments={data.equipments.map((e) => {
                            const config = EQUIPMENT_CATEGORIES.find((c) => c.id === e.category);
                            return {
                                id: e.id,
                                brand: e.brand,
                                model: e.model,
                                size: e.size,
                                icon: config?.icon,
                            };
                        })}
                        showIcon={true}
                    />
                </div>
            ),
        },
    ];

    return (
        <MasterTable
            rows={displayRows}
            columns={desktopColumns}
            mobileColumns={mobileColumns}
            groupBy={masterTableGroupBy}
            getGroupKey={getGroupKey}
            calculateStats={calculateStats}
            renderGroupHeader={renderGroupHeader}
            renderMobileGroupHeader={renderMobileGroupHeader}
            showGroupToggle={false}
            populateType="teacher"
        />
    );
}

// Helper to determine period key
function getPeriodKey(dateStr: string, groupBy: GroupingType) {
    const date = new Date(dateStr);
    if (groupBy === "week") {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        return `${date.getFullYear()}-W${weekNum}`;
    }
    if (groupBy === "month") {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    }
    return "";
}

function getCountryCode(countryName: string): string {
    const country = COUNTRIES.find(
        (c) => c.name.toLowerCase() === countryName.toLowerCase() || c.label.toLowerCase() === countryName.toLowerCase(),
    );
    return country?.code || "US";
}