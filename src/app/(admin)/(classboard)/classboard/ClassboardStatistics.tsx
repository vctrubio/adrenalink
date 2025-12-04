"use client";

import { useState } from "react";
import { ChevronDown, Trash2, Check, Clock, AlertCircle } from "lucide-react";
import type { GlobalStats } from "@/backend/ClassboardStats";
import type { TeacherQueue } from "@/backend/TeacherQueue";
import { getPrettyDuration } from "@/getters/duration-getter";
import { bulkUpdateClassboardEvents, bulkDeleteClassboardEvents, deleteUncompletedClassboardEvents } from "@/actions/classboard-bulk-action";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { EVENT_STATUS_CONFIG } from "@/types/status";

interface ClassboardStatisticsProps {
    stats: GlobalStats;
    teacherQueues: TeacherQueue[];
    totalBookings: number;
}

export default function ClassboardStatistics({ stats, teacherQueues, totalBookings }: ClassboardStatisticsProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const allEvents = teacherQueues.flatMap((queue) => queue.getAllEvents());
    const allEventIds = allEvents.map((e) => e.id).filter((id): id is string => id !== null);
    const eventsByStatus = {
        completed: allEvents.filter((e) => e.eventData.status === "completed"),
        uncompleted: allEvents.filter((e) => e.eventData.status !== "completed"),
    };

    const handleBulkAction = async (action: string) => {
        try {
            switch (action) {
                case "complete-all":
                    await bulkUpdateClassboardEvents(allEventIds, "completed");
                    break;
                case "plan-all":
                    await bulkUpdateClassboardEvents(allEventIds, "planned");
                    break;
                case "tbc-all":
                    await bulkUpdateClassboardEvents(allEventIds, "tbc");
                    break;
                case "delete-all":
                    await bulkDeleteClassboardEvents(allEventIds);
                    break;
                case "delete-uncompleted":
                    const uncompletedIds = eventsByStatus.uncompleted.map((e) => e.id).filter((id): id is string => id !== null);
                    await deleteUncompletedClassboardEvents(uncompletedIds);
                    break;
            }
        } catch (error) {
            console.error("❌ Error performing bulk action:", error);
        }
    };

    const completedCount = eventsByStatus.completed.length;
    const totalEvents = stats.totalEvents;
    const confirmationsNeeded = eventsByStatus.uncompleted.length;

    const dropdownItems: DropdownItemProps[] = [
        {
            id: "complete-all",
            label: "Set All to Completed",
            icon: Check,
            color: EVENT_STATUS_CONFIG.completed.color,
            onClick: () => handleBulkAction("complete-all"),
        },
        {
            id: "plan-all",
            label: "Set All to Planned",
            icon: Clock,
            color: EVENT_STATUS_CONFIG.planned.color,
            onClick: () => handleBulkAction("plan-all"),
        },
        {
            id: "tbc-all",
            label: "Set All to TBC",
            icon: AlertCircle,
            color: EVENT_STATUS_CONFIG.tbc.color,
            onClick: () => handleBulkAction("tbc-all"),
        },
        {
            id: "delete-uncompleted",
            label: `Delete Uncompleted (${eventsByStatus.uncompleted.length})`,
            icon: Trash2,
            color: "#ef4444",
            onClick: () => handleBulkAction("delete-uncompleted"),
        },
        {
            id: "delete-all",
            label: `Delete All (${allEventIds.length})`,
            icon: Trash2,
            color: "#ef4444",
            onClick: () => handleBulkAction("delete-all"),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Statistics Header with Bulk Dropdown */}
            <div>
                <div className="flex items-center justify-between mb-4 relative">
                    <h3 className="text-lg font-semibold text-foreground">Statistics</h3>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors ${
                            completedCount === totalEvents && totalEvents > 0 ? "bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-800 dark:text-green-200" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                    >
                        <span className="font-medium">
                            {completedCount}/{totalEvents}
                        </span>
                        <ChevronDown className="w-3 h-3" />
                    </button>
                    <Dropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} items={dropdownItems} align="right" />
                </div>

                {/* Statistics List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookingIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm text-muted-foreground">Bookings</span>
                        </div>
                        <span className="font-semibold text-foreground">{totalBookings}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FlagIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm text-muted-foreground">Lessons</span>
                        </div>
                        <span className="font-semibold text-foreground">{stats.totalEvents}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <DurationIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm text-muted-foreground">Duration</span>
                        </div>
                        <span className="font-semibold text-foreground">{getPrettyDuration(stats.totalHours * 60)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FlagIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            <span className="text-sm text-muted-foreground">Confirmations</span>
                        </div>
                        <span className="font-semibold text-foreground">{confirmationsNeeded}</span>
                    </div>
                </div>
            </div>

            {/* Revenue Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Revenue</h3>
                    <span className="text-lg font-semibold text-foreground">€{Math.round(stats.totalEarnings.teacher + stats.totalEarnings.school)}</span>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HandshakeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm text-muted-foreground">Teacher Commission</span>
                        </div>
                        <span className="font-semibold text-foreground">€{Math.round(stats.totalEarnings.teacher)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BankIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            <span className="text-sm text-muted-foreground">School Earnings</span>
                        </div>
                        <span className="font-semibold text-foreground">€{Math.round(stats.totalEarnings.school)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
