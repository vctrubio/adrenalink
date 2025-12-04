"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import { getPrettyDuration } from "@/getters/duration-getter";
import { ACTION_BUTTON_CONFIG } from "@/types/status";
import type { TeacherQueue } from "@/backend/TeacherQueue";
import { bulkDeleteClassboardEvents, bulkUpdateEventStatus } from "@/actions/classboard-bulk-action";
import { EVENT_STATUS_CONFIG, type EventStatus, STATUS_PURPLE, STATUS_GREEN, STATUS_GREY } from "@/types/status";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { ENTITY_DATA } from "@/config/entities";
import { DropdownLabel, type DropdownItemProps } from "@/src/components/ui/dropdown";

interface TeacherColumnControllerProps {
    columnViewMode: "view" | "queue";
    queue: TeacherQueue;
    onEditSchedule: () => void;
    onSubmit: () => void;
    onReset: () => void;
    onCancel: () => void;
    onDeleteComplete?: () => void;
}

function TeacherColumnHeader({ queue, allEvents, onDeleteComplete }: { queue: TeacherQueue; allEvents: any[]; onDeleteComplete?: () => void }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const completedCount = allEvents.filter((e) => e.eventData.status === "completed").length;
    const totalEvents = allEvents.length;
    const hasTbcEvent = allEvents.some((e) => e.eventData.status === "tbc");
    const isGreen = completedCount === totalEvents && !hasTbcEvent;
    const isPurple = hasTbcEvent;
    const hasEvents = totalEvents > 0;
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");

    const handleBulkStatusUpdate = async (status: EventStatus) => {
        const eventIds = allEvents.map((e) => e.id).filter((id): id is string => id !== null);
        if (eventIds.length === 0) return;

        try {
            const result = await bulkUpdateEventStatus(eventIds, status);
            if (!result.success) {
                console.error("Update failed:", result.error);
                return;
            }
            onDeleteComplete?.();
        } catch (error) {
            console.error("Error updating events:", error);
        }
    };

    const handleDeleteAll = async () => {
        const eventIds = allEvents.map((e) => e.id);
        if (eventIds.length === 0) return;

        setIsDeleting(true);
        try {
            const result = await bulkDeleteClassboardEvents(eventIds);
            if (!result.success) {
                console.error("Delete failed:", result.error);
                setIsDeleting(false);
                return;
            }
            onDeleteComplete?.();
        } catch (error) {
            console.error("Error deleting events:", error);
            setIsDeleting(false);
        }
    };

    const dropdownItems: DropdownItemProps[] = [
        ...(["planned", "tbc", "completed", "uncompleted"] as const).map((status) => ({
            id: status,
            label: `Set All to ${status}`,
            icon: () => <div className="w-3 h-3 rounded-full" style={{ backgroundColor: EVENT_STATUS_CONFIG[status].color }} />,
            color: EVENT_STATUS_CONFIG[status].color,
            onClick: () => handleBulkStatusUpdate(status),
        })),
        {
            id: "delete-all",
            label: isDeleting ? "Deleting..." : "Delete All",
            icon: Trash2,
            color: "#ef4444",
            onClick: handleDeleteAll,
        },
    ];

    const statusColor = isPurple ? STATUS_PURPLE : isGreen ? STATUS_GREEN : STATUS_GREY;

    return (
        <div className="flex items-center gap-4">
            <HeadsetIcon className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
            {teacherEntity && (
                <HoverToEntity entity={teacherEntity} id={queue.teacher.id}>
                    <div className="text-xl font-bold text-foreground truncate">{queue.teacher.username}</div>
                </HoverToEntity>
            )}
            {!teacherEntity && <div className="text-xl font-bold text-foreground truncate">{queue.teacher.username}</div>}
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">{hasEvents && <DropdownLabel value={`${completedCount}/${totalEvents}`} items={dropdownItems} color={statusColor} />}</div>
        </div>
    );
}

function TeacherColumnStats({ queue }: { queue: TeacherQueue }) {
    const stats = queue.getStats();

    return (
        <div className="flex justify-between">
            <div className="flex flex-col">
                <span className="text-muted-foreground">Events</span>
                <span className="font-semibold text-foreground">{stats.eventCount}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-semibold text-foreground">{getPrettyDuration(stats.totalDuration)}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-muted-foreground">Teacher</span>
                <span className="font-semibold text-green-600 dark:text-green-400">€{stats.earnings.teacher.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-muted-foreground">School</span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">€{stats.earnings.school.toFixed(2)}</span>
            </div>
        </div>
    );
}

function TeacherColumnActions({ columnViewMode, queue, onEditSchedule, onSubmit, onReset, onCancel }: { columnViewMode: "view" | "queue"; queue: TeacherQueue; onEditSchedule: () => void; onSubmit: () => void; onReset: () => void; onCancel: () => void }) {
    const stats = queue.getStats();

    return (
        <div className="flex gap-2">
            {columnViewMode === "view" ? (
                <button
                    onClick={onEditSchedule}
                    className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium ${stats.eventCount === 0 ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50" : "bg-cyan-600 text-white hover:bg-cyan-700"}`}
                    title={stats.eventCount === 0 ? "No events to edit" : "Edit schedule"}
                >
                    Edit Schedule
                </button>
            ) : (
                <>
                    <button onClick={onCancel} className={`px-4 py-2 ${ACTION_BUTTON_CONFIG.cancel.className} rounded-md text-sm font-medium`}>
                        {ACTION_BUTTON_CONFIG.cancel.label}
                    </button>
                    <button onClick={onReset} className={`px-4 py-2 ${ACTION_BUTTON_CONFIG.reset.className} rounded-md text-sm font-medium`}>
                        {ACTION_BUTTON_CONFIG.reset.label}
                    </button>
                    <button onClick={onSubmit} className={`flex-1 px-4 py-2 ${ACTION_BUTTON_CONFIG.submit.className} rounded-md text-sm font-medium`}>
                        {ACTION_BUTTON_CONFIG.submit.label}
                    </button>
                </>
            )}
        </div>
    );
}

export default function TeacherColumnController({ columnViewMode, queue, onEditSchedule, onSubmit, onReset, onCancel, onDeleteComplete }: TeacherColumnControllerProps) {
    const allEvents = queue.getAllEvents();

    return (
        <div className="p-4 px-6.5 border-b border-border space-y-3">
            <TeacherColumnHeader queue={queue} allEvents={allEvents} onDeleteComplete={onDeleteComplete} />
            <TeacherColumnStats queue={queue} />
            <TeacherColumnActions columnViewMode={columnViewMode} queue={queue} onEditSchedule={onEditSchedule} onSubmit={onSubmit} onReset={onReset} onCancel={onCancel} />
        </div>
    );
}
