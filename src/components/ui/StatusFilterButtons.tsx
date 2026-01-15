"use client";

interface StatusFilterButtonsProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    getIcon?: (option: string) => React.ComponentType<any> | null;
}

export function StatusFilterButtons({ options, value, onChange, getIcon }: StatusFilterButtonsProps) {
    return (
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
            {options.map((option, index) => {
                const Icon = getIcon ? getIcon(option) : null;
                return (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        className={`px-3 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                            index > 0 ? "border-l border-border" : ""
                        } ${
                            value === option
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                    >
                        {Icon && <Icon size={14} />}
                        {option}
                    </button>
                );
            })}
        </div>
    );
}
