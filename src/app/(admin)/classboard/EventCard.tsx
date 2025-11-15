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

export const ROW_MARGIN = "mx-4";
export const ROW_PADDING = "py-2";
export const HEADING_PADDING = "py-1.5";

interface EventCardProps {
    event: EventNode;
    queue?: TeacherQueue;
    queueController?: QueueController;
    hasNextEvent?: boolean;
    isProcessing?: boolean;
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

const GapWarning = ({
    gapDuration,
    eventId,
    requiredGapMinutes,
    queueController,
    isProcessing,
    onGapAdjustingChange,
}: {
    gapDuration: number;
    eventId: string;
    requiredGapMinutes?: number;
    queueController?: QueueController;
    isProcessing?: boolean;
    onGapAdjustingChange?: (adjusting: boolean) => void;
}) => {
    const [isAdjusting, setIsAdjusting] = useState(false);

    if (!gapDuration || gapDuration <= 0 || !queueController) return null;

    if (gapDuration === requiredGapMinutes) return null;

    const gapDeficit = (requiredGapMinutes || 0) - gapDuration;
    const needsMore = gapDeficit > 0;
    const isLoading = isAdjusting || isProcessing;

    const handleRemoveGap = async () => {
        setIsAdjusting(true);
        onGapAdjustingChange?.(true);
        try {
            queueController.removeGap(eventId);
            // Wait for Supabase listener to sync the changes
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
            console.error("Error removing gap:", error);
        } finally {
            setIsAdjusting(false);
            onGapAdjustingChange?.(false);
        }
    };

    const handleAddGap = async () => {
        setIsAdjusting(true);
        onGapAdjustingChange?.(true);
        try {
            queueController.addGap(eventId);
            // Wait for Supabase listener to sync the changes
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
            console.error("Error adding gap:", error);
        } finally {
            setIsAdjusting(false);
            onGapAdjustingChange?.(false);
        }
    };

    if (!needsMore) {
        const excess = gapDuration - (requiredGapMinutes || 0);
        return (
            <button
                onClick={handleRemoveGap}
                disabled={isLoading}
                className={`text-xs px-1.5 py-0.5 rounded border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    isLoading
                        ? "bg-orange-100 dark:bg-orange-900/20 text-orange-400 border-orange-200 dark:border-orange-800 opacity-50"
                        : "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-200 dark:hover:bg-orange-900/30"
                }`}
                title={`Click to remove ${getPrettyDuration(excess)}`}
            >
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>+{getPrettyDuration(excess)} gap</span>}
            </button>
        );
    }

    return (
        <button
            onClick={handleAddGap}
            disabled={isLoading}
            className={`text-xs px-1.5 py-0.5 rounded border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                isLoading
                    ? "bg-blue-100 dark:bg-blue-900/20 text-blue-400 border-blue-200 dark:border-blue-800 opacity-50"
                    : "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/30"
            }`}
            title={`Click to add gap (requires +${getPrettyDuration(gapDeficit)})`}
        >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : `−${getPrettyDuration(gapDeficit)} overdue`}
        </button>
    );
};

const HeaderRow = ({
    startTime,
    duration,
    statusColor,
    location,
    categoryEquipment,
    capacityEquipment,
    gap,
    eventId,
    queueController,
    hasNextEvent,
    isDeleting,
    isProcessing,
    onDelete,
    onNotify,
    onGapAdjustingChange,
}: {
    startTime: string;
    duration: number;
    statusColor: string;
    location: string;
    categoryEquipment: string;
    capacityEquipment: number;
    gap: { hasGap: boolean; gapDuration: number; meetsRequirement: boolean };
    eventId: string;
    queueController?: QueueController;
    hasNextEvent: boolean;
    isDeleting: boolean;
    isProcessing?: boolean;
    onDelete: (cascade: boolean) => void;
    onNotify: () => void;
    onGapAdjustingChange?: (adjusting: boolean) => void;
}) => {
    return (
        <div className="border-b-2 border-dashed border-gray-300 dark:border-gray-600 ">
            <div className={`flex items-center gap-2 relative mb-3 ${ROW_MARGIN} ${ROW_PADDING}`}>
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
                    <div className="flex items-center gap-1 absolute top-full">
                        <EquipmentDisplay categoryEquipment={categoryEquipment} capacityEquipment={capacityEquipment} />
                        <MapPin className="w-3 h-3 text-gray-500 dark:text-gray-400 mr-0.5" />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{location}</span>
                        {gap.hasGap && (
                            <GapWarning gapDuration={gap.gapDuration} eventId={eventId} requiredGapMinutes={queueController?.getSettings().gapMinutes} queueController={queueController} isProcessing={isProcessing} onGapAdjustingChange={onGapAdjustingChange} />
                        )}
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
                                    <button onClick={onNotify} className={`${active ? "bg-muted/50" : ""} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm`}>
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
                                                className={`${active ? "bg-blue-50 dark:bg-blue-950/30" : ""} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-blue-800 dark:text-blue-200 disabled:opacity-50`}
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
                                                className={`${active ? "bg-red-50 dark:bg-red-950/30" : ""} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-800 dark:text-red-200 disabled:opacity-50`}
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
                                            className={`${active ? "bg-red-50 dark:bg-red-950/30" : ""} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-800 dark:text-red-200 disabled:opacity-50`}
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

export default function EventCard({ event, queue, queueController, hasNextEvent = false, isProcessing = false, onDeleteComplete, onDeleteWithCascade }: EventCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isGapAdjusting, setIsGapAdjusting] = useState(false);

    const eventId = event.eventData.id || event.id;
    const startTime = getTimeFromISO(event.eventData.date);
    const duration = event.eventData.duration;
    const students = event.studentData || [];
    const status = event.eventData.status as EventStatus;
    const location = event.eventData.location;
    const categoryEquipment = event.packageData?.categoryEquipment || "";
    const capacityEquipment = event.packageData?.capacityEquipment || 0;
    const statusColor = getEventStatusColor(status);

    const gap = queueController?.getEventModCardProps(eventId)?.gap || { hasGap: false, gapDuration: 0, meetsRequirement: true };
    const isLoading = isDeleting || isGapAdjusting;

    const handleDelete = async (cascade: boolean) => {
        if (!eventId || isDeleting) return;

        setIsDeleting(true);
        try {
            if (cascade && onDeleteWithCascade && queue) {
                const allEvents = queue.getAllEvents();
                const currentEventIndex = allEvents.findIndex((e: any) => e.eventData.id === eventId);

                if (currentEventIndex !== -1) {
                    const subsequentEventIds = allEvents
                        .slice(currentEventIndex + 1)
                        .map((e: any) => e.eventData.id)
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
                gap={gap}
                eventId={eventId}
                queueController={queueController}
                hasNextEvent={hasNextEvent}
                isDeleting={isDeleting}
                isProcessing={isProcessing}
                onDelete={handleDelete}
                onNotify={handleNotify}
                onGapAdjustingChange={setIsGapAdjusting}
            />

            {students.length > 0 ? students.map((student, index) => <StudentRow key={student.id || index} student={student} />) : <div className={`${ROW_MARGIN} ${ROW_PADDING} text-sm text-muted-foreground`}>No students</div>}

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 dark:bg-card/50 rounded-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            )}
        </div>
    );
}
