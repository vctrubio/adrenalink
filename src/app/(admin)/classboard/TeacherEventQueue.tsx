"use client";

import type { EventNode } from "@/backend/TeacherQueue";
import EventCard from "./EventCard";

interface TeacherEventQueueProps {
    events: EventNode[];
    onRemoveEvent?: (eventId: string) => Promise<void>;
    onDragOver?: (e: React.DragEvent) => void;
    onDragEnter?: (e: React.DragEvent) => void;
    onDragLeave?: (e: React.DragEvent) => void;
    onDrop?: (e: React.DragEvent) => void;
}

export default function TeacherEventQueue({
    events,
    onRemoveEvent,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
}: TeacherEventQueueProps) {
    return (
        <div className="flex flex-col gap-3 flex-1" onDragOver={onDragOver} onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDrop={onDrop}>
            {events.length > 0 ? (
                events.map((event, index) => {
                    return (
                        <EventCard
                            key={event.id}
                            event={event}
                            hasNextEvent={index < events.length - 1}
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

