"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2, Trash2 } from "lucide-react";
import { getTimeFromISO } from "@/getters/queue-getter";
import { TimeDurationBadge } from "@/src/components/ui/badge/timeduration";
import { type EventStatus, EVENT_STATUS_CONFIG } from "@/types/status";
import type { EventNode, TeacherQueue } from "@/backend/TeacherQueue";
import type { QueueController } from "@/backend/QueueController";
import { deleteClassboardEvent, updateEventStatus } from "@/actions/classboard-action";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { ENTITY_DATA } from "@/config/entities";
import { Dropdown, DropdownItem, type DropdownItemProps } from "@/src/components/ui/dropdown";
import EventGapDetection from "./EventGapDetection";

const EVENT_STATUSES: EventStatus[] = ["planned", "tbc", "completed", "uncompleted"];

export const ROW_MARGIN = "mx-4";
export const ROW_PADDING = "py-2";
export const HEADING_PADDING = "py-1.5";

interface EventCardProps {
    event: EventNode;
    queue?: TeacherQueue;
    queueController?: QueueController;
    onDeleteComplete?: () => void;
    onDeleteWithCascade?: (eventId: string, minutesToShift: number, subsequentEventIds: string[]) => Promise<void>;
    showLocation?: boolean;
}

const HeaderRow = ({
    startTime,
    duration,
    status,
    eventId,
    categoryEquipment,
    capacityEquipment,
    isDeleting,
    hasNextEvent,
    canShiftQueue,
    onStatusChange,
    onDelete,
}: {
    startTime: string;
    duration: number;
    status: EventStatus;
    eventId: string;
    categoryEquipment: string;
    capacityEquipment: number;
    isDeleting: boolean;
    hasNextEvent: boolean;
    canShiftQueue: boolean;
    onStatusChange: (status: EventStatus) => void;
    onDelete: (cascade: boolean) => void;
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === categoryEquipment);
    const EquipmentIcon = equipmentConfig?.icon;

    const handleStatusClick = async (newStatus: EventStatus) => {
        if (newStatus === status || isUpdating) return;

        setIsUpdating(true);
        try {
            await updateEventStatus(eventId, newStatus);
            onStatusChange(newStatus);
            setIsDropdownOpen(false);
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const dropdownItems: DropdownItemProps[] = [
        ...EVENT_STATUSES.map((statusOption) => ({
            id: statusOption,
            label: statusOption,
            icon: () => <div className="w-3 h-3 rounded-full" style={{ backgroundColor: EVENT_STATUS_CONFIG[statusOption].color }} />,
            color: EVENT_STATUS_CONFIG[statusOption].color,
            onClick: () => handleStatusClick(statusOption),
        })),
        ...(canShiftQueue
            ? [
                {
                    id: "delete-cascade",
                    label: isDeleting ? "Deleting..." : "Delete & Shift Queue",
                    icon: Trash2,
                    color: "#ef4444",
                    onClick: () => onDelete(true),
                },
            ]
            : []),
        {
            id: "delete",
            label: isDeleting ? "Deleting..." : "Delete",
            icon: Trash2,
            color: "#ef4444",
            onClick: () => onDelete(false),
        },
    ];

    return (
        <div className={`flex items-center gap-3 ${ROW_MARGIN} ${ROW_PADDING} pointer-events-auto`}>
            {EquipmentIcon && (
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="relative p-1 rounded hover:bg-muted/50 flex-shrink-0" style={{ color: EVENT_STATUS_CONFIG[status].color }}>
                    <EquipmentIcon className="w-8 h-8" />
                    <Dropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} items={dropdownItems} align="right" initialFocusedId={status} />
                </button>
            )}
            <TimeDurationBadge startTime={startTime} duration={duration} />
        </div>
    );
};

const StudentRow = ({ student }: { student: { id: string; firstName: string; lastName: string } }) => {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    if (!studentEntity) return null;

    return (
        <div className={`flex items-center gap-3 ${ROW_MARGIN} ${ROW_PADDING}`}>
            <div style={{ color: studentEntity.color }}>{studentEntity.icon && <studentEntity.icon className="w-8 h-8" />}</div>
            <div className="flex-1">
                <HoverToEntity entity={studentEntity} id={student.id}>
                    <span className="text-base font-medium whitespace-nowrap">
                        {student.firstName} {student.lastName}
                    </span>
                </HoverToEntity>
            </div>
        </div>
    );
};

const GapDetectionHeader = ({ children }: { children?: React.ReactNode }) => {
    if (!children) return null;

    return (
        <div className="flex items-center justify-center py-2 border-b border-border">
            {children}
        </div>
    );
};

const LocationFooter = ({ location, showLocation = true }: { location: string; showLocation?: boolean }) => {
    if (!showLocation || !location) return null;

    return (
        <div className="flex items-center justify-center gap-2 py-3 bg-muted">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{location}</span>
        </div>
    );
};

export default function EventCard({ event, queue, queueController, onDeleteComplete, onDeleteWithCascade, showLocation = true }: EventCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<EventStatus>(event.eventData.status as EventStatus);

    const eventId = event.id;
    const startTime = getTimeFromISO(event.eventData.date);
    const duration = event.eventData.duration;
    const students = event.studentData || [];
    const location = event.eventData.location;
    const categoryEquipment = event.packageData?.categoryEquipment || "";
    const capacityEquipment = event.packageData?.capacityEquipment || 0;

    const cardProps = queueController?.getEventModCardProps(eventId);
    const hasNextEvent = cardProps?.isLast === false;

    let previousEvent: EventNode | undefined;
    let nextEvent: EventNode | undefined;

    if (queue && eventId) {
        const allEvents = queue.getAllEvents();
        const currentEventIndex = allEvents.findIndex((e) => e.id === eventId);
        if (currentEventIndex > 0) {
            previousEvent = allEvents[currentEventIndex - 1];
        }
        if (currentEventIndex !== -1 && currentEventIndex < allEvents.length - 1) {
            nextEvent = allEvents[currentEventIndex + 1];
        }
    }

    const canShiftQueue = queueController?.canShiftQueue(eventId) ?? false;

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

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`w-full bg-card border border-border rounded-lg overflow-visible relative shadow-sm ${HEADING_PADDING}`}
        >
            <GapDetectionHeader>
                {previousEvent && <EventGapDetection currentEvent={event} previousEvent={previousEvent} requiredGapMinutes={queueController?.getSettings().gapMinutes || 0} updateMode="updateNow" />}
            </GapDetectionHeader>

            <HeaderRow
                startTime={startTime}
                duration={duration}
                status={currentStatus}
                eventId={eventId}
                categoryEquipment={categoryEquipment}
                capacityEquipment={capacityEquipment}
                isDeleting={isDeleting}
                hasNextEvent={hasNextEvent}
                canShiftQueue={canShiftQueue}
                onStatusChange={setCurrentStatus}
                onDelete={handleDelete}
            />

            {students.length > 0 ? students.map((student, index) => <StudentRow key={student.id || index} student={student} />) : <div className={`${ROW_MARGIN} ${ROW_PADDING} text-sm text-muted-foreground`}>No students</div>}

            <LocationFooter location={location} showLocation={showLocation} />

            {isDeleting && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            )}
        </motion.div>
    );
}
