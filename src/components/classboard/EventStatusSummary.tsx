"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import toast from "react-hot-toast";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { bulkUpdateEventStatus, bulkDeleteClassboardEvents } from "@/supabase/server/classboard";
import { AnimatedCounter } from "@/src/components/ui/AnimatedCounter";
import { EVENT_STATUS_CONFIG } from "@/types/status";

// ============ SUB-COMPONENTS ============

const StatusGrid = ({
    eventCounts,
    completedTotal,
}: {
    eventCounts: { completed: number; tbd: number; planned: number; uncompleted: number };
    completedTotal: number;
}) => (
    <div className="flex-1 grid grid-cols-3 divide-x divide-border/30 h-full">
        {/* Planned */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 py-2 sm:px-3 h-full">
            <Flag size={16} style={{ color: EVENT_STATUS_CONFIG.planned.color }} className="shrink-0" />
            <span className="text-muted-foreground text-[10px] sm:text-xs hidden lg:inline uppercase tracking-widest font-bold opacity-70">
                Planned
            </span>
            <span className="text-foreground font-black text-sm sm:text-base tracking-tight">
                <AnimatedCounter value={eventCounts.planned} />
            </span>
        </div>

        {/* TBC */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 py-2 sm:px-3 h-full">
            <Flag size={16} style={{ color: EVENT_STATUS_CONFIG.tbc.color }} className="shrink-0" />
            <span className="text-muted-foreground text-[10px] sm:text-xs hidden lg:inline uppercase tracking-widest font-bold opacity-70">
                TBC
            </span>
            <span className="text-foreground font-black text-sm sm:text-base tracking-tight">
                <AnimatedCounter value={eventCounts.tbd} />
            </span>
        </div>

        {/* Completed */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 py-2 sm:px-3 h-full">
            <Flag size={16} style={{ color: EVENT_STATUS_CONFIG.completed.color }} className="shrink-0" />
            <span className="text-muted-foreground text-[10px] sm:text-xs hidden lg:inline uppercase tracking-widest font-bold opacity-70">
                Done
            </span>
            <span className="text-foreground font-black text-sm sm:text-base tracking-tight">
                <AnimatedCounter value={completedTotal} />
            </span>
        </div>
    </div>
);

const ActionsRow = ({
    eventCounts,
    totalEvents,
    isLoading,
    onSetConfirmation,
    onSetCompleted,
    onReschedule,
}: {
    eventCounts: { planned: number; tbd: number };
    totalEvents: number;
    isLoading: boolean;
    onSetConfirmation: () => void;
    onSetCompleted: () => void;
    onReschedule: () => void;
}) => (
    <div className="flex-1 grid grid-cols-3 divide-x divide-border/30 h-full">
        <div className="flex items-center justify-center h-full p-1">
            <button
                onClick={onSetConfirmation}
                disabled={isLoading}
                className="w-full h-full text-[10px] font-black uppercase tracking-wider bg-transparent transition-colors disabled:opacity-50 text-muted-foreground hover:bg-muted/20 rounded group"
            >
                <span
                    className="group-hover:text-[var(--tbc-color)] transition-colors"
                    style={{ "--tbc-color": EVENT_STATUS_CONFIG.tbc.color } as any}
                >
                    Mark {eventCounts.planned} TBC
                </span>
            </button>
        </div>
        <div className="flex items-center justify-center h-full p-1">
            <button
                onClick={onSetCompleted}
                disabled={isLoading}
                className="w-full h-full text-[10px] font-black uppercase tracking-wider bg-transparent hover:text-primary transition-colors disabled:opacity-50 text-muted-foreground hover:bg-muted/20 rounded"
            >
                Mark {eventCounts.planned + eventCounts.tbd} Done
            </button>
        </div>
        <div className="flex items-center justify-center h-full p-1">
            <button
                onClick={onReschedule}
                disabled={isLoading}
                className="w-full h-full text-[10px] font-black uppercase tracking-wider bg-transparent hover:text-destructive transition-colors disabled:opacity-50 text-muted-foreground hover:bg-muted/20 rounded"
            >
                Reschedule {totalEvents}
            </button>
        </div>
    </div>
);

// ============ MAIN COMPONENT ============

export default function EventStatusSummary() {
    const { teacherQueues, globalFlag } = useClassboardContext();
    const [isLoading, setIsLoading] = useState(false);

    // Calculate event counts by status
    const eventCounts = {
        completed: 0,
        tbd: 0,
        planned: 0,
        uncompleted: 0,
    };

    teacherQueues.forEach((queue) => {
        queue.getAllEvents().forEach((event) => {
            const status = event.eventData.status;
            if (status === "completed") eventCounts.completed++;
            else if (status === "tbc") eventCounts.tbd++;
            else if (status === "planned") eventCounts.planned++;
            else if (status === "uncompleted") eventCounts.uncompleted++;
        });
    });

    // Get event IDs by status
    const getEventIdsByStatus = (targetStatus: string): string[] => {
        const eventIds: string[] = [];
        teacherQueues.forEach((queue) => {
            const events = queue.getAllEvents();
            events.forEach((event) => {
                if (event.eventData.status !== targetStatus) {
                    eventIds.push(event.id);
                }
            });
        });
        return eventIds;
    };

    // Get all event IDs
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

    // Bulk action handlers
    const handleSetCompleted = async () => {
        const eventIds = getEventIdsByStatus("completed");
        if (eventIds.length === 0) {
            toast.error("No events to update");
            return;
        }

        setIsLoading(true);
        try {
            await bulkUpdateEventStatus(eventIds, "completed");
            toast.success(`Marking ${eventIds.length} events as completed...`);
        } catch (error) {
            console.error("Bulk update failed", error);
            toast.error("Failed to update events");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetConfirmation = async () => {
        const eventIds = getEventIdsByStatus("tbc");
        if (eventIds.length === 0) {
            toast.error("No events to update");
            return;
        }

        setIsLoading(true);
        try {
            await bulkUpdateEventStatus(eventIds, "tbc");
            toast.success(`Marking ${eventIds.length} events as TBC...`);
        } catch (error) {
            console.error("Bulk update failed", error);
            toast.error("Failed to update events");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReschedule = async () => {
        const eventIds = getAllEventIds();
        if (eventIds.length === 0) {
            toast.error("No events to reschedule");
            return;
        }

        setIsLoading(true);
        try {
            eventIds.forEach((eventId) => {
                globalFlag.notifyEventMutation(eventId, "deleting");
            });

            teacherQueues.forEach((queue) => {
                const events = queue.getAllEvents();
                events.forEach((event) => {
                    if (eventIds.includes(event.id)) {
                        globalFlag.markEventAsDeleted(queue.teacher.id, event.id);
                    }
                });
            });

            globalFlag.triggerRefresh();

            const deleteResult = await bulkDeleteClassboardEvents(eventIds);
            if (!deleteResult.success) {
                throw new Error(deleteResult.error || "Delete failed");
            }

            toast.success(`Rescheduling ${eventIds.length} events...`);
        } catch (error) {
            console.error("Bulk delete failed", error);
            toast.error("Failed to delete events");

            eventIds.forEach((eventId) => {
                globalFlag.clearEventMutation(eventId);
            });

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

    const completedTotal = eventCounts.completed + eventCounts.uncompleted;
    const totalEvents = eventCounts.planned + eventCounts.tbd + completedTotal;

    return (
        <div className="flex-1 rounded-lg overflow-hidden h-full flex flex-col">
            <StatusGrid eventCounts={eventCounts} completedTotal={completedTotal} />
            <div className="h-px bg-border/30 w-full" />
            <ActionsRow
                eventCounts={eventCounts}
                totalEvents={totalEvents}
                isLoading={isLoading}
                onSetConfirmation={handleSetConfirmation}
                onSetCompleted={handleSetCompleted}
                onReschedule={handleReschedule}
            />
        </div>
    );
}
