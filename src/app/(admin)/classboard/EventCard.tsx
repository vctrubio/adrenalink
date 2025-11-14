"use client";

import { useState } from "react";
import { Clock, MapPin, Trash2, ArrowRight, X } from "lucide-react";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getTimeFromISO } from "@/getters/timezone-getter";
import type { EventNode } from "@/backend/TeacherQueue";
import { deleteClassboardEvent } from "@/actions/classboard-action";

const STATUS_COLORS = {
    planned: "bg-blue-500",
    tbc: "bg-purple-500",
    completed: "bg-green-500",
    uncompleted: "bg-orange-500",
} as const;

interface EventCardProps {
    event: EventNode;
    hasNextEvent?: boolean;
    onDeleteComplete?: () => void;
}

// Sub-components
const StudentsDisplay = ({ students }: { students: string[] }) => {
    const handleStudentClick = (studentName: string) => {
        const message = `Hi ${studentName}! This is regarding your kite lesson.`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
    };

    return (
        <div className="flex items-center gap-2 text-sm">
            {students.length > 0 ? (
                <>
                    {students.map((_, index) => (
                        <HelmetIcon key={index} className="w-3 h-3 text-yellow-500" />
                    ))}
                    <div className="flex gap-0.5 flex-wrap">
                        {students.map((studentName, index) => (
                            <button
                                key={index}
                                onClick={() => handleStudentClick(studentName.trim())}
                                className="text-foreground font-medium hover:underline hover:text-blue-600 text-xs"
                                title={`Contact ${studentName.trim()} via WhatsApp`}
                            >
                                {studentName.trim()}
                                {index < students.length - 1 && ","}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <span className="text-muted-foreground text-xs">No students</span>
            )}
        </div>
    );
};

const TimeDisplay = ({ event }: { event: EventNode }) => {
    const startTime = getTimeFromISO(event.eventData.date);

    return (
        <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{startTime}</span>
            <span className="px-2 py-0.5 text-xs font-semibold bg-muted text-foreground rounded-full">
                {getPrettyDuration(event.eventData.duration)}
            </span>
        </div>
    );
};

const LocationDisplay = ({ location }: { location: string }) => (
    <div className="flex items-center gap-2 text-sm">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <span className="text-foreground">{location}</span>
    </div>
);

const DeleteDropdown = ({
    eventId,
    onDeleteComplete,
    hasNextEvent,
}: {
    eventId: string;
    onDeleteComplete: () => void;
    hasNextEvent: boolean;
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async (cascade: boolean) => {
        if (!eventId) return;

        setIsLoading(true);
        try {
            console.log(`🗑️ Deleting event: ${eventId}, cascade: ${cascade}`);

            const result = await deleteClassboardEvent(eventId, cascade);

            if (!result.success) {
                console.error("❌ Delete failed:", result.error);
                setIsLoading(false);
                return;
            }

            console.log("✅ Event deleted successfully");
            onDeleteComplete();
        } catch (error) {
            console.error("🔥 Error during delete operation:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-1 border-t border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <div className="pt-3 px-3 pb-3">
                <div className="flex items-center gap-2 mb-3">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">
                        Delete Event?
                    </span>
                </div>

                {hasNextEvent ? (
                    <div className="space-y-3">
                        <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                            There&apos;s a lesson scheduled after this one. What should happen to it?
                        </p>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleDelete(true)}
                                disabled={isLoading}
                                className="w-full flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 text-left transition-colors duration-150 disabled:opacity-50"
                            >
                                <div className="flex items-center gap-2">
                                    <ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs text-blue-800 dark:text-blue-200">
                                        Move next lesson here
                                    </span>
                                </div>
                                {isLoading && (
                                    <div className="w-3 h-3 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                                )}
                            </button>
                            <button
                                onClick={() => handleDelete(false)}
                                disabled={isLoading}
                                className="w-full flex items-center justify-between p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded hover:bg-red-150 dark:hover:bg-red-900/50 text-left transition-colors duration-150 disabled:opacity-50"
                            >
                                <div className="flex items-center gap-2">
                                    <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                                    <span className="text-xs text-red-800 dark:text-red-200">
                                        Just delete (keep gap)
                                    </span>
                                </div>
                                {isLoading && (
                                    <div className="w-3 h-3 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin" />
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => handleDelete(false)}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded hover:bg-red-150 dark:hover:bg-red-900/50 text-left transition-colors duration-150 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-3 h-3 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs text-red-800 dark:text-red-200">Deleting...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                                <span className="text-xs text-red-800 dark:text-red-200">Yes, delete event</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default function EventCard({ event, hasNextEvent = false, onDeleteComplete }: EventCardProps) {
    const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);

    const statusColor = STATUS_COLORS[event.eventData.status as keyof typeof STATUS_COLORS] || "bg-gray-500";
    const eventId = event.eventData.id || event.id;

    const handleDeleteComplete = () => {
        setShowDeleteDropdown(false);
        onDeleteComplete?.();
    };

    return (
        <div className="space-y-0">
            {/* Main Event Card */}
            <div className="flex bg-card border border-border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                {/* Status Sidebar */}
                <div className={`w-2 ${statusColor}`} />

                {/* Card Content */}
                <div className="flex-1 p-3">
                    {/* Students Display */}
                    <div className="mb-2">
                        <StudentsDisplay students={event.studentNames} />
                    </div>

                    {/* Event Details */}
                    <div className="space-y-1.5">
                        <TimeDisplay event={event} />
                        <LocationDisplay location={event.eventData.location} />
                    </div>

                    {/* Delete Control */}
                    <div className="mt-2 pt-2 border-t border-border">
                        <button
                            onClick={() => setShowDeleteDropdown(!showDeleteDropdown)}
                            className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                            title="Delete Event"
                        >
                            {showDeleteDropdown ? (
                                <X className="w-3 h-3" />
                            ) : (
                                <Trash2 className="w-3 h-3" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Dropdown - Outside main card border */}
            {showDeleteDropdown && (
                <DeleteDropdown
                    eventId={eventId}
                    onDeleteComplete={handleDeleteComplete}
                    hasNextEvent={hasNextEvent}
                />
            )}
        </div>
    );
}
