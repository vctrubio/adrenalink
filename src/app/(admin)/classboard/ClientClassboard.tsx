"use client";

import { useMemo } from "react";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import ClassboardDateHeader from "@/src/components/classboard/ClassboardDateHeader";
import ClassboardContentBoard from "./ClassboardContentBoard";
import ClassboardStatisticsComponent from "./ClassboardHeaderStatsGrid";
import { ClassboardStatistics } from "@/backend/classboard/ClassboardStatistics";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import ClassboardRealtimeSync from "./ClassboardRealtimeSync";
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
            <div className="flex flex-wrap gap-4 p-4 border mx-auto w-full max-w-7xl">
                <ClassboardDateHeader selectedDate={selectedDate} onDateChange={setSelectedDate} />
            </div>

            <ClassboardContentBoard />

            <ClassboardStatisticsComponent stats={stats} gapMinutes={gapMinutes} stepDuration={controller?.stepDuration} />
            <ClassboardFooter />
        </div>
    );
}
