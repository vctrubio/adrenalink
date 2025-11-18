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

export default function TeacherEventQueue({ queue, controller, onRemoveEvent, onDragOver, onDragEnter, onDragLeave, onDrop }: TeacherEventQueueProps) {
    const events = queue.getAllEvents();
    const [processingEventId, setProcessingEventId] = useState<string | null>(null);

    // Create QueueController for gap calculations
    const queueController = useMemo(() => new QueueController(queue, controller, () => { }), [queue, controller]);

    // Handler for cascade delete: delete event then shift subsequent events forward
    const handleDeleteWithCascade = async (eventId: string, minutesToShift: number, subsequentEventIds: string[]) => {
        try {
            setProcessingEventId(eventId);

            // First, delete the event
            const deleteResult = await deleteClassboardEvent(eventId);
            if (!deleteResult.success) {
                setProcessingEventId(null);
                return;
            }

            // Then shift all subsequent events backward (earlier) to fill the gap
            if (subsequentEventIds.length > 0) {
                const shiftResult = await cascadeDeleteWithShift(subsequentEventIds, minutesToShift);

                if (!shiftResult.success) {
                    setProcessingEventId(null);
                    return;
                }
            }
            setProcessingEventId(null);
            await onRemoveEvent?.(eventId);
        } catch (error) {
            console.error("Error in cascade delete:", error);
            setProcessingEventId(null);
        }
    };
    return (
        <div
            className="flex flex-col gap-3 flex-1 pointer-events-auto"
            onDragOver={(e) => {
                e.stopPropagation();
                onDragOver?.(e);
            }}
            onDragEnter={(e) => {
                e.stopPropagation();
                onDragEnter?.(e);
            }}
            onDragLeave={(e) => {
                e.stopPropagation();
                onDragLeave?.(e);
            }}
            onDrop={(e) => {
                e.stopPropagation();
                onDrop?.(e);
            }}
        >
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
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No events - dont show?</div>
            )}
        </div>
    );
}
