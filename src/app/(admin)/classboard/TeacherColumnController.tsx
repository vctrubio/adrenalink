"use client";

import { useState } from "react";
import { Menu } from "@headlessui/react";
import { Settings, Bell, Printer, Trash2 } from "lucide-react";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { TeacherStats } from "@/backend/ClassboardStats";
import type { TeacherQueue } from "@/backend/TeacherQueue";
import { bulkDeleteClassboardEvents } from "@/actions/classboard-bulk-action";

interface TeacherColumnControllerProps {
    username: string;
    stats: TeacherStats;
    columnViewMode: "view" | "queue";
    queue?: TeacherQueue;
    eventIds?: string[];
    earliestTime: string | null;
    onEditSchedule: () => void;
    onSubmit: () => void;
    onReset: () => void;
    onCancel: () => void;
    onDeleteComplete?: () => void;
}

export default function TeacherColumnController({
    username,
    stats,
    columnViewMode,
    queue,
    eventIds,
    earliestTime,
    onEditSchedule,
    onSubmit,
    onReset,
    onCancel,
    onDeleteComplete,
}: TeacherColumnControllerProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleNotify = () => {
        if (queue) {
            queue.printTeacherSchedule();
        }
    };

    const handlePrint = () => {
        if (queue) {
            queue.printTeacherSchedule();
        }
    };

    const handleDeleteAll = async () => {
        if (!eventIds || eventIds.length === 0) return;

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
            {/* Header: Teacher Name + Settings Icon */}
            <div className="flex items-center gap-4">
                <HeadsetIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="text-xl font-bold text-foreground truncate">{username}</div>
                <Menu as="div" className="relative ml-auto">
                    <Menu.Button className="p-1.5 rounded hover:bg-muted/50 transition-colors flex-shrink-0">
                        <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                    </Menu.Button>

                    <Menu.Items className="absolute right-0 top-full mt-1 w-48 origin-top-right bg-background dark:bg-card border border-border rounded-lg shadow-lg focus:outline-none z-[9999]">
                        <div className="p-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={handleNotify}
                                        className={`${active ? "bg-muted/50" : ""} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm`}
                                    >
                                        <Bell className="w-4 h-4" />
                                        Notify
                                    </button>
                                )}
                            </Menu.Item>

                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={handlePrint}
                                        className={`${active ? "bg-muted/50" : ""} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm`}
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </button>
                                )}
                            </Menu.Item>

                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={handleDeleteAll}
                                        disabled={isDeleting || !eventIds || eventIds.length === 0}
                                        className={`${active ? "bg-red-50 dark:bg-red-950/30" : ""} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-800 dark:text-red-200 disabled:opacity-50`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {isDeleting ? "Deleting..." : "Delete All"}
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Menu>
            </div>

            {/* Time Flag Display */}
            {earliestTime && (
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Earliest:</span>
                    <span className="font-mono font-semibold text-foreground">{earliestTime}</span>
                </div>
            )}

            {/* Statistics Panel */}
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col">
                    <span className="text-muted-foreground">Events</span>
                    <span className="font-semibold text-foreground">{stats.eventCount}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold text-foreground">{getPrettyDuration(stats.totalDuration)}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-muted-foreground">Teacher €</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">€{stats.earnings.teacher.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-muted-foreground">School €</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">€{stats.earnings.school.toFixed(2)}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                {columnViewMode === "view" ? (
                    <button
                        onClick={onEditSchedule}
                        disabled={stats.eventCount === 0}
                        className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                            stats.eventCount === 0
                                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                        title={stats.eventCount === 0 ? "No events to edit" : "Edit schedule"}
                    >
                        Edit Schedule
                    </button>
                ) : (
                    <>
                        <button
                            onClick={onSubmit}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                            Submit
                        </button>
                        <button
                            onClick={onReset}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Reset
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
