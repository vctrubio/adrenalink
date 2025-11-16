"use client";

import { useState } from "react";
import { Menu } from "@headlessui/react";
import { ChevronDown, Trash2, Bell, MapPin, Loader2 } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getTimeFromISO } from "@/getters/queue-getter";
import { getEventStatusColor, type EventStatus } from "@/types/status";
import type { EventNode, TeacherQueue } from "@/backend/TeacherQueue";
import type { QueueController } from "@/backend/QueueController";
import { deleteClassboardEvent } from "@/actions/classboard-action";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { ENTITY_DATA } from "@/config/entities";
import EventGapDetection from "./EventGapDetection";

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
        <div className="flex items-center justify-center gap-0.5 mr-1">
            {Array.from({ length: capacityEquipment }).map((_, i) => (
                <EquipmentIcon key={i} className="w-3 h-3 mt-1" style={{ color: equipmentConfig?.color }} />
            ))}
        </div>
    );
};

const SettingDropdown = ({ isDeleting, hasNextEvent, canShiftQueue, onDelete, onNotify }: { isDeleting: boolean; hasNextEvent: boolean; canShiftQueue: boolean; onDelete: (cascade: boolean) => void; onNotify: () => void }) => {
    return (
        <Menu as="div" className="relative ml-auto">
            <Menu.Button className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground flex-shrink-0">
                <ChevronDown className="w-5 h-5" />
            </Menu.Button>

            <Menu.Items className="absolute right-0 top-full mt-1 w-48 origin-top-right bg-background dark:bg-card border border-border rounded-lg shadow-lg focus:outline-none z-[9999]">
                <div className="p-1">
                    <Menu.Item>
                        {({ active }) => (
                            <button onClick={onNotify} className={`${active ? "bg-muted/50" : ""} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm`}>
                                <Bell className="w-4 h-4" />
                                Notify
                            </button>
                        )}
                    </Menu.Item>

                    {canShiftQueue && (
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => onDelete(true)}
                                    disabled={isDeleting}
                                    className={`${active ? "bg-blue-50 dark:bg-blue-950/30" : ""} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-blue-800 dark:text-blue-200 disabled:opacity-50`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {isDeleting ? "Deleting..." : "Delete & Shift Queue"}
                                </button>
                            )}
                        </Menu.Item>
                    )}
                    {hasNextEvent && (
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => onDelete(false)}
                                    disabled={isDeleting}
                                    className={`${active ? "bg-red-50 dark:bg-red-950/30" : ""} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-800 dark:text-red-200 disabled:opacity-50`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {isDeleting ? "Deleting..." : "Delete (Keep Gap)"}
                                </button>
                            )}
                        </Menu.Item>
                    )}
                    {!hasNextEvent && (
                        <Menu.Item>
                            {({ active }) => (
                                <button onClick={() => onDelete(false)} disabled={isDeleting} className={`${active ? "bg-red-50 dark:bg-red-950/30" : ""} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-800 dark:text-red-200 disabled:opacity-50`}>
                                    <Trash2 className="w-4 h-4" />
                                    {isDeleting ? "Deleting..." : "Delete Event"}
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
    statusColor,
    location,
    categoryEquipment,
    capacityEquipment,
    children,
    settingsDropdown,
}: {
    startTime: string;
    duration: number;
    statusColor: string;
    location: string;
    categoryEquipment: string;
    capacityEquipment: number;
    children?: React.ReactNode;
    settingsDropdown?: React.ReactNode;
}) => {
    return (
        <div className="border-b-2 border-dashed border-gray-300 dark:border-gray-600 pointer-events-auto">
            <div className={`flex items-center gap-2 relative mb-3 ${ROW_MARGIN} ${ROW_PADDING} pointer-events-auto`}>
                <div style={{ color: statusColor }}>
                    <FlagIcon className="w-8 h-8" size={34} />
                </div>
                <div className="flex flex-col relative mb-1">
                    <div className="flex items-center gap-2 border-b border-gray-300 dark:border-gray-600">
                        <span className="font-bold text-2xl">{startTime}</span>
                        <span className="text-sm px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-300">
                            <span className="text-gray-500 dark:text-gray-400">+</span>
                            {getPrettyDuration(duration)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 absolute top-full left-0">
                        <EquipmentDisplay categoryEquipment={categoryEquipment} capacityEquipment={capacityEquipment} />
                        <MapPin className="w-3 h-3 text-gray-500 dark:text-gray-400 mr-0.5" />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{location}</span>
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

    const eventId = event.id;
    const startTime = getTimeFromISO(event.eventData.date);
    const duration = event.eventData.duration;
    const students = event.studentData || [];
    const status = event.eventData.status as EventStatus;
    const location = event.eventData.location;
    const categoryEquipment = event.packageData?.categoryEquipment || "";
    const capacityEquipment = event.packageData?.capacityEquipment || 0;
    const statusColor = getEventStatusColor(status);

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

    const handleNotify = () => {
        const studentNames = students.map((s) => `${s.firstName} ${s.lastName}`).join(", ");
        const message = `Event Details:\nTime: ${startTime}\nDuration: ${getPrettyDuration(duration)}\nLocation: ${location}\nStudents: ${studentNames}\nStatus: ${status}`;
        console.log("📢 Notify Event:\n", message);
        alert(message);
    };

    return (
        <div className={`w-full bg-background dark:bg-card border border-border rounded-lg overflow-visible relative ${HEADING_PADDING}`}>
            <HeaderRow
                startTime={startTime}
                duration={duration}
                statusColor={statusColor}
                location={location}
                categoryEquipment={categoryEquipment}
                capacityEquipment={capacityEquipment}
                settingsDropdown={<SettingDropdown isDeleting={isDeleting} hasNextEvent={hasNextEvent} canShiftQueue={canShiftQueue} onDelete={handleDelete} onNotify={handleNotify} />}
            >
                {previousEvent && <EventGapDetection currentEvent={event} previousEvent={previousEvent} requiredGapMinutes={queueController?.getSettings().gapMinutes || 0} updateMode="updateNow" />}
            </HeaderRow>

            {students.length > 0 ? students.map((student, index) => <StudentRow key={student.id || index} student={student} />) : <div className={`${ROW_MARGIN} ${ROW_PADDING} text-sm text-muted-foreground`}>No students</div>}

            {isDeleting && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 dark:bg-card/50 rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            )}
        </div>
    );
}
