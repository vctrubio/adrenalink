"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { type EventStatus, EVENT_STATUS_CONFIG } from "@/types/status";
import type { EventNode } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { QueueController } from "@/src/app/(admin)/(classboard)/QueueController";
import { deleteClassboardEvent, updateEventStatus } from "@/actions/classboard-action";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { EventStartDurationTime } from "@/src/components/ui/EventStartDurationTime";
import { EventStatusLabel } from "@/src/components/labels/EventStatusLabel";
import EventGapDetection from "./EventGapDetection";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { ENTITY_DATA } from "@/config/entities";

type EventCardStatus = "posting" | "updating" | "deleting" | "error";

interface EventCardProps {
    event: EventNode;
    queueController?: QueueController;
    gapMinutes?: number;
    onDeleteComplete?: () => void;
    showLocation?: boolean;
    cardStatus?: EventCardStatus;
}

export default function EventCard({ event, queueController, gapMinutes, onDeleteComplete, showLocation = true, cardStatus }: EventCardProps) {
    const [currentStatus, setCurrentStatus] = useState<EventStatus>(event.eventData.status as EventStatus);
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const studentTriggerRef = useRef<HTMLButtonElement>(null);

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

    // Use linked list for previous event
    const previousEvent = event.prev;

    // Check if there's a next event for cascade delete option
    const hasNextEvent = !!event.next;
    const canShiftQueue = queueController?.canShiftQueue(eventId) ?? false;

    // Derive posting state from temp- prefix
    const isPosting = eventId.startsWith("temp-");
    const isLoading = isPosting || cardStatus === "updating" || isDeleting;
    const isError = cardStatus === "error";

    // Status Icon - shows different states
    const StatusIcon = ({ size = 24 }: { size?: number }) => {
        if (isPosting) {
            return (
                <motion.div
                    initial={{ rotate: -45 }}
                    animate={{ rotate: -45 + 360 }}
                    transition={{
                        duration: 4,
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
                    initial={{ rotate: -45 }}
                    animate={{ rotate: -45 - 360 }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="flex items-center justify-center shrink-0"
                >
                    <Image src="/ADR.webp" width={size} height={size} alt="" className="rounded-full object-cover grayscale opacity-60" />
                </motion.div>
            );
        }

        if (cardStatus === "error") {
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
                    <Image src="/ADR.webp" width={size} height={size} alt="" className="rounded-full object-cover grayscale opacity-40 ring-2 ring-red-500" />
                </motion.div>
            );
        }

        // Default: show equipment icon
        if (EquipmentIcon) {
            return <EquipmentIcon size={size} />;
        }

        return null;
    };

    // Actions
    const handleStatusClick = async (newStatus: EventStatus) => {
        if (newStatus === currentStatus || cardStatus === "updating") return;
        try {
            // Optimistic update
            setCurrentStatus(newStatus);

            // Server update
            const result = await updateEventStatus(eventId, newStatus);

            if (!result.success) {
                console.error("❌ [EventCard] Status update failed:", result.error);
                // Revert on failure
                setCurrentStatus(currentStatus);
            }
        } catch (error) {
            console.error("❌ [EventCard] Error updating status:", error);
            setCurrentStatus(currentStatus);
        }
    };

    const handleDelete = async (cascade: boolean) => {
        if (!eventId || isDeleting) return;
        setIsDeleting(true);

        try {
            // Cascade delete: optimize remaining queue
            if (cascade && queueController) {
                const { deletedId, updates } = queueController.cascadeDeleteAndOptimise(eventId);

                // Execute: delete from DB + bulk update remaining events
                const { bulkUpdateClassboardEvents } = await import("@/actions/classboard-bulk-action");

                await deleteClassboardEvent(deletedId);

                if (updates.length > 0) {
                    await bulkUpdateClassboardEvents(updates, []);
                }

                onDeleteComplete?.();
                return;
            }

            // Standard delete: just remove event
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
        <div className={`group relative w-full overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-shadow duration-300 hover:shadow-lg ${isLoading ? "pointer-events-none" : ""} ${isDeleting ? "opacity-60" : ""} ${isError ? "ring-2 ring-red-500" : ""}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 relative">
                {previousEvent && gapMinutes !== undefined && (
                    <EventGapDetection
                        currentEvent={event}
                        previousEvent={previousEvent}
                        requiredGapMinutes={gapMinutes}
                        updateMode="updateNow"
                        wrapperClassName="absolute top-1 left-6 right-0 flex justify-start pointer-events-none z-20"
                        className="w-auto shadow-sm"
                    />
                )}

                {/* Left Side: Time and Duration */}
                <EventStartDurationTime date={event.eventData.date} duration={duration} />

                {/* Right Side: Status Label with StatusIcon */}
                <EventStatusLabel
                    status={currentStatus}
                    onStatusChange={handleStatusClick}
                    onDelete={handleDelete}
                    isDeleting={isDeleting}
                    canShiftQueue={hasNextEvent}
                    icon={StatusIcon}
                    capacity={capacityEquipment}
                />
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
        </div>
    );
}

// Re-export constants for EventModCard compatibility
export const HEADING_PADDING = "py-1.5";
export const ROW_MARGIN = "mx-4";
export const ROW_PADDING = "py-2";
