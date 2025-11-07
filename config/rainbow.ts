import { TABLE_CONFIG } from "@/config/tables";
import type { RainbowColor, RainbowShade } from "@/src/components/rainbow/Rainbow";

// Maps entity colors (from entities.ts) to rainbow base colors
// export const entityColorToRainbow: Record<string, RainbowColor> = {
//     "text-purple-500": "purple",
//     "text-pink-500": "purple",
//     "text-blue-500": "blue",
//     "text-cyan-500": "blue",
//     "text-foreground": "blue",
//     "text-green-500": "green",
//     "text-emerald-500": "green",
//     "text-yellow-500": "yellow",
//     "text-amber-500": "yellow",
//     "text-amber-600": "yellow",
//     "text-orange-400": "orange",
//     "text-orange-500": "orange",
//     "text-red-500": "red",
//     "text-gray-500": "grey",
//     "text-slate-500": "grey",
//     "text-indigo-500": "grey",
//     "text-sand-600": "grey",
//     "text-sand-800": "grey",
// };

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

// Shade colors with fill and hover states
export const rainbowColors: Record<RainbowShade, { fill: string; hoverFill: string }> = {
    "purple-0": { fill: "#a855f7", hoverFill: "#d946ef" },
    "purple-1": { fill: "#c084fc", hoverFill: "#e879f9" },
    "blue-0": { fill: "#3b82f6", hoverFill: "#1d4ed8" },
    "blue-1": { fill: "#60a5fa", hoverFill: "#93c5fd" },
    "blue-2": { fill: "#93c5fd", hoverFill: "#3b82f6" },
    "green-0": { fill: "#22c55e", hoverFill: "#16a34a" },
    "green-1": { fill: "#4ade80", hoverFill: "#22c55e" },
    "yellow-0": { fill: "#eab308", hoverFill: "#ca8a04" },
    "orange-0": { fill: "#f97316", hoverFill: "#ea580c" },
    "orange-1": { fill: "#fb923c", hoverFill: "#f97316" },
    "red-0": { fill: "#ef4444", hoverFill: "#dc2626" },
    "grey-0": { fill: "#6b7280", hoverFill: "#4b5563" },
    "grey-1": { fill: "#9ca3af", hoverFill: "#6b7280" },
};

// Entity to rainbow shade mapping -- use entity directly...
export const entityToRainbowColor: Record<string, RainbowShade | null> = {
    equipment: "purple-0",
    repairs: "purple-1",
    booking: "blue-0",
    lesson: "blue-1",
    event: "blue-2",
    teacher: "green-0",
    commission: "green-1",
    student: "yellow-0",
    studentPackage: "orange-0",
    schoolPackage: "orange-1",
    rental: "red-0",
    school: "grey-0",
    referral: "grey-1",
};

// Get rainbow shade for an entity
export const getEntityRainbowShade = (entityId: string): RainbowShade | null => {
    return entityToRainbowColor[entityId] || null;
};

// Color labels and descriptions
export const colorLabels: Record<RainbowColor, { name: string; description: string }> = {
    purple: {
        name: "Equipment",
        description: "We add and track equipment activity throughout bookings.",
    },
    blue: {
        name: "Booking",
        description: "This is the base of the application. Everything in blue will relate to a booking, event, and lesson. More on that soon.",
    },
    green: {
        name: "Teacher",
        description: "Your teachers have commission based salaries. Either fixed per hour, or percentage per hour.",
    },
    yellow: {
        name: "Students",
        description: "Obviously this is clear. They register through your homepage, and can pick packages that are public.",
    },
    orange: {
        name: "Packages",
        description: "Where the math is done, you post your package (price, hours, capacity, equipment), and students make a request.",
    },
    red: {
        name: "Rentals",
        description: "Students that are independent can rent, we track equipment, duration and price of the event.",
    },
    grey: {
        name: "School",
        description: "This is your homebase, start by creating referral codes to know where each package request comes from. More on that here.",
    },
};

// Build color groups from table config
// export const getColorGroups = (hoveredShade: RainbowShade | null) => {
//     const colorGroups: Record<RainbowColor, Array<{ entity: (typeof TABLE_CONFIG)[0]; shade: RainbowShade }>> = {
//         purple: [],
//         blue: [],
//         green: [],
//         yellow: [],
//         orange: [],
//         red: [],
//         grey: [],
//     };
//
//     TABLE_CONFIG.forEach((entity) => {
//         const shade = getEntityRainbowShade(entity.id);
//         if (shade) {
//             const baseColor = shade.split("-")[0] as RainbowColor;
//             if (colorGroups[baseColor]) {
//                 colorGroups[baseColor].push({ entity, shade });
//             }
//         }
//     });
//
//     return colorGroups;
// };
