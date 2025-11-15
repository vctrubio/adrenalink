"use client";

import { useState, useMemo } from "react";
import type { EventNode, TeacherQueue, ControllerSettings } from "@/backend/TeacherQueue";
import { QueueController } from "@/backend/QueueController";
import EventCard from "./EventCard";
import { deleteClassboardEvent } from "@/actions/classboard-action";
import { cascadeDeleteWithShift } from "@/actions/classboard-bulk-action";

interface TeacherEventQueueProps {
    queue: TeacherQueue;
    controller: ControllerSettings;
    onRemoveEvent?: (eventId: string) => Promise<void>;
    onDragOver?: (e: React.DragEvent) => void;
    onDragEnter?: (e: React.DragEvent) => void;
    onDragLeave?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
}

export default function TeacherEventQueue({
    queue,
    controller,
    onRemoveEvent,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
}: TeacherEventQueueProps) {
    const events = queue.getAllEvents();
    const [processingEventId, setProcessingEventId] = useState<string | null>(null);

    // Create QueueController for gap calculations (like EventModCard)
    const queueController = useMemo(
        () => new QueueController(queue, controller, () => {}),
        [queue, controller]
    );

    // Handler for cascade delete: delete event then shift subsequent events forward
    const handleDeleteWithCascade = async (
        eventId: string,
        minutesToShift: number,
        subsequentEventIds: string[],
    ) => {
        try {
            setProcessingEventId(eventId);

            // First, delete the event
            const deleteResult = await deleteClassboardEvent(eventId);
            if (!deleteResult.success) {
                console.error("❌ Delete failed:", deleteResult.error);
                setProcessingEventId(null);
                return;
            }

            console.log("✅ Event deleted");

            // Then shift all subsequent events backward (earlier) to fill the gap
            if (subsequentEventIds.length > 0) {
                console.log(
                    `⏪ [TeacherEventQueue] Shifting ${subsequentEventIds.length} events backward by ${minutesToShift} minutes to fill gap`,
                );
                const shiftResult = await cascadeDeleteWithShift(
                    subsequentEventIds,
                    minutesToShift,
                );

                if (!shiftResult.success) {
                    console.error("❌ Cascade shift failed:", shiftResult.error);
                    setProcessingEventId(null);
                    return;
                }
                console.log(`✅ Shifted ${shiftResult.data?.shiftedCount} events backward`);
            }

            console.log("✅ Cascade delete complete");
            setProcessingEventId(null);
            await onRemoveEvent?.(eventId);
        } catch (error) {
            console.error("🔥 Error in cascade delete:", error);
            setProcessingEventId(null);
        }
    };
    return (
        <div className="flex flex-col gap-3 flex-1" onDragOver={onDragOver} onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDrop={onDrop}>
            {events.length > 0 ? (
                events.map((event, index) => {
                    const isProcessing = processingEventId === event.id;
                    return (
                        <EventCard
                            key={event.id}
                            event={event}
                            queue={queue}
                            queueController={queueController}
                            hasNextEvent={index < events.length - 1}
                            isProcessing={isProcessing}
                            onDeleteWithCascade={handleDeleteWithCascade}
                            onDeleteComplete={async () => {
                                if (event.id) {
                                    await onRemoveEvent?.(event.id);
                                }
                            }}
                        />
                    );
                })
            ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No events</div>
            )}
        </div>
    );
}

