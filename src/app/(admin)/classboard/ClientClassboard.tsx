"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useClassboardContext, optimisticEventToNode } from "@/src/providers/classboard-provider";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { HeaderDatePicker } from "@/src/components/ui/HeaderDatePicker";
import ClassboardContentBoard from "./ClassboardContentBoard";
import ClassboardStatisticsComponent from "./ClassboardHeaderStatsGrid";
import { ClassboardStatistics } from "@/backend/classboard/ClassboardStatistics";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import ClassboardRealtimeSync from "./ClassboardRealtimeSync";
import { TeacherQueue } from "@/backend/classboard/TeacherQueue";
import ClassboardFooter from "./ClassboardFooter";

export default function ClientClassboard() {
    const { mounted, error } = useClassboardContext();
    const credentials = useSchoolCredentials();

    if (!mounted) {
        return <ClassboardSkeleton />;
    }

    if (error) {
        return <ClassboardSkeleton error={true} errorMessage={error} />;
    }

    if (!credentials?.timezone) {
        return (
            <ClassboardSkeleton
                error={true}
                errorMessage={`No TimeZone Configuration found for ${credentials?.name || "School"}. Please refresh or update school settings.`}
                schoolUsername={schoolUsername}
            />
        );
    }

    return (
        <ClassboardRealtimeSync>
            <ClassboardContent />
        </ClassboardRealtimeSync>
    );
}

/**
 * ClassboardContent - Reads state from hook context
 * teacherQueues from context ensure proper re-render tracking
 */
function ClassboardContent() {
    const { selectedDate, setSelectedDate, teacherQueues, globalFlag, controller, gapMinutes } = useClassboardContext();

    const stats = useMemo(() => {
        // TeacherQueues now manage their own internal optimistic state
        // We include deleted events so the header stats stay stable during deletion
        const statistics = new ClassboardStatistics(teacherQueues, undefined, undefined, true);
        return statistics.getDailyLessonStats();
    }, [teacherQueues, selectedDate]);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex flex-wrap gap-4 p-4">
                <div className="flex-1 min-w-[280px] max-w-2xl flex items-stretch gap-4">
                    <div className="p-2 rounded-2xl flex w-full items-center justify-center bg-card border border-zinc-200 dark:border-zinc-700">
                        <HeaderDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
                    </div>
                </div>
                <ClassboardStatisticsComponent stats={stats} gapMinutes={gapMinutes} stepDuration={controller?.stepDuration} />
            </div>

            <ClassboardContentBoard />

            <ClassboardFooter />
        </div>
    );
}
