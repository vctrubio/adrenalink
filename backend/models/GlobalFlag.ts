/**
 * GlobalFlag - Manages global time adjustment state and operations
 * Encapsulates all logic for adjusting teacher queue times globally
 */

import { QueueController } from "../QueueController";
import type { TeacherQueue, ControllerSettings, EventNode } from "../TeacherQueue";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";

export class GlobalFlag {
    private adjustmentMode = false;
    private globalTime: string | null = null;
    private globalLocation: string | null = null;
    private pendingTeachers = new Set<string>();
    private isLocked = false;
    private refreshKey = 0;
    private originalQueueStates = new Map<string, EventNode[]>();

    constructor(
        private teacherQueues: TeacherQueue[],
        private controller: ControllerSettings,
        private onRefresh: () => void
    ) {}

    // ============ GETTERS ============

    isAdjustmentMode(): boolean {
        return this.adjustmentMode;
    }

    getGlobalTime(): string | null {
        return this.globalTime;
    }

    getPendingTeachers(): ReadonlySet<string> {
        return this.pendingTeachers as ReadonlySet<string>;
    }

    isAdjustmentLocked(): boolean {
        return this.isLocked;
    }

    getRefreshKey(): number {
        return this.refreshKey;
    }

    getController(): ControllerSettings {
        return this.controller;
    }

    /**
     * Calculate global earliest time across all teacher queues
     */
    getGlobalEarliestTime(): string | null {
        const allEarliestTimes = this.teacherQueues
            .map((queue) => queue.getEarliestEventTime())
            .filter((time) => time !== null) as string[];

        if (allEarliestTimes.length === 0) return null;

        const minTimeInMinutes = Math.min(...allEarliestTimes.map((time) => timeToMinutes(time)));
        return minutesToTime(minTimeInMinutes);
    }

    /**
     * Get earliest time from only pending teachers
     * Used to reset adjustment time when canceling
     */
    getEarliestTimeFromPending(): string | null {
        const pendingTimes: string[] = [];
        this.pendingTeachers.forEach((username) => {
            const queue = this.teacherQueues.find((q) => q.teacher.username === username);
            if (queue) {
                const earliestTime = queue.getEarliestEventTime();
                if (earliestTime) {
                    pendingTimes.push(earliestTime);
                }
            }
        });

        if (pendingTimes.length === 0) return this.getGlobalEarliestTime();

        const minTimeInMinutes = Math.min(...pendingTimes.map((time) => timeToMinutes(time)));
        return minutesToTime(minTimeInMinutes);
    }

    /**
     * Calculate global location - most common location across all teacher queues
     */
    getGlobalLocation(): string | null {
        const allLocations: string[] = [];
        this.teacherQueues.forEach((queue) => {
            const events = queue.getAllEvents();
            events.forEach((event) => {
                if (event.eventData.location) {
                    allLocations.push(event.eventData.location);
                }
            });
        });

        if (allLocations.length === 0) return null;

        // Count occurrences and return the most common
        const locationCounts = allLocations.reduce(
            (acc, loc) => {
                acc[loc] = (acc[loc] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        const mostCommonLocation = Object.entries(locationCounts).sort(
            (a, b) => b[1] - a[1]
        )[0][0];

        return mostCommonLocation;
    }

    /**
     * Get location from only pending teachers
     */
    getLocationFromPending(): string | null {
        const pendingLocations: string[] = [];
        this.pendingTeachers.forEach((username) => {
            const queue = this.teacherQueues.find((q) => q.teacher.username === username);
            if (queue) {
                const events = queue.getAllEvents();
                events.forEach((event) => {
                    if (event.eventData.location) {
                        pendingLocations.push(event.eventData.location);
                    }
                });
            }
        });

        if (pendingLocations.length === 0) return this.getGlobalLocation();

        // Count occurrences and return the most common
        const locationCounts = pendingLocations.reduce(
            (acc, loc) => {
                acc[loc] = (acc[loc] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        const mostCommonLocation = Object.entries(locationCounts).sort(
            (a, b) => b[1] - a[1]
        )[0][0];

        return mostCommonLocation;
    }

    // ============ STATE MANAGEMENT ============

    /**
     * Enter global adjustment mode
     * Initializes pending teachers with all teachers that have events
     * Stores original queue state for change detection
     */
    enterAdjustmentMode(): void {
        const teachersWithEvents = this.teacherQueues
            .filter((queue) => queue.getAllEvents().length > 0)
            .map((queue) => queue.teacher.username);

        this.pendingTeachers = new Set(teachersWithEvents);
        this.adjustmentMode = true;
        this.globalTime = this.getGlobalEarliestTime();
        this.globalLocation = this.getGlobalLocation();

        // Store original state for each teacher
        this.originalQueueStates.clear();
        this.teacherQueues.forEach((queue) => {
            if (this.pendingTeachers.has(queue.teacher.username)) {
                const events = queue.getAllEvents();
                this.originalQueueStates.set(
                    queue.teacher.username,
                    events.map((event) => ({
                        ...event,
                        eventData: { ...event.eventData },
                    }))
                );
            }
        });

        this.onRefresh();
    }

    /**
     * Discard all changes and restore original state
     */
    discardChanges(): void {
        this.teacherQueues.forEach((queue) => {
            if (this.pendingTeachers.has(queue.teacher.username)) {
                const originalEvents = this.originalQueueStates.get(queue.teacher.username) || [];
                const currentEvents = queue.getAllEvents();

                // Restore original state for each event
                currentEvents.forEach((currentEvent, index) => {
                    const originalEvent = originalEvents[index];
                    if (originalEvent) {
                        currentEvent.eventData.date = originalEvent.eventData.date;
                        currentEvent.eventData.duration = originalEvent.eventData.duration;
                        currentEvent.eventData.location = originalEvent.eventData.location;
                    }
                });
            }
        });

        this.onRefresh();
    }

    /**
     * Exit global adjustment mode
     * Clears pending teachers, resets lock, and clears original state
     */
    exitAdjustmentMode(): void {
        this.adjustmentMode = false;
        this.globalTime = null;
        this.globalLocation = null;
        this.pendingTeachers.clear();
        this.isLocked = false;
        this.originalQueueStates.clear();
        this.onRefresh();
    }

    /**
     * Opt a teacher into global adjustments
     */
    optIn(teacherUsername: string): void {
        this.pendingTeachers.add(teacherUsername);
        this.onRefresh();
    }

    /**
     * Opt a teacher out of global adjustments
     * If all teachers are opted out, exit adjustment mode
     */
    optOut(teacherUsername: string): void {
        this.pendingTeachers.delete(teacherUsername);

        if (this.pendingTeachers.size === 0) {
            this.exitAdjustmentMode();
        }

        this.onRefresh();
    }

    // ============ TIME ADJUSTMENT ============

    /**
     * Adjust global time to new value
     * Respects gaps using QueueController methods
     */
    adjustTime(newTime: string): void {
        if (this.isLocked) {
            this.adjustTimeLocked(newTime);
        } else {
            this.adjustTimeUnlocked(newTime);
        }

        this.globalTime = newTime;
        this.refreshKey++;
        this.onRefresh();
    }

    /**
     * Locked mode: sync all queues to adjustment time, but respect those already past it
     * Teachers already past the new time stay put (can't move backwards before global earliest)
     */
    private adjustTimeLocked(newTime: string): void {
        const newMinutes = timeToMinutes(newTime);

        this.teacherQueues.forEach((queue) => {
            if (this.pendingTeachers.has(queue.teacher.username)) {
                const earliestTime = queue.getEarliestEventTime();
                if (earliestTime) {
                    const currentMinutes = timeToMinutes(earliestTime);

                    // Only sync teachers who are at or before the new time
                    // Teachers already past the new time should not move backwards
                    if (currentMinutes <= newMinutes) {
                        const queueController = new QueueController(queue, this.controller, () => {
                            this.refreshKey++;
                            this.onRefresh();
                        });
                        queueController.setFirstEventTime(newTime);
                    }
                }
            }
        });

        this.globalTime = newTime;
    }

    /**
     * Unlocked mode: move teachers who are at or before the adjustment time
     * Teachers already past the new time should NOT move backwards
     */
    private adjustTimeUnlocked(newTime: string): void {
        if (!this.globalTime) return;

        const newMinutes = timeToMinutes(newTime);

        this.teacherQueues.forEach((queue) => {
            if (this.pendingTeachers.has(queue.teacher.username)) {
                const earliestTime = queue.getEarliestEventTime();
                if (earliestTime) {
                    const queueMinutes = timeToMinutes(earliestTime);

                    // Only move teachers who are at or before the new time
                    // Teachers already past the new time should not move backwards
                    if (queueMinutes <= newMinutes) {
                        const queueController = new QueueController(queue, this.controller, () => {
                            this.refreshKey++;
                            this.onRefresh();
                        });
                        queueController.setFirstEventTime(newTime);
                    }
                }
            }
        });
    }

    /**
     * Adapt (Lock/Unlock) all pending teachers
     * If unlocked: sync all to earliest time and lock
     * If locked: unlock
     */
    adapt(): void {
        if (this.isLocked) {
            // Already locked: unlock
            this.isLocked = false;
            this.refreshKey++;
            this.onRefresh();
        } else {
            // Not locked: sync all pending teachers to earliest time and lock
            this.syncAllToEarliest();
            this.isLocked = true;
            this.refreshKey++;
            this.onRefresh();
        }
    }

    /**
     * Lock all pending teachers to a specific adjustment time
     */
    lockToAdjustmentTime(targetTime: string): void {
        this.teacherQueues.forEach((queue) => {
            if (this.pendingTeachers.has(queue.teacher.username)) {
                const earliestTime = queue.getEarliestEventTime();
                if (earliestTime) {
                    const queueController = new QueueController(queue, this.controller, () => {
                        this.refreshKey++;
                        this.onRefresh();
                    });
                    queueController.setFirstEventTime(targetTime);
                }
            }
        });

        this.isLocked = true;
        this.refreshKey++;
        this.onRefresh();
    }

    /**
     * Sync all pending teachers to earliest time
     */
    private syncAllToEarliest(): void {
        const pendingTimes: string[] = [];
        this.teacherQueues.forEach((queue) => {
            if (this.pendingTeachers.has(queue.teacher.username)) {
                const earliestTime = queue.getEarliestEventTime();
                if (earliestTime) {
                    pendingTimes.push(earliestTime);
                }
            }
        });

        if (pendingTimes.length === 0) return;

        const minTimeInMinutes = Math.min(...pendingTimes.map((time) => timeToMinutes(time)));
        const syncTargetTime = minutesToTime(minTimeInMinutes);

        this.teacherQueues.forEach((queue) => {
            if (this.pendingTeachers.has(queue.teacher.username)) {
                const earliestTime = queue.getEarliestEventTime();
                if (earliestTime) {
                    const queueController = new QueueController(queue, this.controller, () => {
                        this.refreshKey++;
                        this.onRefresh();
                    });
                    queueController.setFirstEventTime(syncTargetTime);
                }
            }
        });
    }

    // ============ LOCATION ADJUSTMENT ============

    /**
     * Adjust all pending teacher locations to new location
     */
    adjustLocation(newLocation: string): void {
        this.teacherQueues.forEach((queue) => {
            if (this.pendingTeachers.has(queue.teacher.username)) {
                const queueController = new QueueController(queue, this.controller, () => {
                    this.refreshKey++;
                    this.onRefresh();
                });
                queueController.setAllEventsLocation(newLocation);
            }
        });

        this.globalLocation = newLocation;
        this.refreshKey++;
        this.onRefresh();
    }

    /**
     * Lock all pending teachers to a specific location
     */
    lockToLocation(targetLocation: string): void {
        this.teacherQueues.forEach((queue) => {
            if (this.pendingTeachers.has(queue.teacher.username)) {
                const queueController = new QueueController(queue, this.controller, () => {
                    this.refreshKey++;
                    this.onRefresh();
                });
                queueController.setAllEventsLocation(targetLocation);
            }
        });

        this.globalLocation = targetLocation;
        this.isLocked = true;
        this.refreshKey++;
        this.onRefresh();
    }

    /**
     * Get current global location
     */
    getGlobalLocationAdjustment(): string | null {
        return this.globalLocation;
    }

    /**
     * Collect all changed events from pending teachers
     * Compares current state against original state to find changes
     */
    collectChanges(): { id: string; date: string; duration: number }[] {
        const allUpdates: { id: string; date: string; duration: number }[] = [];

        this.teacherQueues.forEach((queue) => {
            if (!this.pendingTeachers.has(queue.teacher.username)) {
                return;
            }

            const originalEvents = this.originalQueueStates.get(queue.teacher.username) || [];
            const currentEvents = queue.getAllEvents();

            currentEvents.forEach((currentEvent) => {
                const originalEvent = originalEvents.find((e) => e.id === currentEvent.id);
                if (!originalEvent) return; // New event

                // Check if date or duration changed
                const dateChanged = currentEvent.eventData.date !== originalEvent.eventData.date;
                const durationChanged = currentEvent.eventData.duration !== originalEvent.eventData.duration;

                if (dateChanged || durationChanged) {
                    allUpdates.push({
                        id: currentEvent.id,
                        date: currentEvent.eventData.date,
                        duration: currentEvent.eventData.duration,
                    });
                }
            });
        });

        return allUpdates;
    }

    /**
     * Update teacher queues reference (for when queues change)
     */
    updateTeacherQueues(queues: TeacherQueue[]): void {
        this.teacherQueues = queues;
    }
}
