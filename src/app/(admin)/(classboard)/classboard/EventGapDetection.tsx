"use client";

import { useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getMinutesFromISO, minutesToTime, createISODateTime, getDatePartFromISO } from "@/getters/queue-getter";
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

        const datePart = getDatePartFromISO(currentEvent.eventData.date);
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
                    className: "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20",
                    icon: <AlertTriangle className="w-3 h-3 flex-shrink-0" />,
                    text: `Overlap: ${getPrettyDuration(gapStatus.durationMinutes)}`,
                    title: `Fix overlap (${getPrettyDuration(gapStatus.durationMinutes)})`,
                };
            case "overdue":
                return {
                    className: "bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20",
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
            className={`${className || "w-full"} flex items-center justify-center gap-1.5 py-0.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all duration-200 pointer-events-auto ${buttonProps.className}`}
            title={buttonProps.title}
            style={{ pointerEvents: "auto", zIndex: 10 }}
        >
            {buttonProps.icon}
            <span>{buttonProps.text}</span>
        </button>
    );

    if (wrapperClassName) {
        return <div className={wrapperClassName}>{button}</div>;
    }

    return button;
}