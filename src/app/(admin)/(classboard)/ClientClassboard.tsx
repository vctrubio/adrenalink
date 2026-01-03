"use client";

import { useMemo } from "react";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { HeaderDatePicker } from "@/src/components/ui/HeaderDatePicker";
import ClassboardContentBoard from "./classboard/ClassboardContentBoard";
import ClassboardStatisticsComponent from "./classboard/ClassboardHeaderStatsGrid";
import { ClassboardStatistics } from "@/backend/ClassboardStatistics";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import ClassboardFooter from "./classboard/ClassboardFooter";
import ToggleSettingIcon from "@/src/components/ui/ToggleSettingIcon";
import ClassboardRealtimeSync from "./ClassboardRealtimeSync";

export default function ClientClassboard() {
    const { mounted } = useClassboardContext();

    if (!mounted) {
        return <ClassboardSkeleton />;
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
    const { selectedDate, setSelectedDate, teacherQueues, globalFlag } = useClassboardContext();

    const stats = useMemo(() => {
        const statistics = new ClassboardStatistics(teacherQueues);
        return statistics.getDailyLessonStats();
    }, [teacherQueues]);

    const handleToggleSettings = () => {
        if (!globalFlag.isAdjustmentMode()) {
            globalFlag.enterAdjustmentMode();
        } else {
            globalFlag.exitAdjustmentMode();
        }
    };

    const isAdjustmentMode = globalFlag.isAdjustmentMode();

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex flex-wrap gap-4 p-4">
                <div className="flex-1 min-w-[280px] max-w-2xl p-4 rounded-2xl flex items-center gap-4 bg-card border border-zinc-200 dark:border-zinc-700">
                    <HeaderDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

                    <div className="h-8 w-px bg-border/50 mx-2" />
                    <ToggleSettingIcon isOpen={isAdjustmentMode} onClick={handleToggleSettings} />
                </div>
                <ClassboardStatisticsComponent stats={stats} />
            </div>

            <ClassboardContentBoard />

            <ClassboardFooter />
        </div>
    );
}
