/**
 * TeacherQueue - Manages a linked list of events for a teacher on a specific date
 * Handles time adjustments, duration changes, event reordering while respecting intentional gaps
 */

import { minutesToTime, getMinutesFromISO, adjustISODateTime, createISODateTime } from "@/getters/queue-getter";
import type { EventNode, TeacherInfo, ControllerSettings } from "@/types/classboard-teacher-queue";

export { type EventNode, type TeacherInfo, type ControllerSettings } from "@/types/classboard-teacher-queue";

export function getStudentCount(eventNode: EventNode): number {
    return eventNode.studentData.length;
}

export class TeacherQueue {
    private head: EventNode | null = null;
    public teacher: TeacherInfo;

    constructor(teacher: TeacherInfo) {
        this.teacher = teacher;
    }

    // ============ QUEUE OPERATIONS ============

    addToQueue(eventNode: EventNode): void {
        if (!this.head) {
            this.head = eventNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = eventNode;
        }
    }

    /**
     * Insert event in chronological order
     * Places event at head if before first event with sufficient gap, otherwise finds correct position
     */
    addToQueueInChronologicalOrder(eventNode: EventNode, gapMinutes: number = 0): void {
        const eventStartMinutes = this.getStartTimeMinutes(eventNode);
        const eventEndMinutes = eventStartMinutes + eventNode.eventData.duration;

        if (!this.head) {
            this.head = eventNode;
            return;
        }

        const firstEventStartMinutes = this.getStartTimeMinutes(this.head);
        if (eventStartMinutes < firstEventStartMinutes) {
            if (firstEventStartMinutes - eventEndMinutes >= gapMinutes) {
                eventNode.next = this.head;
                this.head = eventNode;
                return;
            }
        }

        let current = this.head;
        while (current.next) {
            const nextEventStartMinutes = this.getStartTimeMinutes(current.next);
            if (eventStartMinutes < nextEventStartMinutes) {
                eventNode.next = current.next;
                current.next = eventNode;
                return;
            }
            current = current.next;
        }

        current.next = eventNode;
    }

    getAllEvents(): EventNode[] {
        const events: EventNode[] = [];
        let current = this.head;
        while (current) {
            events.push(current);
            current = current.next;
        }
        return events;
    }

    /**
     * Rebuild the linked list from an array of events
     * Used when events are reordered (e.g., move up/down operations)
     */
    rebuildQueue(events: EventNode[]): void {
        this.head = null;
        events.forEach((event) => {
            event.next = null;
            this.addToQueue(event);
        });
    }

    getEarliestEventTime(): string | null {
        if (!this.head) return null;
        const startMinutes = this.getStartTimeMinutes(this.head);
        return minutesToTime(startMinutes);
    }

    /**
     * Get insertion time based on capacity and controller settings
     * Calculates duration from capacity, tries submitTime first, then falls back to next available slot
     * Returns object with time string (HH:MM format) and duration in minutes
     */
    getInsertionTime(submitTime: string, capacityStudents: number, controller: ControllerSettings): { time: string; duration: number } {
        // Calculate duration based on capacity
        let duration: number;
        if (capacityStudents === 1) {
            duration = controller.durationCapOne;
        } else if (capacityStudents === 2) {
            duration = controller.durationCapTwo;
        } else {
            duration = controller.durationCapThree;
        }

        const events = this.getAllEvents();
        if (!events.length) return { time: submitTime, duration };

        const submitTimeMinutes = parseInt(submitTime.split(":")[0]) * 60 + parseInt(submitTime.split(":")[1]);
        const lastEventEndMinutes = this.getStartTimeMinutes(events[events.length - 1]) + events[events.length - 1].eventData.duration;
        const nextAvailableMinutes = lastEventEndMinutes + controller.gapMinutes;

        if (submitTimeMinutes >= nextAvailableMinutes && submitTimeMinutes + duration <= 1440) {
            return { time: submitTime, duration };
        }

        return { time: minutesToTime(nextAvailableMinutes), duration };
    }


    // ============ PRIVATE HELPERS ============

    private getStartTimeMinutes(eventNode: EventNode): number {
        return getMinutesFromISO(eventNode.eventData.date);
    }

    private updateEventDateTime(eventNode: EventNode, changeMinutes: number): void {
        eventNode.eventData.date = adjustISODateTime(eventNode.eventData.date, changeMinutes);
    }

    private cascadeTimeAdjustment(startNode: EventNode | null, changeMinutes: number): void {
        let current = startNode;
        while (current) {
            this.updateEventDateTime(current, changeMinutes);
            current = current.next;
        }
    }
}
