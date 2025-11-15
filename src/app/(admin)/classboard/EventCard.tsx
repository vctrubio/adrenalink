"use client";

import { useState } from "react";
import { Menu } from "@headlessui/react";
import { ChevronDown, Trash2, Bell, MapPin, Loader2 } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getTimeFromISO } from "@/getters/queue-getter";
import { getEventStatusColor, type EventStatus } from "@/types/status";
import type { EventNode, TeacherQueue } from "@/backend/TeacherQueue";
import { deleteClassboardEvent } from "@/actions/classboard-action";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { ENTITY_DATA } from "@/config/entities";

export const ROW_MARGIN = "mx-4";
export const ROW_PADDING = "py-2";
export const HEADING_PADDING = "py-1.5";

interface EventCardProps {
    event: EventNode;
    queue?: TeacherQueue;
    hasNextEvent?: boolean;
    isProcessing?: boolean;
    onDeleteComplete?: () => void;
    onDeleteWithCascade?: (eventId: string, minutesToShift: number, subsequentEventIds: string[]) => Promise<void>;
}

interface HeaderRowProps {
    startTime: string;
    duration: number;
    statusColor: string;
    location: string;
    categoryEquipment: string;
    capacityEquipment: number;
    gapBefore: number;
    hasNextEvent: boolean;
    isDeleting: boolean;
    isProcessing?: boolean;
    onDelete: (cascade: boolean) => void;
    onNotify: () => void;
}

interface StudentRowProps {
    student: { id: string; firstName: string; lastName: string };
}

const HeaderRow = ({ startTime, duration, statusColor, location, categoryEquipment, capacityEquipment, gapBefore, hasNextEvent, isDeleting, isProcessing = false, onDelete, onNotify }: HeaderRowProps) => {
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === categoryEquipment);
    const EquipmentIcon = equipmentConfig?.icon;
    // Use secondary blue when processing, otherwise use status color
    const displayColor = isProcessing ? "rgb(59 130 246)" : statusColor;

    return (
        <div className="border-b-2 border-dashed border-gray-300 dark:border-gray-600 ">
            <div className={`flex items-center gap-2 relative mb-3 ${ROW_MARGIN} ${ROW_PADDING}`}>
                <div style={{ color: displayColor }}>
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
                    <div className="flex items-center gap-1 absolute top-full">
                        {EquipmentIcon && capacityEquipment > 0 && (
                            <div className="flex items-center justify-center gap-0.5 mr-1">
                                {Array.from({ length: capacityEquipment }).map((_, i) => (
                                    <EquipmentIcon key={i} className="w-3 h-3 mt-1" style={{ color: equipmentConfig?.color }} />
                                ))}
                            </div>
                        )}
                        <MapPin className="w-3 h-3 text-gray-500 dark:text-gray-400 mr-0.5" />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{location}</span>
                        {gapBefore > 0 && <span className="text-xs px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/20 rounded text-orange-700 dark:text-orange-400 whitespace-nowrap">+ {getPrettyDuration(gapBefore)}</span>}
                    </div>
                </div>

                <Menu as="div" className="relative ml-auto">
                    <Menu.Button className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground flex-shrink-0">
                        <ChevronDown className="w-5 h-5" />
                    </Menu.Button>

                    <Menu.Items className="absolute right-0 top-full mt-1 w-48 origin-top-right bg-background dark:bg-card border border-border rounded-lg shadow-lg focus:outline-none z-[9999]">
                        <div className="p-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button onClick={onNotify} className={`${active ? "bg-muted/50" : ""} group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm`}>
                                        <Bell className="w-4 h-4" />
                                        Notify
                                    </button>
                                )}
                            </Menu.Item>

                            {hasNextEvent ? (
                                <>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => onDelete(true)}
                                                disabled={isDeleting}
                                                className={`${active ? "bg-blue-50 dark:bg-blue-950/30" : ""} group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-blue-800 dark:text-blue-200 disabled:opacity-50`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {isDeleting ? "Deleting..." : "Delete & Shift Queue"}
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => onDelete(false)}
                                                disabled={isDeleting}
                                                className={`${active ? "bg-red-50 dark:bg-red-950/30" : ""} group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-800 dark:text-red-200 disabled:opacity-50`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {isDeleting ? "Deleting..." : "Delete (Keep Gap)"}
                                            </button>
                                        )}
                                    </Menu.Item>
                                </>
                            ) : (
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={() => onDelete(false)}
                                            disabled={isDeleting}
                                            className={`${active ? "bg-red-50 dark:bg-red-950/30" : ""} group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-800 dark:text-red-200 disabled:opacity-50`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            {isDeleting ? "Deleting..." : "Delete Event"}
                                        </button>
                                    )}
                                </Menu.Item>
                            )}
                        </div>
                    </Menu.Items>
                </Menu>
            </div>
        </div>
    );
};

const StudentRow = ({ student }: StudentRowProps) => {
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    if (!studentEntity) return null;

    const StudentIcon = studentEntity.icon;

    return (
        <div className={`flex items-center gap-3 ${ROW_MARGIN} ${ROW_PADDING}`}>
            <div style={{ color: studentEntity.color }}>
                <StudentIcon className="w-8 h-8" />
            </div>
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

export default function EventCard({ event, queue, hasNextEvent = false, isProcessing = false, onDeleteComplete, onDeleteWithCascade }: EventCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const startTime = getTimeFromISO(event.eventData.date);
    const duration = event.eventData.duration;
    const students = event.studentData || [];
    const status = event.eventData.status as EventStatus;
    const location = event.eventData.location;
    const categoryEquipment = event.packageData?.categoryEquipment || "";
    const capacityEquipment = event.packageData?.capacityEquipment || 0;
    const eventId = event.eventData.id || event.id;
    const statusColor = getEventStatusColor(status);

    // Calculate gap before this event (from previous event)
    const calculateGapBefore = () => {
        if (!queue) return 0;

        const allEvents = queue.getAllEvents();
        const currentIndex = allEvents.findIndex((e: any) => e.eventData.id === eventId);

        if (currentIndex <= 0) return 0;

        const previousEvent = allEvents[currentIndex - 1];
        const previousEndTime = new Date(previousEvent.eventData.date);
        previousEndTime.setMinutes(previousEndTime.getMinutes() + previousEvent.eventData.duration);

        const currentStartTime = new Date(event.eventData.date);
        const gapMinutes = Math.floor((currentStartTime.getTime() - previousEndTime.getTime()) / (1000 * 60));

        return Math.max(0, gapMinutes);
    };

    const gapBefore = calculateGapBefore();

    const handleDelete = async (cascade: boolean) => {
        if (!eventId || isDeleting) return;

        setIsDeleting(true);
        try {
            if (cascade && onDeleteWithCascade && queue) {
                // Store duration to shift as const for clarity
                const DURATION_TO_SHIFT = duration;

                console.log(`🔄 [EventCard] Cascade delete: shifting subsequent events backward by ${DURATION_TO_SHIFT} minutes to fill gap`);

                // Find all subsequent event IDs from the queue
                const allEvents = queue.getAllEvents();
                const currentEventIndex = allEvents.findIndex((e: any) => e.eventData.id === eventId);

                if (currentEventIndex !== -1) {
                    // Get all events after the current one
                    const subsequentEventIds = allEvents
                        .slice(currentEventIndex + 1)
                        .map((e: any) => e.eventData.id)
                        .filter((id: string) => id); // Only include events that exist in DB

                    console.log(`📋 Found ${subsequentEventIds.length} subsequent events to shift`);

                    // Call the cascade delete handler
                    await onDeleteWithCascade(eventId, DURATION_TO_SHIFT, subsequentEventIds);
                    onDeleteComplete?.();
                    return;
                }
            }

            // Standard delete (without cascade)
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
                gapBefore={gapBefore}
                hasNextEvent={hasNextEvent}
                isDeleting={isDeleting}
                onDelete={handleDelete}
                onNotify={handleNotify}
            />

            {students.length > 0 ? students.map((student, index) => <StudentRow key={student.id || index} student={student} />) : <div className={`${ROW_MARGIN} ${ROW_PADDING} text-sm text-muted-foreground`}>No students</div>}

            {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 dark:bg-card/50 rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            )}
        </div>
    );
}
