"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getMinutesFromISO, minutesToTime, createISODateTime } from "@/getters/queue-getter";
import { detectEventGapStatus, type GapDetectionState } from "@/getters/event-gap-detection";
import type { EventNode } from "@/types/classboard-teacher-queue";
import { updateEventStartTime } from "@/actions/classboard-action";

interface EventGapDetectionProps {
    currentEvent: EventNode;
    previousEvent?: EventNode;
    requiredGapMinutes: number;
    updateMode: "updateNow" | "updateOnSave";
    onStateChange?: (state: GapDetectionState, duration: number) => void;
    onGapAdjust?: () => void;
    wrapperClassName?: string;
}

export default function EventGapDetection({
    currentEvent,
    previousEvent,
    requiredGapMinutes,
    updateMode,
    onStateChange,
    onGapAdjust,
    wrapperClassName,
}: EventGapDetectionProps) {
    const [gapState, setGapState] = useState<GapDetectionState>("none");

    // If no previous event, nothing to detect
    if (!previousEvent) {
        return null;
    }

    // Detect gap status
    const gapStatus = detectEventGapStatus(currentEvent, previousEvent, requiredGapMinutes);

    // Update state to reflect current gap status
    if (gapStatus.state !== gapState) {
        setGapState(gapStatus.state);
        onStateChange?.(gapStatus.state, gapStatus.durationMinutes);
    }

    const handleClick = async () => {
        if (!previousEvent) {
            return;
        }

        const previousStartMinutes = getMinutesFromISO(previousEvent.eventData.date);
        const previousEndMinutes = previousStartMinutes + previousEvent.eventData.duration;
        const correctStartMinutes = previousEndMinutes + requiredGapMinutes;

        const datePart = currentEvent.eventData.date.split("T")[0];
        const newDate = createISODateTime(datePart, minutesToTime(correctStartMinutes));

        if (updateMode === "updateNow") {
            try {
                await updateEventStartTime(currentEvent.id, newDate);
            } catch (error) {
                console.error("Error updating event:", error);
            }
        } else {
            currentEvent.eventData.date = newDate;
            onGapAdjust?.();
        }
    };

    // Determine button properties based on state
    const getButtonProps = () => {
        switch (gapStatus.state) {
            case "overlap":
                return {
                    className: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 opacity-75 hover:bg-red-200 dark:hover:bg-red-900/30 cursor-pointer",
                    icon: <AlertTriangle className="w-3 h-3 flex-shrink-0" />,
                    text: `Overlap by ${getPrettyDuration(gapStatus.durationMinutes)}`,
                    title: `Overlap: ${getPrettyDuration(gapStatus.durationMinutes)}`,
                };
            case "overdue":
                return {
                    className: "bg-orange-100 dark:bg-orange-900/20 text-orange-400 border-orange-200 dark:border-orange-800 opacity-75 hover:bg-orange-200 dark:hover:bg-orange-900/30 cursor-pointer",
                    icon: null,
                    text: `+${getPrettyDuration(gapStatus.durationMinutes)} overdue`,
                    title: `Click to adjust gap (+${getPrettyDuration(gapStatus.durationMinutes)})`,
                };
            case "gap":
                return {
                    className: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 opacity-75 hover:bg-blue-200 dark:hover:bg-blue-900/30 cursor-pointer",
                    icon: null,
                    text: `+${getPrettyDuration(gapStatus.durationMinutes)} gap`,
                    title: `Click to remove gap (-${getPrettyDuration(gapStatus.durationMinutes)})`,
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
            className={`text-xs px-1.5 py-0.5 rounded border whitespace-nowrap flex items-center gap-1 transition-colors pointer-events-auto ${buttonProps.className}`}
            title={buttonProps.title}
            style={{ pointerEvents: "auto", zIndex: 10 }}
        >
            {buttonProps.icon}
            {buttonProps.text}
        </button>
    );

    if (wrapperClassName) {
        return <div className={wrapperClassName}>{button}</div>;
    }

    return button;
}
