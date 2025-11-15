"use client";

import { useCallback, useMemo } from "react";
import { deleteClassboardEvent, updateClassboardEventLocation } from "@/actions/classboard-action";
import { getEventCardProps } from "@/getters/event-getter";
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
    onEventDeleted,
}: TeacherQueueEditorProps) {
    // Memoize callbacks to prevent unnecessary re-renders of EventModCard
    const handleRemove = useCallback(
        async (eventId: string) => {
            const result = await deleteClassboardEvent(eventId, false);
            if (result.success) {
                onEventDeleted?.(eventId);
            }
        },
        [onEventDeleted]
    );

    const handleAdjustDuration = useCallback(
        (eventId: string, increment: boolean) => {
            const lessonId = events.find((e) => e.id === eventId)?.lessonId;
            if (lessonId) {
                teacherQueue.adjustLessonDuration(lessonId, increment);
                onRefresh();
            }
        },
        [events, teacherQueue, onRefresh]
    );

    const handleAdjustTime = useCallback(
        (eventId: string, increment: boolean) => {
            const event = events.find((e) => e.id === eventId);
            if (event?.lessonId) {
                teacherQueue.adjustLessonTime(event.lessonId, increment);
                onRefresh();
            }
        },
        [events, teacherQueue, onRefresh]
    );

    const handleMoveUp = useCallback(
        (eventId: string) => {
            const lessonId = events.find((e) => e.id === eventId)?.lessonId;
            if (lessonId) {
                teacherQueue.moveLessonUp(lessonId);
                onRefresh();
            }
        },
        [events, teacherQueue, onRefresh]
    );

    const handleMoveDown = useCallback(
        (eventId: string) => {
            const lessonId = events.find((e) => e.id === eventId)?.lessonId;
            if (lessonId) {
                teacherQueue.moveLessonDown(lessonId);
                onRefresh();
            }
        },
        [events, teacherQueue, onRefresh]
    );

    const handleRemoveGap = useCallback(
        (eventId: string) => {
            const lessonId = events.find((e) => e.id === eventId)?.lessonId;
            if (lessonId) {
                teacherQueue.removeGap(lessonId);
                onRefresh();
            }
        },
        [events, teacherQueue, onRefresh]
    );

    const handleLocationChange = useCallback(
        async (eventId: string, location: string) => {
            const result = await updateClassboardEventLocation(eventId, location);
            if (result.success) {
                onRefresh();
            }
        },
        [onRefresh]
    );

    // Memoize the mapped events to prevent EventModCard from re-rendering unnecessarily
    const eventCards = useMemo(
        () =>
            events.map((event, index) => {
                const props = getEventCardProps(event, events, index, teacherQueue, controller.gapMinutes);

                return (
                    <EventModCard
                        key={event.id}
                        event={event}
                        hasGap={props.gap.hasGap}
                        gapDuration={props.gap.gapDuration}
                        gapMeetsRequirement={props.gap.meetsRequirement}
                        requiredGapMinutes={controller.gapMinutes}
                        isFirst={props.isFirst}
                        isLast={props.isLast}
                        canMoveEarlier={props.canMoveEarlier}
                        canMoveLater={props.canMoveLater}
                        onRemove={handleRemove}
                        onAdjustDuration={handleAdjustDuration}
                        onAdjustTime={handleAdjustTime}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                        onRemoveGap={handleRemoveGap}
                        onLocationChange={handleLocationChange}
                    />
                );
            }),
        [events, controller.gapMinutes, teacherQueue, handleRemove, handleAdjustDuration, handleAdjustTime, handleMoveUp, handleMoveDown, handleRemoveGap, handleLocationChange]
    );

    return (
        <div className="space-y-2 flex-1">
            {eventCards}
        </div>
    );
}
