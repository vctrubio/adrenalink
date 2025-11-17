"use client";

import { useState } from "react";
import { Menu } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { TeacherQueue } from "@/backend/TeacherQueue";
import { bulkDeleteClassboardEvents, bulkUpdateEventStatus } from "@/actions/classboard-bulk-action";
import { EVENT_STATUS_CONFIG, type EventStatus } from "@/types/status";

interface TeacherColumnControllerProps {
    columnViewMode: "view" | "queue";
    queue: TeacherQueue;
    onEditSchedule: () => void;
    onSubmit: () => void;
    onReset: () => void;
    onCancel: () => void;
    onDeleteComplete?: () => void;
}

export default function TeacherColumnController({ columnViewMode, queue, onEditSchedule, onSubmit, onReset, onCancel, onDeleteComplete }: TeacherColumnControllerProps) {
    const stats = queue.getStats();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const allEvents = queue.getAllEvents();
    const completedCount = allEvents.filter((e) => e.eventData.status === "completed").length;
    const totalEvents = allEvents.length;
    const hasEvents = totalEvents > 0;

    const handleBulkStatusUpdate = async (status: EventStatus) => {
        const eventIds = allEvents.map((e) => e.id).filter((id): id is string => id !== null);
        if (eventIds.length === 0) return;

        setIsUpdating(true);
        try {
            const result = await bulkUpdateEventStatus(eventIds, status);

            if (!result.success) {
                console.error("Update failed:", result.error);
                setIsUpdating(false);
                return;
            }

            onDeleteComplete?.();
        } catch (error) {
            console.error("Error updating events:", error);
            setIsUpdating(false);
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

    return (
        <div className="p-4 border-b border-border space-y-3">
            {/* Header: Teacher Name + Ratio Button + Settings Icon */}
            <div className="flex items-center gap-4">
                <HeadsetIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="text-xl font-bold text-foreground truncate">{queue.teacher.username}</div>
                <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                    {hasEvents && (
                        <Menu as="div" className="relative">
                            <Menu.Button className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors ${completedCount === totalEvents && totalEvents > 0 ? "bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-800 dark:text-green-200" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                                <span className="font-medium">{completedCount}/{totalEvents}</span>
                                <ChevronDown className="w-3 h-3" />
                            </Menu.Button>

                            <Menu.Items className="absolute right-0 top-full mt-1 w-56 origin-top-right bg-background dark:bg-card border border-border rounded-lg shadow-lg focus:outline-none z-[9999]">
                                <div className="p-1">
                                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border">Update Status</div>
                                    {(["planned", "tbc", "completed", "uncompleted"] as const).map((status) => {
                                        const statusConfig = EVENT_STATUS_CONFIG[status];
                                        return (
                                            <Menu.Item key={status}>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => handleBulkStatusUpdate(status)}
                                                        disabled={isUpdating}
                                                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors capitalize text-foreground disabled:opacity-50 ${active ? "cursor-pointer" : ""}`}
                                                        style={{
                                                            backgroundColor: active ? `${statusConfig.color}30` : "transparent",
                                                        }}
                                                    >
                                                        Set All to {status}
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        );
                                    })}

                                    <div className="my-1 border-t border-border" />

                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={handleDeleteAll}
                                                disabled={isDeleting}
                                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-foreground disabled:opacity-50 ${active ? "bg-red-50 dark:bg-red-950/30 cursor-pointer" : ""}`}
                                            >
                                                {isDeleting ? "Deleting..." : "Delete All"}
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Menu>
                    )}
                </div>
            </div>

            {/* Statistics Panel */}
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

            {/* Action Buttons */}
            <div className="flex gap-2">
                {columnViewMode === "view" ? (
                    <button
                        onClick={onEditSchedule}
                        className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium ${stats.eventCount === 0 ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                        title={stats.eventCount === 0 ? "No events to edit" : "Edit schedule"}
                    >
                        Edit Schedule
                    </button>
                ) : (
                    <>
                        <button onClick={onSubmit} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
                            Submit
                        </button>
                        <button onClick={onReset} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                            Reset
                        </button>
                        <button onClick={onCancel} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
