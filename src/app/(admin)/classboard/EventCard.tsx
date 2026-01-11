"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { type EventStatus, EVENT_STATUS_CONFIG } from "@/types/status";
import type { EventNode } from "@/backend/classboard/TeacherQueue";
import type { QueueController } from "@/backend/classboard/QueueController";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { EventStartDurationTime } from "@/src/components/ui/EventStartDurationTime";
import { EventStatusLabel } from "@/src/components/labels/EventStatusLabel";
import EventGapDetection from "./EventGapDetection";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { ENTITY_DATA } from "@/config/entities";
import { useClassboardContext, type EventCardStatus } from "@/src/providers/classboard-provider";

interface EventCardProps {
    event: EventNode;
    queueController?: QueueController;
    gapMinutes?: number; // Optional override, defaults to GlobalFlag
    showLocation?: boolean;
    cardStatus?: EventCardStatus;
}

// Status Icon - shows different states
const StatusIcon = ({
    size = 24,
    isPosting,
    isDeleting,
    isError,
    EquipmentIcon,
}: {
    size?: number;
    isPosting?: boolean;
    isDeleting?: boolean;
    isError?: boolean;
    EquipmentIcon?: any;
}) => {
    if (isPosting) {
        return (
            <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="flex items-center justify-center shrink-0"
            >
                <Image src="/ADR.webp" width={size} height={size} alt="" className="rounded-full object-cover" />
            </motion.div>
        );
    }

    if (isDeleting) {
        return (
            <motion.div
                animate={{ rotate: [0, -360] }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="flex items-center justify-center shrink-0"
            >
                <Image src="/ADR.webp" width={size} height={size} alt="" className="rounded-full object-cover" />
            </motion.div>
        );
    }

    if (isError) {
        return (
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.1, 0.8] }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="flex items-center justify-center shrink-0"
            >
                <Image
                    src="/ADR.webp"
                    width={size}
                    height={size}
                    alt=""
                    className="rounded-full object-cover grayscale opacity-40 ring-2 ring-red-500"
                />
            </motion.div>
        );
    }

    // Default: show equipment icon
    if (EquipmentIcon) {
        return <EquipmentIcon size={size} />;
    }

    return null;
};

/**
 * EventCard - Renders a single event card
 * Reads gapMinutes from GlobalFlag (source of truth)
 */
export default function EventCard({
    event,
    queueController,
    gapMinutes: gapMinutesProp,
    showLocation = true,
    cardStatus,
}: EventCardProps) {
    const contextValue = useClassboardContext();
    const { deleteEvent, updateEventStatus } = contextValue;

    const [currentStatus, setCurrentStatus] = useState<EventStatus>(event.eventData.status as EventStatus);
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

    const studentTriggerRef = useRef<HTMLButtonElement>(null);

    // Get gapMinutes from GlobalFlag (source of truth) or use prop override or default
    const gapMinutes = gapMinutesProp ?? contextValue?.globalFlag?.getController()?.gapMinutes ?? 0;

    // Sync local state with prop when event updates from subscription
    useEffect(() => {
        setCurrentStatus(event.eventData.status as EventStatus);
    }, [event.eventData.status]);

    const eventId = event.id;
    const duration = event.eventData.duration;
    const location = event.eventData.location;
    const categoryEquipment = event.categoryEquipment || "";
    const capacityEquipment = event.capacityEquipment || 0;

    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === categoryEquipment);
    const EquipmentIcon = equipmentConfig?.icon;

    // Student Data
    const leaderStudentName = event.bookingLeaderName || "Booking abc";
    const students = event.bookingStudents || [];
    const hasMultipleStudents = students.length > 1;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const studentColor = studentEntity?.color || "#eab308";

    // Check if we are awaiting a previous node's deletion/update
    // We traverse back to find the first NON-mutating previous event for gap detection
    const getEffectivePreviousEvent = (node: EventNode | null): EventNode | null => {
        let current = node;
        while (current) {
            const status = contextValue.getEventCardStatus(current.id);
            // Skip events that are being mutated (deleting or updating)
            if (status !== "deleting" && status !== "updating") return current;
            current = current.prev;
        }
        return null;
    };

    const effectivePreviousEvent = getEffectivePreviousEvent(event.prev);
    // Check if any previous event in the chain is mutating (deleting or updating from cascade)
    const isWaitingForPrevious = event.prev && event.prev !== effectivePreviousEvent;

    // Check if there's a next event for cascade delete option
    const hasNextEvent = !!event.next;

    // Derive posting state from temp- prefix
    const isPosting = eventId.startsWith("temp-");
    const isUpdating = cardStatus === "updating";
    const isDeleting = cardStatus === "deleting";
    const isError = cardStatus === "error";
    const isLoading = isPosting || isUpdating || isDeleting;

    const IconWrapper = useCallback(
        (props: { size?: number }) => (
            <StatusIcon {...props} isPosting={isPosting} isDeleting={isDeleting} isError={isError} EquipmentIcon={EquipmentIcon} />
        ),
        [isPosting, isDeleting, isError, EquipmentIcon],
    );

    // Actions
    const handleStatusClick = async (newStatus: EventStatus) => {
        if (newStatus === currentStatus || isUpdating) return;
        try {
            // Optimistic update
            setCurrentStatus(newStatus);

            // Server update via context (handles mutation state)
            await updateEventStatus(eventId, newStatus);
        } catch (error) {
            console.error("❌ [EventCard] Error updating status:", error);
            setCurrentStatus(currentStatus); // Revert on error
        }
    };

    const handleDelete = async (cascade: boolean) => {
        if (!eventId || isDeleting) return;

        try {
            await deleteEvent(eventId, cascade, queueController);
        } catch (error) {
            console.error("❌ [EventCard] Error deleting event:", error);
        }
    };

    const studentDropdownItems: DropdownItemProps[] = students.map((student, index) => ({
        id: student.id || index,
        label: `${student.firstName} ${student.lastName}`,
        icon: HelmetIcon,
        color: studentColor,
    }));

    return (
        <div
            className={`group relative w-full overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-all duration-300 hover:shadow-lg ${isLoading ? "pointer-events-none" : ""} ${isError ? "ring-2 ring-red-500" : ""}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 relative">
                {effectivePreviousEvent && gapMinutes !== undefined && !isDeleting && !isWaitingForPrevious && (
                    <EventGapDetection
                        currentEvent={event}
                        previousEvent={effectivePreviousEvent}
                        requiredGapMinutes={gapMinutes}
                        updateMode="updateNow"
                        wrapperClassName="absolute top-1 left-6 right-0 flex justify-start pointer-events-none z-20"
                        className="w-auto shadow-sm"
                    />
                )}

                {/* Left Side: Time and Duration */}
                <div
                    className={`transition-all duration-500 ${isWaitingForPrevious || isUpdating || isDeleting ? "blur-[2px] opacity-50 scale-95 origin-left grayscale" : ""}`}
                >
                    <EventStartDurationTime date={event.eventData.date} duration={duration} />
                </div>

                {/* Right Side: Status Label with StatusIcon */}
                <EventStatusLabel
                    status={currentStatus}
                    onStatusChange={handleStatusClick}
                    onDelete={handleDelete}
                    isDeleting={isDeleting}
                    isUpdating={isUpdating}
                    canShiftQueue={hasNextEvent}
                    icon={IconWrapper}
                    capacity={capacityEquipment}
                />
            </div>

            {/* Footer / Student Toggle Trigger */}
            <div className="px-2 pb-2">
                <button
                    ref={studentTriggerRef}
                    onClick={() => hasMultipleStudents && setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 text-left ${hasMultipleStudents ? "hover:bg-muted cursor-pointer transition-colors" : "cursor-default"}`}
                >
                    {/* Left side: Student(s) */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div style={{ color: studentColor }} className="shrink-0">
                            <HelmetIcon size={20} />
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                            <div className="overflow-x-auto custom-scrollbar-hide whitespace-nowrap scroll-smooth">
                                <span className="text-sm font-semibold text-foreground">{leaderStudentName}</span>
                            </div>
                            {hasMultipleStudents && (
                                <span className="text-[10px] bg-foreground/5 px-1.5 py-0.5 rounded-md text-muted-foreground font-black shrink-0">
                                    +{students.length - 1}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right side: Location */}
                    {showLocation && location && (
                        <div className="flex items-center gap-2 text-muted-foreground shrink-0 pl-2 border-l border-border/40">
                            <MapPin size={14} className="text-foreground/40" />
                            <span className="text-[11px] font-bold truncate max-w-[80px] uppercase tracking-tight">{location}</span>
                        </div>
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
        </div>
    );
}

// Re-export constants for EventModCard compatibility
export const HEADING_PADDING = "py-1.5";
export const ROW_MARGIN = "mx-4";
export const ROW_PADDING = "py-2";
