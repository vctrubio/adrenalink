"use client";

import { useState, useCallback, useRef } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, ArrowUp, ArrowDown, MapPin } from "lucide-react";
import { Dropdown } from "@/src/components/ui/dropdown";
import { getPrettyDuration, getHMDuration } from "@/getters/duration-getter";
import { getTimeFromISO, timeToMinutes, minutesToTime } from "@/getters/queue-getter";
import type { EventNode } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { QueueController } from "@/src/app/(admin)/(classboard)/QueueController";

import { deleteClassboardEvent } from "@/actions/classboard-action";
import { LOCATION_OPTIONS } from "./EventSettingController";
import EventGapDetection from "./EventGapDetection";
import type { ControllerSettings } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import { LeaderStudent } from "@/src/components/LeaderStudent";

interface EventModCardProps {
    eventId: string;
    queueController: QueueController;
    onDelete?: () => void;
}

// Sub-components

const QueueControls = ({ isFirst, isLast, event, eventId, queueController, onDelete }: { isFirst: boolean; isLast: boolean; event: EventNode; eventId: string; queueController: QueueController; onDelete?: () => void }) => {
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
            
            // Notify parent to remove from UI
            onDelete?.();
        } catch (error) {
            console.error("Error deleting event:", error);
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {!isFirst && (
                <button onClick={() => queueController.moveUp(eventId)} className="p-1.5 bg-muted/50 hover:bg-muted text-blue-600 dark:text-blue-400 rounded-lg transition-colors border border-border/20" title="Move front in queue">
                    <ChevronLeft className="w-3.5 h-3.5" />
                </button>
            )}
            {!isLast && (
                <button onClick={() => queueController.moveDown(eventId)} className="p-1.5 bg-muted/50 hover:bg-muted text-blue-600 dark:text-blue-400 rounded-lg transition-colors border border-border/20" title="Move back in queue">
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            )}
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`p-1.5 rounded-lg transition-colors border border-border/20 ${isDeleting ? "opacity-50 cursor-not-allowed text-red-400" : "bg-muted/50 hover:bg-red-50 text-red-600 dark:text-red-400 dark:hover:bg-red-900/30"}`}
                title={isDeleting ? "Deleting..." : "Delete event"}
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

const TimeControls = ({ event, canMoveEarlier, canMoveLater, eventId, queueController }: { event: EventNode; canMoveEarlier: boolean; canMoveLater: boolean; eventId: string; queueController: QueueController }) => {
    const startTime = getTimeFromISO(event.eventData.date);
    const startMinutes = timeToMinutes(startTime);
    const endTime = minutesToTime(startMinutes + event.eventData.duration);

    const handleTimeChange = (increment: boolean) => {
        queueController.adjustTime(eventId, increment);
    };

    return (
        <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] leading-none">Start</span>
                <div className="flex gap-1">
                    <button
                        onClick={() => handleTimeChange(false)}
                        disabled={!canMoveEarlier}
                        className="p-1 rounded-md bg-muted/50 hover:bg-muted border border-border/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title={canMoveEarlier ? "Earlier" : "Cannot move earlier"}
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => handleTimeChange(true)}
                        disabled={!canMoveLater}
                        className="p-1 rounded-md bg-muted/50 hover:bg-muted border border-border/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title={canMoveLater ? "Later" : "Cannot move later"}
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tighter leading-none text-foreground">{startTime}</span>
                <span className="text-sm font-bold tracking-tight leading-none text-muted-foreground/30">— {endTime}</span>
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
        <div className="flex flex-col items-center gap-1.5 min-w-[70px]">
            <button 
                onClick={() => handleDurationAdjustment(true)} 
                className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted border border-border/20 transition-colors" 
                title="Increase duration"
            >
                <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <span className="text-lg font-black tracking-tighter text-foreground leading-none">+{getHMDuration(duration)}</span>
            <button 
                onClick={() => handleDurationAdjustment(false)} 
                disabled={duration <= minDuration} 
                className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted border border-border/20 disabled:opacity-30 transition-colors" 
                title="Decrease duration"
            >
                <ChevronDown className="w-3.5 h-3.5" />
            </button>
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
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{currentLocation || "Set Location"}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
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

export default function EventModCard({ eventId, queueController, onDelete }: EventModCardProps) {
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
                <QueueControls isFirst={isFirst} isLast={isLast} event={event} eventId={eventId} queueController={queueController} onDelete={onDelete} />
            </div>

            {/* Main Body: Time & Duration */}
            <div className="p-4 flex items-center justify-between gap-2">
                <TimeControls event={event} canMoveEarlier={canMoveEarlier} canMoveLater={canMoveLater} eventId={eventId} queueController={queueController} />
                <div className="h-16 w-px bg-border/60 mx-2" />
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
