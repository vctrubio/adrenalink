/**
 * TeacherQueueV2 - Lightweight linked-list queue for managing events on a specific date
 * Provides chronological event insertion, statistics, and queue optimization
 */

import { minutesToTime, getMinutesFromISO } from "@/getters/queue-getter";
import type { EventNodeV2, ControllerSettings } from "@/types/classboard-teacher-queue";

export interface TeacherInfo {
    id: string; // UUID of teacher
    username: string;
}

export { type EventNodeV2, type ControllerSettings } from "@/types/classboard-teacher-queue";

/**
 * TeacherQueueV2 - Lightweight teacher queue using EventNodeV2
 * Manages a linked list of events for a teacher on a specific date
 * Events are constructed from database records and inserted in chronological order
 */
export class TeacherQueueV2 {
    private head: EventNodeV2 | null = null;
    public teacher: TeacherInfo;

    constructor(teacher: TeacherInfo) {
        this.teacher = teacher;
    }

    /**
     * Construct event in queue - inserts event in chronological order
     * Called when building queue from existing database events
     */
    constructEvents(eventNode: EventNodeV2): void {
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

    /**
     * Rebuild the linked list from an array of events
     * Used after reordering operations (moveUp/moveDown)
     */
    rebuildQueue(events: EventNodeV2[]): void {
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

    getAllEvents(): EventNodeV2[] {
        const events: EventNodeV2[] = [];
        let current = this.head;
        while (current) {
            events.push(current);
            current = current.next;
        }
        return events;
    }

    /**
     * Check if queue is already optimised (all gaps match required gap minutes)
     * Returns true if all consecutive events have exactly the required gap
     */
    isQueueOptimised(gapMinutes: number): boolean {
        const events = this.getAllEvents();
        if (events.length <= 1) return true; // Single or no events are optimized

        for (let i = 0; i < events.length - 1; i++) {
            const currentEvent = events[i];
            const nextEvent = events[i + 1];

            const currentEndMinutes = this.getStartTimeMinutes(currentEvent) + currentEvent.eventData.duration;
            const nextStartMinutes = this.getStartTimeMinutes(nextEvent);
            const actualGap = nextStartMinutes - currentEndMinutes;

            if (actualGap !== gapMinutes) {
                return false; // Found a gap that doesn't match required gap
            }
        }

        return true; // All gaps match required gap
    }

    /**
     * Optimise queue starting from a specific time (useful for cascade deletes)
     * Packs all events back-to-back with required gap, starting from the given time
     * Returns updates for events that need moving + skipped event IDs if they exceed 24:00
     */
    optimiseFromTime(startTimeMinutes: number, gapMinutes: number): { updates: Array<{ id: string; date: string; duration: number }>; skipped: string[] } {
        const events = this.getAllEvents();
        const updates: Array<{ id: string; date: string; duration: number }> = [];
        const skipped: string[] = [];

        if (events.length === 0) return { updates, skipped };

        const datePart = events[0].eventData.date.split("T")[0];
        let currentStartMinutes = startTimeMinutes;
        const MAX_START_TIME = 1440;

        events.forEach((event) => {
            const eventDuration = event.eventData.duration;

            if (currentStartMinutes >= MAX_START_TIME) {
                console.log(`⚠️ [TeacherQueueV2] Event ${event.id} can't fit in day (start would be >= 24:00), skipping`);
                skipped.push(event.id);
                return;
            }

            const eventStartMinutes = this.getStartTimeMinutes(event);

            if (eventStartMinutes !== currentStartMinutes) {
                const newTime = minutesToTime(currentStartMinutes);
                const newDate = `${datePart}T${newTime}:00`;

                updates.push({
                    id: event.id,
                    date: newDate,
                    duration: eventDuration,
                });
            }

            currentStartMinutes += eventDuration + gapMinutes;
        });

        console.log(`✅ [TeacherQueueV2] Queue optimised from ${minutesToTime(startTimeMinutes)}: ${updates.length} events updated, ${skipped.length} skipped`);
        return { updates, skipped };
    }

    /**
     * Optimise queue: remove gaps between events while preserving first event's start time
     * Packs all events back-to-back with required gap minutes, starting from first event's current time
     * Returns updates for events that need moving + skipped event IDs if they exceed 24:00
     */
    optimiseQueue(gapMinutes: number): { updates: Array<{ id: string; date: string; duration: number }>; skipped: string[] } {
        const events = this.getAllEvents();
        if (events.length === 0) return { updates: [], skipped: [] };

        const firstEventStartMinutes = this.getStartTimeMinutes(events[0]);
        return this.optimiseFromTime(firstEventStartMinutes, gapMinutes);
    }

    /**
     * Get the start time of the first (earliest) event in queue
     * Returns time string (HH:MM format) or null if no events
     */
    getEarliestTime(): string | null {
        if (!this.head) return null;
        return this.head.eventData.date.split("T")[1]?.substring(0, 5) || null;
    }

    /**
     * Get next available time slot for a new event
     * Checks if submitTime fits, returns next available slot if not
     */
    getNextAvailableSlot(submitTime: string, duration: number, gapMinutes: number): string {
        const events = this.getAllEvents();
        if (!events.length) return submitTime;

        const submitTimeMinutes = this.timeToMinutes(submitTime);
        const submitEndMinutes = submitTimeMinutes + duration;

        // Check if submitTime fits at the head (before first event)
        const firstEventStartMinutes = this.getStartTimeMinutes(events[0]);
        if (submitTimeMinutes < firstEventStartMinutes) {
            if (submitEndMinutes + gapMinutes <= firstEventStartMinutes && submitEndMinutes <= 1440) {
                return submitTime;
            }
        }

        // Check if submitTime fits in any gap between events
        for (let i = 0; i < events.length - 1; i++) {
            const currentEventEndMinutes = this.getStartTimeMinutes(events[i]) + events[i].eventData.duration;
            const nextEventStartMinutes = this.getStartTimeMinutes(events[i + 1]);
            const gapStartMinutes = currentEventEndMinutes + gapMinutes;

            if (
                submitTimeMinutes >= gapStartMinutes &&
                submitEndMinutes + gapMinutes <= nextEventStartMinutes &&
                submitEndMinutes <= 1440
            ) {
                return submitTime;
            }
        }

        // If submitTime is after all events, use it
        const lastEventEndMinutes = this.getStartTimeMinutes(events[events.length - 1]) + events[events.length - 1].eventData.duration;
        const requiredGapStartMinutes = lastEventEndMinutes + gapMinutes;

        if (submitTimeMinutes >= requiredGapStartMinutes && submitEndMinutes <= 1440) {
            return submitTime;
        }

        // Return next available slot after last event
        if (requiredGapStartMinutes + duration <= 1440) {
            return minutesToTime(requiredGapStartMinutes);
        }

        // Fallback (shouldn't happen with valid times)
        return submitTime;
    }

    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    }

    /**
     * Calculate statistics from queue events
     * Returns stats needed for ClassboardStatistics
     */
    getStats() {
        const events = this.getAllEvents();

        const uniqueStudents = new Set<string>();
        let totalDuration = 0; // in minutes
        let totalRevenue = 0;
        let totalCommission = 0;

        events.forEach((event) => {
            totalDuration += event.eventData.duration;

            // Track unique students
            if (event.bookingStudents) {
                event.bookingStudents.forEach((student) => {
                    uniqueStudents.add(student.id);
                });
            }

            // Calculate revenue: price per student × capacity students
            const eventRevenue = event.pricePerStudent * event.capacityStudents;
            totalRevenue += eventRevenue;

            // Calculate commission based on event duration and revenue
            const hours = event.eventData.duration / 60;
            let commission = 0;

            if (event.commission.type === "fixed") {
                commission = event.commission.cph * hours;
            } else {
                // percentage: calculate percentage of revenue
                commission = eventRevenue * (event.commission.cph / 100);
            }

            totalCommission += commission;
        });

        // Convert total duration from minutes to hours
        const totalHours = totalDuration / 60;

        return {
            eventCount: events.length,
            studentCount: uniqueStudents.size,
            totalHours: Math.round(totalHours * 100) / 100,
            totalRevenue: {
                revenue: Math.round(totalRevenue * 100) / 100,
                commission: Math.round(totalCommission * 100) / 100,
                profit: Math.round((totalRevenue - totalCommission) * 100) / 100,
            },
        };
    }

    private getStartTimeMinutes(eventNode: EventNodeV2): number {
        return getMinutesFromISO(eventNode.eventData.date);
    }
}
