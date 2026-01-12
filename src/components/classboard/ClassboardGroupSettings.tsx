"use client";

import { Minus, Plus, User, Users, Users2 } from "lucide-react";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import type { ControllerSettings } from "@/backend/classboard/TeacherQueue";

export default function ClassboardGroupSettings() {
    const { globalFlag } = useClassboardContext();
    const controller = globalFlag.getController();
    const step = controller.stepDuration || 15;

    const updateDuration = (key: keyof ControllerSettings, delta: number) => {
        const currentValue = (controller[key] as number) || 0;
        const newValue = Math.max(0, currentValue + delta);
        globalFlag.updateController({ [key]: newValue });
    };

    const formatDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    return (
        <div className="flex-1 grid grid-cols-3 divide-x divide-border/30 h-full">
            {/* Column 1: Single (1 Person) */}
            <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 p-1 sm:p-2 h-full">
                <div className="flex items-center gap-2 text-muted-foreground opacity-60">
                    <User size={16} className="shrink-0" />
                    <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline">1 Person</span>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2 w-full justify-center">
                    <button
                        onClick={() => updateDuration("durationCapOne", -step)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors active:scale-95"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="text-sm sm:text-lg font-bold text-foreground w-16 text-center font-mono">
                        {formatDuration(controller.durationCapOne)}
                    </span>
                    <button
                        onClick={() => updateDuration("durationCapOne", step)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors active:scale-95"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            {/* Column 2: Double (2 People) */}
            <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 p-1 sm:p-2 h-full">
                <div className="flex items-center gap-2 text-muted-foreground opacity-60">
                    <Users2 size={16} className="shrink-0" />
                    <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline">2 People</span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 w-full justify-center">
                    <button
                        onClick={() => updateDuration("durationCapTwo", -step)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors active:scale-95"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="text-sm sm:text-lg font-bold text-foreground w-16 text-center font-mono">
                        {formatDuration(controller.durationCapTwo)}
                    </span>
                    <button
                        onClick={() => updateDuration("durationCapTwo", step)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors active:scale-95"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            {/* Column 3: Group (3+ People) */}
            <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 p-1 sm:p-2 h-full">
                <div className="flex items-center gap-2 text-muted-foreground opacity-60">
                    <Users size={16} className="shrink-0" />
                    <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline">3+ People</span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 w-full justify-center">
                    <button
                        onClick={() => updateDuration("durationCapThree", -step)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors active:scale-95"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="text-sm sm:text-lg font-bold text-foreground w-16 text-center font-mono">
                        {formatDuration(controller.durationCapThree)}
                    </span>
                    <button
                        onClick={() => updateDuration("durationCapThree", step)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors active:scale-95"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
