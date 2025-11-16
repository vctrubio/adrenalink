/**
 * TeacherQueue - Manages a linked list of events for a teacher on a specific date
 * Handles time adjustments, duration changes, event reordering while respecting intentional gaps
 */

import { minutesToTime, getMinutesFromISO, adjustISODateTime, createISODateTime } from "@/getters/queue-getter";
import type { EventNode, TeacherInfo, ControllerSettings } from "@/types/classboard-teacher-queue";

export { type EventNode, type TeacherInfo, type ControllerSettings } from "@/types/classboard-teacher-queue";

export class TeacherQueue {
    private head: EventNode | null = null;
    public teacher: TeacherInfo;

    constructor(teacher: TeacherInfo) {
        this.teacher = teacher;
    }

    // ============ QUEUE OPERATIONS ============

    /**
     * Insert event in chronological order by start time
     */
    addToQueueInChronologicalOrder(eventNode: EventNode, gapMinutes: number = 0): void {
        const eventStartMinutes = this.getStartTimeMinutes(eventNode);

        if (!this.head) {
            this.head = eventNode;
            return;
        }

        // Check if event should be at head (before first event chronologically)
        const firstEventStartMinutes = this.getStartTimeMinutes(this.head);
        if (eventStartMinutes < firstEventStartMinutes) {
            eventNode.next = this.head;
            this.head = eventNode;
            return;
        }

        // Find correct position in chronological order
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

        // Add at end
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
     */
    rebuildQueue(events: EventNode[]): void {
        this.head = null;
        events.forEach((event) => {
            event.next = null;
            if (!this.head) {
                this.head = event;
            } else {
                let current = this.head;
                while (current.next) {
                    current = current.next;
                }
                current.next = event;
            }
        });
    }

    getEarliestEventTime(): string | null {
        if (!this.head) return null;
        const startMinutes = this.getStartTimeMinutes(this.head);
        return minutesToTime(startMinutes);
    }

    /**
     * Get insertion time based on capacity and controller settings
     * Tries to fit submitTime in queue, checking head and gaps between events
     * Falls back to next available slot if submitTime doesn't fit anywhere
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
        const submitEndMinutes = submitTimeMinutes + duration;

        // PRIORITY 1: Check if submitTime fits at the head (before first event)
        const firstEventStartMinutes = this.getStartTimeMinutes(events[0]);
        if (submitTimeMinutes < firstEventStartMinutes) {
            if (submitEndMinutes + controller.gapMinutes <= firstEventStartMinutes && submitEndMinutes <= 1440) {
                return { time: submitTime, duration };
            }
        }

        // PRIORITY 2: Check if submitTime fits in any gap between events
        for (let i = 0; i < events.length - 1; i++) {
            const currentEventEndMinutes = this.getStartTimeMinutes(events[i]) + events[i].eventData.duration;
            const nextEventStartMinutes = this.getStartTimeMinutes(events[i + 1]);
            const gapStartMinutes = currentEventEndMinutes + controller.gapMinutes;

            if (submitTimeMinutes >= gapStartMinutes && submitEndMinutes + controller.gapMinutes <= nextEventStartMinutes && submitEndMinutes <= 1440) {
                return { time: submitTime, duration };
            }
        }

        // PRIORITY 3: If submitTime is after all events, use it (respects controller time preference)
        const lastEventEndMinutes = this.getStartTimeMinutes(events[events.length - 1]) + events[events.length - 1].eventData.duration;
        const requiredGapStartMinutes = lastEventEndMinutes + controller.gapMinutes;

        // If controller submitTime is after the queue's last event with required gap, use it
        if (submitTimeMinutes >= requiredGapStartMinutes && submitEndMinutes <= 1440) {
            return { time: submitTime, duration };
        }

        // FALLBACK: Use next available slot after last event
        if (requiredGapStartMinutes + duration <= 1440) {
            return { time: minutesToTime(requiredGapStartMinutes), duration };
        }

        // If even the next available slot exceeds 24 hours, return submitTime anyway (let validation handle it)
        return { time: submitTime, duration };
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
