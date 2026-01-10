"use client";

import { ChevronUp, ChevronDown, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface ClockInputProps {
    time: string; // "HH:MM"
    onChange: (newTime: string) => void;
    step: number;
}

export function ClockInput({ time, onChange, step }: ClockInputProps) {
    const [hStr, mStr] = time.split(":");
    const hours = parseInt(hStr) || 0;
    const minutes = parseInt(mStr) || 0;

    const pad = (n: number) => n.toString().padStart(2, "0");

    const updateHours = (delta: number) => {
        let newH = (hours + delta) % 24;
        if (newH < 0) newH += 24;
        onChange(`${pad(newH)}:${pad(minutes)}`);
    };

    const updateMinutes = (delta: number) => {
        let newTotalMins = hours * 60 + minutes + delta;

        // Handle full day wrap around
        const MINUTES_IN_DAY = 24 * 60;
        newTotalMins = ((newTotalMins % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;

        const newH = Math.floor(newTotalMins / 60);
        const newM = newTotalMins % 60;

        onChange(`${pad(newH)}:${pad(newM)}`);
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider ml-1">Start Time</label>
            <div className="flex items-center justify-center bg-background/50 border border-border/40 rounded-xl p-3 shadow-inner">
                {/* Hours */}
                <div className="flex flex-col items-center">
                    <button
                        onClick={() => updateHours(1)}
                        className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronUp size={16} />
                    </button>
                    <div className="text-3xl font-mono font-bold tracking-wider text-foreground w-16 text-center select-none">
                        {pad(hours)}
                    </div>
                    <button
                        onClick={() => updateHours(-1)}
                        className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronDown size={16} />
                    </button>
                </div>

                <div className="text-2xl font-bold text-muted-foreground/40 pb-1 mx-1">:</div>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                    <button
                        onClick={() => updateMinutes(step)}
                        className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronUp size={16} />
                    </button>
                    <div className="text-3xl font-mono font-bold tracking-wider text-foreground w-16 text-center select-none">
                        {pad(minutes)}
                    </div>
                    <button
                        onClick={() => updateMinutes(-step)}
                        className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
