/**
 * QueueController - Main facade for queue operations and event management
 * Encapsulates all business logic for queue manipulation and event state
 */

import { TeacherQueue, type ControllerSettings, type EventNode } from "./TeacherQueue";
import type { EventCardProps } from "@/types/classboard-teacher-queue";
import { detectGapBefore, getMinutesFromISO, minutesToTime, createISODateTime, getDatePartFromISO } from "@/getters/queue-getter";

export type { EventCardProps } from "@/types/classboard-teacher-queue";

export class QueueController {
    private originalSnapshot: EventNode[] = [];

    constructor(
        private queue: TeacherQueue,
        private settings: ControllerSettings,
        private onRefresh: () => void,
    ) {}

    /**
     * Check if controller is in locked mode (cascade behavior)
     */
    isLocked(): boolean {
        return this.settings.locked ?? false;
    }

    /**
     * Check if in adjustment mode (snapshot exists)
     */
    isInAdjustmentMode(): boolean {
        return this.originalSnapshot.length > 0;
    }

    /**
     * Start adjustment mode - take snapshot of current queue state
     */
    startAdjustmentMode(): void {
        if (this.originalSnapshot.length > 0) return; // Already in adjustment mode
        
        this.originalSnapshot = this.queue.getAllEvents().map((e) => ({
            ...e,
            eventData: { ...e.eventData },
        }));
        
        console.log(`📸 [QueueController] Snapshot created: ${this.originalSnapshot.length} events`);
    }

    /**
     * Exit adjustment mode - clear snapshot
     */
    exitAdjustmentMode(): void {
        this.originalSnapshot = [];
        console.log(`🚪 [QueueController] Exited adjustment mode`);
    }

    /**
     * Reset queue to original snapshot state
     */
    resetToSnapshot(): void {
        if (this.originalSnapshot.length === 0) return;

        console.log(`🔄 [QueueController] Resetting to snapshot`);

        // Deep clone snapshot to restore
        const restoredEvents = this.originalSnapshot.map((e) => ({
            ...e,
            eventData: { ...e.eventData },
        }));

        this.queue.rebuildQueue(restoredEvents);
        this.onRefresh();
    }

    /**
     * Check if there are changes compared to snapshot
     */
    hasChanges(): boolean {
        if (this.originalSnapshot.length === 0) {
            return false;
        }

        const currentEvents = this.queue.getAllEvents();
        const snapshots = this.originalSnapshot;

        // Length difference = changes
        if (currentEvents.length !== snapshots.length) {
            return true;
        }

        // Check each event for changes by ID
        for (const current of currentEvents) {
            const snapshot = snapshots.find(s => s.id === current.id);
            
            if (!snapshot) return true; // New event
            
            // Check for field changes
            if (
                current.eventData.date !== snapshot.eventData.date ||
                current.eventData.duration !== snapshot.eventData.duration ||
                current.eventData.location !== snapshot.eventData.location
            ) {
                return true;
            }
        }

        // Check for deleted events
        const deletedCount = snapshots.filter(
            snapshot => !currentEvents.find(e => e.id === snapshot.id)
        ).length;

        return deletedCount > 0;
    }

    /**
     * Get all changes compared to snapshot
     * Returns array of updates and array of deletions
     */
    getChanges(): { 
        updates: Array<{ id: string; date?: string; duration?: number; location?: string }>, 
        deletions: string[] 
    } {
        if (this.originalSnapshot.length === 0) {
            return { updates: [], deletions: [] };
        }

        const currentEvents = this.queue.getAllEvents();
        const snapshots = this.originalSnapshot;
        const updates: Array<{ id: string; date?: string; duration?: number; location?: string }> = [];

        // Collect changes
        for (const current of currentEvents) {
            const snapshot = snapshots.find(s => s.id === current.id);

            if (!snapshot) {
                // New event - send all fields
                updates.push({
                    id: current.id,
                    date: current.eventData.date,
                    duration: current.eventData.duration,
                    location: current.eventData.location,
                });
                continue;
            }

            // Existing event - only send changed fields
            const update: { id: string; date?: string; duration?: number; location?: string } = { id: current.id };
            let hasChanges = false;

            if (current.eventData.date !== snapshot.eventData.date) {
                update.date = current.eventData.date;
                hasChanges = true;
            }
            if (current.eventData.duration !== snapshot.eventData.duration) {
                update.duration = current.eventData.duration;
                hasChanges = true;
            }
            if (current.eventData.location !== snapshot.eventData.location) {
                update.location = current.eventData.location;
                hasChanges = true;
            }

            if (hasChanges) {
                updates.push(update);
            }
        }

        // Collect deletions
        const deletions = snapshots
            .filter(snapshot => !currentEvents.find(e => e.id === snapshot.id))
            .map(snapshot => snapshot.id);

        return { updates, deletions };
    }

    /**
     * Get optimization statistics for display
     * Returns count of events with proper gaps vs total events
     */
    getOptimisationStats(): { adjusted: number; total: number } {
        const events = this.queue.getAllEvents();
        const total = events.length;
        
        if (total === 0) return { adjusted: 0, total: 0 };
        
        let adjusted = 0;
        for (let i = 0; i < events.length - 1; i++) {
            const current = events[i];
            const next = events[i + 1];
            const currentEndMinutes = getMinutesFromISO(current.eventData.date) + current.eventData.duration;
            const nextStartMinutes = getMinutesFromISO(next.eventData.date);
            const actualGap = nextStartMinutes - currentEndMinutes;
            
            if (actualGap === this.settings.gapMinutes) {
                adjusted++;
            }
        }
        
        // Last event is always "optimised" if it exists
        if (total > 0) adjusted++;
        
        return { adjusted, total };
    }

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
     * Remove event from queue locally (during adjustment mode)
     * Does NOT delete from database - change is tracked in snapshot comparison
     * Deletion happens on submit when getChanges() is called
     */
    removeEventLocally(eventId: string): void {
        const events = this.queue.getAllEvents();
        const eventToDelete = events.find(e => e.id === eventId);

        if (!eventToDelete) {
            console.warn(`❌ [QueueController.removeEventLocally] Event ${eventId} not found`);
            return;
        }

        console.log(`🗑️ [QueueController.removeEventLocally] Removing ${eventId} locally (will be deleted on submit)`);

        const updatedEvents = events.filter(e => e.id !== eventId);
        this.queue.rebuildQueue(updatedEvents);
        this.onRefresh();
    }

    /**
     * Check if queue can be shifted/cascaded after deleting this event
     * Returns true if there's a next event after this one
     */
    canShiftQueue(eventId: string): boolean {
        const events = this.queue.getAllEvents();
        const index = events.findIndex((e) => e.id === eventId);
        return index !== -1 && index < events.length - 1;
    }

    /**
     * Delete event and cascade/optimize remaining queue from deleted event's start time
     * Returns deleted ID and updates for all events that need to be shifted
     */
    cascadeDeleteAndOptimise(eventId: string): { deletedId: string; updates: Array<{ id: string; date: string; duration: number }> } {
        const events = this.queue.getAllEvents();
        const eventToDelete = events.find(e => e.id === eventId);
        
        if (!eventToDelete) {
            return { deletedId: eventId, updates: [] };
        }

        // Store the start time of the event being deleted
        const deletedStartTimeMinutes = getMinutesFromISO(eventToDelete.eventData.date);
        
        console.log(`🔧 [QueueController.cascadeDeleteAndOptimise] Deleting ${eventId} at ${minutesToTime(deletedStartTimeMinutes)}, cascading queue...`);

        // Remove event from queue
        const updatedEvents = events.filter(e => e.id !== eventId);
        this.queue.rebuildQueue(updatedEvents);

        // Optimize remaining queue from the deleted event's start time
        const { updates } = this.queue.optimiseFromTime(deletedStartTimeMinutes, this.settings.gapMinutes);

        console.log(`✅ [QueueController.cascadeDeleteAndOptimise] ${updates.length} events will be shifted`);

        return { deletedId: eventId, updates };
    }

    /**
     * Adjust event duration by stepDuration
     * increment: true = +stepDuration, false = -stepDuration
     * 
     * Cascade behavior:
     * - LOCKED: Always cascade to maintain linked list structure
     * - UNLOCKED: Only cascade if catching up to/overlapping next event
     */
    adjustDuration(eventId: string, increment: boolean): void {
        const event = this.queue.getAllEvents().find((e) => e.id === eventId);
        if (!event) return;

        const change = increment ? this.settings.stepDuration : -this.settings.stepDuration;
        const oldDuration = event.eventData.duration;

        event.eventData.duration = Math.max(30, event.eventData.duration + change);
        const actualChange = event.eventData.duration - oldDuration;

        if (actualChange !== 0 && event.next) {
            const newEndMinutes = getMinutesFromISO(event.eventData.date) + event.eventData.duration;
            const nextStartMinutes = getMinutesFromISO(event.next.eventData.date);
            
            // LOCKED: Always cascade
            // UNLOCKED: Only cascade if overlap occurs
            if (this.isLocked() || newEndMinutes > nextStartMinutes) {
                this.cascadeTimeAdjustment(event.next, actualChange);
            }
        }

        this.onRefresh();
    }

    /**
     * Adjust event time by stepDuration
     * increment: true = +stepDuration (later), false = -stepDuration (earlier)
     * 
     * Cascade behavior:
     * - LOCKED: Always cascade to maintain linked list structure
     * - UNLOCKED: Only cascade if catching up to/overlapping next event
     */
    adjustTime(eventId: string, increment: boolean): void {
        const event = this.queue.getAllEvents().find((e) => e.id === eventId);
        if (!event) return;

        const change = increment ? this.settings.stepDuration : -this.settings.stepDuration;
        
        this.updateEventDateTime(event, change);
        const newEndMinutes = getMinutesFromISO(event.eventData.date) + event.eventData.duration;

        if (event.next) {
            const nextStartMinutes = getMinutesFromISO(event.next.eventData.date);
            
            // LOCKED: Always cascade
            // UNLOCKED: Only cascade if overlap occurs
            if (this.isLocked() || newEndMinutes > nextStartMinutes) {
                this.cascadeTimeAdjustment(event.next, change);
            }
        }

        this.onRefresh();
    }

    /**
     * Adjust first event by arbitrary offset (for global time adjustments)
     * Respects existing gaps - only cascades if next event is adjacent
     */
    adjustFirstEventByOffset(offsetMinutes: number): void {
        const firstEvent = this.queue.getAllEvents()[0];
        if (!firstEvent || offsetMinutes === 0) return;

        const oldEndMinutes = getMinutesFromISO(firstEvent.eventData.date) + firstEvent.eventData.duration;
        this.updateEventDateTime(firstEvent, offsetMinutes);

        if (firstEvent.next) {
            const nextStartMinutes = getMinutesFromISO(firstEvent.next.eventData.date);
            if (nextStartMinutes === oldEndMinutes) {
                this.cascadeTimeAdjustment(firstEvent.next, offsetMinutes);
            }
        }

        this.onRefresh();
    }

    /**
     * Set first event to a specific time (forces to that time, ignoring gaps)
     * Used when syncing to global adjustment time via slider
     */
    setFirstEventTime(targetTimeStr: string): void {
        const firstEvent = this.queue.getAllEvents()[0];
        if (!firstEvent) return;

        const currentStartMinutes = getMinutesFromISO(firstEvent.eventData.date);
        const targetMinutes = parseFloat(targetTimeStr.split(":")[0]) * 60 + parseFloat(targetTimeStr.split(":")[1]);
        const offsetMinutes = targetMinutes - currentStartMinutes;

        if (offsetMinutes === 0) return;

        const oldEndMinutes = currentStartMinutes + firstEvent.eventData.duration;
        this.updateEventDateTime(firstEvent, offsetMinutes);

        // Only cascade if the next event was touching (no gap)
        if (firstEvent.next) {
            const nextStartMinutes = getMinutesFromISO(firstEvent.next.eventData.date);
            if (nextStartMinutes === oldEndMinutes) {
                this.cascadeTimeAdjustment(firstEvent.next, offsetMinutes);
            }
        }

        this.onRefresh();
    }

    /**
     * Move event forward in queue (earlier position)
     * Swaps with previous event and recalculates times from that position
     */
    moveUp(eventId: string): void {
        const events = this.queue.getAllEvents();
        const currentIndex = events.findIndex((e) => e.id === eventId);

        if (currentIndex < 0 || currentIndex === 0) return;

        const newIndex = currentIndex - 1;
        const preservedStartTimeMinutes = getMinutesFromISO(events[newIndex].eventData.date);

        // Swap events
        [events[currentIndex], events[newIndex]] = [events[newIndex], events[currentIndex]];

        this.queue.rebuildQueue(events);

        // Recalculate from swapped position with proper gaps
        const { updates } = this.queue.optimiseFromTime(preservedStartTimeMinutes, this.settings.gapMinutes);
        
        // Apply updates
        updates.forEach(update => {
            const event = events.find(e => e.id === update.id);
            if (event) {
                event.eventData.date = update.date;
                event.eventData.duration = update.duration;
            }
        });

        this.onRefresh();
    }

    /**
     * Move event backward in queue (later position)
     * Swaps with next event and recalculates times from that position
     */
    moveDown(eventId: string): void {
        const events = this.queue.getAllEvents();
        const currentIndex = events.findIndex((e) => e.id === eventId);

        if (currentIndex < 0 || currentIndex >= events.length - 1) return;

        const newIndex = currentIndex + 1;
        const preservedStartTimeMinutes = getMinutesFromISO(events[currentIndex].eventData.date);

        // Swap events
        [events[currentIndex], events[newIndex]] = [events[newIndex], events[currentIndex]];

        this.queue.rebuildQueue(events);

        // Recalculate from swapped position with proper gaps
        const { updates } = this.queue.optimiseFromTime(preservedStartTimeMinutes, this.settings.gapMinutes);
        
        // Apply updates
        updates.forEach(update => {
            const event = events.find(e => e.id === update.id);
            if (event) {
                event.eventData.date = update.date;
                event.eventData.duration = update.duration;
            }
        });

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

        // Calculate offset to move event to match gap requirement
        const gapOffset = gapMinutes - this.settings.gapMinutes;

        this.updateEventDateTime(currentEvent, -gapOffset);

        if (currentEvent.next) {
            const newCurrentEndTime = getMinutesFromISO(currentEvent.eventData.date) + currentEvent.eventData.duration;
            const nextStartTime = getMinutesFromISO(currentEvent.next.eventData.date);

            if (newCurrentEndTime === nextStartTime) {
                this.cascadeTimeAdjustment(currentEvent.next, -gapOffset);
            }
        }

        this.onRefresh();
    }

    /**
     * Add gap before event by moving it later to create required gap
     */
    addGap(eventId: string): void {
        const events = this.queue.getAllEvents();
        const currentEvent = events.find((e) => e.id === eventId);
        if (!currentEvent) return;

        const currentIndex = events.indexOf(currentEvent);
        if (currentIndex <= 0) return;

        const previousEvent = events[currentIndex - 1];
        const previousEndTime = getMinutesFromISO(previousEvent.eventData.date) + previousEvent.eventData.duration;
        const currentStartTime = getMinutesFromISO(currentEvent.eventData.date);
        const actualGap = currentStartTime - previousEndTime;

        // Calculate offset to move event to match gap requirement
        const requiredGap = this.settings.gapMinutes;
        const gapOffset = requiredGap - actualGap;

        console.log(`🔧 [QueueController.addGap] Event ${eventId}: actualGap=${actualGap}min, requiredGap=${requiredGap}min, adjusting by ${gapOffset}min`);

        if (gapOffset <= 0) {
            console.log(`⚠️ [QueueController.addGap] No adjustment needed (gap already sufficient)`);
            return;
        }

        this.updateEventDateTime(currentEvent, gapOffset);

        if (currentEvent.next) {
            const newCurrentEndTime = getMinutesFromISO(currentEvent.eventData.date) + currentEvent.eventData.duration;
            const nextStartTime = getMinutesFromISO(currentEvent.next.eventData.date);

            if (newCurrentEndTime === nextStartTime) {
                this.cascadeTimeAdjustment(currentEvent.next, gapOffset);
            }
        }

        this.onRefresh();
    }

    /**
     * Set all events in queue to the same location
     */
    setAllEventsLocation(newLocation: string): void {
        const events = this.queue.getAllEvents();
        events.forEach((event) => {
            event.eventData.location = newLocation;
        });
        this.onRefresh();
    }

    /**
     * Update event location in queue
     * Only affects this.queue - database persistence happens on submit
     */
    updateLocation(eventId: string, location: string): void {
        const event = this.queue.getAllEvents().find((e) => e.id === eventId);
        if (!event) return;

        event.eventData.location = location;
        this.onRefresh();
    }

    /**
     * Optimize entire queue with proper gaps
     * Applies updates, re-sorts by time, rebuilds queue, and triggers refresh
     */
    optimiseQueue(): { count: number; affectedEventIds: string[] } {
        const { updates } = this.queue.optimiseQueue(this.settings.gapMinutes);

        if (updates.length === 0) {
            return { count: 0, affectedEventIds: [] };
        }

        console.log(`🔧 [QueueController.optimiseQueue] Applying ${updates.length} updates...`);

        // Get all events and apply updates
        const events = this.queue.getAllEvents();
        const affectedEventIds: string[] = [];

        updates.forEach(update => {
            const event = events.find(e => e.id === update.id);
            if (event) {
                event.eventData.date = update.date;
                event.eventData.duration = update.duration;
                affectedEventIds.push(event.id);
            }
        });

        // Re-sort events by start time to ensure correct order
        events.sort((a, b) => {
            const aMinutes = getMinutesFromISO(a.eventData.date);
            const bMinutes = getMinutesFromISO(b.eventData.date);
            return aMinutes - bMinutes;
        });

        // Rebuild queue with sorted events
        this.queue.rebuildQueue(events);

        console.log(`✅ [QueueController.optimiseQueue] Queue optimized and reordered | Affected: ${affectedEventIds.length}`);

        this.onRefresh();
        return { count: updates.length, affectedEventIds };
    }

    /**
     * Check if queue is optimized (all gaps match required gap)
     */
    isQueueOptimised(): boolean {
        return this.queue.isQueueOptimised(this.settings.gapMinutes);
    }

    /**
     * Update controller settings (called when global settings change)
     */
    updateSettings(settings: ControllerSettings): void {
        this.settings = settings;
    }

    /**
     * Get controller settings (for gap requirement calculations)
     */
    getSettings(): ControllerSettings {
        return this.settings;
    }

    getQueue(): TeacherQueue {
        return this.queue;
    }

    // ============ PRIVATE HELPERS ============

    private updateEventDateTime(eventNode: EventNode, changeMinutes: number): void {
        const currentMinutes = getMinutesFromISO(eventNode.eventData.date);
        const newMinutes = currentMinutes + changeMinutes;
        const datePart = getDatePartFromISO(eventNode.eventData.date);
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
            const datePart = getDatePartFromISO(event.eventData.date);
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
