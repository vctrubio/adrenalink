/**
 * GlobalFlag - Manages global time adjustment state and operations
 * Encapsulates all logic for adjusting teacher queue times globally
 */

import { QueueController } from "../QueueController";
import type { TeacherQueue, ControllerSettings } from "../TeacherQueue";
import { timeToMinutes, minutesToTime } from "@/getters/queue-getter";

export class GlobalFlag {
    private adjustmentMode: boolean = false;
    private globalTime: string | null = null;
    private pendingTeachers: Set<string> = new Set();
    private isLocked: boolean = false;
    private refreshKey: number = 0;

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

    getPendingTeachers(): Set<string> {
        return this.pendingTeachers;
    }

    isAdjustmentLocked(): boolean {
        return this.isLocked;
    }

    getRefreshKey(): number {
        return this.refreshKey;
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

    // ============ STATE MANAGEMENT ============

    /**
     * Enter global adjustment mode
     * Initializes pending teachers with all teachers that have events
     */
    enterAdjustmentMode(): void {
        const teachersWithEvents = this.teacherQueues
            .filter((queue) => queue.getAllEvents().length > 0)
            .map((queue) => queue.teacher.username);

        this.pendingTeachers = new Set(teachersWithEvents);
        this.adjustmentMode = true;
        this.globalTime = this.getGlobalEarliestTime();
        this.onRefresh();
    }

    /**
     * Exit global adjustment mode
     * Clears pending teachers and resets lock
     */
    exitAdjustmentMode(): void {
        this.adjustmentMode = false;
        this.globalTime = null;
        this.pendingTeachers.clear();
        this.isLocked = false;
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
     * Locked mode: all queues match the exact global time
     */
    private adjustTimeLocked(newTime: string): void {
        this.teacherQueues.forEach((queue) => {
            if (this.pendingTeachers.has(queue.teacher.username)) {
                const earliestTime = queue.getEarliestEventTime();
                if (earliestTime) {
                    const currentMinutes = timeToMinutes(earliestTime);
                    const targetMinutes = timeToMinutes(newTime);
                    const offsetMinutes = targetMinutes - currentMinutes;

                    const queueController = new QueueController(queue, this.controller, () => {
                        this.refreshKey++;
                        this.onRefresh();
                    });
                    queueController.adjustFirstEventByOffset(offsetMinutes);
                }
            }
        });
    }

    /**
     * Unlocked mode: only cascade to teachers whose earliest time < adjustmentTime
     * Teachers starting after adjustmentTime wait for global time to catch up
     */
    private adjustTimeUnlocked(newTime: string): void {
        if (!this.globalTime) return;

        const currentMinutes = timeToMinutes(this.globalTime);
        const newMinutes = timeToMinutes(newTime);
        const offsetMinutes = newMinutes - currentMinutes;

        this.teacherQueues.forEach((queue) => {
            if (this.pendingTeachers.has(queue.teacher.username)) {
                const earliestTime = queue.getEarliestEventTime();
                if (earliestTime) {
                    const queueMinutes = timeToMinutes(earliestTime);

                    // Only cascade to teachers whose earliest time < adjustment time
                    if (queueMinutes < newMinutes) {
                        const queueController = new QueueController(queue, this.controller, () => {
                            this.refreshKey++;
                            this.onRefresh();
                        });
                        queueController.adjustFirstEventByOffset(offsetMinutes);
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
                    const currentMinutes = timeToMinutes(earliestTime);
                    const targetMinutes = timeToMinutes(syncTargetTime);
                    const offsetMinutes = targetMinutes - currentMinutes;

                    const queueController = new QueueController(queue, this.controller, () => {
                        this.refreshKey++;
                        this.onRefresh();
                    });
                    queueController.adjustFirstEventByOffset(offsetMinutes);
                }
            }
        });
    }

    /**
     * Update teacher queues reference (for when queues change)
     */
    updateTeacherQueues(queues: TeacherQueue[]): void {
        this.teacherQueues = queues;
    }
}
