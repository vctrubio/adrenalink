"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Timer, MapPin, Flag } from "lucide-react";
import { addMinutesToTime } from "@/getters/timezone-getter";
import { getPrettyDuration, adjustDuration, DURATION_INCREMENT } from "@/getters/duration-getter";
import type { ControllerSettings as ControllerSettingsType } from "@/backend/TeacherQueue";

export const LOCATION_OPTIONS = ["Beach", "Lagoon", "Bay", "Ocean"];

interface ControllerSettingsProps {
    controller: ControllerSettingsType;
    onControllerChange: (controller: ControllerSettingsType) => void;
}

export default function ControllerSettings({
    controller,
    onControllerChange,
}: ControllerSettingsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const updateController = useCallback(
        (updates: Partial<ControllerSettingsType>) => {
            onControllerChange({ ...controller, ...updates });
        },
        [controller, onControllerChange]
    );

    const adjustDurationSetting = useCallback(
        (key: keyof ControllerSettingsType, increment: number) => {
            const currentValue = controller[key] as number;
            const newValue = adjustDuration(currentValue, increment);
            updateController({ [key]: newValue });
        },
        [controller, updateController]
    );

    const adjustTimeUp = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const newTime = addMinutesToTime(controller.submitTime, 30);
            updateController({ submitTime: newTime });
        },
        [controller.submitTime, updateController]
    );

    const adjustTimeDown = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const newTime = addMinutesToTime(controller.submitTime, -30);
            updateController({ submitTime: newTime });
        },
        [controller.submitTime, updateController]
    );

    const handleLocationChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            e.stopPropagation();
            updateController({ location: e.target.value });
        },
        [updateController]
    );

    const adjustGapUp = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const newGap = Math.min(120, (controller.gapMinutes || 0) + 15);
            updateController({ gapMinutes: newGap });
        },
        [controller.gapMinutes, updateController]
    );

    const adjustGapDown = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const newGap = Math.max(0, (controller.gapMinutes || 0) - 15);
            updateController({ gapMinutes: newGap });
        },
        [controller.gapMinutes, updateController]
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-stretch gap-4">
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-md border">
                            <Flag className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-mono font-medium min-w-[45px]">
                                {controller.submitTime}
                            </span>
                            <div className="flex flex-col gap-0.5">
                                <button
                                    type="button"
                                    onClick={adjustTimeUp}
                                    className="p-0.5 hover:bg-blue-50 rounded transition-colors group"
                                >
                                    <ChevronUp className="w-3 h-3 text-muted-foreground group-hover:text-blue-600" />
                                </button>
                                <button
                                    type="button"
                                    onClick={adjustTimeDown}
                                    className="p-0.5 hover:bg-blue-50 rounded transition-colors group"
                                >
                                    <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-blue-600" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-md border">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <select
                                value={controller.location}
                                onChange={handleLocationChange}
                                className="text-sm font-medium bg-transparent border-none focus:outline-none cursor-pointer min-w-[80px]"
                            >
                                {LOCATION_OPTIONS.map((location) => (
                                    <option
                                        key={location}
                                        value={location}
                                        className="bg-background"
                                    >
                                        {location}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center justify-around text-xs text-muted-foreground pt-1">
                        <div>
                            Private:{" "}
                            <strong>{getPrettyDuration(controller.durationCapOne)}</strong>
                        </div>
                        <div>
                            Semi-Private:{" "}
                            <strong>{getPrettyDuration(controller.durationCapTwo)}</strong>
                        </div>
                        <div>
                            Group:{" "}
                            <strong>{getPrettyDuration(controller.durationCapThree)}</strong>
                        </div>
                        <div>
                            Gap:{" "}
                            <strong>{controller.gapMinutes || 0}min</strong>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-muted/50 rounded-md transition-colors"
                    title="Duration Settings"
                >
                    <Timer
                        className={`w-4 h-4 transition-colors ${isOpen ? "text-blue-600" : "text-muted-foreground"
                            }`}
                    />
                </button>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 border border-border bg-card shadow-lg rounded-md">
                    <div className="p-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Timer className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-foreground">
                                    Duration Settings
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center justify-between p-3 bg-background rounded-md border">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-muted-foreground w-6">
                                            Gap
                                        </span>
                                        <span className="text-sm font-medium">Break Between Events</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={adjustGapDown}
                                            className="w-8 h-8 flex items-center justify-center border border-border hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                        <span className="text-sm font-mono font-bold min-w-[70px] text-center px-2 py-1 bg-muted rounded">
                                            {controller.gapMinutes || 0}min
                                        </span>
                                        <button
                                            onClick={adjustGapUp}
                                            className="w-8 h-8 flex items-center justify-center border border-border hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-background rounded-md border">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-muted-foreground w-6">
                                            1
                                        </span>
                                        <span className="text-sm font-medium">Private Lesson</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() =>
                                                adjustDurationSetting("durationCapOne", -DURATION_INCREMENT)
                                            }
                                            className="w-8 h-8 flex items-center justify-center border border-border hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                        <span className="text-sm font-mono font-bold min-w-[70px] text-center px-2 py-1 bg-muted rounded">
                                            {getPrettyDuration(controller.durationCapOne)}
                                        </span>
                                        <button
                                            onClick={() =>
                                                adjustDurationSetting("durationCapOne", DURATION_INCREMENT)
                                            }
                                            className="w-8 h-8 flex items-center justify-center border border-border hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-background rounded-md border">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-muted-foreground w-6">
                                            2
                                        </span>
                                        <span className="text-sm font-medium">Semi-Private</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() =>
                                                adjustDurationSetting("durationCapTwo", -DURATION_INCREMENT)
                                            }
                                            className="w-8 h-8 flex items-center justify-center border border-border hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                        <span className="text-sm font-mono font-bold min-w-[70px] text-center px-2 py-1 bg-muted rounded">
                                            {getPrettyDuration(controller.durationCapTwo)}
                                        </span>
                                        <button
                                            onClick={() =>
                                                adjustDurationSetting("durationCapTwo", DURATION_INCREMENT)
                                            }
                                            className="w-8 h-8 flex items-center justify-center border border-border hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-background rounded-md border">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-mono text-muted-foreground w-6">
                                            3+
                                        </span>
                                        <span className="text-sm font-medium">Group Lesson</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() =>
                                                adjustDurationSetting("durationCapThree", -DURATION_INCREMENT)
                                            }
                                            className="w-8 h-8 flex items-center justify-center border border-border hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                        <span className="text-sm font-mono font-bold min-w-[70px] text-center px-2 py-1 bg-muted rounded">
                                            {getPrettyDuration(controller.durationCapThree)}
                                        </span>
                                        <button
                                            onClick={() =>
                                                adjustDurationSetting("durationCapThree", DURATION_INCREMENT)
                                            }
                                            className="w-8 h-8 flex items-center justify-center border border-border hover:bg-muted rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
