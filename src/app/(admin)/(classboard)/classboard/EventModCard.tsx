"use client";

import { useState, useCallback, useRef } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, ArrowUp, ArrowDown, MapPin } from "lucide-react";
import { Dropdown } from "@/src/components/ui/dropdown";
import { getPrettyDuration, getHMDuration } from "@/getters/duration-getter";
import { getTimeFromISO, timeToMinutes, minutesToTime } from "@/getters/queue-getter";
import type { EventNode } from "@/backend/TeacherQueue";
import type { QueueController } from "@/backend/QueueController";

import { deleteClassboardEvent } from "@/actions/classboard-action";
import { LOCATION_OPTIONS } from "./EventSettingController";
import EventGapDetection from "./EventGapDetection";
import type { ControllerSettings } from "@/backend/TeacherQueue";
import { LeaderStudent } from "@/src/components/LeaderStudent";

interface EventModCardProps {
    eventId: string;
    queueController: QueueController;
}

// Sub-components

const QueueControls = ({ isFirst, isLast, event, eventId, queueController }: { isFirst: boolean; isLast: boolean; event: EventNode; eventId: string; queueController: QueueController }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!eventId || isDeleting) return;

        setIsDeleting(true);
        try {
            const result = await deleteClassboardEvent(eventId);

            if (!result.success) {
                setIsDeleting(false);
                return;
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {!isFirst && (
                <button onClick={() => queueController.moveUp(eventId)} className="p-1.5 bg-muted/50 hover:bg-muted text-blue-600 dark:text-blue-400 rounded-lg transition-colors border border-border/20" title="Move front in queue">
                    <ArrowUp className="w-4 h-4" />
                </button>
            )}
            {!isLast && (
                <button onClick={() => queueController.moveDown(eventId)} className="p-1.5 bg-muted/50 hover:bg-muted text-blue-600 dark:text-blue-400 rounded-lg transition-colors border border-border/20" title="Move back in queue">
                    <ArrowDown className="w-4 h-4" />
                </button>
            )}
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`p-1.5 rounded-lg transition-colors border border-border/20 ${isDeleting ? "opacity-50 cursor-not-allowed text-red-400" : "bg-muted/50 hover:bg-red-50 text-red-600 dark:text-red-400 dark:hover:bg-red-900/30"}`}
                title={isDeleting ? "Deleting..." : "Delete event"}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const TimeControls = ({ event, canMoveEarlier, canMoveLater, eventId, queueController }: { event: EventNode; canMoveEarlier: boolean; canMoveLater: boolean; eventId: string; queueController: QueueController }) => {
    const startTime = getTimeFromISO(event.eventData.date);

    const handleTimeChange = (increment: boolean) => {
        queueController.adjustTime(eventId, increment);
    };

    return (
        <div className="flex items-center gap-3">
            <span className="text-4xl font-black tracking-tighter leading-none text-foreground">{startTime}</span>
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Start</span>
                <div className="flex gap-1">
                    <button
                        onClick={() => handleTimeChange(false)}
                        disabled={!canMoveEarlier}
                        className="p-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title={canMoveEarlier ? "30 minutes earlier" : "Cannot move earlier"}
                    >
                        <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => handleTimeChange(true)}
                        disabled={!canMoveLater}
                        className="p-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title={canMoveLater ? "30 minutes later" : "Cannot move later"}
                    >
                        <ChevronRight className="w-3 h-3" />
                    </button>
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
        <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Duration</span>
            <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-1 border border-border/50">
                <button onClick={() => handleDurationAdjustment(false)} disabled={duration <= minDuration} className="p-1 rounded hover:bg-background disabled:opacity-30 transition-colors" title="Decrease duration">
                    <ChevronDown className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold min-w-[3rem] text-center">+{getHMDuration(duration)}</span>
                <button onClick={() => handleDurationAdjustment(true)} className="p-1 rounded hover:bg-background transition-colors" title="Increase duration">
                    <ChevronUp className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const LocationControls = ({ eventId, currentLocation, queueController }: { eventId: string; currentLocation: string; queueController: QueueController }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const handleLocationSelect = (location: string) => {
        queueController.updateLocation(eventId, location);
        setIsOpen(false);
    };

    const locationItems = LOCATION_OPTIONS.map((location) => ({
        id: location,
        label: location,
        onClick: () => handleLocationSelect(location),
    }));

    return (
        <div className="relative">
            <button ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border/50" title="Change location">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{currentLocation || "Set Location"}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            <Dropdown
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                items={locationItems}
                align="left"
                triggerRef={triggerRef}
                renderItem={(item) => (
                    <button
                        onClick={() => {
                            item.onClick?.();
                            setIsOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors ${item.label === currentLocation ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50"}`}
                    >
                        {item.label}
                    </button>
                )}
            />
        </div>
    );
};

const RemainingTimeControl = ({ durationMinutes, eventDuration }: { durationMinutes: number; eventDuration: number }) => {
    const remainingMinutes = durationMinutes - eventDuration;

    return (
        <div className="flex flex-col items-end">
            <span className={`text-sm font-bold ${remainingMinutes < 0 ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"}`}>
                {remainingMinutes < 0 ? "-" : "+"}
                {getPrettyDuration(Math.abs(remainingMinutes))}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{remainingMinutes < 0 ? "Over" : "Left"}</span>
        </div>
    );
};

export default function EventModCard({ eventId, queueController }: EventModCardProps) {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    const cardProps = queueController.getEventModCardProps(eventId);

    if (!cardProps || !eventId) {
        return null;
    }

    const { event, isFirst, isLast, canMoveEarlier, canMoveLater } = cardProps;

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
        <div className="w-full bg-background border border-border rounded-xl overflow-visible shadow-sm relative">
            {/* Header: Student & Controls */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/10">
                <div className="scale-90 origin-left">
                    <LeaderStudent leaderStudentName={event.leaderStudentName} bookingId={event.bookingId} bookingStudents={event.bookingStudents || []} />
                </div>
                <QueueControls isFirst={isFirst} isLast={isLast} event={event} eventId={eventId} queueController={queueController} />
            </div>

            {/* Main Body: Time & Duration */}
            <div className="p-4 flex items-center justify-between gap-4">
                <TimeControls event={event} canMoveEarlier={canMoveEarlier} canMoveLater={canMoveLater} eventId={eventId} queueController={queueController} />
                <DurationControls duration={event.eventData.duration} eventId={eventId} queueController={queueController} controller={queueController.getSettings()} />
            </div>

            {/* Footer: Location & Meta */}
            <div className="px-4 pb-4 pt-0 flex items-end justify-between">
                <LocationControls eventId={eventId} currentLocation={event.eventData.location} queueController={queueController} />
                <RemainingTimeControl durationMinutes={event.packageData.durationMinutes} eventDuration={event.eventData.duration} />
            </div>

            {/* Gap Detection - Full Width Bottom */}
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
                    wrapperClassName="w-full px-4 pb-4 pt-0"
                />
            )}
        </div>
    );
}
