import type { RainbowColor } from "@/app/(playground)/rainbow/Rainbow";

// Maps entity colors (from entities.ts) to rainbow base colors
export const entityColorToRainbow: Record<string, RainbowColor> = {
    "text-purple-500": "purple",
    "text-pink-500": "purple",
    "text-blue-500": "blue",
    "text-cyan-500": "blue",
    "text-foreground": "blue",
    "text-green-500": "green",
    "text-emerald-500": "green",
    "text-yellow-500": "yellow",
    "text-amber-500": "yellow",
    "text-amber-600": "yellow",
    "text-orange-400": "orange",
    "text-orange-500": "orange",
    "text-red-500": "red",
    "text-gray-500": "grey",
    "text-slate-500": "grey",
    "text-indigo-500": "grey",
    "text-sand-600": "grey",
    "text-sand-800": "grey",
};

// Base colors for the rainbow arcs
export const rainbowBaseColors: Record<RainbowColor, { fill: string; hoverFill: string }> = {
    purple: { fill: "#a855f7", hoverFill: "#d946ef" },
    blue: { fill: "#3b82f6", hoverFill: "#1d4ed8" },
    green: { fill: "#22c55e", hoverFill: "#16a34a" },
    yellow: { fill: "#eab308", hoverFill: "#ca8a04" },
    orange: { fill: "#f97316", hoverFill: "#ea580c" },
    red: { fill: "#ef4444", hoverFill: "#dc2626" },
    grey: { fill: "#6b7280", hoverFill: "#4b5563" },
};
