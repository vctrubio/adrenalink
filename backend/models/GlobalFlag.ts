/**
 * GlobalFlag - Centralized state manager for Classboard time/location adjustments.
 * 
 * DESIGN PRINCIPLES (The "WHY"):
 * 
 * 1. Single Source of Truth: All adjustment states (pending teachers, snapshots, submitting status)
 *    live here to prevent synchronization bugs between the sidebar and individual cards.
 * 
 * 2. Session Stability: The class instance is preserved across data refreshes. It uses
 *    "Instance Preservation" (see updateTeacherQueues) to ensure that background data updates 
 *    (e.g., from Supabase real-time or partial submits) do not overwrite local in-memory 
 *    mutations for teachers currently being edited.
 * 
 * 3. Atomic Snapshots: Original state is captured at the moment a teacher enters the queue.
 *    This allows for reliable "Reset" functionality and precise change detection by comparing
 *    the current mutated EventNodes with the saved snapshots.
 * 
 * 4. Automatic Session Management: The session (adjustmentMode) automatically terminates
 *    when the last teacher opts out or is successfully saved. This is handled in optOut().
 * 
 * 5. Coordinated UI Transitions: Individual cards listen to the GlobalFlag session state.
 *    When the global session ends (e.g., sidebar closed), all cards automatically exit 
 *    adjustment mode to maintain a consistent "View" vs "Edit" state across the app.
 */

import { QueueController } from "../QueueController";
import type { TeacherQueue, ControllerSettings, EventNode } from "../TeacherQueue";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";

export class GlobalFlag {
    private adjustmentMode = false;
    private globalTime: string | null = null;
    private globalLocation: string | null = null;
    private pendingTeachers = new Set<string>();
    private submittingTeachers = new Set<string>();
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

    isSubmitting(teacherUsername: string): boolean {
        return this.submittingTeachers.has(teacherUsername);
    }

    /**
     * Returns the effective list of teacher queues, merging server data with local preserved instances
     */
    getTeacherQueues(): TeacherQueue[] {
        return this.teacherQueues;
    }

    getGlobalEarliestTime(): string | null {
        const allEarliestTimes = this.teacherQueues
            .map((queue) => queue.getEarliestEventTime())
            .filter((time) => time !== null) as string[];

        if (allEarliestTimes.length === 0) return null;

        const minTimeInMinutes = Math.min(...allEarliestTimes.map((time) => timeToMinutes(time)));
        return minutesToTime(minTimeInMinutes);
    }

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

    // ============ LOCK STATUS ============

    getLockStatusTime(targetTime?: string | null) {
        const totalTeachers = this.pendingTeachers.size;
        
        const pendingTeachersTimes = this.teacherQueues
            .filter((q) => this.pendingTeachers.has(q.teacher.username))
            .map((q) => ({ username: q.teacher.username, earliestTime: q.getEarliestEventTime() }))
            .filter((t) => t.earliestTime !== null) as { username: string; earliestTime: string }[];

        if (pendingTeachersTimes.length === 0 || totalTeachers === 0) {
            return { isLockFlagTime: false, lockCount: 0 };
        }

        const referenceTime = targetTime || pendingTeachersTimes.reduce((min, t) => {
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

        this.teacherQueues
            .filter((q) => this.pendingTeachers.has(q.teacher.username))
            .forEach((q) => {
                const events = q.getAllEvents();
                const allLocations = events.map((e) => e.eventData.location).filter((l) => l !== null && l !== undefined);
                const allMatch = allLocations.length > 0 && allLocations.every((l) => l === allLocations[0]);

                totalEventsForLock += events.length;

                if (allMatch) {
                    pendingTeachersLocations.push({ username: q.teacher.username, location: allLocations[0] });
                } else {
                    pendingTeachersLocations.push({ username: q.teacher.username, location: null });
                }
            });

        const referenceLocation = targetLocation || pendingTeachersLocations.find((t) => t.location !== null)?.location;

        if (referenceLocation) {
            this.teacherQueues
                .filter((q) => this.pendingTeachers.has(q.teacher.username))
                .forEach((q) => {
                    const events = q.getAllEvents();
                    events.forEach(e => {
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

    // ============ STATE ACTIONS ============

    enterAdjustmentMode(): void {
        const teachersWithEvents = this.teacherQueues
            .filter((queue) => queue.getAllEvents().length > 0)
            .map((queue) => queue.teacher.username);

        this.pendingTeachers = new Set(teachersWithEvents);
        this.adjustmentMode = true;
        this.globalTime = this.getGlobalEarliestTime();
        this.globalLocation = this.getGlobalLocation();

        this.originalQueueStates.clear();
        this.teacherQueues.forEach((queue) => {
            if (this.pendingTeachers.has(queue.teacher.username)) {
                this.snapshotTeacherState(queue.teacher.username);
            }
        });

        this.onRefresh();
    }

    private snapshotTeacherState(username: string): void {
        const queue = this.teacherQueues.find((q) => q.teacher.username === username);
        if (queue && !this.originalQueueStates.has(username)) {
            const events = queue.getAllEvents();
            this.originalQueueStates.set(
                username,
                events.map((event) => ({
                    ...event,
                    eventData: { ...event.eventData },
                }))
            );
        }
    }

    discardChanges(): void {
        this.teacherQueues.forEach((queue) => {
            if (this.pendingTeachers.has(queue.teacher.username)) {
                const originalEvents = this.originalQueueStates.get(queue.teacher.username) || [];
                const currentEvents = queue.getAllEvents();

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

    exitAdjustmentMode(): void {
        this.adjustmentMode = false;
        this.globalTime = null;
        this.globalLocation = null;
        this.pendingTeachers.clear();
        this.submittingTeachers.clear();
        this.isLocked = false;
        this.originalQueueStates.clear();
        this.onRefresh();
    }

    optIn(teacherUsername: string): void {
        this.pendingTeachers.add(teacherUsername);
        this.snapshotTeacherState(teacherUsername);
        this.onRefresh();
    }

    optOut(teacherUsername: string): void {
        this.pendingTeachers.delete(teacherUsername);
        this.originalQueueStates.delete(teacherUsername);
        this.submittingTeachers.delete(teacherUsername);

        // Session Rule: If no more teachers are pending, the global session terminates
        if (this.pendingTeachers.size === 0) {
            this.exitAdjustmentMode();
        }

        this.onRefresh();
    }

    setSubmitting(teacherUsername: string, isSubmitting: boolean): void {
        if (isSubmitting) {
            this.submittingTeachers.add(teacherUsername);
        } else {
            this.submittingTeachers.delete(teacherUsername);
        }
        this.onRefresh();
    }

    // ============ OPERATIONS ============

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

    private adjustTimeLocked(newTime: string): void {
        const newMinutes = timeToMinutes(newTime);

        this.teacherQueues.forEach((queue) => {
            if (this.pendingTeachers.has(queue.teacher.username)) {
                const earliestTime = queue.getEarliestEventTime();
                if (earliestTime) {
                    const currentMinutes = timeToMinutes(earliestTime);
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

    private adjustTimeUnlocked(newTime: string): void {
        if (!this.globalTime) return;

        const newMinutes = timeToMinutes(newTime);

        this.teacherQueues.forEach((queue) => {
            if (this.pendingTeachers.has(queue.teacher.username)) {
                const earliestTime = queue.getEarliestEventTime();
                if (earliestTime) {
                    const queueMinutes = timeToMinutes(earliestTime);
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

    adapt(): void {
        if (this.isLocked) {
            this.isLocked = false;
            this.refreshKey++;
            this.onRefresh();
        } else {
            this.syncAllToEarliest();
            this.isLocked = true;
            this.refreshKey++;
            this.onRefresh();
        }
    }

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

    // ============ PERSISTENCE ============

    getChangedEventsCount(): number {
        let count = 0;
        this.teacherQueues.forEach((queue) => {
            if (!this.pendingTeachers.has(queue.teacher.username)) return;
            const updates = this.collectChangesForTeacher(queue.teacher.username);
            count += updates.length;
        });
        return count;
    }

    collectChanges(): { id: string; date: string; duration: number; location: string }[] {
        const allUpdates: { id: string; date: string; duration: number; location: string }[] = [];
        this.teacherQueues.forEach((queue) => {
            if (!this.pendingTeachers.has(queue.teacher.username)) return;
            const updates = this.collectChangesForTeacher(queue.teacher.username);
            allUpdates.push(...updates);
        });
        return allUpdates;
    }

    collectChangesForTeacher(teacherUsername: string): { id: string; date: string; duration: number; location: string }[] {
        const updates: { id: string; date: string; duration: number; location: string }[] = [];
        const queue = this.teacherQueues.find((q) => q.teacher.username === teacherUsername);
        
        if (!queue || !this.pendingTeachers.has(teacherUsername)) {
            return [];
        }

        const originalEvents = this.originalQueueStates.get(teacherUsername) || [];
        const currentEvents = queue.getAllEvents();

        currentEvents.forEach((currentEvent) => {
            const originalEvent = originalEvents.find((e) => e.id === currentEvent.id);
            if (!originalEvent) return;

            const dateChanged = currentEvent.eventData.date !== originalEvent.eventData.date;
            const durationChanged = currentEvent.eventData.duration !== originalEvent.eventData.duration;
            const locationChanged = currentEvent.eventData.location !== originalEvent.eventData.location;

            if (dateChanged || durationChanged || locationChanged) {
                updates.push({
                    id: currentEvent.id,
                    date: currentEvent.eventData.date,
                    duration: currentEvent.eventData.duration,
                    location: currentEvent.eventData.location,
                });
            }
        });

        return updates;
    }

    triggerRefresh(): void {
        this.onRefresh();
    }

    // ============ DATA SYNC ============

    updateTeacherQueues(queues: TeacherQueue[]): void {
        if (this.adjustmentMode) {
            // Preservation Rule: If background data arrives, don't overwrite pending teachers' queues.
            // This prevents local UI mutations from being lost when Supabase listeners trigger.
            this.teacherQueues = queues.map(newQueue => {
                const username = newQueue.teacher.username;
                if (this.pendingTeachers.has(username)) {
                    const existingQueue = this.teacherQueues.find(q => q.teacher.username === username);
                    return existingQueue || newQueue;
                }
                return newQueue;
            });
        } else {
            this.teacherQueues = queues;
        }
    }

    updateController(controller: ControllerSettings): void {
        this.controller = controller;
    }
}