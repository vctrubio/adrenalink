"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useClassboardContext, optimisticEventToNode } from "@/src/providers/classboard-provider";
import { HeaderDatePicker } from "@/src/components/ui/HeaderDatePicker";
import ClassboardContentBoard from "./classboard/ClassboardContentBoard";
import ClassboardStatisticsComponent from "./classboard/ClassboardHeaderStatsGrid";
import { ClassboardStatistics } from "@/backend/ClassboardStatistics";
import { ClassboardSkeleton } from "@/src/components/skeletons/ClassboardSkeleton";
import ClassboardFooter from "./classboard/ClassboardFooter";
import ClassboardRealtimeSync from "./ClassboardRealtimeSync";
import { TeacherQueue } from "@/src/app/(admin)/(classboard)/TeacherQueue";

export default function ClientClassboard() {
    const { mounted, error } = useClassboardContext();

    if (!mounted) {
        return <ClassboardSkeleton />;
    }

    if (error) {
        return <ClassboardSkeleton error={true} />;
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
    const { selectedDate, setSelectedDate, teacherQueues, globalFlag, optimisticOperations } = useClassboardContext();

    const stats = useMemo(() => {
        // Clone queues to inject optimistic events and remove deleted ones for real-time stats
        const queuesWithOptimistic = teacherQueues.map(q => {
             // Filter operations for this teacher
             const ops = Array.from(optimisticOperations.values());
             
             // Get additions
             const relevantAdditions = ops
                 .filter((op): op is { type: "add"; event: any } => 
                     op.type === "add" && op.event.teacherId === q.teacher.id && op.event.date.startsWith(selectedDate)
                 )
                 .map(op => op.event);

             // Get deletions
             const relevantDeletions = new Set(
                 ops
                 .filter((op): op is { type: "delete"; eventId: string } => op.type === "delete")
                 .map(op => op.eventId)
             );
             
             const hasDeletions = q.getAllEvents().some(e => relevantDeletions.has(e.id));
             
             if (relevantAdditions.length === 0 && !hasDeletions) return q;

             // Create a temporary queue with merged/filtered events
             const newQ = new TeacherQueue(q.teacher);
             
             // Copy existing events EXCEPT those optimistically deleted
             q.getAllEvents().forEach(e => {
                 if (!relevantDeletions.has(e.id)) {
                     // Nullify pointers when cloning to prevent circular references
                     newQ.constructEvents({...e, next: null, prev: null});
                 }
             });
             
             // Add optimistic events
             relevantAdditions.forEach(opt => {
                 const node = optimisticEventToNode(opt);
                 newQ.constructEvents({...node, next: null, prev: null});
             });
             
             return newQ;
        });

        const statistics = new ClassboardStatistics(queuesWithOptimistic);
        return statistics.getDailyLessonStats();
    }, [teacherQueues, optimisticOperations, selectedDate]);

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
                <div className="flex-1 min-w-[280px] max-w-2xl p-4 rounded-2xl flex items-center justify-center bg-card border border-zinc-200 dark:border-zinc-700">
                    <div className="relative group/settings">
                        <HeaderDatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

                        <button
                            onClick={handleToggleSettings}
                            className={`absolute -top-3 -right-12 w-10 h-10 transition-all duration-500 hover:scale-110 active:scale-95 z-10 
                                ${isAdjustmentMode ? "rotate-12 grayscale-0 opacity-100" : "grayscale opacity-20 hover:opacity-100 hover:grayscale-0"}`}
                        >
                            <Image src="/ADR.webp" alt="Toggle Settings" fill className="object-contain dark:invert" />
                        </button>
                    </div>
                </div>
                <ClassboardStatisticsComponent stats={stats} />
            </div>

            <ClassboardContentBoard />

            <ClassboardFooter />
        </div>
    );
}
