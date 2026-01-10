"use client";

interface StatusToggleProps {
    isActive: boolean;
    onToggle: (active: boolean) => void;
    color?: string;
    disabled?: boolean;
    className?: string;
}

export function StatusToggle({ isActive, onToggle, color = "#9ca3af", disabled = false, className = "" }: StatusToggleProps) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                if (!disabled) {
                    onToggle(!isActive);
                }
            }}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            style={{ backgroundColor: isActive ? color : "rgba(255, 255, 255, 0.1)" }}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    isActive ? "translate-x-6" : "translate-x-1"
                }`}
            />
        </button>
    );
}
