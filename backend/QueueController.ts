/**
 * QueueController - Main facade for queue operations and event management
 * Encapsulates all business logic for queue manipulation and event state
 */

import { TeacherQueue, type ControllerSettings, type EventNode } from "./TeacherQueue";
import type { EventCardProps } from "@/types/classboard-teacher-queue";
import { updateClassboardEventLocation } from "@/actions/classboard-action";
import { detectGapBefore, getMinutesFromISO, minutesToTime, createISODateTime } from "@/getters/queue-getter";

export type { EventCardProps } from "@/types/classboard-teacher-queue";

export class QueueController {
    constructor(
        private queue: TeacherQueue,
        private settings: ControllerSettings,
        private onRefresh: () => void
    ) {}

    /**
     * Get complete card props - all info needed to render EventModCard
     */
    getEventModCardProps(eventId: string | null) {
        if (!eventId) return null;

        const events = this.queue.getAllEvents();
        const index = events.findIndex((e) => e.id === eventId);

        if (index === -1) return null;

        const event = events[index];
        const gap = detectGapBefore(event, events, index, this.settings.gapMinutes);
        const isFirst = index === 0;
        const isLast = index === events.length - 1;
        const canMoveEarlier = this.canMoveEarlier(eventId);
        const canMoveLater = this.canMoveLater(eventId);

        return {
            event,
            gap,
            isFirst,
            isLast,
            canMoveEarlier,
            canMoveLater,
            queueController: this,
        };
    }

    /**
     * Check if event can be moved stepDuration minutes earlier
     * Head of queue can move earlier as long as it doesn't go below 00:00
     * Non-head events cannot move if it would overlap with previous event's gap
     */
    canMoveEarlier(eventId: string): boolean {
        const events = this.queue.getAllEvents();
        const index = events.findIndex((e) => e.id === eventId);

        if (index < 0) return false;

        const currentEvent = events[index];
        const currentStartMinutes = getMinutesFromISO(currentEvent.eventData.date);

        // Head of queue can move earlier as long as it doesn't go below 00:00 (0 minutes)
        if (index === 0) {
            return currentStartMinutes - this.settings.stepDuration >= 0;
        }

        // Non-head events cannot move if it would overlap with previous event's gap
        const previousEvent = events[index - 1];
        const previousEndMinutes = getMinutesFromISO(previousEvent.eventData.date) + previousEvent.eventData.duration;

        return currentStartMinutes - this.settings.stepDuration >= previousEndMinutes;
    }

    /**
     * Check if event can be moved 30 minutes later
     * Cannot move if it would exceed 23:00 (1380 minutes)
     */
    canMoveLater(eventId: string): boolean {
        const event = this.queue.getAllEvents().find((e) => e.id === eventId);
        if (!event) return false;
        return getMinutesFromISO(event.eventData.date) < 1380;
    }

    /**
     * Check if event is first in queue
     */
    isFirst(eventId: string): boolean {
        const events = this.queue.getAllEvents();
        return events.length > 0 && events[0].id === eventId;
    }

    /**
     * Check if event is last in queue
     */
    isLast(eventId: string): boolean {
        const events = this.queue.getAllEvents();
        return events.length > 0 && events[events.length - 1].id === eventId;
    }

    /**
     * Adjust event duration by stepDuration
     * increment: true = +stepDuration, false = -stepDuration
     * Respects existing gaps - only cascades if next event is adjacent
     */
    adjustDuration(eventId: string, increment: boolean): void {
        const event = this.queue.getAllEvents().find((e) => e.id === eventId);
        if (!event) return;

        const change = increment ? this.settings.stepDuration : -this.settings.stepDuration;
        const oldDuration = event.eventData.duration;
        const oldEndMinutes = getMinutesFromISO(event.eventData.date) + oldDuration;

        event.eventData.duration = Math.max(30, event.eventData.duration + change);
        const actualChange = event.eventData.duration - oldDuration;

        if (actualChange !== 0 && event.next) {
            const nextStartMinutes = getMinutesFromISO(event.next.eventData.date);
            if (nextStartMinutes === oldEndMinutes) {
                this.cascadeTimeAdjustment(event.next, actualChange);
            }
        }

        this.onRefresh();
    }

    /**
     * Adjust event time by stepDuration
     * increment: true = +stepDuration (later), false = -stepDuration (earlier)
     * Respects existing gaps - only cascades if next event is adjacent
     */
    adjustTime(eventId: string, increment: boolean): void {
        const event = this.queue.getAllEvents().find((e) => e.id === eventId);
        if (!event) return;

        const change = increment ? this.settings.stepDuration : -this.settings.stepDuration;
        const oldEndMinutes = getMinutesFromISO(event.eventData.date) + event.eventData.duration;
        this.updateEventDateTime(event, change);

        if (event.next) {
            const nextStartMinutes = getMinutesFromISO(event.next.eventData.date);
            if (nextStartMinutes === oldEndMinutes) {
                this.cascadeTimeAdjustment(event.next, change);
            }
        }

        this.onRefresh();
    }

    /**
     * Move event forward in queue (earlier position)
     */
    moveUp(eventId: string): void {
        const events = this.queue.getAllEvents();
        const currentIndex = events.findIndex((e) => e.id === eventId);

        if (currentIndex < 0 || currentIndex === 0) return;

        const newIndex = currentIndex - 1;
        const preservedStartTimeMinutes = getMinutesFromISO(events[newIndex].eventData.date);

        [events[currentIndex], events[newIndex]] = [events[newIndex], events[currentIndex]];

        this.queue.rebuildQueue(events);
        this.recalculateStartTimesFromPosition(newIndex, preservedStartTimeMinutes);

        this.onRefresh();
    }

    /**
     * Move event backward in queue (later position)
     */
    moveDown(eventId: string): void {
        const events = this.queue.getAllEvents();
        const currentIndex = events.findIndex((e) => e.id === eventId);

        if (currentIndex < 0 || currentIndex >= events.length - 1) return;

        const newIndex = currentIndex + 1;
        const preservedStartTimeMinutes = getMinutesFromISO(events[currentIndex].eventData.date);

        [events[currentIndex], events[newIndex]] = [events[newIndex], events[currentIndex]];

        this.queue.rebuildQueue(events);
        this.recalculateStartTimesFromPosition(currentIndex, preservedStartTimeMinutes);

        this.onRefresh();
    }

    /**
     * Remove gap before event by moving it up to close the gap
     */
    removeGap(eventId: string): void {
        const events = this.queue.getAllEvents();
        const currentEvent = events.find((e) => e.id === eventId);
        if (!currentEvent) return;

        const currentIndex = events.indexOf(currentEvent);
        if (currentIndex <= 0) return;

        const previousEvent = events[currentIndex - 1];
        const previousEndTime = getMinutesFromISO(previousEvent.eventData.date) + previousEvent.eventData.duration;
        const currentStartTime = getMinutesFromISO(currentEvent.eventData.date);
        const gapMinutes = currentStartTime - previousEndTime;

        if (gapMinutes <= 0) return;

        this.updateEventDateTime(currentEvent, -gapMinutes);

        if (currentEvent.next) {
            const newCurrentEndTime = getMinutesFromISO(currentEvent.eventData.date) + currentEvent.eventData.duration;
            const nextStartTime = getMinutesFromISO(currentEvent.next.eventData.date);

            if (newCurrentEndTime === nextStartTime) {
                this.cascadeTimeAdjustment(currentEvent.next, -gapMinutes);
            }
        }

        this.onRefresh();
    }

    /**
     * Update event location in database
     */
    async updateLocation(eventId: string, location: string): Promise<void> {
        try {
            const result = await updateClassboardEventLocation(eventId, location);
            if (result.success) {
                this.onRefresh();
            }
        } catch (error) {
            console.error("Failed to update location:", error);
        }
    }

    /**
     * Get read-only access to underlying queue
     */
    getQueue(): TeacherQueue {
        return this.queue;
    }

    /**
     * Get read-only access to controller settings
     */
    getSettings(): ControllerSettings {
        return this.settings;
    }

    // ============ PRIVATE HELPERS ============

    private updateEventDateTime(eventNode: EventNode, changeMinutes: number): void {
        const currentMinutes = getMinutesFromISO(eventNode.eventData.date);
        const newMinutes = currentMinutes + changeMinutes;
        const datePart = eventNode.eventData.date.split("T")[0];
        eventNode.eventData.date = createISODateTime(datePart, minutesToTime(newMinutes));
    }

    private cascadeTimeAdjustment(startNode: EventNode | null, changeMinutes: number): void {
        let current = startNode;
        while (current) {
            this.updateEventDateTime(current, changeMinutes);
            current = current.next;
        }
    }

    private recalculateStartTimesFromPosition(startIndex: number, startTimeMinutes: number): void {
        const events = this.queue.getAllEvents();
        let currentTimeMinutes = startTimeMinutes;

        for (let i = startIndex; i < events.length; i++) {
            const event = events[i];
            const datePart = event.eventData.date.split("T")[0];
            event.eventData.date = createISODateTime(datePart, minutesToTime(currentTimeMinutes));
            currentTimeMinutes += event.eventData.duration;

            if (i + 1 < events.length) {
                const nextEventStartMinutes = getMinutesFromISO(events[i + 1].eventData.date);
                if (nextEventStartMinutes > currentTimeMinutes) {
                    break;
                }
            }
        }
    }
}
