"use client";

import { useMemo, useState } from "react";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import ClassboardDateHeader from "@/src/components/classboard/ClassboardDateHeader";
import ClassboardContentHeader from "@/src/components/classboard/ClassboardContentHeader";
import ClassboardContentBoard from "./ClassboardContentBoard";
import { ClassboardStatistics } from "@/backend/classboard/ClassboardStatistics";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import ClassboardRealtimeSync from "./ClassboardRealtimeSync";
import ClassboardFooter from "./ClassboardFooter";

type ContentHeaderViewType = "/" | "config" | "gap" | "lesson" | "admin" | "update";

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
    const [contentHeaderViewType, setContentHeaderViewType] = useState<ContentHeaderViewType>("/");

    const stats = useMemo(() => {
        // TeacherQueues now manage their own internal optimistic state
        // We include deleted events so the header stats stay stable during deletion
        const statistics = new ClassboardStatistics(teacherQueues, undefined, undefined, true);
        return statistics.getDailyLessonStats();
    }, [teacherQueues, selectedDate]);

    // Toggle view type - clicking a button again resets to default "/"
    const toggleContentView = (viewType: ContentHeaderViewType) => {
        setContentHeaderViewType(contentHeaderViewType === viewType ? "/" : viewType);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex flex-col lg:flex-row items-stretch gap-4 p-4 mx-auto w-full max-w-7xl">
                <div className="flex-1 lg:w-96">
                    <ClassboardDateHeader
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                        contentViewType={contentHeaderViewType}
                        onContentViewChange={toggleContentView}
                    />
                </div>
                <div className="flex-1">
                    <ClassboardContentHeader
                        viewType={contentHeaderViewType}
                        stats={stats}
                        gapMinutes={gapMinutes}
                        stepDuration={controller?.stepDuration}
                    />
                </div>
            </div>

            <ClassboardContentBoard />

            <ClassboardFooter />
        </div>
    );
}