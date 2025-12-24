"use client";

import EventSettingController, { LOCATION_OPTIONS } from "./EventSettingController";
import type { ControllerSettings as ControllerSettingsType } from "@/backend/TeacherQueue";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, MapPin } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { getPrettyDuration } from "@/getters/duration-getter";
import AVerticalShape from "@/public/shapes/AVerticalShape";
import { useState, useRef, useEffect, useMemo } from "react";
import Dropdown from "@/src/components/ui/dropdown/dropdown";
import type { DropdownItemProps } from "@/src/components/ui/dropdown/dropdown-item";

const DEFAULT_STEP_DURATION = 15;

interface ClassboardControllerProps {
    controller: ControllerSettingsType;
    setController: (controller: ControllerSettingsType) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

// ----------------------------------------------------------------------------
// Sub-Components
// ----------------------------------------------------------------------------

interface InlineInputProps {
    value: string | number;
    onChange: (val: string) => void;
    type?: "text" | "number" | "time";
    className?: string;
    suffix?: string;
    min?: number;
    max?: number;
    width?: string;
    step?: number;
}

const InlineInput = ({
    value,
    onChange,
    type = "text",
    className = "",
    suffix = "",
    min,
    max,
    width = "w-12",
    step = 1,
}: InlineInputProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTempValue(value.toString());
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            if (type !== "time") {
                inputRef.current.select();
            }
        }
    }, [isEditing, type]);

    const commit = () => {
        setIsEditing(false);
        if (tempValue !== value.toString()) {
            onChange(tempValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            commit();
        } else if (e.key === "Escape") {
            setTempValue(value.toString());
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                <input
                    ref={inputRef}
                    type={type}
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onBlur={commit}
                    onKeyDown={handleKeyDown}
                    min={min}
                    max={max}
                    step={step}
                    className={`bg-background border border-primary/50 rounded px-2 py-0 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-6 ${width}`}
                />
            </div>
        );
    }

    return (
        <span
            onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
            }}
            className={`cursor-text hover:bg-muted/50 hover:text-foreground rounded px-1 transition-colors ${className}`}
        >
            {value}{suffix}
        </span>
    );
};

interface DurationInlineInputProps {
    minutes: number;
    onChange: (totalMinutes: number) => void;
    className?: string;
    step?: number;
}

const DurationInlineInput = ({
    minutes,
    onChange,
    className = "",
    step = DEFAULT_STEP_DURATION,
}: DurationInlineInputProps) => {
    const [isEditing, setIsEditing] = useState(false);
    
    const [h, setH] = useState(Math.floor(minutes / 60));
    const [m, setM] = useState(minutes % 60);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setH(Math.floor(minutes / 60));
        setM(minutes % 60);
    }, [minutes]);

    useEffect(() => {
        if (isEditing && firstInputRef.current) {
            firstInputRef.current.focus();
            firstInputRef.current.select();
        }
    }, [isEditing]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                commit();
            }
        };

        if (isEditing) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isEditing, h, m]);

    const commit = () => {
        setIsEditing(false);
        const total = (Math.max(0, h) * 60) + Math.max(0, m);
        if (total !== minutes) {
            onChange(total);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            commit();
        } else if (e.key === "Escape") {
            setH(Math.floor(minutes / 60));
            setM(minutes % 60);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <div 
                ref={containerRef}
                className="flex items-center gap-0.5 bg-background border border-primary/50 rounded px-1.5 h-6 min-w-[5rem]"
                onClick={(e) => e.stopPropagation()}
            >
                <input
                    ref={firstInputRef}
                    type="number"
                    value={h}
                    onChange={(e) => setH(parseInt(e.target.value) || 0)}
                    onKeyDown={handleKeyDown}
                    min={0}
                    className="w-6 bg-transparent text-xs font-mono text-foreground focus:outline-none p-0 text-center"
                    placeholder="h"
                />
                <span className="text-[10px] text-muted-foreground mr-1">h</span>
                <input
                    type="number"
                    value={m}
                    onChange={(e) => setM(parseInt(e.target.value) || 0)}
                    onKeyDown={handleKeyDown}
                    min={0}
                    max={59}
                    step={step}
                    className="w-7 bg-transparent text-xs font-mono text-foreground focus:outline-none p-0 text-center"
                    placeholder="m"
                />
                <span className="text-[10px] text-muted-foreground">m</span>
            </div>
        );
    }

    return (
        <span
            onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
            }}
            className={`cursor-text hover:bg-muted/50 hover:text-foreground rounded px-1 transition-colors ${className}`}
        >
            {getPrettyDuration(minutes)}
        </span>
    );
};

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------

export default function ClassboardController({
    controller,
    setController,
    isCollapsed,
    onToggleCollapse,
}: ClassboardControllerProps) {
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const locationRef = useRef<HTMLDivElement>(null);

    const handleLocationClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLocationOpen(!isLocationOpen);
    };

    const locationOptions: DropdownItemProps[] = useMemo(() => LOCATION_OPTIONS.map(loc => ({
        id: loc,
        label: loc,
        icon: MapPin,
        active: controller.location === loc,
        onClick: () => setController({ ...controller, location: loc })
    })), [controller.location, controller, setController]);

    const step = controller.stepDuration || DEFAULT_STEP_DURATION;

    return (
        <div className="border-b border-border bg-background">
            <div 
                className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/30 transition-colors select-none group"
                onClick={onToggleCollapse}
            >
                <div className="flex items-center gap-3">
                    <Settings2 className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-foreground">Settings</span>
                        <span className="text-muted-foreground/40">|</span>
                        
                        <div className="flex items-center gap-1.5 -ml-1">
                            <FlagIcon size={14} className="text-muted-foreground/60" />
                            <InlineInput
                                value={controller.submitTime}
                                onChange={(val) => setController({ ...controller, submitTime: val })}
                                type="time"
                                className="font-mono text-muted-foreground"
                                width="w-24"
                            />
                        </div>
                        
                        <span className="text-muted-foreground/40">•</span>
                        
                        <div 
                            ref={locationRef}
                            onClick={handleLocationClick}
                            className={`flex items-center gap-1 border rounded px-1.5 py-0.5 -ml-1.5 transition-all ${isLocationOpen ? "border-secondary shadow-sm" : "border-transparent hover:border-secondary/50"}`}
                        >
                            <MapPin className={`w-3.5 h-3.5 transition-colors ${isLocationOpen ? "text-secondary" : "text-muted-foreground/60"}`} />
                            <span className={`uppercase text-[10px] tracking-wide font-medium transition-colors ${isLocationOpen ? "text-secondary" : "text-muted-foreground"}`}>{controller.location}</span>
                        </div>

                        <span className="text-muted-foreground/40">•</span>

                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                            <div className="flex items-center gap-1">
                                <span className="opacity-50">1P</span>
                                <DurationInlineInput 
                                    minutes={controller.durationCapOne}
                                    onChange={(val) => setController({ ...controller, durationCapOne: val })}
                                    className="font-mono text-xs"
                                    step={step}
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="opacity-50">2P</span>
                                <DurationInlineInput 
                                    minutes={controller.durationCapTwo}
                                    onChange={(val) => setController({ ...controller, durationCapTwo: val })}
                                    className="font-mono text-xs"
                                    step={step}
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="opacity-50">3P+</span>
                                <DurationInlineInput 
                                    minutes={controller.durationCapThree}
                                    onChange={(val) => setController({ ...controller, durationCapThree: val })}
                                    className="font-mono text-xs"
                                    step={step}
                                />
                            </div>
                            <span className="text-muted-foreground/40 font-normal">•</span>
                            
                            <div className="flex items-center gap-1">
                                <span className="opacity-50">GAP</span>
                                <InlineInput
                                    value={controller.gapMinutes || 0}
                                    onChange={(val) => setController({ ...controller, gapMinutes: parseInt(val) || 0 })}
                                    type="number"
                                    suffix="m"
                                    className="font-mono text-xs"
                                    width="w-14"
                                    min={0}
                                    step={step}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                <motion.div
                    animate={{ rotate: isCollapsed ? 0 : 180 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors"
                >
                    <AVerticalShape size={16} />
                </motion.div>
            </div>

            <AnimatePresence initial={false}>
                {!isCollapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-2">
                            <EventSettingController controller={controller} onControllerChange={setController} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Dropdown
                isOpen={isLocationOpen}
                onClose={() => setIsLocationOpen(false)}
                items={locationOptions}
                triggerRef={locationRef}
                align="left"
            />
        </div>
    );
}
