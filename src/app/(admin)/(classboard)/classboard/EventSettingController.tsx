"use client";

import { useCallback } from "react";
import { ChevronDown, ChevronUp, Clock, MapPin, Users, History } from "lucide-react";
import { addMinutesToTime } from "@/getters/queue-getter";
import { getPrettyDuration, adjustDuration } from "@/getters/duration-getter";
import type { ControllerSettings as ControllerSettingsType } from "@/src/app/(admin)/(classboard)/TeacherQueue";
import { cn } from "@/drizzle/schema"; // Assuming cn exists or I'll use template literals if not found, let's use standard template literals to be safe as I didn't check for cn utility.

export const LOCATION_OPTIONS = ["Beach", "Lagoon", "Bay", "Ocean"];

interface ControllerSettingsProps {
    controller: ControllerSettingsType;
    onControllerChange: (controller: ControllerSettingsType) => void;
}

const MinimalStepper = ({
    value,
    onDecrease,
    onIncrease,
    label,
    icon: Icon,
}: {
    value: string | number;
    onDecrease: (e: React.MouseEvent) => void;
    onIncrease: (e: React.MouseEvent) => void;
    label: string;
    icon?: React.ElementType;
}) => (
    <div className="flex items-center justify-between group h-8">
        <div className="flex items-center gap-2 text-muted-foreground min-w-[80px]">
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span className="text-xs font-medium truncate">{label}</span>
        </div>
        <div className="flex items-center gap-1">
            <button
                onClick={onDecrease}
                className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            >
                <ChevronDown className="w-3 h-3" />
            </button>
            <div className="min-w-[3.5rem] text-center font-mono text-xs font-medium text-foreground">
                {value}
            </div>
            <button
                onClick={onIncrease}
                className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            >
                <ChevronUp className="w-3 h-3" />
            </button>
        </div>
    </div>
);

const LocationSelector = ({
    options,
    value,
    onChange,
}: {
    options: string[];
    value: string;
    onChange: (val: string) => void;
}) => (
    <div className="flex items-center h-8 gap-1">
        <MapPin className="w-3.5 h-3.5 text-muted-foreground mr-1" />
        <div className="flex flex-1 gap-0.5">
            {options.map((option) => {
                const isActive = value === option;
                return (
                    <button
                        key={option}
                        onClick={() => onChange(option)}
                        className={`
                            px-2 py-1 text-[10px] uppercase tracking-wide font-medium rounded border transition-all flex-1
                            ${isActive ? "border-secondary text-secondary shadow-sm" : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"}
                        `}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
    </div>
);

export default function ControllerSettings({ controller, onControllerChange }: ControllerSettingsProps) {
    const updateController = useCallback(
        (updates: Partial<ControllerSettingsType>) => {
            onControllerChange({ ...controller, ...updates });
        },
        [controller, onControllerChange],
    );

    const adjustDurationSetting = useCallback(
        (key: keyof ControllerSettingsType, increment: number) => {
            const currentValue = controller[key] as number;
            const newValue = adjustDuration(currentValue, increment);
            updateController({ [key]: newValue });
        },
        [controller, updateController],
    );

    const adjustTime = useCallback(
        (minutes: number) => {
            const newTime = addMinutesToTime(controller.submitTime, minutes);
            updateController({ submitTime: newTime });
        },
        [controller.submitTime, updateController],
    );

    const adjustSetting = useCallback(
        (key: "gapMinutes" | "stepDuration", increment: number, min: number, max: number) => {
            const current = controller[key] || 0;
            const newValue = Math.min(max, Math.max(min, current + increment));
            updateController({ [key]: newValue });
        },
        [controller, updateController],
    );

    return (
        <div className="flex flex-col gap-4">
            {/* Top Row: Context (Time & Location) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 pb-4 border-b border-border/50">
                <div className="flex items-center justify-between h-8">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Start Time</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => adjustTime(-30)} className="hover:bg-muted p-1 rounded text-muted-foreground hover:text-foreground">
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-sm font-semibold w-12 text-center">{controller.submitTime}</span>
                        <button onClick={() => adjustTime(30)} className="hover:bg-muted p-1 rounded text-muted-foreground hover:text-foreground">
                            <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
                
                <LocationSelector 
                    options={LOCATION_OPTIONS} 
                    value={controller.location} 
                    onChange={(val) => updateController({ location: val })} 
                />
            </div>

            {/* Bottom Row: Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                <div className="space-y-1">
                    <span className="text-[10px] uppercase text-muted-foreground/50 font-bold tracking-wider mb-2 block">Durations</span>
                    <MinimalStepper
                        label="Private (1p)"
                        value={getPrettyDuration(controller.durationCapOne)}
                        onDecrease={() => adjustDurationSetting("durationCapOne", -(controller.stepDuration || 30))}
                        onIncrease={() => adjustDurationSetting("durationCapOne", controller.stepDuration || 30)}
                        icon={Users}
                    />
                    <MinimalStepper
                        label="Semi (2p)"
                        value={getPrettyDuration(controller.durationCapTwo)}
                        onDecrease={() => adjustDurationSetting("durationCapTwo", -(controller.stepDuration || 30))}
                        onIncrease={() => adjustDurationSetting("durationCapTwo", controller.stepDuration || 30)}
                    />
                    <MinimalStepper
                        label="Group (3p+)"
                        value={getPrettyDuration(controller.durationCapThree)}
                        onDecrease={() => adjustDurationSetting("durationCapThree", -(controller.stepDuration || 30))}
                        onIncrease={() => adjustDurationSetting("durationCapThree", controller.stepDuration || 30)}
                    />
                </div>

                <div className="space-y-1">
                    <span className="text-[10px] uppercase text-muted-foreground/50 font-bold tracking-wider mb-2 block md:mt-0 mt-4">Queue Logic</span>
                    <MinimalStepper
                        label="Step Size"
                        value={`${controller.stepDuration || 30}m`}
                        onDecrease={() => adjustSetting("stepDuration", -15, 15, 60)}
                        onIncrease={() => adjustSetting("stepDuration", 15, 15, 60)}
                        icon={History}
                    />
                    <MinimalStepper
                        label="Gap"
                        value={`${controller.gapMinutes || 0}m`}
                        onDecrease={() => adjustSetting("gapMinutes", -15, 0, 120)}
                        onIncrease={() => adjustSetting("gapMinutes", 15, 0, 120)}
                        icon={Clock}
                    />
                </div>
            </div>
        </div>
    );
}
