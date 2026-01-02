// "use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, ArrowUp, ArrowDown, MapPin, Plus, Minus } from "lucide-react";
import { Dropdown } from "@/src/components/ui/dropdown";
import { getPrettyDuration, getHMDuration } from "@/getters/duration-getter";
import { getTimeFromISO, timeToMinutes, minutesToTime, getMinutesFromISO } from "@/getters/queue-getter";
import { getPackageInfo } from "@/getters/school-packages-getter";
import type { EventNode, ControllerSettings } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import { QueueController } from "@/src/app/(admin)/(classboard)/QueueController";
import type { QueueController as QueueControllerType } from "@/src/app/(admin)/(classboard)/QueueController";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { useClassboardContext } from "@/src/providers/classboard-provider";

import { deleteClassboardEvent } from "@/actions/classboard-action";
import { LOCATION_OPTIONS } from "./EventSettingController";
import EventGapDetection from "./EventGapDetection";
import { LeaderStudent } from "@/src/components/LeaderStudent";

interface EventModCardProps {
    event: EventNode;
    queueController: QueueControllerType;
    onDelete?: () => void;
}

// Sub-components

const QueueControls = ({ isFirst, isLast, event, eventId, queueController, onDelete }: { isFirst: boolean; isLast: boolean; event: EventNode; eventId: string; queueController: QueueControllerType; onDelete?: () => void }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!eventId || isDeleting) return;

        setIsDeleting(true);
        try {
            console.log(`🗑️ [EventModCard] Deleting event ${eventId}`);

            // Use QueueController's deleteEvent method - it handles both modes
            const result = await queueController.deleteEvent(
                eventId,
                deleteClassboardEvent,
                onDelete // This will remove from snapshot
            );

            if (!result.success) {
                setIsDeleting(false);
                return;
            }

            console.log(`✅ [EventModCard] Event deleted, ${result.updates.length} events updated`);
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

const TimeControls = ({ event, canMoveEarlier, canMoveLater, eventId, queueController }: { event: EventNode; canMoveEarlier: boolean; canMoveLater: boolean; eventId: string; queueController: QueueControllerType }) => {
    const startTime = getTimeFromISO(event.eventData.date);
    const startMinutes = timeToMinutes(startTime);
    const endTime = minutesToTime(startMinutes + event.eventData.duration);

    const handleTimeChange = (increment: boolean) => {
        queueController.adjustTime(eventId, increment);
    };

    return (
        <div className="flex flex-col flex-1 gap-1">
            {/* Top Row: Labels and Increment controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
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
            </div>

            {/* Bottom Row: Times */}
            <div className="flex items-center">
                <span className="text-3xl font-black tracking-tighter leading-none text-foreground">{startTime}</span>
                <span className="ml-2 text-sm font-bold tracking-tight leading-none text-muted-foreground/30">— {endTime}</span>
            </div>
        </div>
    );
};

const DurationControls = ({ duration, eventId, queueController }: { duration: number; eventId: string; queueController: QueueControllerType }) => {
    const handleDurationAdjustment = (increment: boolean) => {
        const controller = queueController.getSettings();

        const stepDuration = controller.stepDuration || 30;

        const minDuration = controller.minDuration || 60;

        const newDuration = increment ? duration + stepDuration : duration - stepDuration;

        if (newDuration < minDuration) return;

        queueController.adjustDuration(eventId, increment);
    };

    return (
        <div className="flex flex-col flex-1 gap-2 min-w-[60px] mr-1">
            {/* Top Row: Icon and Increment */}

            <div className="flex items-center gap-2 justify-end">
                <div className="flex gap-1">
                    <button onClick={() => handleDurationAdjustment(true)} className="p-1 rounded-md bg-muted/50 hover:bg-muted border border-border/20 transition-colors" title="Increase duration">
                        <Plus className="w-3.5 h-3.5" />
                    </button>

                    <button
                        onClick={() => handleDurationAdjustment(false)}
                        disabled={duration <= (queueController.getSettings().minDuration || 60)}
                        className="p-1 rounded-md bg-muted/50 hover:bg-muted border border-border/20 disabled:opacity-30 transition-colors"
                        title="Decrease duration"
                    >
                        <Minus className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Bottom Row: Duration Text */}

            <div className="flex items-center gap-1 justify-end">
                <DurationIcon size={16} className="text-muted-foreground/80" />
                <span className="text-3xl font-black tracking-tighter leading-none text-foreground">{getHMDuration(duration)}</span>
            </div>
        </div>
    );
};

const LocationControls = ({ eventId, currentLocation, queueController }: { eventId: string; currentLocation: string; queueController: QueueControllerType }) => {
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

    console.log(`⏱️ [RemainingTimeControl] Rendering:`, {
        durationMinutes,
        eventDuration,
        remainingMinutes,
    });

    return (
        <div className="flex flex-col items-end">
            <span className={`text-sm font-bold ${remainingMinutes < 0 ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"}`}>
                {remainingMinutes < 0 ? "+" : "-"}
                {getPrettyDuration(Math.abs(remainingMinutes))}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{remainingMinutes < 0 ? "Over" : "Left"}</span>
        </div>
    );
};

export default function EventModCard({ event, queueController, onDelete }: EventModCardProps) {
    const { bookingsForSelectedDate } = useClassboardContext();
    const eventId = event.id;
    const allEvents = queueController.getQueue().getAllEvents();
    const currentEventIndex = allEvents.findIndex((e) => e.id === eventId);

    // Position flags
    const isFirst = currentEventIndex === 0;
    const isLast = currentEventIndex === allEvents.length - 1;
    const canMoveEarlier = queueController.canMoveEarlier(eventId);
    const canMoveLater = queueController.canMoveLater(eventId);

    // Use linked list reference for previous event
    const previousEvent = event.prev;

    // Get booking progress duration - calculate from package info
    const bookingData = bookingsForSelectedDate.find((b) => b.booking.id === event.bookingId);
    const packageInfo = bookingData ? getPackageInfo(bookingData.schoolPackage, bookingData.lessons) : null;
    const bookingDurationMinutes = packageInfo?.durationMinutes ?? 0;

    console.log(`📊 [EventModCard] Event ${eventId}:`, {
        bookingId: event.bookingId,
        bookingFound: !!bookingData,
        bookingDurationMinutes,
        eventDuration: event.eventData.duration,
        shouldDisplay: bookingDurationMinutes > 0,
    });

    return (
        <div className="w-full bg-background border border-border rounded-xl overflow-visible shadow-sm relative">
            {/* Header: Student & Controls */}
            <div className="flex items-center justify-between px-4 py-1 border-b border-border/50 bg-muted/10">
                <div className="scale-90 origin-left">
                    <LeaderStudent leaderStudentName={event.bookingLeaderName} bookingId={event.bookingId} bookingStudents={event.bookingStudents || []} />
                </div>
                <QueueControls isFirst={isFirst} isLast={isLast} event={event} eventId={eventId} queueController={queueController} onDelete={onDelete} />
            </div>

            {/* Main Body: Time & Duration */}
            <div className="pt-4 px-4 flex items-center justify-between gap-2 relative">
                {!isFirst && previousEvent && (
                    <EventGapDetection
                        currentEvent={event}
                        previousEvent={previousEvent}
                        requiredGapMinutes={queueController.getSettings().gapMinutes || 0}
                        updateMode="updateOnSave"
                        onGapAdjust={() => {
                            // Calculate actual gap and decide whether to add or remove
                            const prevEndMinutes = getMinutesFromISO(previousEvent.eventData.date) + previousEvent.eventData.duration;
                            const currStartMinutes = getMinutesFromISO(event.eventData.date);
                            const actualGap = currStartMinutes - prevEndMinutes;
                            const requiredGap = queueController.getSettings().gapMinutes || 0;

                            if (actualGap < requiredGap) {
                                // Gap too small - move event later to add gap
                                queueController.addGap(eventId);
                            } else if (actualGap > requiredGap) {
                                // Gap too large - move event earlier to remove gap
                                queueController.removeGap(eventId);
                            }
                        }}
                        wrapperClassName="absolute top-1 left-4 right-0 flex justify-start pointer-events-none z-20"
                        className="w-auto shadow-sm"
                    />
                )}
                <TimeControls event={event} canMoveEarlier={canMoveEarlier} canMoveLater={canMoveLater} eventId={eventId} queueController={queueController} />
                <div className="h-16 w-px bg-border/60 mx-2" />
                <DurationControls duration={event.eventData.duration} eventId={eventId} queueController={queueController} />
            </div>

            {/* Footer: Location & Meta */}
            <div className="px-4 py-2 flex items-end justify-between">
                <LocationControls eventId={eventId} currentLocation={event.eventData.location} queueController={queueController} />
                {bookingDurationMinutes > 0 && <RemainingTimeControl durationMinutes={bookingDurationMinutes} eventDuration={event.eventData.duration} />}
            </div>
        </div>
    );
}
