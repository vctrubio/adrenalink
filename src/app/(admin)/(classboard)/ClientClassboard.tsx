"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";
import { Share } from "lucide-react";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { ClassboardActionsProvider, useClassboardActions } from "@/src/providers/classboard-actions-provider";
import { HeaderDatePicker } from "@/src/components/ui/HeaderDatePicker";
import ClassboardContentBoard from "./classboard/ClassboardContentBoard";
import ClassboardStatisticsComponent from "./classboard/ClassboardHeaderStatsGrid";
import { ClassboardStatistics } from "@/backend/ClassboardStatistics";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import ClassboardFooter from "./classboard/ClassboardFooter";
import ToggleSettingIcon from "@/src/components/ui/ToggleSettingIcon";
import { generateDailyScheduleText } from "@/utils/classboard-share";

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
    const { teacherQueues, globalFlag } = useClassboardActions();

    const stats = useMemo(() => {
        const statistics = new ClassboardStatistics(teacherQueues);
        return statistics.getDailyLessonStats();
    }, [teacherQueues]);

    const handleShare = () => {
         const text = generateDailyScheduleText(teacherQueues, selectedDate);
         navigator.clipboard.writeText(text);
         toast.success("Schedule copied to clipboard");
    };

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
                    
                    <button 
                        onClick={handleShare}
                        className="w-10 h-10 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl active:scale-95 text-foreground"
                    >
                        <Share size={18} />
                    </button>
                </div>
                <ClassboardStatisticsComponent stats={stats} />
            </div>

            <ClassboardContentBoard />

            <ClassboardFooter controller={controller} setController={setController} />
        </div>
    );
}
