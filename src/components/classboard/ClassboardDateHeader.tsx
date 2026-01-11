"use client";

import { Play, Share2, RefreshCw, MapPin, Users, Layers, Phone, Plus, Minus, Timer } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { getTodayDateString } from "@/getters/date-getter";
import { cn } from "@/src/lib/utils";
import ToggleSettingIcon from "@/src/components/ui/ToggleSettingIcon";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DailyClassScheduleModal from "@/src/components/modals/DailyClassScheduleModal";
import { bulkUpdateEventStatus, bulkDeleteClassboardEvents } from "@/supabase/server/classboard";
import { STATUS_GREEN, STATUS_ORANGE } from "@/types/status";

interface ClassboardDateHeaderProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
}

export default function ClassboardDateHeader({ selectedDate, onDateChange }: ClassboardDateHeaderProps) {
    const dateObj = new Date(selectedDate + "T00:00:00");
    const today = new Date(getTodayDateString() + "T00:00:00");
    const { controller, setController, teacherQueues, globalFlag } = useClassboardContext();
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Get all event IDs for bulk operations
    const getAllEventIds = (): string[] => {
        const eventIds: string[] = [];
        teacherQueues.forEach((queue) => {
            const events = queue.getAllEvents();
            events.forEach((event) => {
                eventIds.push(event.id);
            });
        });
        return eventIds;
    };

    // Get event IDs by status
    const getEventIdsByStatus = (targetStatus: string): string[] => {
        const eventIds: string[] = [];
        teacherQueues.forEach((queue) => {
            const events = queue.getAllEvents();
            events.forEach((event) => {
                if (event.eventData.status !== targetStatus) {
                    eventIds.push(event.id);
                }
            });
        });
        return eventIds;
    };

    const isAdjustmentMode = globalFlag.isAdjustmentMode();

    const handleToggleAdjustmentMode = () => {
        if (isAdjustmentMode) {
            globalFlag.exitAdjustmentMode();
        } else {
            globalFlag.enterAdjustmentMode();
        }
    };

    const handleMarkAllCompleted = async () => {
        const eventIds = getEventIdsByStatus("completed");
        if (eventIds.length === 0) {
            toast.error("No events to update");
            return;
        }

        setIsLoading(true);
        setIsDropdownOpen(false);
        try {
            await bulkUpdateEventStatus(eventIds, "completed");
            toast.success(`Marking ${eventIds.length} events as completed...`);
        } catch (error) {
            console.error("Bulk update failed", error);
            toast.error("Failed to update events");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAllTBC = async () => {
        const eventIds = getEventIdsByStatus("tbc");
        if (eventIds.length === 0) {
            toast.error("No events to update");
            return;
        }

        setIsLoading(true);
        setIsDropdownOpen(false);
        try {
            await bulkUpdateEventStatus(eventIds, "tbc");
            toast.success(`Marking ${eventIds.length} events as TBC...`);
        } catch (error) {
            console.error("Bulk update failed", error);
            toast.error("Failed to update events");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAll = async () => {
        const eventIds = getAllEventIds();
        if (eventIds.length === 0) {
            toast.error("No events to delete");
            return;
        }

        if (!window.confirm(`Delete all ${eventIds.length} events? This cannot be undone.`)) {
            return;
        }

        setIsLoading(true);
        setIsDropdownOpen(false);
        try {
            eventIds.forEach((eventId) => {
                globalFlag.notifyEventMutation(eventId, "deleting");
            });

            teacherQueues.forEach((queue) => {
                const events = queue.getAllEvents();
                events.forEach((event) => {
                    if (eventIds.includes(event.id)) {
                        globalFlag.markEventAsDeleted(queue.teacher.id, event.id);
                    }
                });
            });

            globalFlag.triggerRefresh();

            const deleteResult = await bulkDeleteClassboardEvents(eventIds);
            if (!deleteResult.success) {
                throw new Error(deleteResult.error || "Delete failed");
            }

            toast.success(`Deleting ${eventIds.length} events...`);
        } catch (error) {
            console.error("Bulk delete failed", error);
            toast.error("Failed to delete events");

            eventIds.forEach((eventId) => {
                globalFlag.clearEventMutation(eventId);
            });

            eventIds.forEach((eventId) => {
                teacherQueues.forEach((queue) => {
                    globalFlag.unmarkEventAsDeleted(queue.teacher.id, eventId);
                });
            });
            globalFlag.triggerRefresh();
        } finally {
            setIsLoading(false);
        }
    };

    // Formatters
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const dayNumber = dateObj.getDate();
    const monthShort = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    
    // Time difference logic
    const diffTime = dateObj.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const isToday = diffDays === 0;

    const formatDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handlePreviousDay = () => {
        const newDate = new Date(dateObj);
        newDate.setDate(newDate.getDate() - 1);
        onDateChange(formatDateString(newDate));
    };

    const handleNextDay = () => {
        const newDate = new Date(dateObj);
        newDate.setDate(newDate.getDate() + 1);
        onDateChange(formatDateString(newDate));
    };

    const handleToday = () => {
        onDateChange(getTodayDateString());
    };

    // Flag settings increment/decrement functions
    const handleTimeIncrement = () => {
        if (!controller) return;
        const [hours, minutes] = controller.submitTime.split(":").map(Number);
        const newHours = (hours + 1) % 24;
        const newTime = `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        setController({ ...controller, submitTime: newTime });
    };

    const handleTimeDecrement = () => {
        if (!controller) return;
        const [hours, minutes] = controller.submitTime.split(":").map(Number);
        const newHours = (hours - 1 + 24) % 24;
        const newTime = `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        setController({ ...controller, submitTime: newTime });
    };

    const locationCycle = ["Zoom", "In-Person", "Hybrid", "Phone"];
    const handleLocationIncrement = () => {
        if (!controller) return;
        const currentIndex = locationCycle.indexOf(controller.location || "Zoom");
        const nextIndex = (currentIndex + 1) % locationCycle.length;
        setController({ ...controller, location: locationCycle[nextIndex] });
    };

    const handleLocationDecrement = () => {
        if (!controller) return;
        const currentIndex = locationCycle.indexOf(controller.location || "Zoom");
        const prevIndex = (currentIndex - 1 + locationCycle.length) % locationCycle.length;
        setController({ ...controller, location: locationCycle[prevIndex] });
    };

    const gapCycle = [0, 5, 10, 15, 20, 30, 60];
    const handleGapIncrement = () => {
        if (!controller) return;
        const currentIndex = gapCycle.indexOf(controller.gapMinutes || 0);
        const nextIndex = (currentIndex + 1) % gapCycle.length;
        setController({ ...controller, gapMinutes: gapCycle[nextIndex] });
    };

    const handleGapDecrement = () => {
        if (!controller) return;
        const currentIndex = gapCycle.indexOf(controller.gapMinutes || 0);
        const prevIndex = (currentIndex - 1 + gapCycle.length) % gapCycle.length;
        setController({ ...controller, gapMinutes: gapCycle[prevIndex] });
    };

    const getLocationIcon = () => {
        switch (controller?.location) {
            case "Zoom":
                return <Users size={16} className="text-slate-600 dark:text-slate-400" />;
            case "In-Person":
                return <MapPin size={16} className="text-slate-600 dark:text-slate-400" />;
            case "Hybrid":
                return <Layers size={16} className="text-slate-600 dark:text-slate-400" />;
            case "Phone":
                return <Phone size={16} className="text-slate-600 dark:text-slate-400" />;
            default:
                return <Users size={16} className="text-slate-600 dark:text-slate-400" />;
        }
    };

    // Format relative days badge text (e.g., "19d", "-2d")
    const showBadge = diffDays !== 0;
    const badgeText = diffDays === 1 ? "Tomorrow" : diffDays === -1 ? "Yesterday" : `${diffDays > 0 ? "+" : "-"}${Math.abs(diffDays)}d`;

    return (
        <div className="flex items-stretch bg-card border border-border rounded-xl overflow-hidden shadow-sm select-none">
            {/* Left Side: Flag Settings Strip */}
            <div className="w-64 bg-slate-100 dark:bg-slate-800 flex flex-col divide-y divide-slate-200 dark:divide-slate-700 flex-shrink-0">
                {/* Start Time Section */}
                <div className="flex-1 flex items-center justify-between px-4 py-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group">
                    <div className="flex items-center gap-2">
                        <FlagIcon size={16} className="text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start Time</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleTimeDecrement}
                            className="p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            title="Decrease hour"
                        >
                            <Minus size={14} className="text-slate-600 dark:text-slate-400" />
                        </button>
                        <span className="text-sm font-black text-slate-900 dark:text-white w-12 text-center">{controller?.submitTime || "00:00"}</span>
                        <button
                            onClick={handleTimeIncrement}
                            className="p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            title="Increase hour"
                        >
                            <Plus size={14} className="text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Location Section */}
                <div className="flex-1 flex items-center justify-between px-4 py-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group">
                    <div className="flex items-center gap-2">
                        {getLocationIcon()}
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Location</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleLocationDecrement}
                            className="p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            title="Previous location"
                        >
                            <Minus size={14} className="text-slate-600 dark:text-slate-400" />
                        </button>
                        <span className="text-sm font-black text-slate-900 dark:text-white w-20 text-center">{controller?.location || "Zoom"}</span>
                        <button
                            onClick={handleLocationIncrement}
                            className="p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            title="Next location"
                        >
                            <Plus size={14} className="text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Gap Intervals Section */}
                <div className="flex-1 flex items-center justify-between px-4 py-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group">
                    <div className="flex items-center gap-2">
                        <Timer size={16} className="text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Gap Intervals</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleGapDecrement}
                            className="p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            title="Decrease gap"
                        >
                            <Minus size={14} className="text-slate-600 dark:text-slate-400" />
                        </button>
                        <span className="text-sm font-black text-slate-900 dark:text-white w-12 text-center">{controller?.gapMinutes || 0}m</span>
                        <button
                            onClick={handleGapIncrement}
                            className="p-1 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            title="Increase gap"
                        >
                            <Plus size={14} className="text-slate-600 dark:text-slate-400" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content: Navigation & Date */}
            <div className="flex-1 flex items-center justify-center gap-6 py-6 px-4 relative">
                {/* Previous Button */}
                <button
                    onClick={handlePreviousDay}
                    className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-slate-800 dark:hover:border-slate-200 bg-transparent flex items-center justify-center transition-all group active:scale-95"
                >
                    <Play
                        size={12}
                        className="rotate-180 text-slate-400 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-slate-200 fill-current transition-colors"
                        strokeWidth={3}
                    />
                </button>

                {/* Date Display */}
                <div className="flex items-center gap-6">
                    {/* Date Number Block */}
                    <div className="flex flex-col items-center leading-none">
                        <span className="text-4xl font-serif font-black text-slate-900 dark:text-white tracking-tighter">
                            {dayNumber}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 ml-1">
                            {monthShort}
                        </span>
                    </div>

                    {/* Day Info Block */}
                    <div className="flex flex-col items-start gap-0.5">
                        <span className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-none">
                            {dayName}
                        </span>

                        <div className="flex items-center gap-2 h-4">
                            {/* Relative Badge (Tomorrow, Yesterday, or -Xd/Xd) */}
                            {showBadge && (
                                <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black px-2 py-0.5 rounded-full min-w-[28px] text-center">
                                    {badgeText}
                                </span>
                            )}

                            {/* Today Label (Underlined when active) */}
                            {isToday && (
                                <span className="text-[10px] font-black text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white pb-0.5 tracking-wider">
                                    TODAY
                                </span>
                            )}

                            {/* Always show Today button as a shortcut if not today */}
                            {!isToday && (
                                <button
                                    onClick={handleToday}
                                    className="text-[9px] font-black text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider border-b border-transparent hover:border-slate-900 dark:hover:border-white"
                                >
                                    Today
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Next Button */}
                <button
                    onClick={handleNextDay}
                    className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-slate-800 dark:hover:border-slate-200 bg-transparent flex items-center justify-center transition-all group active:scale-95"
                >
                    <Play
                        size={12}
                        className="text-slate-400 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-slate-200 fill-current transition-colors"
                        strokeWidth={3}
                    />
                </button>
            </div>

            {/* Right Side: Technical Action Strip */}
            <div className="relative w-10 bg-slate-900 dark:bg-white flex flex-col divide-y divide-white/10 dark:divide-slate-200 flex-shrink-0">
                {/* Edit All / Adjustment Mode Toggle */}
                <div className="flex-1 flex items-center justify-center hover:bg-white/10 dark:hover:bg-slate-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed">
                    <button
                        onClick={handleToggleAdjustmentMode}
                        disabled={isLoading}
                        className="w-full h-full flex items-center justify-center"
                    >
                        <ToggleSettingIcon isOpen={isAdjustmentMode} onClick={handleToggleAdjustmentMode} />
                    </button>
                </div>

                {/* Share / Daily Schedule Modal */}
                <button
                    onClick={() => setIsScheduleModalOpen(true)}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center text-white dark:text-slate-900 hover:bg-white/10 dark:hover:bg-slate-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Share2 size={12} strokeWidth={3} className="opacity-80 group-hover:opacity-100" />
                </button>

                {/* Refresh with Dropdown Menu */}
                <div className="flex-1 relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        disabled={isLoading}
                        className="w-full h-full flex items-center justify-center text-white dark:text-slate-900 hover:bg-white/10 dark:hover:bg-slate-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw size={12} strokeWidth={3} className="opacity-80 group-hover:opacity-100" />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute bottom-10 right-0 w-44 bg-slate-900 dark:bg-white border border-slate-700 dark:border-slate-200 rounded-lg shadow-lg z-50">
                            <button
                                onClick={handleMarkAllCompleted}
                                disabled={isLoading || getEventIdsByStatus("completed").length === 0}
                                className="w-full px-4 py-3 text-left text-sm font-medium text-white dark:text-slate-900 hover:bg-white/10 dark:hover:bg-slate-50 border-b border-slate-700 dark:border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t-lg"
                                style={{ color: isLoading ? undefined : STATUS_GREEN }}
                            >
                                {isLoading ? "Updating..." : "Complete All"}
                            </button>
                            <button
                                onClick={handleMarkAllTBC}
                                disabled={isLoading || getEventIdsByStatus("tbc").length === 0}
                                className="w-full px-4 py-3 text-left text-sm font-medium text-white dark:text-slate-900 hover:bg-white/10 dark:hover:bg-slate-50 border-b border-slate-700 dark:border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ color: isLoading ? undefined : STATUS_ORANGE }}
                            >
                                {isLoading ? "Updating..." : "Set Confirmation"}
                            </button>
                            <button
                                onClick={handleDeleteAll}
                                disabled={isLoading || getAllEventIds().length === 0}
                                className="w-full px-4 py-3 text-left text-sm font-medium text-red-500 hover:bg-white/10 dark:hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed last:rounded-b-lg"
                            >
                                {isLoading ? "Deleting..." : "Delete All"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Daily Schedule Modal */}
            <DailyClassScheduleModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                selectedDate={selectedDate}
                teacherQueues={teacherQueues}
            />
        </div>
    );
}
