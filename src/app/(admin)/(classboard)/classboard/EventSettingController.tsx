"use client";

import { useCallback } from "react";
import { ChevronDown, ChevronUp, MapPin, Clock } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { addMinutesToTime } from "@/getters/queue-getter";
import { getPrettyDuration, adjustDuration } from "@/getters/duration-getter";
import type { ControllerSettings as ControllerSettingsType } from "@/backend/TeacherQueue";

export const LOCATION_OPTIONS = ["Beach", "Lagoon", "Bay", "Ocean"];

interface ControllerSettingsProps {
    controller: ControllerSettingsType;
    onControllerChange: (controller: ControllerSettingsType) => void;
}

// Sub-components for grouped sections
const TimeAdjustButton = ({ onClick, children }: { onClick: (e: React.MouseEvent) => void; children: React.ReactNode }) => (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center border border-border hover:bg-muted rounded transition-colors">
        {children}
    </button>
);

const SettingRow = ({ label, icon: Icon, isFlagIcon, children }: { label: string; icon?: React.ElementType; isFlagIcon?: boolean; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
        <div className="flex items-center gap-3 min-w-0">
            {isFlagIcon ? <FlagIcon className="w-4 h-4 flex-shrink-0" /> : Icon ? <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : null}
            <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">{children}</div>
    </div>
);

const SettingGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-0.5">
        <h3 className="text-xs font-semibold text-foreground/70 uppercase tracking-wider px-0.5 pt-1 pb-0.5">{title}</h3>
        <div className="divide-y divide-border">{children}</div>
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

    const adjustTimeUp = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const newTime = addMinutesToTime(controller.submitTime, 30);
            updateController({ submitTime: newTime });
        },
        [controller.submitTime, updateController],
    );

    const adjustTimeDown = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const newTime = addMinutesToTime(controller.submitTime, -30);
            updateController({ submitTime: newTime });
        },
        [controller.submitTime, updateController],
    );

    const handleLocationChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            e.stopPropagation();
            updateController({ location: e.target.value });
        },
        [updateController],
    );

    const adjustGapUp = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const newGap = Math.min(120, (controller.gapMinutes || 0) + 15);
            updateController({ gapMinutes: newGap });
        },
        [controller.gapMinutes, updateController],
    );

    const adjustGapDown = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const newGap = Math.max(0, (controller.gapMinutes || 0) - 15);
            updateController({ gapMinutes: newGap });
        },
        [controller.gapMinutes, updateController],
    );

    const adjustStepUp = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const newStep = Math.min(60, (controller.stepDuration || 30) + 15);
            updateController({ stepDuration: newStep });
        },
        [controller.stepDuration, updateController],
    );

    const adjustStepDown = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const newStep = Math.max(15, (controller.stepDuration || 30) - 15);
            updateController({ stepDuration: newStep });
        },
        [controller.stepDuration, updateController],
    );

    return (
        <div className="space-y-3">
            {/* WHEN Section - Time and Location */}
            <SettingGroup title="When">
                <SettingRow label="Submit Time" isFlagIcon>
                    <TimeAdjustButton onClick={adjustTimeDown}>
                        <ChevronDown className="w-4 h-4" />
                    </TimeAdjustButton>
                    <span className="text-sm font-mono font-semibold w-12 text-center">{controller.submitTime}</span>
                    <TimeAdjustButton onClick={adjustTimeUp}>
                        <ChevronUp className="w-4 h-4" />
                    </TimeAdjustButton>
                </SettingRow>
                <SettingRow label="Location" icon={MapPin}>
                    <select value={controller.location} onChange={handleLocationChange} className="text-sm font-medium bg-transparent border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer min-w-[60px]">
                        {LOCATION_OPTIONS.map((location) => (
                            <option key={location} value={location}>
                                {location}
                            </option>
                        ))}
                    </select>
                </SettingRow>
            </SettingGroup>

            {/* GROUP Section - Lesson Types */}
            <SettingGroup title="Group">
                <SettingRow label="Private" icon={() => <span className="text-xs font-bold">1</span>}>
                    <TimeAdjustButton onClick={() => adjustDurationSetting("durationCapOne", -(controller.stepDuration || 30))}>
                        <ChevronDown className="w-4 h-4" />
                    </TimeAdjustButton>
                    <span className="text-sm font-mono font-semibold w-14 text-center">{getPrettyDuration(controller.durationCapOne)}</span>
                    <TimeAdjustButton onClick={() => adjustDurationSetting("durationCapOne", controller.stepDuration || 30)}>
                        <ChevronUp className="w-4 h-4" />
                    </TimeAdjustButton>
                </SettingRow>
                <SettingRow label="Semi-Private" icon={() => <span className="text-xs font-bold">2</span>}>
                    <TimeAdjustButton onClick={() => adjustDurationSetting("durationCapTwo", -(controller.stepDuration || 30))}>
                        <ChevronDown className="w-4 h-4" />
                    </TimeAdjustButton>
                    <span className="text-sm font-mono font-semibold w-14 text-center">{getPrettyDuration(controller.durationCapTwo)}</span>
                    <TimeAdjustButton onClick={() => adjustDurationSetting("durationCapTwo", controller.stepDuration || 30)}>
                        <ChevronUp className="w-4 h-4" />
                    </TimeAdjustButton>
                </SettingRow>
                <SettingRow label="Group" icon={() => <span className="text-xs font-bold">3+</span>}>
                    <TimeAdjustButton onClick={() => adjustDurationSetting("durationCapThree", -(controller.stepDuration || 30))}>
                        <ChevronDown className="w-4 h-4" />
                    </TimeAdjustButton>
                    <span className="text-sm font-mono font-semibold w-14 text-center">{getPrettyDuration(controller.durationCapThree)}</span>
                    <TimeAdjustButton onClick={() => adjustDurationSetting("durationCapThree", controller.stepDuration || 30)}>
                        <ChevronUp className="w-4 h-4" />
                    </TimeAdjustButton>
                </SettingRow>
            </SettingGroup>

            {/* TIME Section - Step and Gap */}
            <SettingGroup title="Time">
                <SettingRow label="Step" icon={Clock}>
                    <TimeAdjustButton onClick={adjustStepDown}>
                        <ChevronDown className="w-4 h-4" />
                    </TimeAdjustButton>
                    <span className="text-sm font-mono font-semibold w-12 text-center">{controller.stepDuration || 30}m</span>
                    <TimeAdjustButton onClick={adjustStepUp}>
                        <ChevronUp className="w-4 h-4" />
                    </TimeAdjustButton>
                </SettingRow>
                <SettingRow label="Gap" icon={Clock}>
                    <TimeAdjustButton onClick={adjustGapDown}>
                        <ChevronDown className="w-4 h-4" />
                    </TimeAdjustButton>
                    <span className="text-sm font-mono font-semibold w-12 text-center">{controller.gapMinutes || 0}m</span>
                    <TimeAdjustButton onClick={adjustGapUp}>
                        <ChevronUp className="w-4 h-4" />
                    </TimeAdjustButton>
                </SettingRow>
            </SettingGroup>
        </div>
    );
}
