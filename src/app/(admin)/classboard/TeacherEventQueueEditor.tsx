"use client";

import { useCallback, useMemo } from "react";
import { timeToMinutes } from "@/getters/timezone-getter";
import { deleteClassboardEvent, updateClassboardEventLocation } from "@/actions/classboard-action";
import EventModCard from "./EventModCard";
import type { EventNode, TeacherQueue, ControllerSettings } from "@/backend/TeacherQueue";

interface TeacherQueueEditorProps {
    events: EventNode[];
    teacherQueue: TeacherQueue;
    onRefresh: () => void;
    controller: ControllerSettings;
    onEventDeleted?: (eventId: string) => void;
}

function detectGapBefore(
    currentEvent: EventNode,
    events: EventNode[],
    index: number,
    requiredGapMinutes: number
): { hasGap: boolean; gapDuration: number; meetsRequirement: boolean } {
    if (index === 0) return { hasGap: false, gapDuration: 0, meetsRequirement: true };

    const previousEvent = events[index - 1];
    const previousEndTime =
        timeToMinutes(previousEvent.eventData.date) + previousEvent.eventData.duration;
    const currentStartTime = timeToMinutes(currentEvent.eventData.date);
    const gapMinutes = currentStartTime - previousEndTime;

    return {
        hasGap: gapMinutes > 0,
        gapDuration: Math.max(0, gapMinutes),
        meetsRequirement: gapMinutes >= requiredGapMinutes,
    };
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
                console.log(`[DEBUG-adjustTime] eventId: ${eventId}, increment: ${increment}, current time: ${event.eventData.date}, lessonId: ${event.lessonId}`);
                teacherQueue.adjustLessonTime(event.lessonId, increment);
                console.log(`[DEBUG-adjustTime] After adjustment, new time: ${event.eventData.date}`);
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
                const gap = detectGapBefore(event, events, index, controller.gapMinutes);
                const isFirst = index === 0;
                const isLast = index === events.length - 1;
                const canMoveEarlier = teacherQueue.canMoveEarlier(event.lessonId);
                const canMoveLater = teacherQueue.canMoveLater(event.lessonId);

                return (
                    <EventModCard
                        key={event.id}
                        event={event}
                        hasGap={gap.hasGap}
                        gapDuration={gap.gapDuration}
                        gapMeetsRequirement={gap.meetsRequirement}
                        requiredGapMinutes={controller.gapMinutes}
                        isFirst={isFirst}
                        isLast={isLast}
                        canMoveEarlier={canMoveEarlier}
                        canMoveLater={canMoveLater}
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
