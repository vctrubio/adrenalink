"use client";

import { Hash } from "lucide-react";
import { useState, useEffect } from "react";

interface StepStepperProps {
    value: number;
    onChange: (newValue: number) => void;
    min?: number;
    step?: number;
}

export function StepStepper({ value, onChange, min = 5, step = 5 }: StepStepperProps) {
    const [stepInput, setStepInput] = useState(value.toString());

    // Sync input when value changes externally
    useEffect(() => {
        setStepInput(value.toString());
    }, [value]);

    const handleStepChange = (newValue: string) => {
        setStepInput(newValue);
        const numValue = parseInt(newValue, 10);
        if (!isNaN(numValue) && numValue >= min) {
            onChange(numValue);
        }
    };

    return (
        <div className="bg-muted/30 border-border/30 px-2 py-1 rounded-tl-[1.5rem] border-t border-r flex items-center gap-1.5 shadow-sm">
            <Hash size={12} className="text-muted-foreground/60" />
            <input
                type="number"
                min={min}
                step={step}
                value={stepInput}
                onChange={(e) => handleStepChange(e.target.value)}
                onBlur={(e) => {
                    const numValue = parseInt(e.target.value, 10);
                    if (isNaN(numValue) || numValue < min) {
                        setStepInput(value.toString());
                    }
                }}
                className="w-10 text-xs font-bold text-muted-foreground bg-transparent border-none outline-none text-center font-mono"
            />
            <span className="text-[10px] text-muted-foreground/60 font-semibold">m</span>
        </div>
    );
}
