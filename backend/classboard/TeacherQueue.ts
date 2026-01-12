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
    public version: number = 0;
    public isActive: boolean = true;

    // THE GROUND TRUTH: Last known state from the server
    private serverEvents = new Map<string, EventNode>();

    // Internal optimistic state
    private optimisticAdditions = new Map<string, EventNode>();
    private optimisticDeletions = new Set<string>();

    constructor(teacher: TeacherInfo) {
        this.teacher = teacher;
    }

    /**
     * Add an optimistic event to the queue
     */
    addOptimisticEvent(event: EventNode): void {
        console.log(`[Queue:${this.teacher.username}] ➕ Adding optimistic event: ${event.id} at ${event.eventData.date}`);
        this.optimisticAdditions.set(event.id, event);
        this.version++;
        this.refreshQueueStructure();
    }

    /**
     * Remove an optimistic event (e.g. after confirmation or failure)
     */
    removeOptimisticEvent(eventId: string): void {
        console.log(`[Queue:${this.teacher.username}] ➖ Removing optimistic event: ${eventId}`);
        this.optimisticAdditions.delete(eventId);
        this.version++;
        this.refreshQueueStructure();
    }

    /**
     * Mark an event as optimistically deleted
     */
    markAsDeleted(eventId: string): void {
        console.log(`[Queue:${this.teacher.username}] 🗑️ Marking event as deleted: ${eventId}`);
        this.optimisticDeletions.add(eventId);
        this.version++;
        this.refreshQueueStructure();
    }

    /**
     * Unmark an event deletion (e.g. if delete failed)
     */
    unmarkAsDeleted(eventId: string): void {
        console.log(`[Queue:${this.teacher.username}] ♻️ Unmarking deletion: ${eventId}`);
        this.optimisticDeletions.delete(eventId);
        this.version++;
        this.refreshQueueStructure();
    }

    /**
     * Clear all deletion markers
     */
    clearDeletions(): void {
        console.log(`[Queue:${this.teacher.username}] ♻️ Clearing all deletion markers`);
        this.optimisticDeletions.clear();
        this.version++;
        this.refreshQueueStructure();
    }

    /**
     * Clear all optimistic state (e.g. on full reset or date change)
     */
    clearOptimisticState(): void {
        console.log(`[Queue:${this.teacher.username}] 🧹 Clearing all optimistic state`);
        this.optimisticAdditions.clear();
        this.optimisticDeletions.clear();
        this.serverEvents.clear(); // Wipe server cache too for clean date switching
        this.head = null;
        this.version++;
    }

    /**
     * Check if this queue has any optimistic additions for a specific booking
     */
    hasOptimisticForBooking(bookingId: string): boolean {
        for (const event of this.optimisticAdditions.values()) {
            if (event.bookingId === bookingId) return true;
        }
        return false;
    }

    /**
     * Helper to re-integrate optimistic state into the linked list
     * Should be called whenever real data changes or optimistic state changes
     */
    private refreshQueueStructure(): void {
        // ALWAYS use serverEvents as the source of truth for the base list
        const baseEvents = Array.from(this.serverEvents.values());

        // Combine with optimistic additions
        const allActiveEvents = [...baseEvents, ...Array.from(this.optimisticAdditions.values())];

        // Sort
        allActiveEvents.sort((a, b) => new Date(a.eventData.date).getTime() - new Date(b.eventData.date).getTime());

        // Rebuild Links
        this.rebuildQueue(allActiveEvents);
    }

    /**
     * Remove an event from the queue by ID
     * Used for cleaning up optimistic events that failed to persist
     */
    removeEvent(eventId: string): void {
        if (!this.head) return;

        // If head is the target
        if (this.head.id === eventId) {
            this.head = this.head.next;
            if (this.head) {
                this.head.prev = null;
            }
            return;
        }

        // Traverse to find the event
        let current = this.head;
        while (current.next) {
            if (current.next.id === eventId) {
                const nodeToRemove = current.next;
                current.next = nodeToRemove.next;
                if (current.next) {
                    current.next.prev = current;
                }
                return;
            }
            current = current.next;
        }
    }

    /**
     * Update an existing event in the queue
     * If time changes, it will re-sort the queue locally for this event
     */
    updateEvent(eventId: string, updates: Partial<EventNode["eventData"]>): void {
        let current = this.head;
        let foundNode: EventNode | null = null;

        while (current) {
            if (current.id === eventId) {
                foundNode = current;
                break;
            }
            current = current.next;
        }

        if (!foundNode) return;

        // Check if timing changed
        const oldDate = foundNode.eventData.date;
        const newDate = updates.date || oldDate;

        // Merge updates
        foundNode.eventData = { ...foundNode.eventData, ...updates };

        // If date changed, we might need to re-position
        // For safety, if start time changes, we re-insert.
        if (oldDate !== newDate) {
            // Remove from current position
            this.removeEvent(eventId);
            // Re-insert sorted
            this.constructEvents(foundNode);
        }
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

        this.version++;
    }

    /**
     * Sync queue with a new list of events, preserving object identity where possible
     * Returns a list of IDs that were confirmed (additions confirmed or deletions confirmed)
     */
    syncEvents(newEventsData: EventNode[], mutatingIds: Set<string> = new Set()): string[] {
        console.log(`[Queue:${this.teacher.username}] 🔄 Syncing ${newEventsData.length} events from server...`);
        const confirmedIds: string[] = [];

        // 1. Update the 'Server Truth' map, preserving object references
        const updatedServerMap = new Map<string, EventNode>();

        newEventsData.forEach((newData) => {
            const existingNode = this.serverEvents.get(newData.id);
            if (existingNode) {
                // Update properties in place
                const isMutating = mutatingIds.has(newData.id);
                existingNode.lessonId = newData.lessonId;
                existingNode.bookingId = newData.bookingId;
                existingNode.bookingLeaderName = newData.bookingLeaderName;
                existingNode.bookingStudents = newData.bookingStudents;
                existingNode.capacityStudents = newData.capacityStudents;
                existingNode.pricePerStudent = newData.pricePerStudent;
                existingNode.packageDuration = newData.packageDuration;
                existingNode.categoryEquipment = newData.categoryEquipment;
                existingNode.capacityEquipment = newData.capacityEquipment;
                existingNode.commission = newData.commission;

                if (!isMutating) {
                    existingNode.eventData = newData.eventData;
                } else {
                    // Mutation Guard: Keep local timing, sync status/location
                    existingNode.eventData.status = newData.eventData.status;
                    existingNode.eventData.location = newData.eventData.location;
                }
                updatedServerMap.set(newData.id, existingNode);
            } else {
                updatedServerMap.set(newData.id, newData);
            }
        });

        this.serverEvents = updatedServerMap;

        // 2. Self-heal deletions: If server says it's gone, remove from local deletion markers
        this.optimisticDeletions.forEach((id) => {
            if (!this.serverEvents.has(id)) {
                console.log(`[Queue:${this.teacher.username}] ✅ Server confirmed deletion of ${id}`);
                this.optimisticDeletions.delete(id);
                confirmedIds.push(id);
            }
        });

        // 3. Self-heal additions: If server now has the event, remove from local additions
        this.optimisticAdditions.forEach((event, id) => {
            const optTime = event.eventData.date.substring(0, 16);
            const isConfirmed = Array.from(this.serverEvents.values()).find(
                (e) => e.id === id || (e.lessonId === event.lessonId && e.eventData.date.substring(0, 16) === optTime),
            );

            if (isConfirmed) {
                console.log(`[Queue:${this.teacher.username}] ✅ Server confirmed event: ${id}`);
                this.optimisticAdditions.delete(id);
                confirmedIds.push(id); // Newly added event confirmed
                confirmedIds.push(isConfirmed.id); // Add the real server ID too
            }
        });

        // 4. Solidify the linked list
        this.refreshQueueStructure();
        this.version++;
        console.log(
            `[Queue:${this.teacher.username}] ✨ Sync complete. Board Size: ${this.getAllEvents({ includeDeleted: true }).length}`,
        );

        return confirmedIds;
    }

    /**
     * Get all events in the queue
     * @param options includeDeleted: show events marked for deletion (for UI spinners), raw: return raw head list
     */
    getAllEvents(options: { includeDeleted?: boolean; raw?: boolean } = {}): EventNode[] {
        const events: EventNode[] = [];
        let current = this.head;
        while (current) {
            // Keep the event if:
            // 1. We are requesting raw nodes
            // 2. We explicitly want to include deleted ones
            // 3. It's NOT in our local optimistic deletions set
            if (options.raw || options.includeDeleted || !this.optimisticDeletions.has(current.id)) {
                events.push(current);
            }
            current = current.next;
        }
        return events;
    }

    /**
     * Update event status in-place
     */
    updateEventStatus(eventId: string, status: EventNode["eventData"]["status"]): void {
        console.log(`[Queue:${this.teacher.username}] 🏷️ Updating status for ${eventId} -> ${status}`);
        const event = this.getAllEvents({ includeDeleted: true }).find((e) => e.id === eventId);
        if (event) {
            event.eventData.status = status;
            this.version++;
        }
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
    optimiseFromTime(
        startTimeMinutes: number,
        gapMinutes: number,
    ): { updates: Array<{ id: string; date: string; duration: number }>; skipped: string[] } {
        // Use getAllEvents() which automatically excludes ghosted (deleting) nodes
        const events = this.getAllEvents();
        const updates: Array<{ id: string; date: string; duration: number }> = [];
        const skipped: string[] = [];

        if (events.length === 0) return { updates, skipped };

        // CRITICAL: Only optimize events that START at or after startTimeMinutes
        // This prevents affecting previous events (e.g. A) when deleting a middle event (e.g. B)
        const eventsToOptimize = events.filter((e) => this.getStartTimeMinutes(e) >= startTimeMinutes);

        if (eventsToOptimize.length === 0) return { updates, skipped };

        const datePart = events[0].eventData.date.split("T")[0];
        let nextAvailableMinutes = startTimeMinutes;
        const MAX_START_TIME = 1440;

        eventsToOptimize.forEach((event) => {
            const eventDuration = event.eventData.duration;

            if (nextAvailableMinutes >= MAX_START_TIME) {
                console.log(`⚠️ [Queue:${this.teacher.username}] Event ${event.id} can't fit in day, skipping`);
                skipped.push(event.id);
                return;
            }

            const currentStartMinutes = this.getStartTimeMinutes(event);

            // If it's not already at the correct slot, record an update
            if (currentStartMinutes !== nextAvailableMinutes) {
                const newTime = minutesToTime(nextAvailableMinutes);
                const newDate = `${datePart}T${newTime}:00`;

                updates.push({
                    id: event.id,
                    date: newDate,
                    duration: eventDuration,
                });
            }

            // Calculate the NEXT slot: current event's end + required gap
            nextAvailableMinutes += eventDuration + gapMinutes;
        });

        console.log(
            `✅ [Queue:${this.teacher.username}] Gap Optimization: ${updates.length} events shifted starting from ${minutesToTime(startTimeMinutes)}`,
        );
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
            (a, b) => this.getStartTimeMinutes(a) - this.getStartTimeMinutes(b),
        );

        console.log(
            `🔍 [TeacherQueue] Finding slot for ${submitTime} (${duration}m + ${gapMinutes}m gap). Events: ${allEvents.length}`,
        );

        // Try submitTime if no conflicts and before midnight
        const hasConflict = this.doesTimeConflict(submitTime, duration, gapMinutes, allEvents);
        const isBeforeMidnight = this.startsBeforeMidnight(submitTime);

        console.log(`   👉 Checking ${submitTime}: Conflict=${hasConflict}, BeforeMidnight=${isBeforeMidnight}`);

        if (!hasConflict && isBeforeMidnight) {
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

        console.log(
            `   👉 Checking Next Slot ${nextSlotTime} (after last event at ${minutesToTime(this.getStartTimeMinutes(lastEvent))} + ${lastEvent.eventData.duration}m)`,
        );

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
    getStats(options: { includeDeleted?: boolean } = {}) {
        const events = this.getAllEvents(options);

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

            // Calculate revenue: price per student × actual students × duration hours
            const hours = event.eventData.duration / 60;
            const studentCount = event.bookingStudents?.length || 0;
            const eventRevenue = event.pricePerStudent * studentCount * hours;
            
            totalRevenue += eventRevenue;

            // Calculate commission based on event duration and revenue
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
