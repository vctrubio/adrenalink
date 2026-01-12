"use client";

import SchoolIcon from "@/public/appSvgs/SchoolIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import ClassboardHeaderStatsGrid from "@/src/app/(admin)/classboard/ClassboardHeaderStatsGrid";
import EventStatusSummary from "@/src/components/classboard/EventStatusSummary";
import ClassboardFlagSettings from "@/src/components/classboard/ClassboardFlagSettings";
import ClassboardGroupSettings from "@/src/components/classboard/ClassboardGroupSettings";
import ClassboardConfigSettings from "@/src/components/classboard/ClassboardConfigSettings";
import type { ClassboardStatistics as ClassboardStatsType } from "@/backend/classboard/ClassboardStatistics";

type ContentHeaderViewType = "/" | "config" | "gap" | "lesson" | "admin" | "update";

interface ClassboardContentHeaderProps {
    viewType: ContentHeaderViewType;
    stats: ReturnType<ClassboardStatsType["getDailyLessonStats"]>;
    gapMinutes?: number;
    stepDuration?: number;
}

export default function ClassboardContentHeader({
    viewType,
    stats,
    gapMinutes,
    stepDuration,
}: ClassboardContentHeaderProps) {

    const renderContent = () => {
        switch (viewType) {
            case "/":
                // Default stats view
                return <ClassboardHeaderStatsGrid stats={stats} />;

            case "config":
                return <ClassboardConfigSettings />;

            case "gap":
                return <ClassboardGroupSettings />;

            case "lesson":
                return <ClassboardFlagSettings />;

            case "admin":
                return (
                    <div className="flex items-center justify-center h-full p-6 w-full">
                        {/* 3-Way Admin Sections */}
                        <div className="flex flex-1 divide-x-2 divide-foreground/10">
                            {/* School View */}
                            <div className="flex flex-col items-center justify-center gap-3 flex-1 hover:bg-slate-500/5 transition-colors">
                                <SchoolIcon size={40} className="text-slate-700 dark:text-slate-300 opacity-80" />
                                <p className="text-xs font-medium text-muted-foreground">School</p>
                            </div>

                            {/* Student View */}
                            <div className="flex flex-col items-center justify-center gap-3 flex-1 hover:bg-slate-500/5 transition-colors">
                                <HelmetIcon size={40} className="text-slate-700 dark:text-slate-300 opacity-80" />
                                <p className="text-xs font-medium text-muted-foreground">Student</p>
                            </div>

                            {/* Teacher View */}
                            <div className="flex flex-col items-center justify-center gap-3 flex-1 hover:bg-slate-500/5 transition-colors">
                                <HeadsetIcon size={40} className="text-slate-700 dark:text-slate-300 opacity-80" />
                                <p className="text-xs font-medium text-muted-foreground">Teacher</p>
                            </div>
                        </div>
                    </div>
                );

            case "update":
                return <EventStatusSummary />;

            default:
                return null;
        }
    };

    return (
        <div className="rounded-lg overflow-hidden shadow-sm select-none min-h-32 flex items-stretch h-full">{renderContent()}</div>
    );
}