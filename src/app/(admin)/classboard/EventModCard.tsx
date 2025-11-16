"use client";

import { useState, useCallback } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, ArrowUp, ArrowDown, MapPin } from "lucide-react";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getTimeFromISO, timeToMinutes, minutesToTime } from "@/getters/queue-getter";
import type { EventNode } from "@/backend/TeacherQueue";
import type { QueueController } from "@/backend/QueueController";
import { showEntityToast } from "@/getters/toast-getter";
import { deleteClassboardEvent } from "@/actions/classboard-action";
import { LOCATION_OPTIONS } from "./EventSettingController";
import { HEADING_PADDING, ROW_MARGIN, ROW_PADDING } from "./EventCard";
import EventGapDetection from "./EventGapDetection";
import type { ControllerSettings } from "@/backend/TeacherQueue";
import { ENTITY_DATA } from "@/config/entities";

interface EventModCardProps {
    eventId: string;
    queueController: QueueController;
}

// Constants
const STUDENT_ICON_SIZE = "w-8 h-8";

// Sub-components
const StudentGrid = ({ students }: { students: any[] }) => {
    const studentCount = students.length;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");

    if (!studentEntity) return null;

    return (
        <div className={`flex-shrink-0 ${studentCount === 4 ? "grid grid-cols-2 gap-1" : "flex gap-1"}`}>
            {students.map((_, index) => (
                <div key={index} style={{ color: studentEntity.color }}>
                    <HelmetIcon className={STUDENT_ICON_SIZE} />
                </div>
            ))}
        </div>
    );
};

const QueueControls = ({ isFirst, isLast, event, eventId, queueController }: { isFirst: boolean; isLast: boolean; event: EventNode; eventId: string; queueController: QueueController }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!eventId || isDeleting) return;

        setIsDeleting(true);
        try {
            const result = await deleteClassboardEvent(eventId);

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
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`p-1 rounded transition-opacity ${isDeleting ? "opacity-50 cursor-not-allowed text-red-400" : "text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"}`}
                title={isDeleting ? "Deleting..." : "Delete event"}
            >
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

    const handleTimeChange = (increment: boolean) => {
        queueController.adjustTime(eventId, increment);
    };

    return (
        <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">Start</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleTimeChange(false)}
                        disabled={!canMoveEarlier}
                        className="p-1.5 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={canMoveEarlier ? "30 minutes earlier" : "Cannot move earlier - would overlap"}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleTimeChange(true)}
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
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">{startTime}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{endTime}</div>
                </div>
            </div>
        </div>
    );
};

const DurationControls = ({ duration, eventId, queueController, controller }: { duration: number; eventId: string; queueController: QueueController; controller: ControllerSettings }) => {
    const stepDuration = controller.stepDuration || 30;
    const minDuration = controller.minDuration || 60;

    const handleDurationAdjustment = (increment: boolean) => {
        const newDuration = increment ? duration + stepDuration : duration - stepDuration;
        if (newDuration < minDuration) return;
        queueController.adjustDuration(eventId, increment);
    };

    return (
        <div className="flex gap-2 justify-center w-16 min-w-[4rem]">
            <div className="flex flex-col">
                <button onClick={() => handleDurationAdjustment(true)} className="p-1.5 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center" title={`${stepDuration} minutes more`}>
                    <ChevronUp className="w-4 h-4 mx-auto" />
                </button>
                <div className="text-base font-semibold text-gray-900 dark:text-white my-1">+{getPrettyDuration(duration)}</div>
                <button
                    onClick={() => handleDurationAdjustment(false)}
                    disabled={duration <= minDuration}
                    className="p-1.5 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-center"
                    title={`${stepDuration} minutes less (minimum ${minDuration} minutes)`}
                >
                    <ChevronDown className="w-4 h-4 mx-auto" />
                </button>
            </div>
        </div>
    );
};

const LocationControls = ({ eventId, currentLocation, queueController }: { eventId: string; currentLocation: string; queueController: QueueController }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleLocationSelect = async (location: string) => {
        await queueController.updateLocation(eventId, location);
        setIsOpen(false);
    };

    return (
        <div className="flex-grow min-w-0 flex justify-center">
            <div className="relative">
                <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted/50 transition-colors" title="Change location">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">{currentLocation}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-background border border-border rounded-md shadow-lg z-50 min-w-[140px]">
                        {LOCATION_OPTIONS.map((location) => (
                            <button key={location} onClick={() => handleLocationSelect(location)} className={`w-full text-left px-3 py-2 text-xs transition-colors ${location === currentLocation ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}>
                                {location}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const RemainingTimeControl = ({ durationMinutes, eventDuration }: { durationMinutes: number; eventDuration: number }) => {
    const remainingMinutes = durationMinutes - eventDuration;

    return (
        <div className="flex gap-2 justify-center w-16 min-w-[4rem]">
            <div className="flex flex-col text-center">
                <span className={`text-base font-semibold ${remainingMinutes < 0 ? "text-orange-600 dark:text-orange-400" : "text-gray-900 dark:text-white"}`}>{getPrettyDuration(Math.abs(remainingMinutes))}</span>
                <span className={`text-xs ${remainingMinutes < 0 ? "text-orange-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-400"}`}>{remainingMinutes < 0 ? "over limit" : "remaining"}</span>
            </div>
        </div>
    );
};

export default function EventModCard({ eventId, queueController }: EventModCardProps) {
    const [refreshKey, setRefreshKey] = useState(0);

    const cardProps = queueController.getEventModCardProps(eventId);

    // Return early if invalid eventId or can't get props
    if (!cardProps || !eventId) {
            return null;
    }


    const { event, isFirst, isLast, canMoveEarlier, canMoveLater } = cardProps;

    const handleRefresh = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);
    const students = event.studentData || [];
    const studentNames = students.map((s) => `${s.firstName} ${s.lastName}`).join(", ");

    // Get previous event for gap detection
    let previousEvent: EventNode | undefined;
    const queue = queueController.getQueue();
    if (queue && eventId) {
        const allEvents = queue.getAllEvents();
        const currentEventIndex = allEvents.findIndex((e) => e.id === eventId);
        if (currentEventIndex > 0) {
            previousEvent = allEvents[currentEventIndex - 1];
        }
    }

    return (
        <div className={`w-full ${HEADING_PADDING} bg-background dark:bg-card border border-border rounded-lg overflow-visible relative`}>
            {/* Student Names and Queue Controls */}
            <div className={`flex items-center gap-3 ${ROW_MARGIN} ${ROW_PADDING}`}>
                <StudentGrid students={students} />
                <div className="flex-1 overflow-x-auto">
                    <span className="text-base font-medium text-foreground whitespace-nowrap">{studentNames}</span>
                </div>
                <QueueControls isFirst={isFirst} isLast={isLast} event={event} eventId={eventId} queueController={queueController} />
            </div>

            {/* Time and Duration Controls (Row 1) */}
            <div className={`flex gap-4 ${ROW_MARGIN} ${ROW_PADDING}`}>
                <TimeControls event={event} canMoveEarlier={canMoveEarlier} canMoveLater={canMoveLater} eventId={eventId} queueController={queueController} />
                <div className="w-px bg-gray-300 dark:bg-gray-500 my-1" />
                <DurationControls duration={event.eventData.duration} eventId={eventId} queueController={queueController} controller={queueController.getSettings()} />
            </div>

            {/* Location and Gap Detection + Remaining Time (Row 2 - aligned below) */}
            <div className={`flex gap-6 items-center ${ROW_MARGIN} ${ROW_PADDING}`}>
                <div className="flex-grow" />
                <div className="w-px bg-gray-300 dark:bg-gray-500 my-1" />
                {!isFirst && previousEvent && (
                    <EventGapDetection
                        currentEvent={event}
                        previousEvent={previousEvent}
                        requiredGapMinutes={queueController.getSettings().gapMinutes || 0}
                        updateMode="updateOnSave"
                        onGapAdjust={() => {
                            queueController.addGap(eventId);
                            handleRefresh();
                        }}
                    />
                )}
                <RemainingTimeControl durationMinutes={event.packageData.durationMinutes} eventDuration={event.eventData.duration} />
            </div>

            {/* Location on its own row */}
            <div className={`${ROW_MARGIN} ${ROW_PADDING}`}>
                <LocationControls eventId={eventId} currentLocation={event.eventData.location} queueController={queueController} />
            </div>
        </div>
    );
}
