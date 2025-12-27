"use client";

import { useState, useRef } from "react";
import { MapPin, Loader2, Trash2 } from "lucide-react";
import { type EventStatus, EVENT_STATUS_CONFIG } from "@/types/status";
import type { EventNode, TeacherQueue } from "@/backend/TeacherQueue";
import type { QueueController } from "@/backend/QueueController";
import { deleteClassboardEvent, updateEventStatus } from "@/actions/classboard-action";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { EventStartDurationTime } from "@/src/components/ui/EventStartDurationTime";
import { EventStatusLabel } from "@/src/components/labels/EventStatusLabel";
import EventGapDetection from "./EventGapDetection";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { ENTITY_DATA } from "@/config/entities";

const EVENT_STATUSES: EventStatus[] = ["planned", "tbc", "completed", "uncompleted"];

interface EventCardProps {
    event: EventNode;
    queue?: TeacherQueue;
    queueController?: QueueController;
    onDeleteComplete?: () => void;
    onDeleteWithCascade?: (eventId: string, minutesToShift: number, subsequentEventIds: string[]) => Promise<void>;
    showLocation?: boolean;
}

export default function EventCard({ event, queue, queueController, onDeleteComplete, onDeleteWithCascade, showLocation = true }: EventCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<EventStatus>(event.eventData.status as EventStatus);
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const studentTriggerRef = useRef<HTMLButtonElement>(null);

    const eventId = event.id;
    const duration = event.eventData.duration;
    const location = event.eventData.location;
    const categoryEquipment = event.packageData?.categoryEquipment || "";
    const capacityEquipment = event.packageData?.capacityEquipment || 0;

    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === categoryEquipment);
    const EquipmentIcon = equipmentConfig?.icon;

    // Student Data
    const leaderStudentName = event.leaderStudentName || "Booking abc";
    const students = event.bookingStudents || [];
    const hasMultipleStudents = students.length > 1;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const studentColor = studentEntity?.color || "#eab308";

    // Previous/Next Logic
    let previousEvent: EventNode | undefined;
    if (queue && eventId) {
        const allEvents = queue.getAllEvents();
        const currentEventIndex = allEvents.findIndex((e) => e.id === eventId);
        if (currentEventIndex > 0) {
            previousEvent = allEvents[currentEventIndex - 1];
        }
    }

    const canShiftQueue = queueController?.canShiftQueue(eventId) ?? false;
    const isPosting = eventId.startsWith("temp-");

    // Actions
    const handleStatusClick = async (newStatus: EventStatus) => {
        if (newStatus === currentStatus || isUpdating) return;
        setIsUpdating(true);
        try {
            await updateEventStatus(eventId, newStatus);
            setCurrentStatus(newStatus);
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (cascade: boolean) => {
        if (!eventId || isDeleting) return;
        setIsDeleting(true);
        try {
            if (cascade && onDeleteWithCascade && queue) {
                const allEvents = queue.getAllEvents();
                const currentEventIndex = allEvents.findIndex((e) => e.id === eventId);
                if (currentEventIndex !== -1) {
                    const subsequentEventIds = allEvents
                        .slice(currentEventIndex + 1)
                        .map((e) => e.id)
                        .filter((id: string) => id);
                    await onDeleteWithCascade(eventId, duration, subsequentEventIds);
                    onDeleteComplete?.();
                    return;
                }
            }
            const result = await deleteClassboardEvent(eventId);
            if (!result.success) {
                console.error("Delete failed:", result.error);
                setIsDeleting(false);
                return;
            }
            onDeleteComplete?.();
        } catch (error) {
            console.error("Error deleting event:", error);
            setIsDeleting(false);
        }
    };

    const studentDropdownItems: DropdownItemProps[] = students.map((student, index) => ({
        id: student.id || index,
        label: `${student.firstName} ${student.lastName}`,
        icon: HelmetIcon,
        color: studentColor,
    }));

    return (
        <div className={`group relative w-full overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-shadow duration-300 hover:shadow-lg ${isPosting ? "opacity-70 animate-pulse pointer-events-none" : ""}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5">
                {/* Left Side: Time and Duration */}
                <EventStartDurationTime date={event.eventData.date} duration={duration} />

                {/* Right Side: Equipment Icon (Dropdown Trigger) */}
                {EquipmentIcon && (
                    <EventStatusLabel
                        status={currentStatus}
                        onStatusChange={handleStatusClick}
                        onDelete={handleDelete}
                        isDeleting={isDeleting}
                        canShiftQueue={canShiftQueue}
                        icon={EquipmentIcon}
                        capacity={capacityEquipment}
                    />
                )}
            </div>

            {/* Footer / Student Toggle Trigger */}
            <div className="px-4 pb-4">
                <button
                    ref={studentTriggerRef}
                    onClick={() => hasMultipleStudents && setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl bg-muted/50 border border-border/50 text-left ${hasMultipleStudents ? "hover:bg-muted cursor-pointer transition-colors" : "cursor-default"}`}
                >
                    {/* Leader Student */}
                    <div className="flex items-center gap-2">
                        <div style={{ color: studentColor }}>
                            <HelmetIcon size={20} />
                        </div>
                        <span className="text-sm font-semibold text-foreground truncate max-w-[150px]">{leaderStudentName}</span>
                        {hasMultipleStudents && <span className="text-xs text-muted-foreground font-medium">+{students.length - 1}</span>}
                    </div>

                    {showLocation && location && (
                        <>
                            <div className="h-4 w-px bg-border/60" />
                            {/* Location */}
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin size={16} className="text-foreground/60" />
                                <span className="text-sm font-medium truncate max-w-[100px]">{location}</span>
                            </div>
                        </>
                    )}
                </button>

                {/* Student Dropdown - Only if multiple students */}
                {hasMultipleStudents && <Dropdown isOpen={isStudentDropdownOpen} onClose={() => setIsStudentDropdownOpen(false)} items={studentDropdownItems} align="left" triggerRef={studentTriggerRef} />}
            </div>

            {/* Gap Detection - Now at the Bottom */}
            {previousEvent && <EventGapDetection currentEvent={event} previousEvent={previousEvent} requiredGapMinutes={queueController?.getSettings().gapMinutes || 0} updateMode="updateNow" wrapperClassName="w-full px-4 pb-4 pt-0" />}

            {/* Loading Overlay */}
            {isDeleting && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}
        </div>
    );
}

// Re-export constants for EventModCard compatibility
export const HEADING_PADDING = "py-1.5";
export const ROW_MARGIN = "mx-4";
export const ROW_PADDING = "py-2";