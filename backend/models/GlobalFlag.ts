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

import { QueueController } from "../../src/app/(admin)/(classboard)/QueueController";
import type { TeacherQueue } from "../../src/app/(admin)/(classboard)/TeacherQueue";
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

    // ============ EVENT MUTATIONS (Spinner State) ============

    notifyEventMutation(eventId: string, type: EventMutationType, teacherId?: string): void {
        this.eventMutations.set(eventId, { eventId, type, teacherId });
    }

    clearEventMutation(eventId: string): void {
        this.eventMutations.delete(eventId);
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

    updateTeacherQueues(queues: TeacherQueue[]): void {
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
        if (this.isLockedTime) {
            this.adjustTimeLocked(newTime);
        } else {
            this.adjustTimeUnlocked(newTime);
        }

        this.globalTime = newTime;
        this.refreshKey++;
    }

    private adjustTimeLocked(newTime: string): void {
        const newMinutes = timeToMinutes(newTime);

        this.queueControllers.forEach((qc) => {
            const earliestTime = qc.getQueue().getEarliestTime();
            if (earliestTime) {
                const currentMinutes = timeToMinutes(earliestTime);
                if (currentMinutes <= newMinutes) {
                    qc.setFirstEventTime(newTime);
                }
            }
        });

        this.globalTime = newTime;
    }

    private adjustTimeUnlocked(newTime: string): void {
        if (!this.globalTime) return;

        const newMinutes = timeToMinutes(newTime);

        this.queueControllers.forEach((qc) => {
            const earliestTime = qc.getQueue().getEarliestTime();
            if (earliestTime) {
                const queueMinutes = timeToMinutes(earliestTime);
                if (queueMinutes <= newMinutes) {
                    qc.setFirstEventTime(newTime);
                }
            }
        });
    }

    lockToAdjustmentTime(targetTime: string): void {
        this.queueControllers.forEach((qc) => {
            if (qc.getQueue().getEarliestTime()) {
                qc.setFirstEventTime(targetTime);
            }
        });

        this.isLockedTime = true;
        this.refreshKey++;
    }

    unlockTime(): void {
        this.isLockedTime = false;
        this.refreshKey++;
    }

    adjustLocation(newLocation: string): void {
        this.queueControllers.forEach((qc) => {
            qc.setAllEventsLocation(newLocation);
        });

        this.globalLocation = newLocation;
        this.refreshKey++;
    }

    lockToLocation(targetLocation: string): void {
        this.queueControllers.forEach((qc) => {
            qc.setAllEventsLocation(targetLocation);
        });

        this.globalLocation = targetLocation;
        this.isLockedLocation = true;
        this.refreshKey++;
    }

    unlockLocation(): void {
        this.isLockedLocation = false;
        this.refreshKey++;
    }

    // ============ LOCK STATUS ============

    getLockStatusTime(targetTime?: string | null) {
        const pendingControllers = Array.from(this.queueControllers.values());
        const totalTeachers = pendingControllers.length;

        const pendingTeachersTimes = pendingControllers.map((qc) => ({ username: qc.getQueue().teacher.username, earliestTime: qc.getQueue().getEarliestTime() })).filter((t) => t.earliestTime !== null) as { username: string; earliestTime: string }[];

        if (pendingTeachersTimes.length === 0 || totalTeachers === 0) {
            return { isLockFlagTime: false, lockCount: 0 };
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

        const allSynchronized = referenceLocation ? pendingTeachersLocations.every((t) => t.location === referenceLocation) : false;

        return {
            isLockFlagLocation: allSynchronized && referenceLocation !== null,
            lockLocationCount: synchronizedEventsCount,
            totalLocationEventsForLock: totalEventsForLock,
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
