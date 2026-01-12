"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, Clock, Loader2 } from "lucide-react";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getMinutesFromISO, minutesToTime, createISODateTime, getDatePartFromISO } from "@/getters/queue-getter";
import { detectEventGapStatus, type GapDetectionState } from "@/getters/event-gap-detection";
import type { EventNode } from "@/types/classboard-teacher-queue";
import { updateEventStartTime } from "@/supabase/server/classboard";
import { useClassboardContext } from "@/src/providers/classboard-provider";

interface EventGapDetectionProps {
    currentEvent: EventNode;
    previousEvent?: EventNode;
    requiredGapMinutes: number;
    updateMode: "updateNow" | "updateOnSave";
    onStateChange?: (state: GapDetectionState, duration: number) => void;
    onGapAdjust?: () => void;
    wrapperClassName?: string;
    className?: string;
}

export default function EventGapDetection({
    currentEvent,
    previousEvent,
    requiredGapMinutes,
    updateMode,
    onStateChange,
    onGapAdjust,
    wrapperClassName,
    className,
}: EventGapDetectionProps) {
    const { globalFlag } = useClassboardContext();
    const [isUpdating, setIsUpdating] = useState(false);

    // If no previous event, nothing to detect
    if (!previousEvent) {
        return null;
    }

    // Detect gap status - recalculate when requiredGapMinutes or event dates/durations change
    const gapStatus = useMemo(
        () => detectEventGapStatus(currentEvent, previousEvent, requiredGapMinutes),
        [
            currentEvent.eventData.date,
            currentEvent.eventData.duration,
            previousEvent.eventData.date,
            previousEvent.eventData.duration,
            requiredGapMinutes,
        ],
    );

    const handleClick = async () => {
        if (!previousEvent || isUpdating) {
            return;
        }

        setIsUpdating(true);
        const eventId = currentEvent.id;

        // Notify that the event is being updated (shows blur and spinner in EventCard)
        globalFlag.notifyEventMutation(eventId, "updating");

        try {
            if (updateMode === "updateNow") {
                // Database update mode - calculate and save directly
                // IMPORTANT: previousEvent end time is the source of truth for the next available slot
                const previousStartMinutes = getMinutesFromISO(previousEvent.eventData.date);
                const previousEndMinutes = previousStartMinutes + previousEvent.eventData.duration;
                const correctStartMinutes = previousEndMinutes + requiredGapMinutes;

                const datePart = getDatePartFromISO(currentEvent.eventData.date);
                const newDate = createISODateTime(datePart, minutesToTime(correctStartMinutes));

                console.log(`🔧 [EventGapDetection] Adjusting gap: ${minutesToTime(correctStartMinutes)} (v${previousEvent.id})`);
                const result = await updateEventStartTime(eventId, newDate);

                if (result.success) {
                    // Server confirmed the update - wait for realtime sync to clear mutation
                    // This prevents brief flicker of the gap warning with old time
                    console.log("🔧 [EventGapDetection] Sent to server, waiting for realtime sync confirmation...");
                } else {
                    console.error("🔧 [EventGapDetection] ❌ Update failed:", result.error);
                    // Clear on error so event isn't stuck spinning
                    globalFlag.clearEventMutation(eventId);
                }
            } else {
                // Update on save mode - let parent QueueController handle it
                onGapAdjust?.();
                // For save mode, clear immediately since QueueController will manage the mutation
                globalFlag.clearEventMutation(eventId);
            }
        } catch (error) {
            console.error("❌ [EventGapDetection] Error updating event:", error);
            // Clear on error
            globalFlag.clearEventMutation(eventId);
        } finally {
            setIsUpdating(false);
        }
    };

    // Determine button properties based on state
    const getButtonProps = () => {
        switch (gapStatus.state) {
            case "overlap":
                return {
                    className: "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20",
                    icon: <AlertTriangle className="w-3 h-3 flex-shrink-0" />,
                    text: `Overlap: ${getPrettyDuration(gapStatus.durationMinutes)}`,
                    title: `Fix overlap (${getPrettyDuration(gapStatus.durationMinutes)})`,
                };
            case "overdue":
                return {
                    className:
                        "bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20",
                    icon: <Clock className="w-3 h-3 flex-shrink-0" />,
                    text: `Overdue: ${getPrettyDuration(gapStatus.durationMinutes)}`,
                    title: `Adjust gap (+${getPrettyDuration(gapStatus.durationMinutes)})`,
                };
            case "gap":
                return {
                    className: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20",
                    icon: <AlertTriangle className="w-3 h-3 flex-shrink-0" />,
                    text: `Gap: ${getPrettyDuration(gapStatus.durationMinutes)}`,
                    title: `Remove gap (-${getPrettyDuration(gapStatus.durationMinutes)})`,
                };
            default:
                return null;
        }
    };

    const buttonProps = getButtonProps();
    if (!buttonProps) {
        return null;
    }

    const button = (
        <button
            onClick={handleClick}
            disabled={isUpdating}
            className={`${className || "w-full"} flex items-center justify-center gap-1.5 py-0.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all duration-200 pointer-events-auto ${buttonProps.className} ${isUpdating ? "opacity-60" : ""}`}
            title={buttonProps.title}
            style={{ pointerEvents: "auto", zIndex: 10 }}
        >
            {isUpdating ? <Loader2 className="w-3 h-3 flex-shrink-0 animate-spin" /> : buttonProps.icon}
            <span>{isUpdating ? "Adjusting..." : buttonProps.text}</span>
        </button>
    );

    if (wrapperClassName) {
        return <div className={wrapperClassName}>{button}</div>;
    }

    return button;
}
