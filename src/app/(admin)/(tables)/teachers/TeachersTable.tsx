"use client";

import { ENTITY_DATA } from "@/config/entities";
import { MasterTable, type ColumnDef, type MobileColumnDef } from "../MasterTable";
import { TeacherStatusBadge } from "@/src/components/ui/badge";
import { StatItemUI } from "@/backend/data/StatsData";
import { type TeacherTableData } from "@/config/tables";
import { SportEquipmentDurationList } from "@/src/components/ui/badge/sport-equipment-duration";
import { BrandSizeCategoryList } from "@/src/components/ui/badge/brand-size-category";
import { ActiveTeacherLessonBadge } from "@/src/components/ui/badge/active-teacher-lesson";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import ReactCountryFlag from "react-country-flag";
import Link from "next/link";
import { COUNTRIES } from "@/config/countries";

import { filterTeachers } from "@/types/searching-entities";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";

const HEADER_CLASSES = {
    yellow: "px-4 py-3 font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10",
    blue: "px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    green: "px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10",
    purple: "px-4 py-3 font-medium text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10",
    zinc: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    center: "px-4 py-3 font-medium text-center",
} as const;

export function TeachersTable({ teachers = [] }: { teachers: TeacherTableData[] }) {
    const { search } = useTablesController();
    const teacherEntity = ENTITY_DATA.find(e => e.id === "teacher")!;

    // Filter teachers
    const filteredTeachers = filterTeachers(teachers, search);

    const desktopColumns: ColumnDef<TeacherTableData>[] = [
        {
            header: "Teacher Profile",
            headerClassName: HEADER_CLASSES.green,
            render: (data) => (
                <div className="flex flex-col gap-1 items-start">
                    <Link 
                        href={`${teacherEntity.link}/${data.id}`}
                        className="flex items-center gap-2 group"
                    >
                        <span className="font-bold text-foreground text-sm normal-case group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">{data.firstName} {data.lastName}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${data.active ? "bg-emerald-500" : "bg-muted-foreground/30"}`} title={data.active ? "Active" : "Inactive"} />
                    </Link>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-tight">
                        <div className="flex items-center" title={data.country}>
                            <ReactCountryFlag countryCode={getCountryCode(data.country)} svg style={{ width: '1.2em', height: '1.2em' }} />
                        </div>
                        <span className="opacity-20 text-foreground">|</span>
                        <span className="tabular-nums">{data.phone}</span>
                        <span className="opacity-20 text-foreground">|</span>
                        <span className="tabular-nums">@{data.username}</span>
                    </div>
                </div>
            ),
        },
        {
            header: "Lessons",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => {
                const activeTeacherLessons = data.lessons.filter(l => l.status === "active" || l.status === "rest");
                
                return (
                    <div className="flex flex-col gap-2">
                        {activeTeacherLessons.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pb-2 mb-1 border-b border-border/40 max-h-[150px] overflow-y-auto custom-scrollbar">
                                {activeTeacherLessons.map(l => (
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
            header: "Equipment",
            headerClassName: HEADER_CLASSES.purple,
            render: (data) => (
                <div className="flex flex-row flex-wrap gap-3 max-w-[300px]">
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
                </div>
            ),
        },
        {
            header: "Stats",
            headerClassName: HEADER_CLASSES.zinc,
            render: (data) => (
                <div className="flex items-center gap-4">
                    <StatItemUI type="lessons" value={data.stats.totalLessons} iconColor={true} />
                    <StatItemUI type="duration" value={data.stats.totalDurationMinutes} iconColor={true} />
                    <StatItemUI type="commission" value={data.stats.totalCommissions.toFixed(0)} iconColor={true} />
                    <StatItemUI type="teacherPayments" value={data.stats.totalPayments.toFixed(0)} labelOverride="Paid" iconColor={true} />
                </div>
            ),
        },
    ];

    const mobileColumns: MobileColumnDef<TeacherTableData>[] = [
        {
            label: "Teacher",
            headerClassName: HEADER_CLASSES.green,
            render: (data) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${data.active ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                        <div className="font-bold text-sm">{data.firstName} {data.lastName}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-black uppercase">
                        <ReactCountryFlag countryCode={getCountryCode(data.country)} svg style={{ width: '1em', height: '1em' }} />
                        <span className="opacity-20 text-foreground">|</span>
                        <span>@{data.username}</span>
                    </div>
                </div>
            ),
        },
        {
            label: "Activity",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => {
                const activeTeacherLessons = data.lessons.filter(l => l.status === "active" || l.status === "rest");
                
                if (activeTeacherLessons.length > 0) {
                    return (
                        <div className="flex flex-col gap-1.5 scale-90 origin-right items-end max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                            {activeTeacherLessons.map(l => (
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
                    );
                }

                return (
                    <div className="flex flex-row flex-wrap gap-2 scale-90 origin-right justify-end max-w-[120px]">
                        <StatItemUI type="lessons" value={data.stats.totalLessons} iconColor={true} />
                        <StatItemUI type="duration" value={data.stats.totalDurationMinutes} iconColor={true} />
                        <StatItemUI type="commission" value={data.stats.totalCommissions.toFixed(0)} iconColor={true} />
                        <StatItemUI type="teacherPayments" value={data.stats.totalPayments.toFixed(0)} iconColor={true} />
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
                </div>
            ),
        },
    ];

    return (
        <MasterTable
            rows={filteredTeachers}
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
