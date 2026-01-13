"use client";

import { Minus, Plus } from "lucide-react";

interface TimePickerProps {
    value: string; // Format "HH:MM"
    onChange: (newValue: string) => void;
    className?: string;
    noBg?: boolean;
}

export function TimePicker({ value, onChange, className = "", noBg = false }: TimePickerProps) {
    const [hStr, mStr] = value.split(":");

    const updateTime = (newH: string, newM: string) => {
        onChange(`${newH}:${newM}`);
    };

    const changeHour = (delta: number) => {
        const h = parseInt(hStr, 10);
        let newHours = h + delta;
        if (newHours < 0) newHours = 23;
        if (newHours > 23) newHours = 0;
        updateTime(String(newHours).padStart(2, "0"), mStr);
    };

    const handleInputChange = (type: "hour" | "minute", inputValue: string) => {
        // Only allow numbers
        const numericValue = inputValue.replace(/\D/g, "").slice(0, 2);
        if (type === "hour") {
            updateTime(numericValue, mStr);
        } else {
            updateTime(hStr, numericValue);
        }
    };

    const handleInputBlur = (type: "hour" | "minute", inputValue: string) => {
        let num = parseInt(inputValue, 10) || 0;
        if (type === "hour") {
            if (num > 23) num = 23;
            updateTime(String(num).padStart(2, "0"), mStr);
        } else {
            if (num > 59) num = 59;
            updateTime(hStr, String(num).padStart(2, "0"));
        }
    };

    return (
        <div className={`flex items-center gap-1 ${className}`}>
            <button
                onClick={() => changeHour(-1)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors active:scale-95 flex-shrink-0"
                type="button"
            >
                <Minus size={14} />
            </button>

            <div
                className={`flex items-center px-2 py-1 rounded-md border border-transparent focus-within:border-primary/30 transition-all ${noBg ? "" : "bg-muted/50"}`}
            >
                <input
                    type="text"
                    value={hStr}
                    onChange={(e) => handleInputChange("hour", e.target.value)}
                    onBlur={(e) => handleInputBlur("hour", e.target.value)}
                    className="w-6 bg-transparent text-center outline-none font-mono font-bold text-lg text-foreground focus:text-primary"
                    maxLength={2}
                />
                <span className="text-muted-foreground font-mono font-bold">:</span>
                <input
                    type="text"
                    value={mStr}
                    onChange={(e) => handleInputChange("minute", e.target.value)}
                    onBlur={(e) => handleInputBlur("minute", e.target.value)}
                    className="w-6 bg-transparent text-center outline-none font-mono font-bold text-lg text-foreground focus:text-primary"
                    maxLength={2}
                />
            </div>

            <button
                onClick={() => changeHour(1)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors active:scale-95 flex-shrink-0"
                type="button"
            >
                <Plus size={14} />
            </button>
        </div>
    );
}
