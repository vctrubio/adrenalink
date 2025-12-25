"use client";

import { useState, useRef } from "react";
import { MapPin, Loader2, Trash2 } from "lucide-react";
import { getTimeFromISO } from "@/getters/queue-getter";
import { type EventStatus, EVENT_STATUS_CONFIG } from "@/types/status";
import type { EventNode, TeacherQueue } from "@/backend/TeacherQueue";
import type { QueueController } from "@/backend/QueueController";
import { deleteClassboardEvent, updateEventStatus } from "@/actions/classboard-action";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import EventGapDetection from "./EventGapDetection";
import { getHMDuration } from "@/getters/duration-getter";
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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    
    const dropdownTriggerRef = useRef<HTMLButtonElement>(null);
    const studentTriggerRef = useRef<HTMLButtonElement>(null);

    const eventId = event.id;
    const startTime = getTimeFromISO(event.eventData.date);
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
    
    // Actions
    const handleStatusClick = async (newStatus: EventStatus) => {
        if (newStatus === currentStatus || isUpdating) return;
        setIsUpdating(true);
        try {
            await updateEventStatus(eventId, newStatus);
            setCurrentStatus(newStatus);
            setIsDropdownOpen(false);
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
                    const subsequentEventIds = allEvents.slice(currentEventIndex + 1).map((e) => e.id).filter((id: string) => id);
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

    const statusDropdownItems: DropdownItemProps[] = [
        ...EVENT_STATUSES.map((statusOption) => ({
            id: statusOption,
            label: statusOption,
            icon: () => <div className="w-3 h-3 rounded-full" style={{ backgroundColor: EVENT_STATUS_CONFIG[statusOption].color }} />,
            color: EVENT_STATUS_CONFIG[statusOption].color,
            onClick: () => handleStatusClick(statusOption),
        })),
        ...(canShiftQueue ? [{ id: "delete-cascade", label: isDeleting ? "Deleting..." : "Delete & Shift Queue", icon: Trash2, color: "#ef4444", onClick: () => handleDelete(true) }] : []),
        { id: "delete", label: isDeleting ? "Deleting..." : "Delete", icon: Trash2, color: "#ef4444", onClick: () => handleDelete(false) },
    ];

    const studentDropdownItems: DropdownItemProps[] = students.map((student, index) => ({
        id: student.id || index,
        label: `${student.firstName} ${student.lastName}`,
        icon: HelmetIcon,
        color: studentColor,
    }));

    return (
        <div
            className="group relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5">
                {/* Left Side: Time and Duration Stacked */}
                <div className="flex items-center gap-2">
                    <span className="text-4xl font-black tracking-tighter leading-none text-foreground">{startTime}</span>
                    <div className="flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Start</span>
                        <span className="text-sm font-bold text-foreground/80 mt-1 leading-none whitespace-nowrap">
                            +{getHMDuration(duration)}
                        </span>
                    </div>
                </div>

                {/* Right Side: Equipment Icon (Dropdown Trigger) */}
                {EquipmentIcon && (
                    <div className="relative">
                        <button 
                            ref={dropdownTriggerRef}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors border border-border relative"
                            style={{ color: EVENT_STATUS_CONFIG[currentStatus].color }}
                        >
                            <EquipmentIcon size={24} />
                            {/* Capacity Badge */}
                            {capacityEquipment > 1 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white shadow-sm border border-border/50">
                                    x{capacityEquipment}
                                </span>
                            )}
                        </button>
                        <Dropdown 
                            isOpen={isDropdownOpen} 
                            onClose={() => setIsDropdownOpen(false)} 
                            items={statusDropdownItems} 
                            align="right" 
                            initialFocusedId={currentStatus}
                            triggerRef={dropdownTriggerRef}
                        />
                    </div>
                )}
            </div>

            {/* Footer / Student Toggle Trigger */}
            <div className="px-4 pb-4">
                <button
                    ref={studentTriggerRef}
                    onClick={() => hasMultipleStudents && setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl bg-muted/50 border border-border/50 text-left ${
                        hasMultipleStudents ? "hover:bg-muted cursor-pointer transition-colors" : "cursor-default"
                    }`}
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
                {hasMultipleStudents && (
                    <Dropdown 
                        isOpen={isStudentDropdownOpen}
                        onClose={() => setIsStudentDropdownOpen(false)}
                        items={studentDropdownItems}
                        align="left"
                        triggerRef={studentTriggerRef}
                    />
                )}
            </div>

             {/* Gap Detection - Now at the Bottom */}
             {previousEvent && (
                <EventGapDetection 
                    currentEvent={event} 
                    previousEvent={previousEvent} 
                    requiredGapMinutes={queueController?.getSettings().gapMinutes || 0} 
                    updateMode="updateNow" 
                    wrapperClassName="w-full px-4 pb-4 pt-0"
                />
            )}

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