"use client";

import { useState } from "react";
import { type EventStatus, EVENT_STATUS_CONFIG } from "@/types/status";
import { updateEventIdStatus } from "@/supabase/server/events";

const EVENT_STATUSES: EventStatus[] = ["planned", "tbc", "completed", "uncompleted"];

interface EventHomeStatusLabelProps {
    eventId: string;
    status: EventStatus;
    onStatusChange?: (newStatus: EventStatus) => void;
    className?: string;
}

export function EventHomeStatusLabel({ eventId, status, onStatusChange, className = "" }: EventHomeStatusLabelProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(status);
    const statusConfig = EVENT_STATUS_CONFIG[currentStatus] || EVENT_STATUS_CONFIG.planned;

    const handleStatusChange = async (newStatus: EventStatus) => {
        if (newStatus === currentStatus || isUpdating) return;

        setIsUpdating(true);
        setCurrentStatus(newStatus);

        const result = await updateEventIdStatus(eventId, newStatus);

        if (!result.success) {
            // Revert on error
            setCurrentStatus(status);
            console.error("Failed to update status:", result.error);
        }

        setIsUpdating(false);
        onStatusChange?.(newStatus);
    };

    return (
        <div className={`relative ${className}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 group">
                <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity group-hover:hidden"
                    style={{
                        backgroundColor: statusConfig.color + (isUpdating ? "10" : "20"),
                        color: statusConfig.color,
                        opacity: isUpdating ? 0.6 : 1,
                    }}
                >
                    {isUpdating ? "updating..." : statusConfig.label}
                </span>

                {/* Status options on hover */}
                <div
                    className="hidden group-hover:flex items-center gap-1.5 rounded-lg backdrop-blur-sm border border-border/50 p-2"
                    style={{
                        backgroundColor: statusConfig.color + "15",
                    }}
                >
                    {EVENT_STATUSES.map((statusOption) => (
                        <button
                            key={statusOption}
                            onClick={() => handleStatusChange(statusOption)}
                            disabled={isUpdating || statusOption === currentStatus}
                            className="w-3 h-3 rounded-full hover:scale-125 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: EVENT_STATUS_CONFIG[statusOption].color,
                            }}
                            title={EVENT_STATUS_CONFIG[statusOption].label}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
