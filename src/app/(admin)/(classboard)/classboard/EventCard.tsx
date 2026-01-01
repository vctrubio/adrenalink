"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { type EventStatus, EVENT_STATUS_CONFIG } from "@/types/status";
import type { EventNodeV2, TeacherQueue } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import type { QueueController } from "@/src/app/(admin)/(classboard)/QueueController";
import { deleteClassboardEvent, updateEventStatus } from "@/actions/classboard-action";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { EventStartDurationTime } from "@/src/components/ui/EventStartDurationTime";
import { EventStatusLabel } from "@/src/components/labels/EventStatusLabel";
import EventGapDetection from "./EventGapDetection";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { ENTITY_DATA } from "@/config/entities";

interface EventCardProps {
    event: EventNodeV2;
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

    // Sync local state with prop when event updates from subscription
    useEffect(() => {
        console.log("🔄 [EventCard] Status prop changed:", event.eventData.status);
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

    // Previous/Next Logic
    let previousEvent: EventNodeV2 | undefined;
    if (queue && eventId) {
        const allEvents = queue.getAllEvents();
        const currentEventIndex = allEvents.findIndex((e) => e.id === eventId);
        if (currentEventIndex > 0) {
            previousEvent = allEvents[currentEventIndex - 1];
        }
    }

    const canShiftQueue = queueController?.canShiftQueue(eventId) ?? false;
    const isPosting = eventId.startsWith("temp-");

    const PostingIcon = ({ size = 24 }: { size?: number }) => (
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

    const DeletingIcon = ({ size = 24 }: { size?: number }) => (
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

    // Actions
    const handleStatusClick = async (newStatus: EventStatus) => {
        if (newStatus === currentStatus || isUpdating) return;
        console.log("📝 [EventCard] Updating status:", eventId, "from", currentStatus, "to", newStatus);
        setIsUpdating(true);
        try {
            // Optimistic update
            setCurrentStatus(newStatus);

            // Server update
            const result = await updateEventStatus(eventId, newStatus);

            if (!result.success) {
                console.error("❌ [EventCard] Status update failed:", result.error);
                // Revert on failure
                setCurrentStatus(currentStatus);
            } else {
                console.log("✅ [EventCard] Status updated successfully");
                // Subscription will sync the change across all components
            }
        } catch (error) {
            console.error("❌ [EventCard] Error updating status:", error);
            // Revert on error
            setCurrentStatus(currentStatus);
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
        <div className={`group relative w-full overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-shadow duration-300 hover:shadow-lg ${isPosting || isDeleting ? "pointer-events-none" : ""} ${isDeleting ? "opacity-60" : ""}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 relative">
                {previousEvent && (
                    <EventGapDetection
                        currentEvent={event}
                        previousEvent={previousEvent}
                        requiredGapMinutes={queueController?.getSettings().gapMinutes || 0}
                        updateMode="updateNow"
                        wrapperClassName="absolute top-1 left-6 right-0 flex justify-start pointer-events-none z-20"
                        className="w-auto shadow-sm"
                    />
                )}

                {/* Left Side: Time and Duration */}
                <EventStartDurationTime date={event.eventData.date} duration={duration} />

                {/* Right Side: Status Label with optional Equipment Icon */}
                <EventStatusLabel
                    status={currentStatus}
                    onStatusChange={handleStatusClick}
                    onDelete={handleDelete}
                    isDeleting={isDeleting}
                    canShiftQueue={canShiftQueue}
                    icon={isPosting ? PostingIcon : isDeleting ? DeletingIcon : EquipmentIcon}
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
