"use client";

interface StatusFilterButtonsProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
}

export function StatusFilterButtons({ options, value, onChange }: StatusFilterButtonsProps) {
    return (
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
            {options.map((option, index) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    className={`px-3 py-2 text-xs font-semibold transition-colors ${
                        index > 0 ? "border-l border-border" : ""
                    } ${
                        value === option
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
