"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "@headlessui/react";
import { ChevronDown, Trash2, Bell } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getTimeFromISO } from "@/getters/timezone-getter";
import { getEventStatusColor, type EventStatus } from "@/types/status";
import type { EventNode } from "@/backend/TeacherQueue";
import { deleteClassboardEvent } from "@/actions/classboard-action";

interface EventCardProps {
    event: EventNode;
    hasNextEvent?: boolean;
    onDeleteComplete?: () => void;
}

export default function EventCard({ event, hasNextEvent = false, onDeleteComplete }: EventCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const startTime = getTimeFromISO(event.eventData.date);
    const duration = event.eventData.duration;
    const students = event.studentData || [];
    const status = event.eventData.status as EventStatus;
    const location = event.eventData.location;
    const eventId = event.eventData.id || event.id;

    const statusColor = getEventStatusColor(status);

    const handleDelete = async (cascade: boolean) => {
        if (!eventId || isDeleting) return;

        setIsDeleting(true);
        try {
            const result = await deleteClassboardEvent(eventId, cascade);

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
        // Create event as text readable
        const studentNames = students.map((s) => `${s.firstName} ${s.lastName}`).join(", ");
        const message = `Event Details:\nTime: ${startTime}\nDuration: ${getPrettyDuration(duration)}\nLocation: ${location}\nStudents: ${studentNames}\nStatus: ${status}`;

        console.log("📢 Notify Event:\n", message);

        // For now, just log the text. Later this can be integrated with actual notification system
        alert(message);
    };

    return (
        <div
            style={{ width: "269px" }}
            className="bg-background dark:bg-card border border-border rounded-lg overflow-hidden relative"
        >
            <div className="overflow-hidden">
                {/* First Row: Flag + Time + Duration + Dropdown Menu */}
                <div className="flex items-center gap-2 p-4 border-b-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div style={{ color: statusColor }}>
                        <FlagIcon className="w-10 h-10" size={40} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-2xl">{startTime}</span>
                    </div>
                    <span className="text-sm px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                        +{getPrettyDuration(duration)}
                    </span>

                    {/* Headless UI Menu */}
                    <Menu as="div" className="relative ml-auto">
                        <Menu.Button className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground">
                            <ChevronDown className="w-5 h-5" />
                        </Menu.Button>

                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-background dark:bg-card border border-border rounded-lg shadow-lg focus:outline-none z-50">
                            <div className="p-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={handleNotify}
                                            className={`${
                                                active ? "bg-muted/50" : ""
                                            } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm`}
                                        >
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
                                                    onClick={() => handleDelete(true)}
                                                    disabled={isDeleting}
                                                    className={`${
                                                        active ? "bg-blue-50 dark:bg-blue-950/30" : ""
                                                    } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-blue-800 dark:text-blue-200 disabled:opacity-50`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    {isDeleting ? "Deleting..." : "Delete & Move Next"}
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => handleDelete(false)}
                                                    disabled={isDeleting}
                                                    className={`${
                                                        active ? "bg-red-50 dark:bg-red-950/30" : ""
                                                    } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-800 dark:text-red-200 disabled:opacity-50`}
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
                                                onClick={() => handleDelete(false)}
                                                disabled={isDeleting}
                                                className={`${
                                                    active ? "bg-red-50 dark:bg-red-950/30" : ""
                                                } group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-800 dark:text-red-200 disabled:opacity-50`}
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

                {/* Students Rows */}
                {students.length > 0 ? (
                    students.map((student, index) => (
                        <div key={student.id || index} className="flex items-center gap-3 px-6 py-2">
                            <HelmetIcon className="w-8 h-8 text-yellow-500" />
                            <div className="overflow-x-auto flex-1">
                                <Link
                                    href={`/students/${student.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-base font-medium text-foreground whitespace-nowrap hover:underline"
                                >
                                    {student.firstName} {student.lastName}
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="px-6 py-2 text-sm text-muted-foreground">No students</div>
                )}
            </div>
        </div>
    );
}
