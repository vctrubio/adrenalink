"use client";

import { Minus, Plus, Timer } from "lucide-react";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import type { ControllerSettings } from "@/backend/classboard/TeacherQueue";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import { TimePicker } from "@/src/components/ui/TimePicker";
import { LocationPicker } from "@/src/components/ui/LocationPicker";
import { MapPin } from "lucide-react";

export default function ClassboardFlagSettings() {
    const { globalFlag } = useClassboardContext();
    const controller = globalFlag.getController();
    
    // Read locations from controller (source of truth)
    const locations = controller.locationOptions || ["Zoom", "In-Person", "Hybrid", "Phone"];

    const handleLocationChange = (newLoc: string) => {
        globalFlag.updateController({ location: newLoc });
    };

    const handleOptionsChange = (newOptions: string[]) => {
        globalFlag.updateController({ locationOptions: newOptions });
    };

    const updateGap = (delta: number) => {
        globalFlag.updateController({ gapMinutes: Math.max(0, (controller.gapMinutes || 0) + delta) });
    };

    return (
        <div className="flex-1 min-w-[280px] border border-border/30 rounded-lg overflow-hidden h-full">
            <div className="grid grid-cols-3 divide-x divide-border/30 h-full">
                {/* Column 1: Flag Time */}
                <div className="flex flex-col items-center justify-center gap-2 p-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <FlagIcon size={16} />
                        <span className="text-[10px] uppercase font-black tracking-widest">Flag Time</span>
                    </div>
                    
                    <div className="flex items-center gap-1 w-full justify-center">
                        <TimePicker 
                            value={controller.submitTime} 
                            onChange={(newTime) => globalFlag.updateController({ submitTime: newTime })} 
                        />
                    </div>
                </div>

                {/* Column 2: Location */}
                <div className="flex flex-col items-center justify-center gap-2 p-2 relative">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={16} />
                        <span className="text-[10px] uppercase font-black tracking-widest">Location</span>
                    </div>

                    <LocationPicker
                        value={controller.location}
                        options={locations}
                        onChange={handleLocationChange}
                        onOptionsChange={handleOptionsChange}
                    />
                </div>

                {/* Column 3: In-Betweens */}
                <div className="flex flex-col items-center justify-center gap-2 p-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Timer size={16} />
                        <span className="text-[10px] uppercase font-black tracking-widest">In-Betweens</span>
                    </div>

                    <div className="flex items-center gap-1 w-full justify-center">
                        <button
                            onClick={() => updateGap(-5)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors active:scale-95 flex-shrink-0"
                        >
                            <Minus size={14} />
                        </button>
                        
                        <div className="bg-muted/50 px-3 py-1 rounded-md border border-transparent transition-all">
                            <span className="text-lg font-bold text-foreground w-12 text-center font-mono">
                                {controller.gapMinutes || 0}m
                            </span>
                        </div>

                        <button
                            onClick={() => updateGap(5)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors active:scale-95 flex-shrink-0"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}