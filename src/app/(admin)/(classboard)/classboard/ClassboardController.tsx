"use client";

import EventSettingController from "./EventSettingController";
import type { ControllerSettings as ControllerSettingsType } from "@/backend/TeacherQueue";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, MapPin } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { getPrettyDuration } from "@/getters/duration-getter";
import AVerticalShape from "@/public/shapes/AVerticalShape";

interface ClassboardControllerProps {
    controller: ControllerSettingsType;
    setController: (controller: ControllerSettingsType) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export default function ClassboardController({
    controller,
    setController,
    isCollapsed,
    onToggleCollapse,
}: ClassboardControllerProps) {
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
                        
                        <div className="flex items-center gap-1.5">
                            <FlagIcon size={14} className="text-muted-foreground/60" />
                            <span className="font-mono text-muted-foreground">{controller.submitTime}</span>
                        </div>
                        
                        <span className="text-muted-foreground/40">•</span>
                        
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground/60" />
                            <span className="text-muted-foreground uppercase text-[10px] tracking-wide font-medium">{controller.location}</span>
                        </div>

                        <span className="text-muted-foreground/40">•</span>

                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                            <div className="flex items-center gap-1">
                                <span className="opacity-50">1P</span>
                                <span className="font-mono text-xs">{getPrettyDuration(controller.durationCapOne)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="opacity-50">2P</span>
                                <span className="font-mono text-xs">{getPrettyDuration(controller.durationCapTwo)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="opacity-50">3P+</span>
                                <span className="font-mono text-xs">{getPrettyDuration(controller.durationCapThree)}</span>
                            </div>
                            <span className="text-muted-foreground/40 font-normal">•</span>
                            <div className="flex items-center gap-1">
                                <span className="opacity-50">GAP</span>
                                <span className="font-mono text-xs">{controller.gapMinutes || 0}m</span>
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
        </div>
    );
}
