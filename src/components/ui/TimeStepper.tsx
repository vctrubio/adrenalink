"use client";

import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

// Helper to format numbers with leading zero
const pad = (n: number) => n.toString().padStart(2, "0");

interface TimeStepperProps {
    value: number; // Total minutes
    onChange: (newValue: number) => void;
    step: number;
    label?: string;
}

export function TimeStepper({ value, onChange, step, label }: TimeStepperProps) {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;

    const updateHours = (delta: number) => {
        const newHours = Math.max(0, hours + delta);
        onChange(newHours * 60 + minutes);
    };

    const updateMinutes = (delta: number) => {
        let newTotal = value + delta;
        // Ensure strictly positive and handle rollover if needed (though usually duration is just positive)
        if (newTotal < 0) newTotal = 0;
        onChange(newTotal);
    };

    // For direct input
    const handleHourInput = (val: string) => {
        const h = parseInt(val) || 0;
        onChange(h * 60 + minutes);
    };

    const handleMinuteInput = (val: string) => {
        const m = parseInt(val) || 0;
        onChange(hours * 60 + m);
    };

    return (
        <div className="flex flex-col items-center gap-2">
            {label && <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</span>}
            <div className="flex items-center gap-2 bg-muted/20 p-1.5 rounded-xl border border-border/40">
                {/* Hours Group */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={() => updateHours(1)}
                        className="h-6 w-full flex items-center justify-center rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Plus size={10} strokeWidth={3} />
                    </button>

                    <div className="relative group">
                        <input
                            type="text"
                            value={pad(hours)}
                            onChange={(e) => handleHourInput(e.target.value)}
                            className="w-12 text-center bg-transparent text-xl font-mono font-bold text-foreground outline-none focus:text-primary transition-colors"
                        />
                        <span className="absolute -right-2 top-0 text-[10px] text-muted-foreground font-sans font-medium opacity-50">
                            h
                        </span>
                    </div>

                    <button
                        onClick={() => updateHours(-1)}
                        className="h-6 w-full flex items-center justify-center rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Minus size={10} strokeWidth={3} />
                    </button>
                </div>

                <div className="h-8 w-px bg-border/40" />

                {/* Minutes Group */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={() => updateMinutes(step)}
                        className="h-6 w-full flex items-center justify-center rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Plus size={10} strokeWidth={3} />
                    </button>

                    <div className="relative group">
                        <input
                            type="text"
                            value={pad(minutes)}
                            onChange={(e) => handleMinuteInput(e.target.value)}
                            className="w-12 text-center bg-transparent text-xl font-mono font-bold text-foreground outline-none focus:text-primary transition-colors"
                        />
                        <span className="absolute -right-2 top-0 text-[10px] text-muted-foreground font-sans font-medium opacity-50">
                            m
                        </span>
                    </div>

                    <button
                        onClick={() => updateMinutes(-step)}
                        className="h-6 w-full flex items-center justify-center rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Minus size={10} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
}
