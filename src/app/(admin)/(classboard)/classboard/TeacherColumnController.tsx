"use client";

import { useState } from "react";
import { Trash2, Settings, TrendingUp } from "lucide-react";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import FlagIcon from "@/public/appSvgs/FlagIcon.jsx";
import DurationIcon from "@/public/appSvgs/DurationIcon.jsx";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon.jsx";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
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

function TeacherColumnHeader({ queue, allEvents, columnViewMode, onDeleteComplete, onEditSchedule, onSubmit, onReset, onCancel }: { queue: TeacherQueue; allEvents: any[]; columnViewMode: "view" | "queue"; onDeleteComplete?: () => void; onEditSchedule: () => void; onSubmit: () => void; onReset: () => void; onCancel: () => void }) {
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
    const stats = queue.getStats();

    if (columnViewMode === "queue") {
        return (
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-2 flex-1">
                        <button onClick={onCancel} className={`px-4 py-2 ${ACTION_BUTTON_CONFIG.cancel.className} rounded-md text-sm font-medium`}>
                            {ACTION_BUTTON_CONFIG.cancel.label}
                        </button>
                        <button onClick={onReset} className={`px-4 py-2 ${ACTION_BUTTON_CONFIG.reset.className} rounded-md text-sm font-medium`}>
                            {ACTION_BUTTON_CONFIG.reset.label}
                        </button>
                        <button onClick={onSubmit} className={`flex-1 px-4 py-2 ${ACTION_BUTTON_CONFIG.submit.className} rounded-md text-sm font-medium`}>
                            {ACTION_BUTTON_CONFIG.submit.label}
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <HeadsetIcon className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                    {teacherEntity && (
                        <HoverToEntity entity={teacherEntity} id={queue.teacher.username}>
                            <div className="text-xl font-bold text-foreground truncate">{queue.teacher.username}</div>
                        </HoverToEntity>
                    )}
                    {!teacherEntity && <div className="text-xl font-bold text-foreground truncate">{queue.teacher.username}</div>}
                    <div className="ml-auto">{hasEvents && <DropdownLabel value={`${completedCount}/${totalEvents}`} items={dropdownItems} color={statusColor} />}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center justify-between gap-4 flex-1">
                    <div className="flex items-center gap-2">
                        <FlagIcon size={16} className="text-muted-foreground" />
                        <span className="font-semibold text-foreground">{getCompactNumber(stats.eventCount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DurationIcon size={16} className="text-muted-foreground" />
                        <span className="font-semibold text-foreground">{getHMDuration(stats.totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <HandshakeIcon size={16} className="text-muted-foreground" />
                        <span className="font-semibold text-green-600 dark:text-green-400">{getCompactNumber(stats.earnings.teacher)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-muted-foreground" />
                        <span className="font-semibold text-orange-500">{getCompactNumber(stats.earnings.school)}</span>
                    </div>
                </div>
                <button
                    onClick={onEditSchedule}
                    disabled={stats.eventCount === 0}
                    className="p-2 rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    title={stats.eventCount === 0 ? "No events to edit" : "Edit schedule"}
                >
                    <Settings className="w-5 h-5 text-foreground" />
                </button>
            </div>
            <div className="flex items-center gap-4">
                <HeadsetIcon className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                {teacherEntity && (
                    <HoverToEntity entity={teacherEntity} id={queue.teacher.username}>
                        <div className="text-xl font-bold text-foreground truncate">{queue.teacher.username}</div>
                    </HoverToEntity>
                )}
                {!teacherEntity && <div className="text-xl font-bold text-foreground truncate">{queue.teacher.username}</div>}
                <div className="ml-auto">{hasEvents && <DropdownLabel value={`${completedCount}/${totalEvents}`} items={dropdownItems} color={statusColor} />}</div>
            </div>
        </div>
    );
}

export default function TeacherColumnController({ columnViewMode, queue, onEditSchedule, onSubmit, onReset, onCancel, onDeleteComplete }: TeacherColumnControllerProps) {
    const allEvents = queue.getAllEvents();

    return (
        <div className="p-4 px-6.5 border-b border-border space-y-3">
            <TeacherColumnHeader queue={queue} allEvents={allEvents} columnViewMode={columnViewMode} onDeleteComplete={onDeleteComplete} onEditSchedule={onEditSchedule} onSubmit={onSubmit} onReset={onReset} onCancel={onCancel} />
        </div>
    );
}
