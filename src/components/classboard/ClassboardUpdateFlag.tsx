"use client";

import { CheckCircle2, Trash2, Settings2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { bulkUpdateEventStatus, bulkDeleteClassboardEvents } from "@/supabase/server/classboard";

export default function ClassboardUpdateFlag() {
    const { teacherQueues, globalFlag } = useClassboardContext();
    const [isLoading, setIsLoading] = useState(false);

    const isAdjustmentMode = globalFlag.isAdjustmentMode();

    // Collect all event IDs from all teacher queues
    const getAllEventIds = (): string[] => {
        const eventIds: string[] = [];
        teacherQueues.forEach((queue) => {
            const events = queue.getAllEvents();
            events.forEach((event) => {
                eventIds.push(event.id);
            });
        });
        return eventIds;
    };

    const handleToggleAdjustmentMode = () => {
        if (isAdjustmentMode) {
            globalFlag.exitAdjustmentMode();
        } else {
            globalFlag.enterAdjustmentMode();
        }
    };

    const handleMarkAllCompleted = async () => {
        const eventIds = getAllEventIds();
        if (eventIds.length === 0) {
            toast.error("No events to update");
            return;
        }

        setIsLoading(true);
        try {
            // Mark events as updating in UI
            eventIds.forEach((eventId) => {
                globalFlag.notifyEventMutation(eventId, "updating");
            });

            // Update on server
            await bulkUpdateEventStatus(eventIds, "completed");

            // Update local queue events optimistically
            teacherQueues.forEach((queue) => {
                const events = queue.getAllEvents();
                events.forEach((event) => {
                    if (eventIds.includes(event.id)) {
                        event.eventData.status = "completed";
                    }
                });
            });

            // Trigger refresh to update UI
            globalFlag.triggerRefresh();

            toast.success(`Marked ${eventIds.length} events as completed`);
        } catch (error) {
            console.error("Bulk update failed", error);
            toast.error("Failed to update events");
        } finally {
            // Clear mutation spinners
            eventIds.forEach((eventId) => {
                globalFlag.clearEventMutation(eventId);
            });
            // Final refresh
            globalFlag.triggerRefresh();
            setIsLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        const eventIds = getAllEventIds();
        console.log(`🗑️ [ClassboardUpdateFlag] Starting bulk delete for ${eventIds.length} events`, eventIds);

        if (eventIds.length === 0) {
            toast.error("No events to delete");
            return;
        }

        if (!window.confirm(`Delete all ${eventIds.length} events? This cannot be undone.`)) {
            console.log(`🗑️ [ClassboardUpdateFlag] Delete cancelled by user`);
            return;
        }

        setIsLoading(true);
        try {
            console.log(`🗑️ [ClassboardUpdateFlag] Step 1: Notifying mutations (spinners)`);
            // Show spinners for all events being deleted
            eventIds.forEach((eventId) => {
                globalFlag.notifyEventMutation(eventId, "deleting");
            });

            console.log(`🗑️ [ClassboardUpdateFlag] Step 2: Marking events as deleted optimistically`);
            // Mark events as deleted optimistically in UI
            teacherQueues.forEach((queue) => {
                const events = queue.getAllEvents();
                events.forEach((event) => {
                    if (eventIds.includes(event.id)) {
                        globalFlag.markEventAsDeleted(queue.teacher.id, event.id);
                    }
                });
            });

            console.log(`🗑️ [ClassboardUpdateFlag] Step 3: Triggering UI refresh`);
            globalFlag.triggerRefresh();

            console.log(`🗑️ [ClassboardUpdateFlag] Step 4: Calling server to delete ${eventIds.length} events`);
            await bulkDeleteClassboardEvents(eventIds);

            console.log(`🗑️ [ClassboardUpdateFlag] Step 5: Server delete complete, waiting for realtime sync to confirm...`);
            // Do NOT clear mutations here - let realtime sync confirm the deletions
            // This ensures events keep their spinners until the deletion is confirmed server-side

            console.log(`🗑️ [ClassboardUpdateFlag] ✅ Bulk delete sent to server`);
            toast.success(`Deleting ${eventIds.length} events...`);
        } catch (error) {
            console.error("🗑️ [ClassboardUpdateFlag] ❌ Bulk delete failed", error);
            toast.error("Failed to delete events");

            // Clear spinners on error
            eventIds.forEach((eventId) => {
                globalFlag.clearEventMutation(eventId);
            });

            // Revert optimistic delete on error
            console.log(`🗑️ [ClassboardUpdateFlag] Reverting optimistic deletes`);
            eventIds.forEach((eventId) => {
                teacherQueues.forEach((queue) => {
                    globalFlag.unmarkEventAsDeleted(queue.teacher.id, eventId);
                });
            });
            globalFlag.triggerRefresh();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-xs border border-border rounded-lg p-4 m-4">
            <div className="flex gap-4">
                {/* Icon Column */}
                <div className="flex flex-col items-center justify-around py-2">
                    <Settings2 size={20} className="text-muted-foreground" />
                    <CheckCircle2 size={20} className="text-muted-foreground" />
                    <Trash2 size={20} className="text-muted-foreground" />
                </div>

                {/* Content Column */}
                <div className="flex flex-col flex-1">
                    {/* Row 1 - Toggle Adjustment Mode */}
                    <div className="flex items-center justify-center gap-2 py-2">
                        <button
                            onClick={handleToggleAdjustmentMode}
                            disabled={isLoading}
                            className={`w-full px-3 py-1 rounded text-sm font-semibold transition-colors ${
                                isAdjustmentMode
                                    ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/30"
                                    : "bg-muted/30 text-foreground hover:bg-muted/50"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isAdjustmentMode ? "Editing" : "Edit All"}
                        </button>
                    </div>

                    <div className="border-b border-border" />

                    {/* Row 2 - Mark All Completed */}
                    <div className="flex items-center justify-center gap-2 py-2">
                        <button
                            onClick={handleMarkAllCompleted}
                            disabled={isLoading || getAllEventIds().length === 0}
                            className="w-full px-3 py-1 rounded text-sm font-semibold text-green-600 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Updating..." : "Complete All"}
                        </button>
                    </div>

                    <div className="border-b border-border" />

                    {/* Row 3 - Delete All */}
                    <div className="flex items-center justify-center gap-2 py-2">
                        <button
                            onClick={handleDeleteAll}
                            disabled={isLoading || getAllEventIds().length === 0}
                            className="w-full px-3 py-1 rounded text-sm font-semibold text-red-600 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Deleting..." : "Delete All"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
