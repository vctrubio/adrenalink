"use client";

import { memo } from "react";

export interface IconOption {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
}

interface FormIconSelectProps {
    options: IconOption[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const FormIconSelect = memo(function FormIconSelect({
    options,
    value,
    onChange,
    disabled = false,
}: FormIconSelectProps) {
    return (
        <div className="grid grid-cols-3 gap-2">
            {options.map((opt) => {
                const Icon = opt.icon;
                const isSelected = value === opt.id;
                return (
                    <button
                        key={opt.id}
                        type="button"
                        onClick={() => !disabled && onChange(opt.id)}
                        disabled={disabled}
                        className={`
                            p-3 border-2 rounded-xl transition-all flex flex-col items-center gap-1.5
                            ${
                                isSelected
                                    ? "bg-selection border-selection-border shadow-sm"
                                    : "border-border bg-background hover:border-zinc-200 dark:hover:border-zinc-700"
                            }
                            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        `}
                    >
                        <div
                            className="w-8 h-8 flex items-center justify-center"
                            style={{ color: isSelected ? "inherit" : "#94a3b8" }}
                        >
                            <Icon className="w-8 h-8" />
                        </div>
                        <div className="font-black text-[10px] uppercase tracking-widest">{opt.name}</div>
                    </button>
                );
            })}
        </div>
    );
});

export default FormIconSelect;
