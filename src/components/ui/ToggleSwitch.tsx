"use client";

import { Switch } from "@headlessui/react";

interface ToggleSwitchProps {
    value: string;
    onChange: (value: string) => void;
    values: {
        left: string;
        right: string;
    };
    counts: {
        [key: string]: number;
    };
    color: "yellow"; // Can be extended with more colors
}

const colorMap = {
    yellow: {
        bg: "bg-yellow-500",
        ring: "focus:ring-yellow-500",
        text: "text-yellow-600 dark:text-yellow-400",
        bgHover: "bg-yellow-500/20",
    },
};

const ToggleSwitch = ({ value, onChange, values, counts, color }: ToggleSwitchProps) => {
    const isRight = value === values.right;
    const colorClasses = colorMap[color];

    return (
        <div className="flex items-center gap-2">
            <span
                className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold transition-colors ${
                    !isRight ? `${colorClasses.bgHover} ${colorClasses.text}` : "bg-muted text-muted-foreground"
                }`}
            >
                {counts[values.left]}
            </span>

            <Switch
                checked={isRight}
                onChange={(checked) => onChange(checked ? values.right : values.left)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${colorClasses.ring} ${
                    isRight ? colorClasses.bg : "bg-muted-foreground/40"
                }`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${isRight ? "translate-x-6" : "translate-x-1"}`} />
            </Switch>

            <span
                className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold transition-colors ${
                    isRight ? `${colorClasses.bgHover} ${colorClasses.text}` : "bg-muted text-muted-foreground"
                }`}
            >
                {counts[values.right]}
            </span>
        </div>
    );
};

export default ToggleSwitch;

