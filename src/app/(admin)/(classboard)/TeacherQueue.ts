/**
 * TeacherQueue - Manages a linked list of events for a teacher on a specific date
 * Handles time adjustments, duration changes, event reordering while respecting intentional gaps
 */

import { minutesToTime, getMinutesFromISO, adjustISODateTime, createISODateTime } from "@/getters/queue-getter";
import { calculateTeacherStatsFromEvents } from "@/getters/classboard-getter";
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
     * Optimise queue: remove gaps between events while preserving first event's start time
     * Packs all events back-to-back with required gap minutes, starting from first event's current time
     * Returns updates for events that need moving + skipped event IDs if they exceed 24:00
     */
    optimiseQueue(gapMinutes: number): { updates: Array<{ id: string; date: string; duration: number }>; skipped: string[] } {
        const events = this.getAllEvents();
        const updates: Array<{ id: string; date: string; duration: number }> = [];
        const skipped: string[] = [];

        if (events.length === 0) return { updates, skipped };

        const datePart = events[0].eventData.date.split("T")[0];
        const firstEventStartMinutes = this.getStartTimeMinutes(events[0]);
        let currentStartMinutes = firstEventStartMinutes;
        const MAX_START_TIME = 1440; // Can't start after 24:00

        events.forEach((event) => {
            const eventDuration = event.eventData.duration;

            // Check if this event would start after 24:00
            if (currentStartMinutes >= MAX_START_TIME) {
                console.log(`⚠️ [TeacherQueueV2] Event ${event.id} can't fit in day (start would be >= 24:00), skipping`);
                skipped.push(event.id);
                return;
            }

            const eventStartMinutes = this.getStartTimeMinutes(event);

            // If event doesn't start at optimal position, add to updates
            if (eventStartMinutes !== currentStartMinutes) {
                const newTime = minutesToTime(currentStartMinutes);
                const newDate = `${datePart}T${newTime}:00`;

                updates.push({
                    id: event.id,
                    date: newDate,
                    duration: eventDuration,
                });
            }

            // Move to next start time (current end + gap)
            currentStartMinutes += eventDuration + gapMinutes;
        });

        console.log(`✅ [TeacherQueueV2] Queue optimised: ${updates.length} events updated, ${skipped.length} skipped`);
        return { updates, skipped };
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

// Keep original TeacherQueue for backward compatibility
export class TeacherQueue {
    private head: EventNodeV2 | null = null;
    public teacher: TeacherInfo;

    constructor(teacher: TeacherInfo) {
        this.teacher = teacher;
    }

    // ============ QUEUE OPERATIONS ============

    /**
     * Insert event in chronological order by start time
     */
    addToQueueInChronologicalOrder(eventNode: EventNodeV2, gapMinutes = 0): void {
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
     * Add event with smart insertion:
     * - Calculates duration based on capacity
     * - Finds optimal insertion time (submitTime if fits, else finds gaps, else appends)
     * - Creates EventNode and inserts it into queue
     * - Returns the calculated insertion time
     */
    addEventWithSmartInsertion(
        lessonId: string,
        bookingId: string,
        eventDate: string,
        capacityStudents: number,
        controller: ControllerSettings,
    ): { time: string; duration: number } {
        // Calculate duration based on capacity
        let duration: number;
        if (capacityStudents === 1) {
            duration = controller.durationCapOne;
        } else if (capacityStudents === 2) {
            duration = controller.durationCapTwo;
        } else {
            duration = controller.durationCapThree;
        }

        // Get the date part (YYYY-MM-DD) from eventDate
        const dateOnly = eventDate.split("T")[0];

        // Find insertion time using smart logic
        const { time, duration: calculatedDuration } = this.getInsertionTime(controller.submitTime, capacityStudents, controller);

        // Create EventNodeV2 with calculated time
        const fullEventDate = `${dateOnly}T${time}:00`;
        const eventNode: EventNodeV2 = {
            id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            lessonId,
            bookingId,
            bookingLeaderName: "",
            bookingStudents: null,
            capacityStudents,
            commission: { type: "fixed", cph: 0 },
            eventData: {
                date: fullEventDate,
                duration: calculatedDuration,
                location: controller.location,
                status: "planned",
            },
            next: null,
        };

        // Insert into queue at appropriate position
        this.addToQueueInChronologicalOrder(eventNode, controller.gapMinutes);

        return { time, duration: calculatedDuration };
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
     * Rebuild the linked list from an array of events
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

    getEarliestEventTime(): string | null {
        if (!this.head) return null;
        const startMinutes = this.getStartTimeMinutes(this.head);
        return minutesToTime(startMinutes);
    }

    /**
     * Get teacher stats calculated from current queue events
     */
    getStats() {
        const events = this.getAllEvents();
        return calculateTeacherStatsFromEvents(this.teacher.username, events, 0);
    }

    /**
     * Print teacher schedule in console with formatted event details
     */
    printTeacherSchedule(): void {
        console.log("\n" + "=".repeat(60));
        console.log(`📅 SCHEDULE FOR: ${this.teacher.username}`);
        console.log("=".repeat(60));

        const events = this.getAllEvents();
        if (events.length === 0) {
            console.log("No events scheduled");
            console.log("=".repeat(60) + "\n");
            return;
        }

        events.forEach((event, index) => {
            const startTime = minutesToTime(this.getStartTimeMinutes(event));
            const duration = event.eventData.duration;
            const studentNames = event.bookingStudents?.map((s) => `${s.firstName} ${s.lastName}`).join(", ") || event.bookingLeaderName;

            console.log(`\n${index + 1}. ${startTime} (+${Math.floor(duration / 60)}h ${duration % 60}m) - ${studentNames}`);
        });

        console.log("\n" + "=".repeat(60) + "\n");
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

    private getStartTimeMinutes(eventNode: EventNodeV2): number {
        return getMinutesFromISO(eventNode.eventData.date);
    }

    private updateEventDateTime(eventNode: EventNodeV2, changeMinutes: number): void {
        eventNode.eventData.date = adjustISODateTime(eventNode.eventData.date, changeMinutes);
    }

    private cascadeTimeAdjustment(startNode: EventNodeV2 | null, changeMinutes: number): void {
        let current = startNode;
        while (current) {
            this.updateEventDateTime(current, changeMinutes);
            current = current.next;
        }
    }
}
