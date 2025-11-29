"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "@headlessui/react";
import { ChevronDown, MapPin, Loader2 } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getTimeFromISO } from "@/getters/queue-getter";
import { getEventStatusColor, type EventStatus, EVENT_STATUS_CONFIG } from "@/types/status";
import type { EventNode, TeacherQueue } from "@/backend/TeacherQueue";
import type { QueueController } from "@/backend/QueueController";
import { deleteClassboardEvent, updateEventStatus } from "@/actions/classboard-action";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { ENTITY_DATA } from "@/config/entities";
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
}

const EquipmentDisplay = ({ categoryEquipment, capacityEquipment }: { categoryEquipment: string; capacityEquipment: number }) => {
    if (!categoryEquipment || capacityEquipment <= 0) return null;

    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === categoryEquipment);
    const EquipmentIcon = equipmentConfig?.icon;

    if (!EquipmentIcon) return null;

    return (
        <div className="flex items-center justify-center gap-0.5">
            {Array.from({ length: capacityEquipment }).map((_, i) => (
                <EquipmentIcon key={i} className="w-3 h-3 mt-0.5" style={{ color: equipmentConfig?.color }} />
            ))}
        </div>
    );
};

const SettingDropdown = ({ isDeleting, hasNextEvent, canShiftQueue, currentStatus, eventId, onDelete, onStatusChange }: { isDeleting: boolean; hasNextEvent: boolean; canShiftQueue: boolean; currentStatus: EventStatus; eventId: string; onDelete: (cascade: boolean) => void; onStatusChange: (status: EventStatus) => void }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusClick = async (status: EventStatus) => {
        if (status === currentStatus || isUpdating) return;

        setIsUpdating(true);
        try {
            await updateEventStatus(eventId, status);
            onStatusChange(status);
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Menu as="div" className="relative ml-auto">
            <Menu.Button className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground flex-shrink-0">
                <ChevronDown className="w-5 h-5" />
            </Menu.Button>

            <Menu.Items className="absolute right-0 top-full mt-1 w-48 origin-top-right bg-background dark:bg-card border border-border rounded-lg shadow-lg focus:outline-none z-[9999]">
                <div className="p-1">
                    {EVENT_STATUSES.map((status) => {
                        const statusConfig = EVENT_STATUS_CONFIG[status];
                        return (
                            <Menu.Item key={status}>
                                {({ active }) => (
                                    <button
                                        onClick={() => handleStatusClick(status)}
                                        disabled={isUpdating || status === currentStatus}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors capitalize text-foreground ${
                                            status === currentStatus
                                                ? "font-semibold disabled:opacity-100"
                                                : "disabled:cursor-not-allowed"
                                        }`}
                                        style={{
                                            backgroundColor: active ? `${statusConfig.color}30` : status === currentStatus ? `${statusConfig.color}20` : "transparent",
                                        }}
                                    >
                                        {status}
                                    </button>
                                )}
                            </Menu.Item>
                        );
                    })}

                    {canShiftQueue && (
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => onDelete(true)}
                                    disabled={isDeleting}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-foreground disabled:opacity-50 ${active ? "bg-red-50 dark:bg-red-950/30" : ""}`}
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            )}
                        </Menu.Item>
                    )}
                    {hasNextEvent && (
                        <Menu.Item>
                            {({ active }) => (
                                <button onClick={() => onDelete(false)} disabled={isDeleting} className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-foreground disabled:opacity-50 ${active ? "bg-red-50 dark:bg-red-950/30" : ""}`}>
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            )}
                        </Menu.Item>
                    )}
                    {!hasNextEvent && (
                        <Menu.Item>
                            {({ active }) => (
                                <button onClick={() => onDelete(false)} disabled={isDeleting} className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-foreground disabled:opacity-50 ${active ? "bg-red-50 dark:bg-red-950/30" : ""}`}>
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            )}
                        </Menu.Item>
                    )}
                </div>
            </Menu.Items>
        </Menu>
    );
};

const HeaderRow = ({
    startTime,
    duration,
    status,
    eventId,
    location,
    categoryEquipment,
    capacityEquipment,
    children,
    settingsDropdown,
    onStatusChange,
}: {
    startTime: string;
    duration: number;
    status: EventStatus;
    eventId: string;
    location: string;
    categoryEquipment: string;
    capacityEquipment: number;
    children?: React.ReactNode;
    settingsDropdown?: React.ReactNode;
    onStatusChange: (status: EventStatus) => void;
}) => {
    return (
        <div className="border-b border-border pointer-events-auto pb-1">
            <div className={`flex items-center gap-2 relative mb-3 ${ROW_MARGIN} ${ROW_PADDING} pointer-events-auto`}>
                <div style={{ color: getEventStatusColor(status) }}>
                    <FlagIcon className="w-8 h-8" size={34} />
                </div>
                <div className="flex flex-col relative mb-1">
                    <div className="flex items-center gap-2 border-b border-border">
                        <span className="font-bold text-2xl text-foreground">{startTime}</span>
                        <span className="text-sm px-2 py-1 bg-muted rounded text-foreground">
                            <span className="text-muted-foreground">+</span>
                            {getPrettyDuration(duration)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 absolute top-full left-0 pt-0.5">
                        <EquipmentDisplay categoryEquipment={categoryEquipment} capacityEquipment={capacityEquipment} />
                        <div className="flex items-center pt-0.5">
                            <MapPin className="w-3 h-3 text-muted-foreground mr-0.5" />
                            <span className="text-xs font-medium text-muted-foreground">{location}</span>
                        </div>
                        {children}
                    </div>
                </div>

                {settingsDropdown}
            </div>
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

export default function EventCard({ event, queue, queueController, onDeleteComplete, onDeleteWithCascade }: EventCardProps) {
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
            <HeaderRow
                startTime={startTime}
                duration={duration}
                status={currentStatus}
                eventId={eventId}
                location={location}
                categoryEquipment={categoryEquipment}
                capacityEquipment={capacityEquipment}
                onStatusChange={setCurrentStatus}
                settingsDropdown={<SettingDropdown isDeleting={isDeleting} hasNextEvent={hasNextEvent} canShiftQueue={canShiftQueue} currentStatus={currentStatus} eventId={eventId} onDelete={handleDelete} onStatusChange={setCurrentStatus} />}
            >
                {previousEvent && <EventGapDetection currentEvent={event} previousEvent={previousEvent} requiredGapMinutes={queueController?.getSettings().gapMinutes || 0} updateMode="updateNow" />}
            </HeaderRow>

            {students.length > 0 ? students.map((student, index) => <StudentRow key={student.id || index} student={student} />) : <div className={`${ROW_MARGIN} ${ROW_PADDING} text-sm text-muted-foreground`}>No students</div>}

            {isDeleting && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            )}
        </motion.div>
    );
}
