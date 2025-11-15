"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, AlertTriangle, ArrowUp, ArrowDown, MapPin } from "lucide-react";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getTimeFromISO, timeToMinutes, minutesToTime } from "@/getters/queue-getter";
import type { EventNode } from "@/backend/TeacherQueue";
import type { QueueController } from "@/backend/QueueController";
import { showEntityToast } from "@/getters/toast-getter";
import { deleteClassboardEvent } from "@/actions/classboard-action";
import { LOCATION_OPTIONS } from "./EventSettingController";
import { HEADING_PADDING, ROW_MARGIN, ROW_PADDING } from "./EventCard";

interface EventModCardProps {
    eventId: string;
    queueController: QueueController;
}

// Sub-components
const StudentGrid = ({ students }: { students: any[] }) => {
    const studentCount = students.length;

    return (
        <div className={`flex-shrink-0 ${studentCount === 4 ? "grid grid-cols-2 gap-1" : "flex gap-1"}`}>
            {students.map((_, index) => (
                <HelmetIcon key={index} className="w-8 h-8 text-yellow-500" />
            ))}
        </div>
    );
};

const QueueControls = ({ isFirst, isLast, event, eventId, queueController }: { isFirst: boolean; isLast: boolean; event: EventNode; eventId: string; queueController: QueueController }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const databaseEventId = event.eventData.id;

    const handleDelete = async () => {
        if (!databaseEventId || isDeleting) return;

        setIsDeleting(true);
        try {
            const result = await deleteClassboardEvent(databaseEventId, false);

            if (!result.success) {
                console.error("Delete failed:", result.error);
                showEntityToast("event", {
                    title: "Delete Failed",
                    description: result.error || "Failed to delete event",
                    duration: 4000,
                });
                setIsDeleting(false);
                return;
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            showEntityToast("event", {
                title: "Delete Failed",
                description: error instanceof Error ? error.message : "Failed to delete event",
                duration: 4000,
            });
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center gap-1 flex-shrink-0">
            {!isFirst && (
                <button onClick={() => queueController.moveUp(eventId)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded" title="Move front in queue">
                    <ArrowUp className="w-3 h-3" />
                </button>
            )}
            {!isLast && (
                <button onClick={() => queueController.moveDown(eventId)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded" title="Move back in queue">
                    <ArrowDown className="w-3 h-3" />
                </button>
            )}
            <button onClick={handleDelete} disabled={isDeleting} className={`p-1 rounded transition-opacity ${isDeleting ? "opacity-50 cursor-not-allowed text-red-400" : "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"}`} title={isDeleting ? "Deleting..." : "Delete event"}>
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const TimeControls = ({ event, canMoveEarlier, canMoveLater, eventId, queueController }: { event: EventNode; canMoveEarlier: boolean; canMoveLater: boolean; eventId: string; queueController: QueueController }) => {
    const startTime = getTimeFromISO(event.eventData.date);
    const durationMinutes = event.eventData.duration;
    const endTimeMinutes = timeToMinutes(startTime) + durationMinutes;
    const endTime = minutesToTime(endTimeMinutes);

    return (
        <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">Start</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => queueController.adjustTime(eventId, false)}
                        disabled={!canMoveEarlier}
                        className="p-1.5 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={canMoveEarlier ? "30 minutes earlier" : "Cannot move earlier - would overlap"}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => queueController.adjustTime(eventId, true)}
                        disabled={!canMoveLater}
                        className="p-1.5 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={canMoveLater ? "30 minutes later" : "Cannot move later - would exceed 23:00"}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
                <div className="flex flex-col text-center">
                    <div className="text-base font-semibold text-green-600 dark:text-green-400">{startTime}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{endTime}</div>
                </div>
            </div>
        </div>
    );
};

const DurationControls = ({ duration, eventId, queueController }: { duration: number; eventId: string; queueController: QueueController }) => {
    const handleDurationAdjustment = (increment: boolean) => {
        const newDuration = increment ? duration + 30 : duration - 30;
        if (newDuration < 60) return;
        queueController.adjustDuration(eventId, increment);
    };

    return (
        <div className="flex gap-2 justify-center w-16 min-w-[4rem]">
            <div className="flex flex-col">
                <button onClick={() => handleDurationAdjustment(true)} className="p-1.5 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" title="30 minutes more">
                    <ChevronUp className="w-4 h-4" />
                </button>
                <div className="text-base font-semibold text-gray-900 dark:text-white my-1">+{getPrettyDuration(duration)}</div>
                <button
                    onClick={() => handleDurationAdjustment(false)}
                    disabled={duration <= 60}
                    className="p-1.5 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="30 minutes less (minimum 60 minutes)"
                >
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const GapWarning = ({ gapDuration, eventId, meetsRequirement, requiredGapMinutes, queueController }: { gapDuration: number; eventId: string; meetsRequirement?: boolean; requiredGapMinutes?: number; queueController: QueueController }) => {
    if (!gapDuration || gapDuration <= 0) return null;

    const isBlue = meetsRequirement;
    const bgColor = isBlue ? "bg-blue-50 dark:bg-blue-900/20" : "bg-orange-50 dark:bg-orange-900/20";
    const borderColor = isBlue ? "border-blue-200 dark:border-blue-800" : "border-orange-200 dark:border-orange-800";
    const textColor = isBlue ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400";
    const hoverColor = isBlue ? "hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700" : "hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:border-orange-300 dark:hover:border-orange-700";

    return (
        <button
            onClick={() => queueController.removeGap(eventId)}
            className={`flex items-center justify-center gap-1 text-xs ${textColor} ${bgColor} p-2 rounded border ${borderColor} ${hoverColor} transition-colors cursor-pointer w-full`}
            title={isBlue ? "Gap meets requirements" : "Click to remove gap"}
        >
            {!isBlue && <AlertTriangle className="w-3 h-3 flex-shrink-0" />}
            <span>
                {getPrettyDuration(gapDuration)} gap {requiredGapMinutes ? `(requires ${requiredGapMinutes}min)` : ""}
            </span>
        </button>
    );
};

const LocationDropdown = ({ eventId, currentLocation, queueController }: { eventId: string; currentLocation: string; queueController: QueueController }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleLocationSelect = async (location: string) => {
        await queueController.updateLocation(eventId, location);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-muted/50 transition-colors" title="Change location">
                <MapPin className="w-3 h-3" />
                <span className="text-xs font-medium">{currentLocation}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 min-w-[140px]">
                    {LOCATION_OPTIONS.map((location) => (
                        <button key={location} onClick={() => handleLocationSelect(location)} className={`w-full text-left px-3 py-2 text-xs transition-colors ${location === currentLocation ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}>
                            {location}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const PackageInfo = ({ location, durationMinutes, eventDuration, eventId, queueController }: { eventId: string; location: string; durationMinutes: number; eventDuration: number; queueController: QueueController }) => {
    const remainingMinutes = durationMinutes - eventDuration;

    return (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center flex items-center justify-center gap-2">
            <LocationDropdown eventId={eventId} currentLocation={location} queueController={queueController} />
            <span>•</span>
            <span className={remainingMinutes < 0 ? "text-orange-600 dark:text-orange-400 font-medium" : ""}>
                {getPrettyDuration(Math.abs(remainingMinutes))} {remainingMinutes < 0 ? "over limit" : "remaining"}
            </span>
            {remainingMinutes < 0 && <AlertTriangle className="w-3 h-3 text-orange-600 dark:text-orange-400" />}
        </div>
    );
};

export default function EventModCard({ eventId, queueController }: EventModCardProps) {
    const cardProps = queueController.getEventModCardProps(eventId);

    // Return early if invalid eventId or can't get props
    if (!cardProps || !eventId) {
        console.log(`[EventModCard] Event ${eventId} not found in queue - event was deleted`);
        return null;
    }

    console.log(`[EventModCard] Rendering event: ${eventId}`);

    const { event, gap, isFirst, isLast, canMoveEarlier, canMoveLater } = cardProps;
    const students = event.studentData || [];
    const studentNames = students.map((s) => `${s.firstName} ${s.lastName}`).join(", ");

    const getBgColor = () => {
        if (!gap.hasGap || isFirst) return "bg-background dark:bg-card border-border";
        if (gap.meetsRequirement) return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
        return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
    };

    return (
        <div className={`w-full ${HEADING_PADDING} bg-background dark:bg-card border border-border rounded-lg overflow-visible relative ${!gap.hasGap || isFirst ? "" : getBgColor()}`}>
            <div className={`flex items-center gap-3 ${ROW_MARGIN} ${ROW_PADDING}`}>
                <StudentGrid students={students} />
                <div className="flex-1 overflow-x-auto">
                    <span className="text-base font-medium text-foreground whitespace-nowrap">{studentNames}</span>
                </div>
                <QueueControls isFirst={isFirst} isLast={isLast} event={event} eventId={eventId} queueController={queueController} />
            </div>

            <div className={`flex gap-4 ${ROW_MARGIN} ${ROW_PADDING}`}>
                <TimeControls event={event} canMoveEarlier={canMoveEarlier} canMoveLater={canMoveLater} eventId={eventId} queueController={queueController} />
                <div className="w-px bg-gray-300 dark:bg-gray-500 my-1" />
                <DurationControls duration={event.eventData.duration} eventId={eventId} queueController={queueController} />
            </div>

            <div className={`${ROW_MARGIN} ${ROW_PADDING}`}>
                <PackageInfo eventId={eventId} location={event.eventData.location} durationMinutes={event.packageData.durationMinutes} eventDuration={event.eventData.duration} queueController={queueController} />
            </div>

            {!isFirst && gap.hasGap && (
                <div className={`${ROW_MARGIN} ${ROW_PADDING}`}>
                    <GapWarning gapDuration={gap.gapDuration} eventId={eventId} meetsRequirement={gap.meetsRequirement} requiredGapMinutes={queueController.getSettings().gapMinutes} queueController={queueController} />
                </div>
            )}
        </div>
    );
}
