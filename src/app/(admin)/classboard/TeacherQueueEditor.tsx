"use client";

import { timeToMinutes } from "@/getters/timezone-getter";
import EventModCard from "./EventModCard";
import type { EventNode, TeacherQueue, ControllerSettings } from "@/backend/TeacherQueue";

interface TeacherQueueEditorProps {
    events: EventNode[];
    teacherQueue: TeacherQueue;
    onRefresh: () => void;
    controller: ControllerSettings;
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
}: TeacherQueueEditorProps) {
    return (
        <div className="space-y-2 flex-1">
            {events.map((event, index) => {
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
                        isFirst={isFirst}
                        isLast={isLast}
                        canMoveEarlier={canMoveEarlier}
                        canMoveLater={canMoveLater}
                        onRemove={async (eventId) => {
                            const lessonId = events.find((e) => e.id === eventId)?.lessonId;
                            if (lessonId) {
                                // TODO: Call delete action
                                onRefresh();
                            }
                        }}
                        onAdjustDuration={(eventId, increment) => {
                            const lessonId = events.find((e) => e.id === eventId)?.lessonId;
                            if (lessonId) {
                                teacherQueue.adjustLessonDuration(lessonId, increment);
                                onRefresh();
                            }
                        }}
                        onAdjustTime={(eventId, increment) => {
                            const lessonId = events.find((e) => e.id === eventId)?.lessonId;
                            if (lessonId) {
                                teacherQueue.adjustLessonTime(lessonId, increment);
                                onRefresh();
                            }
                        }}
                        onMoveUp={(eventId) => {
                            const lessonId = events.find((e) => e.id === eventId)?.lessonId;
                            if (lessonId) {
                                teacherQueue.moveLessonUp(lessonId);
                                onRefresh();
                            }
                        }}
                        onMoveDown={(eventId) => {
                            const lessonId = events.find((e) => e.id === eventId)?.lessonId;
                            if (lessonId) {
                                teacherQueue.moveLessonDown(lessonId);
                                onRefresh();
                            }
                        }}
                        onRemoveGap={(eventId) => {
                            const lessonId = events.find((e) => e.id === eventId)?.lessonId;
                            if (lessonId) {
                                teacherQueue.removeGap(lessonId);
                                onRefresh();
                            }
                        }}
                    />
                );
            })}
        </div>
    );
}
