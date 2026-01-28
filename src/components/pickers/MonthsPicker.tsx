"use client";

import { format, subMonths, addMonths, parseISO } from "date-fns";

export interface MonthRange {
    startMonth: string; // YYYY-MM
    endMonth: string;   // YYYY-MM
}

interface MonthsPickerProps {
    range: MonthRange;
    onChange: (range: MonthRange) => void;
    onMonthClick?: () => void; // Reset selection if range changes
    className?: string;
}

export function MonthsPicker({ range, onChange, onMonthClick, className = "" }: MonthsPickerProps) {
    const updateRange = (start: string, end: string) => {
        onChange({ startMonth: start, endMonth: end });
        if (onMonthClick) onMonthClick();
    };

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateRange(e.target.value, range.endMonth);
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateRange(range.startMonth, e.target.value);
    };

    const adjustMonth = (key: "startMonth" | "endMonth", amount: number) => {
        const current = parseISO(`${range[key]}-01`);
        const next = addMonths(current, amount);
        const nextStr = format(next, "yyyy-MM");
        
        if (key === "startMonth") updateRange(nextStr, range.endMonth);
        else updateRange(range.startMonth, nextStr);
    };

    return (
        <div className={`flex items-center gap-6 ${className}`}>
            {/* Presets - Vertical Stack */}
            <div className="flex flex-col">
                {[11, 5, 2].map((months) => {
                    const end = new Date();
                    const start = subMonths(end, months);
                    const presetStart = format(start, "yyyy-MM");
                    const presetEnd = format(end, "yyyy-MM");
                    const isActive = range.startMonth === presetStart && range.endMonth === presetEnd;

                    return (
                        <button 
                            key={months}
                            onClick={() => updateRange(presetStart, presetEnd)}
                            className={`text-[9px] font-black uppercase transition-colors whitespace-nowrap text-left leading-tight py-0.5 ${
                                isActive ? "text-primary underline underline-offset-2" : "text-muted-foreground hover:text-primary"
                            }`}
                        >
                            Last {months + 1}m
                        </button>
                    );
                })}
            </div>

            {/* Inputs with Nav */}
            <div className="flex items-center gap-4">
                <MonthInputWithNav 
                    label="From" 
                    value={range.startMonth} 
                    onChange={handleStartChange}
                    onPrev={() => adjustMonth("startMonth", -1)}
                    onNext={() => adjustMonth("startMonth", 1)}
                />
                <MonthInputWithNav 
                    label="To" 
                    value={range.endMonth} 
                    onChange={handleEndChange}
                    onPrev={() => adjustMonth("endMonth", -1)}
                    onNext={() => adjustMonth("endMonth", 1)}
                />
            </div>
        </div>
    );
}

function MonthInputWithNav({ label, value, onChange, onPrev, onNext }: any) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
                <div className="flex items-center gap-1.5">
                    <button onClick={onPrev} className="text-[10px] font-black text-muted-foreground hover:text-foreground leading-none">−</button>
                    <button onClick={onNext} className="text-[10px] font-black text-muted-foreground hover:text-foreground leading-none">+</button>
                </div>
            </div>
            <input
                type="month"
                value={value}
                onChange={onChange}
                className="bg-muted/50 border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
        </div>
    );
}