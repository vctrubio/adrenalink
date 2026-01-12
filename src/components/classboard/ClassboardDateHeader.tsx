"use client";

import { Play, Share2, RefreshCw, Timer, Settings, Flag, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getTodayDateString } from "@/getters/date-getter";
import { useClassboardContext } from "@/src/providers/classboard-provider";

type ContentHeaderViewType = "/" | "config" | "gap" | "lesson" | "share" | "update";
type IconType = "image" | "lucide";

interface ButtonConfig {
    id: string;
    view: ContentHeaderViewType;
    icon: IconType;
    iconName?: string;
    rotate: string;
}

/**
 * Button Configuration - Left and Right strips
 * Following clean-code-thesis.md principle of centralized configuration objects
 */
const LEFT_BUTTONS: ButtonConfig[] = [
    { id: "settings", view: "config", icon: "lucide", iconName: "Settings", rotate: "group-hover:rotate-90" },
    { id: "lesson", view: "lesson", icon: "lucide", iconName: "Flag", rotate: "group-hover:rotate-12" },
    { id: "gap", view: "gap", icon: "lucide", iconName: "Timer", rotate: "group-hover:rotate-45" },
];

const RIGHT_BUTTONS: ButtonConfig[] = [
    { id: "stats", view: "/", icon: "lucide", iconName: "BarChart3", rotate: "group-hover:scale-110" },
    { id: "share", view: "share", icon: "lucide", iconName: "Share2", rotate: "group-hover:-rotate-12" },
    { id: "refresh", view: "update", icon: "lucide", iconName: "RefreshCw", rotate: "group-hover:rotate-180" },
];

interface ClassboardDateHeaderProps {
    contentViewType: ContentHeaderViewType;
    onContentViewChange: (viewType: ContentHeaderViewType) => void;
}

export default function ClassboardDateHeader({ contentViewType, onContentViewChange }: ClassboardDateHeaderProps) {
    const { selectedDate, setSelectedDate, globalFlag } = useClassboardContext();
    const dateObj = new Date(selectedDate + "T00:00:00");
    const today = new Date(getTodayDateString() + "T00:00:00");

    const isAdjustmentMode = globalFlag.isAdjustmentMode();

    // Reactively switch back to default view if adjustment mode is exited globally
    useEffect(() => {
        if (!isAdjustmentMode && contentViewType === "config") {
            onContentViewChange("/");
        }
    }, [isAdjustmentMode, contentViewType, onContentViewChange]);

    const handleViewChange = (view: ContentHeaderViewType) => {
        // If we are leaving config view or clicking settings while in adjustment mode
        if (view !== "config" && isAdjustmentMode) {
            globalFlag.exitAdjustmentMode(true); // true = reset/cancel changes
        } else if (view === "config" && !isAdjustmentMode) {
            globalFlag.enterAdjustmentMode();
        } else if (view === "config" && isAdjustmentMode) {
            // Toggle off if clicking settings again
            globalFlag.exitAdjustmentMode(true);
            onContentViewChange("/"); // Go back to home if toggling off
            return;
        }

        // If we are leaving share view, exit all sharing modes
        if (contentViewType === "share" && view !== "share") {
            globalFlag.setSharingMode(null);
        }

        // Toggle share view off if clicking it again
        if (contentViewType === "share" && view === "share") {
            globalFlag.setSharingMode(null);
            onContentViewChange("/");
            return;
        }

        onContentViewChange(view);
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
        setSelectedDate(formatDateString(newDate));
    };

    const handleNextDay = () => {
        const newDate = new Date(dateObj);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(formatDateString(newDate));
    };

    const handleToday = () => {
        setSelectedDate(getTodayDateString());
    };

    // Format relative days badge text (e.g., "19d", "-2d")
    const showBadge = diffDays !== 0;
    const badgeText =
        diffDays === 1 ? "Tomorrow" : diffDays === -1 ? "Yesterday" : `${diffDays > 0 ? "+" : "-"}${Math.abs(diffDays)}d`;

    return (
        <div className="flex items-stretch border border-border/30 rounded-lg overflow-hidden shadow-sm select-none min-h-32 max-w-xl mx-auto">
            <LeftButtonStrip contentViewType={contentViewType} onViewChange={handleViewChange} isAdjustmentMode={isAdjustmentMode} />

            {/* Main Content: Navigation & Date */}
            <div className="flex-1 flex items-center justify-center gap-6 py-4 px-4 relative">
                {/* Previous Button */}
                <button
                    onClick={handlePreviousDay}
                    className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-slate-800 dark:hover:border-slate-200 bg-transparent flex items-center justify-center transition-all group active:scale-95"
                >
                    <Play
                        size={16}
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
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 ml-1">{monthShort}</span>
                    </div>

                    {/* Day Info Block */}
                    <div className="flex flex-col items-start gap-0.5">
                        <span className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-none">{dayName}</span>

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

            <RightButtonStrip contentViewType={contentViewType} onViewChange={handleViewChange} />
        </div>
    );
}

/**
 * LeftButtonStrip - Renders left side button configuration
 */
function LeftButtonStrip({
    contentViewType,
    onViewChange,
    isAdjustmentMode,
}: {
    contentViewType: ContentHeaderViewType;
    onViewChange: (view: ContentHeaderViewType) => void;
    isAdjustmentMode: boolean;
}) {
    return (
        <div className="w-12 bg-slate-900 dark:bg-slate-500 flex flex-col divide-y divide-white/10 flex-shrink-0">
            {LEFT_BUTTONS.map((btn) => (
                <button
                    key={btn.id}
                    onClick={() => onViewChange(btn.view)}
                    className={`flex-1 flex items-center justify-center transition-all group px-3 py-3 ${
                        contentViewType === btn.view ? "text-primary" : "text-white hover:text-primary transition-colors"
                    }`}
                >
                    {btn.id === "settings" && (
                        <Image
                            src="/ADR.webp"
                            alt="Home"
                            width={20}
                            height={20}
                            className={`object-contain transition-all duration-300 invert group-hover:opacity-80 ${
                                isAdjustmentMode ? "opacity-100 scale-110" : "opacity-80"
                            }`}
                        />
                    )}
                    {btn.id === "lesson" && (
                        <Flag
                            size={20}
                            strokeWidth={3}
                            className={`text-white group-hover:text-primary transition-all duration-300 ${btn.rotate}`}
                        />
                    )}
                    {btn.id === "gap" && (
                        <Timer
                            size={20}
                            strokeWidth={3}
                            className={`text-white group-hover:text-primary transition-all duration-300 ${btn.rotate}`}
                        />
                    )}
                </button>
            ))}
        </div>
    );
}

/**
 * RightButtonStrip - Renders right side button configuration
 */
function RightButtonStrip({
    contentViewType,
    onViewChange,
}: {
    contentViewType: ContentHeaderViewType;
    onViewChange: (view: ContentHeaderViewType) => void;
}) {
    return (
        <div className="w-12 bg-slate-900 dark:bg-slate-500 flex flex-col divide-y divide-white/10 flex-shrink-0">
            {RIGHT_BUTTONS.map((btn) => (
                <button
                    key={btn.id}
                    onClick={() => onViewChange(btn.view)}
                    className={`flex-1 flex items-center justify-center transition-all group px-3 py-3 ${
                        contentViewType === btn.view ? "text-primary" : "text-white hover:text-primary transition-colors"
                    }`}
                >
                    {btn.id === "stats" && (
                        <BarChart3
                            size={20}
                            strokeWidth={3}
                            className={`text-white group-hover:text-primary transition-all duration-300 ${btn.rotate}`}
                        />
                    )}
                    {btn.id === "share" && (
                        <Share2
                            size={20}
                            strokeWidth={3}
                            className={`text-white group-hover:text-primary transition-all duration-300 ${btn.rotate}`}
                        />
                    )}
                    {btn.id === "refresh" && (
                        <RefreshCw
                            size={20}
                            strokeWidth={3}
                            className={`text-white group-hover:text-primary transition-all duration-300 ${btn.rotate}`}
                        />
                    )}
                </button>
            ))}
        </div>
    );
}
