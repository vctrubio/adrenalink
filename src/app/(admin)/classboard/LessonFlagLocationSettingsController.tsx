"use client";

import { useState } from "react";
import { Zap, X } from "lucide-react";
import { SubmitCancelReset } from "@/src/components/ui/SubmitCancelReset";
import { bulkUpdateClassboardEvents } from "@/supabase/server/classboard";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";

const ActiveQueueSection = ({
    teachers,
    pendingTeachers,
    globalFlag,
    adjustmentTime,
    onIndividualSubmit,
}: {
    teachers: any[];
    pendingTeachers: Set<string>;
    globalFlag: any;
    adjustmentTime: string | null;
    onIndividualSubmit: (id: string) => void;
}) => (
    <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Active Queue ({pendingTeachers.size})
        </label>
        <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
            {teachers
                .filter((q) => pendingTeachers.has(q.teacher.id))
                .map((q) => {
                    const controller = globalFlag.getQueueController(q.teacher.id);
                    const activeQueue = controller?.getQueue() ?? q;
                    const firstTime = activeQueue.getEarliestTime();
                    const isSubmitting = globalFlag.isSubmitting(q.teacher.id);
                    const hasChanges = globalFlag.collectChangesForTeacher(q.teacher.id).length > 0;
                    const isMatchingGlobal = firstTime === adjustmentTime;

                    return (
                        <div
                            key={q.teacher.id}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 shadow-sm animate-in slide-in-from-left-2 duration-200"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                    <HeadsetIcon size={16} className="text-muted-foreground shrink-0" />
                                    <span className="font-bold text-sm tracking-tight truncate">{q.teacher.username}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <FlagIcon size={14} className={isMatchingGlobal ? "text-primary" : "text-muted-foreground/40"} />
                                    <span
                                        className={`font-mono text-xs font-bold ${isMatchingGlobal ? "text-primary" : "text-muted-foreground"}`}
                                    >
                                        {firstTime || "--:--"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 ml-2">
                                <button
                                    onClick={() => globalFlag.optOut(q.teacher.id)}
                                    className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                                <button
                                    onClick={() => onIndividualSubmit(q.teacher.id)}
                                    disabled={!hasChanges || isSubmitting}
                                    className="p-2 rounded-lg bg-muted/30 transition-all group disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Zap 
                                            size={14} 
                                            className={`transition-colors ${hasChanges ? "text-primary fill-current" : "text-muted-foreground/30"}`} 
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
        </div>
    </div>
);

// ============ MAIN COMPONENT ============

/**
 * LessonFlagLocationSettingsController - Global adjustment panel (Queue View Only)
 * Now only displays the active queue and global submit actions.
 * Configuration controls have moved to the header (ClassboardConfigSettings).
 */
export default function LessonFlagLocationSettingsController() {
    const { globalFlag } = useClassboardContext();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Derived from GlobalFlag
    const pendingTeachers = globalFlag.getPendingTeachers();
    const updatesCount = globalFlag.getChangedEventsCount();
    const adjustmentTime = globalFlag.getGlobalTime();

    // Handlers
    const handleIndividualSubmit = async (teacherId: string) => {
        const changes = globalFlag.collectChangesForTeacher(teacherId);
        globalFlag.setSubmitting(teacherId, true);
        try {
            if (changes.length > 0) await bulkUpdateClassboardEvents(changes);
            globalFlag.optOut(teacherId);
        } finally {
            globalFlag.setSubmitting(teacherId, false);
        }
    };

    const handleSubmitAll = async () => {
        setIsSubmitting(true);
        try {
            const changes = globalFlag.collectChanges();
            if (changes.length > 0) await bulkUpdateClassboardEvents(changes);
            globalFlag.exitAdjustmentMode();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        globalFlag.discardChanges();
    };

    return (
        <div className="flex flex-col gap-6 px-4 py-2 h-full bg-card/50 backdrop-blur-sm">
            <SubmitCancelReset
                onSubmit={handleSubmitAll}
                onCancel={() => globalFlag.exitAdjustmentMode(true)}
                onReset={handleReset}
                hasChanges={updatesCount > 0}
                isSubmitting={isSubmitting}
                submitLabel="Apply Changes"
                extraContent={
                    updatesCount > 0 && (
                        <span className="ml-2 flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                            {updatesCount}
                        </span>
                    )
                }
            />

            <div className="h-px bg-border/10" />

            <ActiveQueueSection
                teachers={globalFlag.getTeacherQueues()}
                pendingTeachers={pendingTeachers}
                globalFlag={globalFlag}
                adjustmentTime={adjustmentTime}
                onIndividualSubmit={handleIndividualSubmit}
            />
        </div>
    );
}
