"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import toast from "react-hot-toast";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { bulkUpdateEventStatus, bulkDeleteClassboardEvents } from "@/supabase/server/classboard";
import { AnimatedCounter } from "@/src/components/ui/AnimatedCounter";
import { EVENT_STATUS_CONFIG } from "@/types/status";

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

    const handleNoCancellation = async () => {
        const eventIds = getAllEventIds();
        if (eventIds.length === 0) {
            toast.error("No events to delete");
            return;
        }

        if (!window.confirm(`Delete all ${eventIds.length} events? This cannot be undone.`)) {
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

            toast.success(`Deleting ${eventIds.length} events...`);
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
        <div className="flex-1 rounded-lg overflow-hidden h-full">
            <div className="grid grid-cols-3 grid-rows-2 divide-x divide-y divide-border/30 h-full">
                {/* Row 1: Planned, TBC, Completed */}
                <div className="flex items-center justify-center gap-2 h-full">
                    <Flag size={16} style={{ color: EVENT_STATUS_CONFIG.planned.color }} className="shrink-0" />
                    <span className="text-muted-foreground text-xs hidden lg:inline">Planned</span>
                    <span className="text-foreground font-semibold">
                        <AnimatedCounter value={eventCounts.planned} />
                    </span>
                </div>
                <div className="flex items-center justify-center gap-2 h-full">
                    <Flag size={16} style={{ color: EVENT_STATUS_CONFIG.tbc.color }} className="shrink-0" />
                    <span className="text-muted-foreground text-xs hidden lg:inline">TBC</span>
                    <span className="text-foreground font-semibold">
                        <AnimatedCounter value={eventCounts.tbd} />
                    </span>
                </div>
                <div className="flex items-center justify-center gap-2 h-full">
                    <Flag size={16} style={{ color: EVENT_STATUS_CONFIG.completed.color }} className="shrink-0" />
                    <span className="text-muted-foreground text-xs hidden lg:inline">Completed</span>
                    <span className="text-foreground font-semibold">
                        <AnimatedCounter value={completedTotal} />
                    </span>
                </div>
                {/* Row 2: Action Buttons */}
                <div className="flex items-center justify-center h-full">
                    <button
                        onClick={handleSetConfirmation}
                        disabled={isLoading}
                        className="w-full py-2 px-4 text-xs border-none text-foreground font-bold bg-transparent hover:text-primary transition-colors disabled:opacity-50"
                    >
                        Mark {eventCounts.planned} TBC
                    </button>
                </div>
                <div className="flex items-center justify-center h-full">
                    <button
                        onClick={handleSetCompleted}
                        disabled={isLoading}
                        className="w-full py-2 px-4 text-xs border-none text-foreground font-bold bg-transparent hover:text-primary transition-colors disabled:opacity-50"
                    >
                        Mark {eventCounts.planned + eventCounts.tbd} Completed
                    </button>
                </div>
                <div className="flex items-center justify-center h-full">
                    <button
                        onClick={handleNoCancellation}
                        disabled={isLoading}
                        className="w-full py-2 px-4 text-xs border-none text-foreground font-bold bg-transparent hover:text-destructive transition-colors disabled:opacity-50"
                    >
                        Delete {totalEvents}
                    </button>
                </div>
            </div>
        </div>
    );
}
