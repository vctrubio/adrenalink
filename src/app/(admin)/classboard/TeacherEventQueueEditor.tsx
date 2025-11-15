"use client";

import { useMemo } from "react";
import { QueueController } from "@/backend/QueueController";
import EventModCard from "./EventModCard";
import type { EventNode, TeacherQueue, ControllerSettings } from "@/backend/TeacherQueue";

interface TeacherQueueEditorProps {
    events: EventNode[];
    teacherQueue: TeacherQueue;
    onRefresh: () => void;
    controller: ControllerSettings;
    onEventDeleted?: (eventId: string) => void;
}

export default function TeacherQueueEditor({
    events,
    teacherQueue,
    onRefresh,
    controller,
}: TeacherQueueEditorProps) {
    // Create a single QueueController for all events
    const queueController = useMemo(
        () => new QueueController(teacherQueue, controller, onRefresh),
        [teacherQueue, controller, onRefresh]
    );

    return (
        <div className="space-y-2 flex-1">
            {events.map((event) => (
                <EventModCard
                    key={event.id}
                    eventId={event.id}
                    queueController={queueController}
                />
            ))}
        </div>
    );
}
