"use client";

import { Minus, Plus, Clock, MapPin } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import type { ControllerSettings } from "@/backend/classboard/TeacherQueue";

export default function ClassboardFlagSettings() {
    const { globalFlag, setController } = useClassboardContext();
    const controller = globalFlag.getController();
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [dropdownRect, setDropdownRect] = useState({ top: 0, right: 0 });
    const locationRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const updateController = (key: keyof ControllerSettings, value: any) => {
        setController({ ...controller, [key]: value });
    };

    const updateGap = (delta: number) => {
        setController({ ...controller, gapMinutes: Math.max(0, (controller.gapMinutes || 0) + delta) });
    };

    const changeTime = (delta: number) => {
        const [hours, minutes] = controller.submitTime.split(":").map(Number);
        let newHours = hours + delta;

        if (newHours < 0) newHours = 23;
        if (newHours > 23) newHours = 0;

        const formattedTime = `${String(newHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        updateController("submitTime", formattedTime);
    };

    const locations = ["Zoom", "In-Person", "Hybrid", "Phone"];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
                setIsLocationOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isLocationOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownRect({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        }
    }, [isLocationOpen]);

    return (
        <div className="max-w-xs border border-border rounded-lg p-4 m-4">
            <div className="flex gap-4">
                {/* Icon Column */}
                <div className="flex flex-col items-center justify-around py-2">
                    <FlagIcon size={20} className="text-muted-foreground" />
                    <MapPin size={20} className="text-muted-foreground" />
                    <Clock size={20} className="text-muted-foreground" />
                </div>

                {/* Content Column */}
                <div className="flex flex-col flex-1">
                    {/* Row 1 - Start Time */}
                    <div className="flex items-center justify-between gap-2 py-2">
                        <button
                            onClick={() => changeTime(-1)}
                            className="px-2 py-1 rounded hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground"
                            aria-label="Decrease time"
                        >
                            ←
                        </button>

                        <span className="text-sm font-semibold text-foreground text-center flex-1">{controller.submitTime}</span>

                        <button
                            onClick={() => changeTime(1)}
                            className="px-2 py-1 rounded hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground"
                            aria-label="Increase time"
                        >
                            →
                        </button>
                    </div>

                    <div className="border-b border-border" />

                    {/* Row 2 - Location */}
                    <div ref={locationRef} className="relative py-2">
                        <button
                            ref={buttonRef}
                            onClick={() => setIsLocationOpen(!isLocationOpen)}
                            className="w-full text-sm font-semibold text-foreground text-center hover:text-primary transition-colors outline-none"
                        >
                            {controller.location}
                        </button>

                        <AnimatePresence>
                            {isLocationOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="fixed min-w-[140px] bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                                    style={{ top: `${dropdownRect.top}px`, right: `${dropdownRect.right}px` }}
                                >
                                    {locations.map((location) => (
                                        <button
                                            key={location}
                                            onClick={() => {
                                                updateController("location", location);
                                                setIsLocationOpen(false);
                                            }}
                                            className={`w-full px-3 py-2 text-sm text-center transition-colors ${
                                                controller.location === location
                                                    ? "bg-muted/50 font-medium"
                                                    : "hover:bg-muted/30"
                                            }`}
                                        >
                                            {location}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="border-b border-border" />

                    {/* Row 3 - Gap Duration */}
                    <div className="flex items-center justify-between gap-2 py-2">
                        <button
                            onClick={() => updateGap(-5)}
                            className="px-2 py-1 rounded hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground"
                            aria-label="Decrease gap"
                        >
                            <Minus size={14} />
                        </button>

                        <span className="text-sm font-semibold text-foreground text-center flex-1">{controller.gapMinutes || 0}m</span>

                        <button
                            onClick={() => updateGap(5)}
                            className="px-2 py-1 rounded hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground"
                            aria-label="Increase gap"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
