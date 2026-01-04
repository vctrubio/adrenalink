"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";
import { getHMDuration } from "@/getters/duration-getter";
import { Settings2, Clock, MapPin, Users, Hash, Minus, Plus } from "lucide-react";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import type { ControllerSettings } from "@/backend/classboard/TeacherQueue";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { TimeStepper } from "@/src/components/ui/TimeStepper";
import { LocationManager } from "@/src/components/ui/LocationManager";
import { ClockInput } from "@/src/components/ui/ClockInput";


/**
 * ClassboardFooter - Reads controller from GlobalFlag (single source of truth)
 */
export default function ClassboardFooter() {
    const { globalFlag, setController } = useClassboardContext();

    // Get controller from GlobalFlag (single source of truth)
    const controller = globalFlag.getController();
    const [isOpen, setIsOpen] = useState(false);

    const step = controller.stepDuration || 15;

    // Handlers
    const updateDuration = (key: keyof ControllerSettings, minutes: number) => {
        setController({ ...controller, [key]: minutes });
    };

    const updateGap = (delta: number) => {
        setController({ ...controller, gapMinutes: Math.max(0, (controller.gapMinutes || 0) + delta) });
    };

    const updateStep = (delta: number) => {
         setController({ ...controller, stepDuration: Math.max(5, (controller.stepDuration || 15) + delta) });
    };

    return (
        <div className="rounded-t-2xl overflow-hidden border-t border-x border-border/30 bg-card/95 backdrop-blur-sm shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] mt-auto z-50">
            {/* Toggle Header */}
            <div
                className="px-6 py-4 flex items-center justify-between cursor-pointer transition-colors select-none group hover:bg-muted/40"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Summary Info */}
                <div className="flex items-center gap-8 text-sm">
                    
                    {/* 1. Time & Location Group */}
                    <div className="flex items-center gap-3 text-foreground/90 font-medium bg-muted/30 px-3 py-1.5 rounded-lg border border-border/20">
                        <Clock size={15} className="text-primary" />
                        <span className="font-mono tracking-wide">{controller.submitTime}</span>
                        <span className="text-border/60">|</span>
                        <MapPin size={15} className="text-primary" />
                        <span className="uppercase tracking-wide text-xs">{controller.location}</span>
                    </div>

                    {/* 2. Group Limitations (Hidden on mobile) */}
                    <div className="hidden md:flex items-center gap-4 text-muted-foreground text-xs font-mono">
                         <div className="flex items-center gap-1.5">
                            <Users size={12} className="opacity-50" />
                            <span>1P:<span className="text-foreground ml-0.5">{getHMDuration(controller.durationCapOne)}</span></span>
                         </div>
                         <div className="w-px h-3 bg-border/50" />
                         <div className="flex items-center gap-1.5">
                            <Users size={12} className="opacity-50" />
                            <span>2P:<span className="text-foreground ml-0.5">{getHMDuration(controller.durationCapTwo)}</span></span>
                         </div>
                         <div className="w-px h-3 bg-border/50" />
                         <div className="flex items-center gap-1.5">
                            <Users size={12} className="opacity-50" />
                            <span>3+:<span className="text-foreground ml-0.5">{getHMDuration(controller.durationCapThree)}</span></span>
                         </div>
                    </div>

                     {/* 3. Gap Interval (Solid) */}
                     <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20 shadow-sm">
                        <DurationIcon size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">Gap: {controller.gapMinutes || 0}m</span>
                     </div>
                </div>

                <ToggleAdranalinkIcon isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} variant="lg" />
            </div>

            {/* Collapsible Content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} // Apple-like ease
                        className="overflow-hidden border-t border-border/20"
                    >
                        <div className="p-8 bg-gradient-to-b from-card/50 to-background/80 space-y-10">
                            
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                
                                {/* Column 1: Identity (Time & Location) - span 4 */}
                                <div className="md:col-span-4 space-y-8 border-r border-border/10 pr-6">
                                    <div className="flex items-center gap-2 text-primary/80 mb-2">
                                        <Settings2 size={16} />
                                        <h4 className="text-xs font-bold uppercase tracking-widest">Settings</h4>
                                    </div>
                                    
                                    <ClockInput 
                                        time={controller.submitTime} 
                                        onChange={(t) => setController({ ...controller, submitTime: t })}
                                        step={step}
                                    />

                                    <div className="pt-2">
                                        <LocationManager 
                                            selected={controller.location}
                                            onSelect={(loc) => setController({ ...controller, location: loc })}
                                        />
                                    </div>
                                </div>

                                {/* Column 2: Structure (Gap & Step) - span 3 */}
                                <div className="md:col-span-3 space-y-8 border-r border-border/10 pr-6">
                                    <div className="flex items-center gap-2 text-primary/80 mb-2">
                                        <Hash size={16} />
                                        <h4 className="text-xs font-bold uppercase tracking-widest">Structure</h4>
                                    </div>

                                    {/* Gap */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider ml-1">Gap Interval</label>
                                        <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-xl border border-border/40 justify-between">
                                             <button onClick={() => updateGap(-5)} className="p-2 hover:bg-background rounded-lg shadow-sm text-muted-foreground hover:text-foreground transition-all"><Minus size={14}/></button>
                                             <span className="font-mono font-bold text-lg">{controller.gapMinutes || 0}m</span>
                                             <button onClick={() => updateGap(5)} className="p-2 hover:bg-background rounded-lg shadow-sm text-muted-foreground hover:text-foreground transition-all"><Plus size={14}/></button>
                                        </div>
                                    </div>

                                    {/* Step */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider ml-1">Precision Step</label>
                                        <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-xl border border-border/40 justify-between">
                                             <button onClick={() => updateStep(-5)} className="p-2 hover:bg-background rounded-lg shadow-sm text-muted-foreground hover:text-foreground transition-all"><Minus size={14}/></button>
                                             <span className="font-mono font-bold text-lg">{controller.stepDuration || 15}m</span>
                                             <button onClick={() => updateStep(5)} className="p-2 hover:bg-background rounded-lg shadow-sm text-muted-foreground hover:text-foreground transition-all"><Plus size={14}/></button>
                                        </div>
                                    </div>
                                </div>

                                {/* Column 3: Capacities - span 5 */}
                                <div className="md:col-span-5 space-y-6">
                                    <div className="flex items-center gap-2 text-primary/80 mb-2">
                                        <Users size={16} />
                                        <h4 className="text-xs font-bold uppercase tracking-widest">Group Limits</h4>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4">
                                        <TimeStepper 
                                            label="1 Person" 
                                            value={controller.durationCapOne} 
                                            onChange={(v) => updateDuration("durationCapOne", v)}
                                            step={step}
                                        />
                                        <TimeStepper 
                                            label="2 People" 
                                            value={controller.durationCapTwo} 
                                            onChange={(v) => updateDuration("durationCapTwo", v)}
                                            step={step}
                                        />
                                        <TimeStepper 
                                            label="3+ People" 
                                            value={controller.durationCapThree} 
                                            onChange={(v) => updateDuration("durationCapThree", v)}
                                            step={step}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
