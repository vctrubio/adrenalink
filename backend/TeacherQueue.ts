/**
 * TeacherQueue - Manages a linked list of events for a teacher on a specific date
 * Handles time adjustments, duration changes, event reordering, and cascade updates
 * Used for drag-and-drop event scheduling and queue editing in the classboard interface
 */

import { timeToMinutes, minutesToTime, getTimeFromISO } from "@/getters/timezone-getter";
import { deleteClassboardEvent } from "@/actions/classboard-action";
import type { CommissionInfo } from "@/getters/commission-calculator";

export interface DraggableBooking {
    bookingId: string;
    capacityStudents: number;
    lessons: Array<{
        id: string;
        teacherUsername: string;
        commissionType: "fixed" | "percentage";
        commissionCph: number;
    }>;
}

export interface StudentData {
    id: string;
    firstName: string;
    lastName: string;
    passport: string;
    country: string;
    phone: string;
}

export interface PackageData {
    pricePerStudent: number;
    durationMinutes: number;
    description: string;
    categoryEquipment: string;
    capacityEquipment: number;
}

export interface EventNode {
    id: string | null;
    lessonId: string;
    bookingId: string;
    commission: CommissionInfo;
    eventData: {
        id?: string;
        date: string;
        duration: number;
        location: string;
        status: string;
    };
    studentData: StudentData[];
    packageData: PackageData;
    next: EventNode | null;
}

export function getStudentCount(eventNode: EventNode): number {
    return eventNode.studentData.length;
}

export interface TeacherInfo {
    username: string;
    name: string;
}

export interface ControllerSettings {
    submitTime: string;
    location: string;
    durationCapOne: number;
    durationCapTwo: number;
    durationCapThree: number;
    gapMinutes: number;
}

export class TeacherQueue {
    private head: EventNode | null = null;
    public teacher: TeacherInfo;
    private date: string;

    constructor(teacher: TeacherInfo, date: string) {
        this.teacher = teacher;
        this.date = date;
    }

    // ============ BASIC QUEUE OPERATIONS ============

    addToQueue(eventNode: EventNode): void {
        if (!this.head) {
            this.head = eventNode;
        } else {
            let current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = eventNode;
        }
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

    private getLastEvent(): EventNode | null {
        if (!this.head) return null;

        let current = this.head;
        while (current.next) {
            current = current.next;
        }

        return current;
    }

    // ============ TIME UTILITIES ============

    private getStartTime(eventNode: EventNode): string {
        return getTimeFromISO(eventNode.eventData.date);
    }

    private getStartTimeMinutes(eventNode: EventNode): number {
        return timeToMinutes(this.getStartTime(eventNode));
    }

    private updateEventDateTime(eventNode: EventNode, changeMinutes: number): void {
        const currentDate = eventNode.eventData.date;
        if (currentDate.includes("T")) {
            const [datePart, timePart] = currentDate.split("T");
            const currentMinutes = timeToMinutes(timePart.substring(0, 5));
            const newMinutes = currentMinutes + changeMinutes;
            const newTime = minutesToTime(newMinutes);
            eventNode.eventData.date = `${datePart}T${newTime}:00`;
        }
    }

    private cascadeTimeAdjustment(startNode: EventNode | null, changeMinutes: number): void {
        let current = startNode;
        while (current) {
            this.updateEventDateTime(current, changeMinutes);
            current = current.next;
        }
    }

    // ============ PUBLIC ACCESSORS ============

    getNextAvailableSlot(controller: ControllerSettings): string {
        const lastEvent = this.getLastEvent();

        if (!lastEvent) {
            return controller.submitTime;
        }

        const lastEventEndMinutes = this.getStartTimeMinutes(lastEvent) + lastEvent.eventData.duration;
        const nextSlotMinutes = lastEventEndMinutes + controller.gapMinutes;
        return minutesToTime(nextSlotMinutes);
    }

    getEarliestEventTime(): string | null {
        if (!this.head) return null;
        return this.getStartTime(this.head);
    }

    getFlagTime(): string | null {
        return this.getEarliestEventTime();
    }

    /**
     * Check if a time slot (start time + duration) overlaps with any existing event
     */
    hasEventAtTime(startTimeMinutes: number, durationMinutes: number): boolean {
        let current = this.head;

        while (current) {
            const eventStartMinutes = this.getStartTimeMinutes(current);
            const eventEndMinutes = eventStartMinutes + current.eventData.duration;

            // Check if new event overlaps with this event
            const newEventEndMinutes = startTimeMinutes + durationMinutes;

            // Overlap occurs if: new start is before event end AND new end is after event start
            if (startTimeMinutes < eventEndMinutes && newEventEndMinutes > eventStartMinutes) {
                return true;
            }

            current = current.next;
        }

        return false;
    }

    /**
     * Get smart insertion info that includes position (head or tail)
     * Returns: { time, shouldUseHead }
     * - time: The insertion time
     * - shouldUseHead: Whether to add to head (true) or tail (false) of queue
     */
    getSmartInsertionInfo(controllerFlagTime: string, eventDurationMinutes: number, gapMinutes: number): { time: string; shouldUseHead: boolean } {
        const flagTimeMinutes = timeToMinutes(controllerFlagTime);

        // If no events, use controller flag time
        if (!this.head) {
            return { time: controllerFlagTime, shouldUseHead: false };
        }

        // Check if controller flag time is available
        const timeIsAvailable = !this.hasEventAtTime(flagTimeMinutes, eventDurationMinutes);

        if (timeIsAvailable) {
            // Flag time is available, check if it's before first event
            const firstEventStartMinutes = this.getStartTimeMinutes(this.head);
            const flagIsBeforeFirst = flagTimeMinutes < firstEventStartMinutes;

            if (flagIsBeforeFirst) {
                // Can potentially add to head, check gap requirement
                const flagEndMinutes = flagTimeMinutes + eventDurationMinutes;
                const gap = firstEventStartMinutes - flagEndMinutes;

                if (gap >= gapMinutes) {
                    // Can add to head with proper gap
                    return { time: controllerFlagTime, shouldUseHead: true };
                } else {
                    // Flag time is before first but gap too small, schedule after last event
                    const lastEvent = this.getLastEvent();
                    if (!lastEvent) return { time: controllerFlagTime, shouldUseHead: false };
                    const lastEventEndMinutes = this.getStartTimeMinutes(lastEvent) + lastEvent.eventData.duration;
                    const nextSlotMinutes = lastEventEndMinutes + gapMinutes;
                    const nextSlotTime = minutesToTime(nextSlotMinutes);
                    return { time: nextSlotTime, shouldUseHead: false };
                }
            }

            // Flag time is available but comes AFTER first event
            // Check if it's actually after the last event with proper gap
            const lastEvent = this.getLastEvent();
            if (lastEvent) {
                const lastEventEndMinutes = this.getStartTimeMinutes(lastEvent) + lastEvent.eventData.duration;
                const flagEndMinutes = flagTimeMinutes + eventDurationMinutes;

                if (flagTimeMinutes >= lastEventEndMinutes + gapMinutes && flagEndMinutes <= 1440) {
                    // Flag time is after all events with proper gap - use it
                    return { time: controllerFlagTime, shouldUseHead: false };
                }
            }

            // Flag time is in the middle, schedule after last event instead
            const lastEventForScheduling = this.getLastEvent();
            if (!lastEventForScheduling) return { time: controllerFlagTime, shouldUseHead: false };

            const lastEventEndMinutes = this.getStartTimeMinutes(lastEventForScheduling) + lastEventForScheduling.eventData.duration;
            const nextSlotMinutes = lastEventEndMinutes + gapMinutes;
            const nextSlotTime = minutesToTime(nextSlotMinutes);
            return { time: nextSlotTime, shouldUseHead: false };
        }

        // Flag time is occupied, return next available after last event
        const lastEvent = this.getLastEvent();
        if (!lastEvent) {
            return { time: controllerFlagTime, shouldUseHead: false };
        }

        const lastEventEndMinutes = this.getStartTimeMinutes(lastEvent) + lastEvent.eventData.duration;
        const nextSlotMinutes = lastEventEndMinutes + gapMinutes;
        const nextSlotTime = minutesToTime(nextSlotMinutes);
        return { time: nextSlotTime, shouldUseHead: false };
    }

    // ============ QUEUE MODIFICATION ============

    adjustLessonDuration(lessonId: string, increment: boolean): void {
        let current = this.head;
        while (current) {
            if (current.lessonId === lessonId) {
                const change = increment ? 30 : -30;
                const oldDuration = current.eventData.duration;

                current.eventData.duration = Math.max(30, current.eventData.duration + change);
                const actualChange = current.eventData.duration - oldDuration;

                if (actualChange !== 0 && current.next) {
                    this.cascadeTimeAdjustment(current.next, actualChange);
                }
                break;
            }
            current = current.next;
        }
    }

    adjustLessonTime(lessonId: string, increment: boolean): void {
        console.log(`[DEBUG-TeacherQueue] adjustLessonTime called: lessonId=${lessonId}, increment=${increment}`);
        let current = this.head;
        while (current) {
            if (current.lessonId === lessonId) {
                const change = increment ? 30 : -30;
                console.log(`[DEBUG-TeacherQueue] Found event, before: ${current.eventData.date}, change: ${change}min`);
                this.updateEventDateTime(current, change);
                console.log(`[DEBUG-TeacherQueue] After updateEventDateTime: ${current.eventData.date}`);

                if (current.next) {
                    console.log(`[DEBUG-TeacherQueue] Cascading to next event with change: ${change}min`);
                    this.cascadeTimeAdjustment(current.next, change);
                }
                break;
            }
            current = current.next;
        }
    }

    moveLessonUp(lessonId: string): void {
        this.moveLessonInQueue(lessonId, "up");
    }

    moveLessonDown(lessonId: string): void {
        this.moveLessonInQueue(lessonId, "down");
    }

    private moveLessonInQueue(lessonId: string, direction: "up" | "down"): void {
        const events = this.getAllEvents();
        const currentIndex = events.findIndex((event) => event.lessonId === lessonId);

        if (currentIndex === -1) return;

        const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= events.length) return;

        const earlierIndex = Math.min(currentIndex, newIndex);
        const earlierEvent = events[earlierIndex];
        const preservedStartTimeMinutes = this.getStartTimeMinutes(earlierEvent);

        [events[currentIndex], events[newIndex]] = [events[newIndex], events[currentIndex]];

        this.head = null;
        events.forEach((event) => {
            event.next = null;
            this.addToQueue(event);
        });

        this.recalculateStartTimesFromPosition(earlierIndex, preservedStartTimeMinutes);
    }

    private recalculateStartTimesFromPosition(startIndex: number, startTimeMinutes: number): void {
        const events = this.getAllEvents();
        let currentTimeMinutes = startTimeMinutes;

        for (let i = startIndex; i < events.length; i++) {
            const event = events[i];
            const [datePart] = event.eventData.date.split("T");
            const newTime = minutesToTime(currentTimeMinutes);
            event.eventData.date = `${datePart}T${newTime}:00`;
            currentTimeMinutes += event.eventData.duration;
        }
    }

    canMoveEarlier(lessonId: string): boolean {
        const events = this.getAllEvents();
        const currentIndex = events.findIndex((event) => event.lessonId === lessonId);

        if (currentIndex < 0) return false;
        if (currentIndex === 0) return true;

        const currentEvent = events[currentIndex];
        const previousEvent = events[currentIndex - 1];

        const currentStartMinutes = this.getStartTimeMinutes(currentEvent);
        const proposedStartMinutes = currentStartMinutes - 30;
        const previousEndMinutes = this.getStartTimeMinutes(previousEvent) + previousEvent.eventData.duration;

        return proposedStartMinutes >= previousEndMinutes;
    }

    canMoveLater(lessonId: string): boolean {
        const events = this.getAllEvents();
        const currentEvent = events.find((event) => event.lessonId === lessonId);

        if (!currentEvent) return false;

        const currentTimeMinutes = this.getStartTimeMinutes(currentEvent);
        return currentTimeMinutes < 1380;
    }

    removeGap(lessonId: string): void {
        let current = this.head;
        let previous: EventNode | null = null;

        while (current) {
            if (current.lessonId === lessonId) {
                break;
            }
            previous = current;
            current = current.next;
        }

        if (!current || !previous) {
            return;
        }

        const previousEndTime = this.getStartTimeMinutes(previous) + previous.eventData.duration;
        const currentStartTime = this.getStartTimeMinutes(current);
        const gapMinutes = currentStartTime - previousEndTime;

        if (gapMinutes <= 0) {
            return;
        }

        this.updateEventDateTime(current, -gapMinutes);

        if (current.next) {
            const newCurrentEndTime = this.getStartTimeMinutes(current) + current.eventData.duration;
            const nextStartTime = this.getStartTimeMinutes(current.next);

            if (newCurrentEndTime === nextStartTime) {
                this.cascadeTimeAdjustment(current.next, -gapMinutes);
            }
        }
    }

    async removeFromQueueWithCascade(lessonId: string): Promise<{ success: boolean; error?: string }> {
        if (!this.head) return { success: false, error: "Queue is empty" };

        let nodeToRemove: EventNode | null = null;
        let previousNode: EventNode | null = null;
        let current = this.head;

        while (current) {
            if (current.lessonId === lessonId) {
                nodeToRemove = current;
                break;
            }
            previousNode = current;
            current = current.next;
        }

        if (!nodeToRemove) {
            return { success: false, error: "Event not found in queue" };
        }

        const removedStartTimeMinutes = this.getStartTimeMinutes(nodeToRemove);

        if (nodeToRemove.eventData.id) {
            const deleteResult = await deleteClassboardEvent(nodeToRemove.eventData.id, true);
            if (!deleteResult.success) {
                return { success: false, error: `Failed to delete event: ${deleteResult.error}` };
            }
        }

        if (previousNode) {
            previousNode.next = nodeToRemove.next;
        } else {
            this.head = nodeToRemove.next;
        }

        const eventsToShift = [];
        current = nodeToRemove.next;
        while (current) {
            eventsToShift.push(current);
            current = current.next;
        }

        if (eventsToShift.length > 0) {
            let newStartTimeMinutes = removedStartTimeMinutes;

            for (const event of eventsToShift) {
                const [datePart] = event.eventData.date.split("T");
                const newTime = minutesToTime(newStartTimeMinutes);
                event.eventData.date = `${datePart}T${newTime}:00`;
                newStartTimeMinutes += event.eventData.duration;
            }
        }

        return { success: true };
    }

    removeFromQueue(lessonId: string): void {
        if (!this.head) return;

        if (this.head.lessonId === lessonId) {
            this.head = this.head.next;
            return;
        }

        let current = this.head;
        while (current.next && current.next.lessonId !== lessonId) {
            current = current.next;
        }

        if (current.next) {
            current.next = current.next.next;
        }
    }

    restoreState(originalEvents: EventNode[]): void {
        this.head = null;
        originalEvents.forEach((event) => {
            const restoredEvent: EventNode = {
                ...event,
                eventData: { ...event.eventData },
                next: null,
            };
            this.addToQueue(restoredEvent);
        });
    }

    getNodes(): any[] {
        const nodes: any[] = [];
        let current = this.head;

        while (current) {
            nodes.push({
                id: current.id,
                type: "event",
                startTime: this.getStartTime(current),
                duration: current.eventData.duration,
                eventData: {
                    lessonId: current.lessonId,
                },
            });
            current = current.next;
        }

        return nodes;
    }

    getSchedule() {
        return {
            teacherId: this.teacher.username,
            teacherName: this.teacher.name,
        };
    }
}
