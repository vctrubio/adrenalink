"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";
import { getHMDuration } from "@/getters/duration-getter";
import { Settings2, MapPin, Clock, Minus, Plus, Calendar, Hash, Users, Zap } from "lucide-react";
import ExportSettingController from "./ExportSettingController";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import type { TeacherQueue, ControllerSettings } from "@/src/app/(admin)/(classboard)/TeacherQueue";

interface ClassboardFooterV2Props {
    controller: ControllerSettings;
    setController: (c: ControllerSettings) => void;
    selectedDate: string;
    teacherQueues: TeacherQueue[];
}

export default function ClassboardFooterV2({
    controller,
    setController,
    selectedDate,
    teacherQueues,
}: ClassboardFooterV2Props) {
    const [isOpen, setIsOpen] = useState(false);

    const updateTime = (minutesToAdd: number) => {
        const [h, m] = controller.submitTime.split(":").map(Number);
        const totalMins = h * 60 + m + minutesToAdd;
        const newH = Math.floor((totalMins + 1440) / 60) % 24;
        const newM = (totalMins + 1440) % 60;
        setController({
            ...controller,
            submitTime: `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`,
        });
    };

    const updateDuration = (key: keyof ControllerSettings, delta: number) => {
        const current = controller[key] as number;
        const newValue = Math.max(15, current + delta);
        setController({ ...controller, [key]: newValue });
    };
    
    const updateGap = (delta: number) => {
        setController({ ...controller, gapMinutes: Math.max(0, (controller.gapMinutes || 0) + delta) });
    }

    const updateStep = (delta: number) => {
         setController({ ...controller, stepDuration: Math.max(5, (controller.stepDuration || 15) + delta) });
    }

    return (
        <div className="rounded-t-xl overflow-hidden border-t border-x border-border/30 bg-card shadow-sm mt-auto">
            {/* Toggle Header */}
            <div
                className="px-4 py-3 flex items-center justify-between cursor-pointer transition-all select-none group hover:bg-muted/30"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Summary Info */}
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-foreground font-mono font-medium">
                        <Clock size={14} className="text-muted-foreground" />
                        {controller.submitTime}
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground hidden sm:flex">
                        <MapPin size={14} />
                        {controller.location}
                    </div>

                     <div className="hidden md:flex items-center gap-2 text-muted-foreground font-mono text-xs">
                        <DurationIcon size={12} className="text-muted-foreground/50 mr-1" />
                        <span>1P:{getHMDuration(controller.durationCapOne)}</span>
                        <span className="text-muted-foreground/20 mx-1">|</span>
                        <span>2P:{getHMDuration(controller.durationCapTwo)}</span>
                        <span className="text-muted-foreground/20 mx-1">|</span>
                        <span>3+:{getHMDuration(controller.durationCapThree)}</span>
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
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden border-t border-border/20"
                    >
                        <div className="p-8 space-y-10 bg-gradient-to-b from-card to-background/50">
                            
                            {/* Main Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                                
                                {/* 1. General Settings */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3 border-b border-border/10 pb-2">
                                        <div className="p-1.5 rounded-lg bg-primary/5">
                                            <Settings2 size={16} className="text-primary/70" />
                                        </div>
                                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/80">
                                            Identity
                                        </h4>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {/* Time */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider ml-1">Start Time</label>
                                            <div className="flex items-center gap-1.5">
                                                 <button onClick={() => updateTime(-(controller.stepDuration || 15))} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-border/40 hover:border-border/80"><Minus size={14}/></button>
                                                 <input 
                                                    type="time" 
                                                    value={controller.submitTime}
                                                    onChange={(e) => setController({ ...controller, submitTime: e.target.value })}
                                                    className="flex-1 bg-background/50 border border-border/40 rounded-lg px-3 py-2 text-center text-sm font-mono focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                                                 />
                                                 <button onClick={() => updateTime((controller.stepDuration || 15))} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-border/40 hover:border-border/80"><Plus size={14}/></button>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider ml-1">Location</label>
                                            <select 
                                                value={controller.location}
                                                onChange={(e) => setController({ ...controller, location: e.target.value })}
                                                className="w-full bg-background/50 border border-border/40 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary/30 outline-none cursor-pointer transition-all"
                                            >
                                                <option value="BEACH">BEACH</option>
                                                <option value="FLAT">FLAT</option>
                                                <option value="BOAT">BOAT</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Grid Settings */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3 border-b border-border/10 pb-2">
                                        <div className="p-1.5 rounded-lg bg-primary/5">
                                            <Hash size={16} className="text-primary/70" />
                                        </div>
                                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/80">
                                            Structure
                                        </h4>
                                    </div>
                                    
                                    <div className="space-y-4">
                                         {/* Gap */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider ml-1">Gap Interval</label>
                                            <div className="flex items-center gap-1.5">
                                                 <button onClick={() => updateGap(-5)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-border/40"><Minus size={14}/></button>
                                                 <div className="flex-1 bg-background/50 border border-border/40 rounded-lg px-3 py-2 text-center text-sm font-mono flex items-center justify-center gap-2">
                                                     <Clock size={12} className="text-muted-foreground/40" />
                                                     {controller.gapMinutes || 0}m
                                                 </div>
                                                 <button onClick={() => updateGap(5)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-border/40"><Plus size={14}/></button>
                                            </div>
                                        </div>

                                        {/* Step */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider ml-1">Step precision</label>
                                            <div className="flex items-center gap-1.5">
                                                 <button onClick={() => updateStep(-5)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-border/40"><Minus size={14}/></button>
                                                 <div className="flex-1 bg-background/50 border border-border/40 rounded-lg px-3 py-2 text-center text-sm font-mono flex items-center justify-center gap-2">
                                                     <Zap size={12} className="text-muted-foreground/40" />
                                                     {controller.stepDuration || 15}m
                                                 </div>
                                                 <button onClick={() => updateStep(5)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all border border-border/40"><Plus size={14}/></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Duration Caps */}
                                <div className="space-y-5 col-span-1 md:col-span-2">
                                    <div className="flex items-center gap-3 border-b border-border/10 pb-2">
                                        <div className="p-1.5 rounded-lg bg-primary/5">
                                            <Users size={16} className="text-primary/70" />
                                        </div>
                                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/80">
                                            Capacity Limitations
                                        </h4>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-6">
                                        {/* 1 Person */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block text-center">1 Person</label>
                                            <div className="flex items-center gap-1.5">
                                                 <button onClick={() => updateDuration('durationCapOne', -(controller.stepDuration || 15))} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all border border-border/40"><Minus size={12}/></button>
                                                 <div className="flex-1 bg-background/50 border border-border/40 rounded-lg px-1 py-2 text-center text-[11px] font-mono flex items-center justify-center gap-1.5">
                                                     <DurationIcon size={12} className="text-primary/50" />
                                                     {getHMDuration(controller.durationCapOne)}
                                                 </div>
                                                 <button onClick={() => updateDuration('durationCapOne', (controller.stepDuration || 15))} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all border border-border/40"><Plus size={12}/></button>
                                            </div>
                                        </div>
                                         {/* 2 People */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block text-center">2 People</label>
                                            <div className="flex items-center gap-1.5">
                                                 <button onClick={() => updateDuration('durationCapTwo', -(controller.stepDuration || 15))} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all border border-border/40"><Minus size={12}/></button>
                                                 <div className="flex-1 bg-background/50 border border-border/40 rounded-lg px-1 py-2 text-center text-[11px] font-mono flex items-center justify-center gap-1.5">
                                                     <DurationIcon size={12} className="text-primary/50" />
                                                     {getHMDuration(controller.durationCapTwo)}
                                                 </div>
                                                 <button onClick={() => updateDuration('durationCapTwo', (controller.stepDuration || 15))} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all border border-border/40"><Plus size={12}/></button>
                                            </div>
                                        </div>
                                         {/* 3+ People */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block text-center">3+ People</label>
                                            <div className="flex items-center gap-1.5">
                                                 <button onClick={() => updateDuration('durationCapThree', -(controller.stepDuration || 15))} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all border border-border/40"><Minus size={12}/></button>
                                                 <div className="flex-1 bg-background/50 border border-border/40 rounded-lg px-1 py-2 text-center text-[11px] font-mono flex items-center justify-center gap-1.5">
                                                     <DurationIcon size={12} className="text-primary/50" />
                                                     {getHMDuration(controller.durationCapThree)}
                                                 </div>
                                                 <button onClick={() => updateDuration('durationCapThree', (controller.stepDuration || 15))} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all border border-border/40"><Plus size={12}/></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Export Section */}
                            <div className="pt-8 border-t border-border/10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-1.5 rounded-lg bg-primary/5">
                                        <Calendar size={16} className="text-primary/70" />
                                    </div>
                                    <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/80">
                                        Intelligence & Reporting
                                    </h4>
                                </div>
                                <div className="bg-background/30 rounded-2xl p-6 border border-border/30">
                                    <ExportSettingController selectedDate={selectedDate} teacherQueues={teacherQueues} />
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
