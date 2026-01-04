/**
 * TeacherQueue - Lightweight linked-list queue for managing events on a specific date
 * Provides chronological event insertion, statistics, and queue optimization
 */

import { minutesToTime, getMinutesFromISO } from "@/getters/queue-getter";
import type { EventNode, ControllerSettings } from "@/types/classboard-teacher-queue";

export interface TeacherInfo {
    id: string; // UUID of teacher
    username: string;
}

export { type EventNode, type ControllerSettings } from "@/types/classboard-teacher-queue";

/**
 * TeacherQueue - Lightweight teacher queue
 * Manages a linked list of events for a teacher on a specific date
 * Events are constructed from database records and inserted in chronological order
 */
export class TeacherQueue {
    private head: EventNode | null = null;
    public teacher: TeacherInfo;

    constructor(teacher: TeacherInfo) {
        this.teacher = teacher;
    }

    /**
     * Construct event in queue - inserts event in chronological order
     * Called when building queue from existing database events
     */
    constructEvents(eventNode: EventNode): void {
        // IMPORTANT: Clear pointers to prevent cycles if node is being reused/cloned
        eventNode.next = null;
        eventNode.prev = null;

        const eventStartMinutes = this.getStartTimeMinutes(eventNode);

        if (!this.head) {
            this.head = eventNode;
            return;
        }

        // Check if event should be at head (before first event chronologically)
        const firstEventStartMinutes = this.getStartTimeMinutes(this.head);
        if (eventStartMinutes < firstEventStartMinutes) {
            eventNode.next = this.head;
            this.head.prev = eventNode; // Maintain doubly linked list
            this.head = eventNode;
            return;
        }

        // Find correct position in chronological order
        let current = this.head;
        while (current.next) {
            const nextEventStartMinutes = this.getStartTimeMinutes(current.next);
            if (eventStartMinutes < nextEventStartMinutes) {
                eventNode.next = current.next;
                eventNode.prev = current;
                current.next.prev = eventNode;
                current.next = eventNode;
                return;
            }
            current = current.next;
        }

        // Add at end
        current.next = eventNode;
        eventNode.prev = current;
    }

    /**
     * Rebuild the linked list from an array of events
     * Used after reordering operations (moveUp/moveDown)
     */
    rebuildQueue(events: EventNode[]): void {
        this.head = null;
        let prev: EventNode | null = null;

        events.forEach((event) => {
            event.next = null;
            event.prev = prev;

            if (!this.head) {
                this.head = event;
            } else if (prev) {
                prev.next = event;
            }
            prev = event;
        });
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
     * Check if a time slot is before 23:55 (midnight cutoff)
     */
    private startsBeforeMidnight(time: string): boolean {
        const timeMinutes = this.timeToMinutes(time);
        return timeMinutes < 1435; // 23:55 = 1435 minutes
    }

    /**
     * Check if submitTime conflicts with any existing events
     */
    private doesTimeConflict(submitTime: string, duration: number, gapMinutes: number, events: EventNode[]): boolean {
        if (!events.length) return false;

        const submitTimeMinutes = this.timeToMinutes(submitTime);
        const submitEndMinutes = submitTimeMinutes + duration;

        for (const event of events) {
            const eventStart = this.getStartTimeMinutes(event);
            const eventEnd = eventStart + event.eventData.duration;
            const gapEnd = eventEnd + gapMinutes;

            // Check if submitTime overlaps with event + gap
            if (submitTimeMinutes < eventEnd + gapMinutes && submitEndMinutes > eventStart) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get next available time slot for a new event
     * 1. Check if submitTime works (no conflicts, before 23:55)
     * 2. If not, find next slot after last event
     */
    getNextAvailableSlot(submitTime: string, duration: number, gapMinutes: number, pendingEvents: EventNode[] = []): string | null {
        const allEvents = [...this.getAllEvents(), ...pendingEvents].sort(
            (a, b) => this.getStartTimeMinutes(a) - this.getStartTimeMinutes(b)
        );

        // Try submitTime if no conflicts and before midnight
        if (!this.doesTimeConflict(submitTime, duration, gapMinutes, allEvents) && this.startsBeforeMidnight(submitTime)) {
            return submitTime;
        }

        // If no events, submitTime is only option but it failed validation
        if (!allEvents.length) {
            return null;
        }

        // Find next slot after last event
        const lastEvent = allEvents[allEvents.length - 1];
        const lastEventEndMinutes = this.getStartTimeMinutes(lastEvent) + lastEvent.eventData.duration;
        const nextSlotTime = minutesToTime(lastEventEndMinutes + gapMinutes);

        if (this.startsBeforeMidnight(nextSlotTime)) {
            return nextSlotTime;
        }

        return null;
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

    /**
     * Calculate time difference in minutes between an event and a reference snapshot
     */
    getEventTimeDifference(eventId: string, snapshotEvents: EventNode[]): number {
        const currentEvent = this.getAllEvents().find((e) => e.id === eventId);
        const snapshotEvent = snapshotEvents.find((e) => e.id === eventId);

        if (!currentEvent || !snapshotEvent) return 0;

        const currentMins = this.getStartTimeMinutes(currentEvent);
        const snapshotMins = this.getStartTimeMinutes(snapshotEvent);

        return currentMins - snapshotMins;
    }

    private getStartTimeMinutes(eventNode: EventNode): number {
        return getMinutesFromISO(eventNode.eventData.date);
    }
}
