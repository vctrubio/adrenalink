"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Grid3X3 } from "lucide-react";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";
import { HomeHeader } from "./HomeHeader";
import { HomeViewHeader } from "./HomeViewHeader";
import { HomeGrouped } from "./HomeGrouped";
import { TransactionEventsTable } from "@/src/app/(admin)/(tables)/TransactionEventsTable";
import { HomeActivity } from "./HomeActivity";
import { getHomeStats, getGroupedEvents, getAllTransactionEvents } from "./getters";
import { TablesProvider } from "@/src/app/(admin)/(tables)/layout";
import { TablesSearchHeader } from "@/src/app/(admin)/(tables)/TablesSearchHeader";
import type { GroupingType } from "@/src/app/(admin)/(tables)/MasterTable";

import type { TransactionEventData } from "@/types/transaction-event";

export type ViewMode = "grouped" | "table" | "calendar";

export interface DateGroup {
    date: string;
    events: TransactionEventData[];
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

function HomeViewToggle({ mode, setMode }: { mode: ViewMode; setMode: (m: ViewMode) => void }) {
    return (
        <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border w-fit">
            <button
                onClick={() => setMode("grouped")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "grouped" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
                <LayoutGrid size={14} />
                <span>Grouped</span>
            </button>
            <button
                onClick={() => setMode("table")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "table" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
                <List size={14} />
                <span>Table</span>
            </button>
            <button
                onClick={() => setMode("calendar")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "calendar" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
                <Grid3X3 size={14} />
                <span>Activity</span>
            </button>
        </div>
    );
}

export function HomePage({ classboardData }: { classboardData: ClassboardModel }) {
    const credentials = useSchoolCredentials();
    const [viewMode, setViewMode] = useState<ViewMode>("grouped");
    const [groupBy, setGroupBy] = useState<GroupingType>("all");

    const globalTotals = useMemo(() => getHomeStats(classboardData), [classboardData]);
    const groupedEvents = useMemo(() => getGroupedEvents(classboardData), [classboardData]);
    const allTransactionEvents = useMemo(
        () => getAllTransactionEvents(classboardData, credentials.currency),
        [classboardData, credentials.currency],
    );

    console.log("🐛 [HomePage] allTransactionEvents count:", allTransactionEvents.length);

    return (
        <TablesProvider>
            <div className="max-w-7xl mx-auto">
                <HomeHeader school={credentials} globalTotals={globalTotals} />

                <div className="flex items-end justify-between border-b border-border py-6">
                    <HomeViewHeader {...VIEW_CONFIG[viewMode]} />
                    <HomeViewToggle mode={viewMode} setMode={setViewMode} />
                </div>
            </div>

            <div className="container mx-auto">
                <div className="space-y-4 pt-6 mb-20">
                    {viewMode === "grouped" && <HomeGrouped groupedEvents={groupedEvents} classboardData={classboardData} />}

                    {viewMode === "table" && (
                        <div className="space-y-4">
                            <TablesSearchHeader
                                entityId="event"
                                groupBy={groupBy}
                                onGroupByChange={setGroupBy}
                            />
                            <TransactionEventsTable events={allTransactionEvents} groupBy={groupBy} enableTableLogic={true} />
                        </div>
                    )}

                    {viewMode === "calendar" && <HomeActivity events={allTransactionEvents} classboardData={classboardData} />}
                </div>
            </div>
        </TablesProvider>
    );
}
