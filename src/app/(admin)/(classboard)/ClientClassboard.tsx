"use client";

import { useMemo } from "react";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { ClassboardActionsProvider, useClassboardActions } from "@/src/providers/classboard-actions-provider";
import { HeaderDatePicker } from "@/src/components/ui/HeaderDatePicker";
import ClassboardContentBoard from "./classboard/ClassboardContentBoard";
import ClassboardStatisticsComponent from "./classboard/ClassboardHeaderStatsGrid";
import { ClassboardStatistics } from "@/backend/ClassboardStatistics";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import ClassboardFooter from "./classboard/ClassboardFooter";

export default function ClientClassboard() {
    const { mounted } = useClassboardContext();

    if (!mounted) {
        return <ClassboardSkeleton />;
    }

    return (
        <ClassboardActionsProvider>
            <ClassboardContent />
        </ClassboardActionsProvider>
    );
}

function ClassboardContent() {
    const { selectedDate, setSelectedDate, controller, setController } = useClassboardContext();
    const { teacherQueues } = useClassboardActions();

    const stats = useMemo(() => {
        const statistics = new ClassboardStatistics(teacherQueues);
        return statistics.getDailyLessonStats();
    }, [teacherQueues]);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex flex-wrap gap-4 p-4">
                <div className="flex-1 min-w-[280px] max-w-2xl p-4 rounded-2xl flex items-center justify-center bg-card border border-zinc-200 dark:border-zinc-700">
                    <HeaderDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
                </div>
                <ClassboardStatisticsComponent stats={stats} />
            </div>

            <ClassboardContentBoard />

            <ClassboardFooter controller={controller} setController={setController} />
        </div>
    );
}
