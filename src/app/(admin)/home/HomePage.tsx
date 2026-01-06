"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Grid3X3 } from "lucide-react";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";
import { HomeHeader } from "./HomeHeader";
import { HomeViewHeader } from "./HomeViewHeader";
import { HomeViewToggle } from "./HomeViewToggle";
import { HomeGrouped } from "./HomeGrouped";
import { HomeTable } from "./HomeTable";
import { HomeActivity } from "./HomeActivity";
import { getHomeStats, getGroupedEvents, getAllTransactionEvents } from "./getters";

export type ViewMode = "grouped" | "table" | "calendar";

export interface HomeTransactionEvent {
    id: string;
    date: string;
    lessonId: string;
    location: string | null;
    duration: number;
    status: string;
    teacherUsername: string;
    packageName: string;
    leaderStudentName: string;
    categoryEquipment: string;
    capacityEquipment: number;
    capacityStudents: number;
    packageDurationMinutes: number;
    pricePerStudent: number;
}

export interface DateGroup {
    date: string;
    events: HomeTransactionEvent[];
}

export interface HomeStats {
    duration: number;
    commissions: number;
    profit: number;
    events: number;
}

const VIEW_CONFIG = {
    grouped: {
        title: "All Lessons",
        subtitle: "Visible by date",
        icon: LayoutGrid,
    },
    table: {
        title: "A Nicer Looking Table",
        subtitle: "With full transaction details",
        icon: List,
    },
    calendar: {
        title: "Lesson Activity",
        subtitle: "Your History at a glance",
        icon: Grid3X3,
    },
};

export function HomePage({ classboardData }: { classboardData: ClassboardModel }) {
    const credentials = useSchoolCredentials();
    const [viewMode, setViewMode] = useState<ViewMode>("grouped");

    const globalTotals = useMemo(() => getHomeStats(classboardData), [classboardData]);
    const groupedEvents = useMemo(() => getGroupedEvents(classboardData), [classboardData]);
    const allTransactionEvents = useMemo(() => getAllTransactionEvents(classboardData, credentials.currency), [classboardData, credentials.currency]);

    return (
        <div className="space-y-10">
            <HomeHeader school={credentials} globalTotals={globalTotals} />

            <div className="flex items-end justify-between border-b border-border pb-6">
                <HomeViewHeader {...VIEW_CONFIG[viewMode]} />
                <HomeViewToggle mode={viewMode} setMode={setViewMode} />
            </div>

            <div className="space-y-6">
                {viewMode === "grouped" && (
                    <HomeGrouped groupedEvents={groupedEvents} classboardData={classboardData} />
                )}
                
                {viewMode === "table" && (
                    <HomeTable events={allTransactionEvents} />
                )}
                
                {viewMode === "calendar" && (
                    <HomeActivity events={allTransactionEvents} />
                )}
            </div>
        </div>
    );
}