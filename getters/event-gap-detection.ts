/**
 * Event Gap Detection Utility
 * Determines gap status between consecutive events
 *
 * States:
 * - OVERLAP: Previous event end time > current event start time
 *   Example: Previous ends at 11:45, current starts at 11:30 → OVERLAP by 15 mins
 *
 * - OVERDUE: Gap duration + previous event end time > current event start time (but no overlap)
 *   Example: Previous ends 11:30, gap required 15 mins (should start 11:45), but current starts 11:40 → OVERDUE by 5 mins
 *
 * - GAP: Previous event end time + gap duration (from controller) < current event start time
 *   Example: Previous ends 11:30, gap required 15 mins, but current starts 12:00 → GAP of 15 mins
 *
 * - NONE: Perfect alignment (end time + gap duration == current start time)
 */

import type { EventNode } from "@/types/classboard-teacher-queue";
import { getMinutesFromISO } from "./queue-getter";

export type GapDetectionState = "overlap" | "overdue" | "gap" | "none";

export interface EventGapDetection {
    state: GapDetectionState;
    durationMinutes: number; // Duration of gap/gap/overdue (always positive)
}

/**
 * Detect gap status between current event and previous event
 *
 * @param currentEvent - Current event to check
 * @param previousEvent - Previous event in queue
 * @param requiredGapMinutes - Required gap from controller settings
 * @returns Gap detection state and duration
 */
export function detectEventGapStatus(
    currentEvent: EventNode,
    previousEvent: EventNode,
    requiredGapMinutes: number
): EventGapDetection {
    const previousStartMinutes = getMinutesFromISO(previousEvent.eventData.date);
    const previousEndMinutes = previousStartMinutes + previousEvent.eventData.duration;
    const currentStartMinutes = getMinutesFromISO(currentEvent.eventData.date);

    // OVERLAP: Previous end > current start
    if (previousEndMinutes > currentStartMinutes) {
        const overlapDuration = previousEndMinutes - currentStartMinutes;
        return {
            state: "overlap",
            durationMinutes: overlapDuration,
        };
    }

    // Calculate what current start should be
    const requiredStartMinutes = previousEndMinutes + requiredGapMinutes;

    // OVERDUE: Required start > current start (gap is insufficient)
    if (requiredStartMinutes > currentStartMinutes) {
        const overdueMinutes = requiredStartMinutes - currentStartMinutes;
        return {
            state: "overdue",
            durationMinutes: overdueMinutes,
        };
    }

    // GAP: Current start > required start (excess gap)
    if (currentStartMinutes > requiredStartMinutes) {
        const gapMinutes = currentStartMinutes - requiredStartMinutes;
        return {
            state: "gap",
            durationMinutes: gapMinutes,
        };
    }

    // NONE: Perfect alignment
    return {
        state: "none",
        durationMinutes: 0,
    };
}
