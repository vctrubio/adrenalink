/**
 * GlobalFlag - Centralized state manager for Classboard operations.
 *
 * RESPONSIBILITIES:
 * 1. Event Mutations: Tracks which events are being created/updated/deleted (spinner state)
 * 2. Controller Settings: Manages gap, stepDuration, minDuration (persisted to localStorage)
 * 3. Adjustment Mode: Manages edit sessions for all teachers
 * 4. Teacher Queues: Source of truth for all teacher queues on selected date
 * 5. Date Changes: Auto-exits adjustment mode when date changes
 *
 * DESIGN PRINCIPLES:
 * - Single Source of Truth: All classboard state lives here
 * - Instance Preservation: Edit sessions survive background data refreshes
 * - Automatic Session Management: Sessions terminate when last teacher opts out
 */

import { QueueController } from "./QueueController";
import type { TeacherQueue } from "./TeacherQueue";
import type { ControllerSettings } from "@/types/classboard-teacher-queue";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";

// Re-export for backwards compatibility
export type { ControllerSettings } from "@/types/classboard-teacher-queue";

export type EventMutationType = "creating" | "updating" | "deleting";

interface EventMutation {
    eventId: string;
    type: EventMutationType;
    teacherId?: string;
}

const CONTROLLER_STORAGE_KEY = "classboard-controller-settings";

const DEFAULT_CONTROLLER: ControllerSettings = {
    submitTime: "09:00",
    location: "Beach",
    durationCapOne: 60,
    durationCapTwo: 90,
    durationCapThree: 120,
    gapMinutes: 0,
    stepDuration: 30,
    minDuration: 60,
    maxDuration: 180,
    locked: false,
    locationOptions: ["Beach", "Bay", "Lake", "River", "Pool", "Indoor"],
    minTimeMinutes: 0,
    maxTimeMinutes: 1380,
};

// ============ CLASS ============

export class GlobalFlag {
    // Event Mutations - tracks spinners
    private eventMutations = new Map<string, EventMutation>();

    // Controller Settings - persisted
    private controller: ControllerSettings;

    // Adjustment Mode State
    private adjustmentMode = false;
    private globalTime: string | null = null;
    private globalLocation: string | null = null;
    private globalCascadeMode = false;

    // Teacher Queue Controllers (active edit sessions)
    private queueControllers = new Map<string, QueueController>();
    private submittingTeachers = new Set<string>();

    // UI State
    public isLockedTime = false;
    public isLockedLocation = false;
    private refreshKey = 0;

    constructor(
        private teacherQueues: TeacherQueue[],
        private onRefresh: () => void,
    ) {
        // Load controller from localStorage or use defaults
        this.controller = this.loadControllerFromStorage();
    }

    // ============ CONTROLLER SETTINGS (Persisted) ============

    private loadControllerFromStorage(): ControllerSettings {
        if (typeof window === "undefined") return DEFAULT_CONTROLLER;

        try {
            const stored = localStorage.getItem(CONTROLLER_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return { ...DEFAULT_CONTROLLER, ...parsed, locked: false };
            }
        } catch (error) {
            console.warn("[GlobalFlag] Failed to load controller from storage:", error);
        }
        return DEFAULT_CONTROLLER;
    }

    private saveControllerToStorage(): void {
        if (typeof window === "undefined") return;

        try {
            const { locked, ...toSave } = this.controller;
            localStorage.setItem(CONTROLLER_STORAGE_KEY, JSON.stringify(toSave));
        } catch (error) {
            console.warn("[GlobalFlag] Failed to save controller to storage:", error);
        }
    }

    getController(): ControllerSettings {
        return this.controller;
    }

    getLocationOptionsFromStorage(): string[] {
        if (typeof window === "undefined") return DEFAULT_CONTROLLER.locationOptions;

        try {
            const stored = localStorage.getItem(CONTROLLER_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed.locationOptions || DEFAULT_CONTROLLER.locationOptions;
            }
        } catch (error) {
            console.warn("[GlobalFlag] Failed to load location options from storage:", error);
        }
        return DEFAULT_CONTROLLER.locationOptions;
    }

    updateController(updates: Partial<ControllerSettings>): void {
        this.controller = { ...this.controller, ...updates };
        this.saveControllerToStorage();

        // Propagate to all active QueueControllers
        this.queueControllers.forEach((qc) => {
            qc.updateSettings(this.controller);
        });

        this.refreshKey++;
        this.triggerRefresh();
    }

    // ============ OPTIMISTIC EVENT MANAGEMENT ============

    addOptimisticEvent(teacherId: string, event: any): void {
        const queue = this.teacherQueues.find(q => q.teacher.id === teacherId);
        if (queue) {
            queue.addOptimisticEvent(event);
            this.refreshKey++;
            this.triggerRefresh();
        }
    }

    removeOptimisticEvent(teacherId: string, eventId: string): void {
        const queue = this.teacherQueues.find(q => q.teacher.id === teacherId);
        if (queue) {
            queue.removeOptimisticEvent(eventId);
            this.refreshKey++;
            this.triggerRefresh();
        }
    }

    markEventAsDeleted(teacherId: string, eventId: string): void {
        const queue = this.teacherQueues.find(q => q.teacher.id === teacherId);
        if (queue) {
            queue.markAsDeleted(eventId);
            this.refreshKey++;
            this.triggerRefresh();
        }
    }

    unmarkEventAsDeleted(teacherId: string, eventId: string): void {
        const queue = this.teacherQueues.find(q => q.teacher.id === teacherId);
        if (queue) {
            queue.unmarkAsDeleted(eventId);
            this.refreshKey++;
            this.triggerRefresh();
        }
    }

    /**
     * Check if a booking has any optimistic events (additions)
     */
    hasOptimisticEventsForBooking(bookingId: string): boolean {
        for (const queue of this.teacherQueues) {
            if (queue.hasOptimisticForBooking(bookingId)) return true;
        }
        return false;
    }

    // ============ EVENT MUTATIONS (Spinner State) ============

    notifyEventMutation(eventId: string, type: EventMutationType, teacherId?: string): void {
        this.eventMutations.set(eventId, { eventId, type, teacherId });
        this.triggerRefresh();
    }

    clearEventMutation(eventId: string): void {
        this.eventMutations.delete(eventId);
        this.triggerRefresh();
    }

    isEventMutating(eventId: string): boolean {
        return this.eventMutations.has(eventId);
    }

    getEventMutation(eventId: string): EventMutation | undefined {
        return this.eventMutations.get(eventId);
    }

    getMutatingEventIds(): Set<string> {
        return new Set(this.eventMutations.keys());
    }

    // ============ DATE CHANGE HANDLING ============

    onDateChange(): void {
        // Auto-exit adjustment mode when date changes
        if (this.adjustmentMode) {
            console.log("[GlobalFlag] Date changed - exiting adjustment mode");
            this.exitAdjustmentMode(true); // Discard changes
        }

        // Clear all mutations
        this.eventMutations.clear();
    }

    // ============ TEACHER QUEUES ============

    getTeacherQueues(): TeacherQueue[] {
        return this.teacherQueues;
    }

    /**
     * Detect if a queue has changed (different event count or structure)
     */
    private hasQueueChanged(oldQueue: TeacherQueue, newQueue: TeacherQueue): boolean {
        const oldEvents = oldQueue.getAllEvents();
        const newEvents = newQueue.getAllEvents();

        // Different count = changed
        if (oldEvents.length !== newEvents.length) return true;

        // Check if event IDs match in same order
        for (let i = 0; i < oldEvents.length; i++) {
            if (oldEvents[i].id !== newEvents[i].id) return true;
        }

        return false;
    }

    /**
     * Update a single teacher's queue (granular update instead of full rebuild)
     * If the queue changed while in adjustment mode, exit adjustment for that teacher
     */
    updateSingleTeacherQueue(newQueue: TeacherQueue): void {
        const teacherId = newQueue.teacher.id;
        const existingIndex = this.teacherQueues.findIndex((q) => q.teacher.id === teacherId);

        if (existingIndex < 0) {
            // Teacher not found, just add it
            this.teacherQueues.push(newQueue);
        } else {
            // Check if this teacher is in adjustment mode
            const isInAdjustment = this.queueControllers.has(teacherId);

            if (isInAdjustment) {
                const preservedQueue = this.queueControllers.get(teacherId)?.getQueue();

                // CONFLICT DETECTION: Did the server queue change while user was editing?
                if (preservedQueue && this.hasQueueChanged(preservedQueue, newQueue)) {
                    console.log(`⚠️ [GlobalFlag] Queue for ${newQueue.teacher.id} changed on server - exiting adjustment mode`);
                    // Exit adjustment for this teacher only
                    this.optOut(teacherId);
                    // Use fresh server data
                    this.teacherQueues[existingIndex] = newQueue;
                } else {
                    // No conflict - keep the edited queue
                    // (preservedQueue is already in teacherQueues via updateTeacherQueues)
                }
            } else {
                // Not in adjustment mode - just update normally
                this.teacherQueues[existingIndex] = newQueue;
            }
        }

        this.refreshKey++;
        this.triggerRefresh();
    }

    updateTeacherQueues(queues: TeacherQueue[]): void {
        console.log(`🔄 [GlobalFlag] Updating teacher queues (${this.teacherQueues.length} -> ${queues.length})`);

        // Preserve queues that are being edited
        const preservedQueues = new Map<string, TeacherQueue>();
        this.queueControllers.forEach((qc, id) => {
            preservedQueues.set(id, qc.getQueue());
        });

        this.teacherQueues = queues.map((newQueue) => {
            if (preservedQueues.has(newQueue.teacher.id)) {
                return preservedQueues.get(newQueue.teacher.id)!;
            }
            return newQueue;
        });

        this.refreshKey++;
        this.triggerRefresh();
    }

    // ============ ADJUSTMENT MODE ============

    isAdjustmentMode(): boolean {
        return this.adjustmentMode;
    }

    getQueueController(teacherId: string): QueueController | undefined {
        return this.queueControllers.get(teacherId);
    }

    getPendingTeachers(): ReadonlySet<string> {
        return new Set(this.queueControllers.keys());
    }

    getRefreshKey(): number {
        return this.refreshKey;
    }

    enterAdjustmentMode(): void {
        this.queueControllers.clear();

        // Initialize controllers for all queues with events
        this.teacherQueues.forEach((queue) => {
            if (queue.getAllEvents().length > 0) {
                const qc = new QueueController(queue, this.controller, () => {
                    this.refreshKey++;
                    this.triggerRefresh();
                });
                qc.startAdjustmentMode();
                this.queueControllers.set(queue.teacher.id, qc);
            }
        });

        this.adjustmentMode = true;
        this.globalTime = this.getGlobalEarliestTime();
        this.globalLocation = this.getGlobalLocation();

        // Auto-lock if everything is already synchronized on entry
        const timeStatus = this.getLockStatusTime(this.globalTime);
        const locStatus = this.getLockStatusLocation(this.globalLocation);

        if (timeStatus.isLockFlagTime && timeStatus.totalTeachers > 0) {
            this.isLockedTime = true;
            this.controller.locked = true;
            this.globalCascadeMode = true;
        }

        if (locStatus.isLockFlagLocation && locStatus.totalTeachers > 0) {
            this.isLockedLocation = true;
        }

        // Propagate potential lock changes to all controllers
        this.queueControllers.forEach(qc => qc.updateSettings(this.controller));

        this.refreshKey++;
        this.triggerRefresh();
    }

    exitAdjustmentMode(shouldDiscard = false): void {
        this.queueControllers.forEach((qc) => {
            if (shouldDiscard) {
                qc.resetToSnapshot();
            }
            qc.exitAdjustmentMode();
        });
        this.queueControllers.clear();

        this.adjustmentMode = false;
        this.globalTime = null;
        this.globalLocation = null;
        this.submittingTeachers.clear();
        this.isLockedTime = false;
        this.isLockedLocation = false;
        this.refreshKey++;
        this.triggerRefresh();
    }

    optIn(teacherId: string): void {
        const queue = this.teacherQueues.find((q) => q.teacher.id === teacherId);
        if (queue && !this.queueControllers.has(teacherId)) {
            const qc = new QueueController(queue, this.controller, () => {
                this.refreshKey++;
                this.triggerRefresh();
            });
            qc.startAdjustmentMode();
            this.queueControllers.set(teacherId, qc);
            this.refreshKey++;
            this.triggerRefresh();
        }
    }

    optOut(teacherId: string): void {
        const qc = this.queueControllers.get(teacherId);
        if (qc) {
            qc.exitAdjustmentMode();
            this.queueControllers.delete(teacherId);
        }

        this.submittingTeachers.delete(teacherId);

        // Auto-terminate session if no teachers left
        if (this.queueControllers.size === 0) {
            this.exitAdjustmentMode();
        } else {
            this.refreshKey++;
            this.triggerRefresh();
        }
    }

    discardChanges(): void {
        this.queueControllers.forEach((qc) => {
            qc.resetToSnapshot();
        });
    }

    // ============ SUBMITTING STATE ============

    isSubmitting(teacherId: string): boolean {
        return this.submittingTeachers.has(teacherId);
    }

    setSubmitting(teacherId: string, isSubmitting: boolean): void {
        if (isSubmitting) {
            this.submittingTeachers.add(teacherId);
        } else {
            this.submittingTeachers.delete(teacherId);
        }
    }

    // ============ GLOBAL TIME/LOCATION ============

    getGlobalTime(): string | null {
        return this.globalTime;
    }

    getGlobalEarliestTime(): string | null {
        const allEarliestTimes = Array.from(this.queueControllers.values())
            .map((qc) => qc.getQueue().getEarliestTime())
            .filter((time) => time !== null) as string[];

        if (allEarliestTimes.length === 0) return null;

        const minTimeInMinutes = Math.min(...allEarliestTimes.map((time) => timeToMinutes(time)));
        return minutesToTime(minTimeInMinutes);
    }

    getGlobalLocation(): string | null {
        const allLocations: string[] = [];
        this.queueControllers.forEach((qc) => {
            const events = qc.getQueue().getAllEvents();
            events.forEach((event) => {
                if (event.eventData.location) {
                    allLocations.push(event.eventData.location);
                }
            });
        });

        if (allLocations.length === 0) return null;

        const locationCounts = allLocations.reduce(
            (acc, loc) => {
                acc[loc] = (acc[loc] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );

        return Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0][0];
    }

    getGlobalCascadeMode(): boolean {
        return this.globalCascadeMode;
    }

    setGlobalCascadeMode(cascadeMode: boolean): void {
        this.globalCascadeMode = cascadeMode;
        this.controller.locked = cascadeMode;
        this.refreshKey++;
    }

    // ============ TIME/LOCATION ADJUSTMENTS ============

    adjustTime(newTime: string): void {
        console.log(`⏱️ [GlobalFlag.adjustTime] New: ${newTime} | Locked: ${this.isLockedTime}`);
        
        // Only propagate time change to queues if global time lock is ON
        if (this.isLockedTime) {
            console.log(`  🔗 Propagation ACTIVE (adjusting ${this.queueControllers.size} queues)`);
            this.queueControllers.forEach((qc) => {
                qc.setFirstEventTime(newTime);
            });
        } else {
            console.log("  ∅ Propagation DISABLED (unlocked)");
        }

        this.globalTime = newTime;
        this.refreshKey++;
        this.triggerRefresh();
    }

    lockToAdjustmentTime(targetTime: string): void {
        console.log(`🔒 [GlobalFlag.lockToAdjustmentTime] Target: ${targetTime}`);
        
        // 1. Update persistent intent
        this.isLockedTime = true;
        this.globalCascadeMode = true;
        
        // 2. Snap all queues
        this.queueControllers.forEach((qc) => {
            qc.setFirstEventTime(targetTime);
        });

        // 3. Update controller settings and propagate to all edit sessions
        this.updateController({ locked: true });
        
        this.globalTime = targetTime;
        this.refreshKey++;
        this.triggerRefresh();
    }

    unlockTime(): void {
        console.log("🔓 [GlobalFlag.unlockTime]");
        this.isLockedTime = false;
        
        // If location is also unlocked, we can unlock the underlying controllers too
        if (!this.isLockedLocation) {
            this.updateController({ locked: false });
        }
        
        this.refreshKey++;
        this.triggerRefresh();
    }

    adjustLocation(newLocation: string): void {
        console.log(`📍 [GlobalFlag.adjustLocation] New: ${newLocation} | Locked: ${this.isLockedLocation}`);
        
        // Only propagate location change to queues if global location lock is ON
        if (this.isLockedLocation) {
            console.log("  🔗 Propagation ACTIVE");
            this.queueControllers.forEach((qc) => {
                qc.setAllEventsLocation(newLocation);
            });
        } else {
            console.log("  ∅ Propagation DISABLED");
        }

        this.globalLocation = newLocation;
        this.refreshKey++;
        this.triggerRefresh();
    }

    lockToLocation(targetLocation: string): void {
        console.log(`🔒 [GlobalFlag.lockToLocation] Target: ${targetLocation}`);
        
        this.queueControllers.forEach((qc) => {
            qc.setAllEventsLocation(targetLocation);
        });

        this.globalLocation = targetLocation;
        this.isLockedLocation = true;
        
        this.refreshKey++;
        this.triggerRefresh();
    }

    unlockLocation(): void {
        console.log("🔓 [GlobalFlag.unlockLocation]");
        this.isLockedLocation = false;
        this.refreshKey++;
        this.triggerRefresh();
    }

    // ============ LOCK STATUS ============

    getLockStatusTime(targetTime?: string | null) {
        const pendingControllers = Array.from(this.queueControllers.values());
        const totalTeachers = pendingControllers.length;

        const pendingTeachersTimes = pendingControllers.map((qc) => ({ username: qc.getQueue().teacher.username, earliestTime: qc.getQueue().getEarliestTime() })).filter((t) => t.earliestTime !== null) as { username: string; earliestTime: string }[];

        if (pendingTeachersTimes.length === 0 || totalTeachers === 0) {
            return { isLockFlagTime: false, lockCount: 0, totalTeachers: 0 };
        }

        const referenceTime =
            targetTime ||
            pendingTeachersTimes.reduce((min, t) => {
                const minMinutes = timeToMinutes(min);
                const tMinutes = timeToMinutes(t.earliestTime);
                return tMinutes < minMinutes ? t.earliestTime : min;
            }, pendingTeachersTimes[0].earliestTime);

        const synchronizedCount = pendingTeachersTimes.filter((t) => t.earliestTime === referenceTime).length;

        return {
            isLockFlagTime: synchronizedCount === totalTeachers,
            lockCount: synchronizedCount,
            totalTeachers,
        };
    }

    getLockStatusLocation(targetLocation?: string | null) {
        let totalEventsForLock = 0;
        let synchronizedEventsCount = 0;
        const pendingTeachersLocations: { username: string; location: string | null }[] = [];

        this.queueControllers.forEach((qc) => {
            const events = qc.getQueue().getAllEvents();
            const allLocations = events.map((e) => e.eventData.location).filter((l) => l !== null && l !== undefined);
            const allMatch = allLocations.length > 0 && allLocations.every((l) => l === allLocations[0]);

            totalEventsForLock += events.length;

            if (allMatch) {
                pendingTeachersLocations.push({ username: qc.getQueue().teacher.username, location: allLocations[0] });
            } else {
                pendingTeachersLocations.push({ username: qc.getQueue().teacher.username, location: null });
            }
        });

        const totalTeachers = pendingTeachersLocations.length;
        const referenceLocation = targetLocation || pendingTeachersLocations.find((t) => t.location !== null)?.location;

        if (referenceLocation) {
            this.queueControllers.forEach((qc) => {
                const events = qc.getQueue().getAllEvents();
                events.forEach((e) => {
                    if (e.eventData.location === referenceLocation) {
                        synchronizedEventsCount++;
                    }
                });
            });
        }

        const synchronizedTeachersCount = referenceLocation 
            ? pendingTeachersLocations.filter((t) => t.location === referenceLocation).length 
            : 0;

        const allSynchronized = referenceLocation ? synchronizedTeachersCount === totalTeachers : false;

        return {
            isLockFlagLocation: allSynchronized && referenceLocation !== null,
            lockLocationCount: synchronizedEventsCount,
            totalLocationEventsForLock: totalEventsForLock,
            synchronizedTeachersCount,
            totalTeachers,
        };
    }

    // ============ OPTIMISATION ============

    getOptimisationStats(): { optimised: number; total: number } {
        let totalEvents = 0;
        let optimisedEvents = 0;

        this.queueControllers.forEach((qc) => {
            const allEvents = qc.getQueue().getAllEvents();
            totalEvents += allEvents.length;

            if (qc.isQueueOptimised()) {
                optimisedEvents += allEvents.length;
            }
        });

        return { optimised: optimisedEvents, total: totalEvents };
    }

    optimiseAllQueues(): void {
        this.queueControllers.forEach((qc) => {
            qc.optimiseQueue();
        });

        // Fully lock the state after optimization
        this.isLockedTime = true;
        this.isLockedLocation = true;
        this.controller.locked = true;
        this.globalCascadeMode = true;
        
        this.refreshKey++;
    }

    // ============ PERSISTENCE / CHANGES ============

    getChangedEventsCount(): number {
        let count = 0;
        this.queueControllers.forEach((qc) => {
            if (qc.hasChanges()) {
                const { updates } = qc.getChanges();
                count += updates.length;
            }
        });
        return count;
    }

    collectChanges(): { id: string; date: string; duration: number; location: string }[] {
        const allUpdates: { id: string; date: string; duration: number; location: string }[] = [];

        this.queueControllers.forEach((qc) => {
            const { updates } = qc.getChanges();
            updates.forEach((u) => {
                const currentEvent = qc
                    .getQueue()
                    .getAllEvents()
                    .find((e) => e.id === u.id);
                if (currentEvent) {
                    allUpdates.push({
                        id: u.id,
                        date: currentEvent.eventData.date,
                        duration: currentEvent.eventData.duration,
                        location: currentEvent.eventData.location,
                    });
                }
            });
        });

        return allUpdates;
    }

    collectChangesForTeacher(teacherId: string): { id: string; date: string; duration: number; location: string }[] {
        const qc = this.queueControllers.get(teacherId);
        if (!qc) return [];

        const { updates } = qc.getChanges();
        const fullUpdates: { id: string; date: string; duration: number; location: string }[] = [];

        updates.forEach((u) => {
            const currentEvent = qc
                .getQueue()
                .getAllEvents()
                .find((e) => e.id === u.id);
            if (currentEvent) {
                fullUpdates.push({
                    id: u.id,
                    date: currentEvent.eventData.date,
                    duration: currentEvent.eventData.duration,
                    location: currentEvent.eventData.location,
                });
            }
        });

        return fullUpdates;
    }

    triggerRefresh(): void {
        this.onRefresh();
    }
}