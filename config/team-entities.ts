/**
 * Team Entities - Simplified rainbow for the /team page
 * Based on the 6 pillars + school
 */

import AdminIcon from "../public/appSvgs/AdminIcon.jsx";
import HelmetIcon from "../public/appSvgs/HelmetIcon.jsx";
import HeadsetIcon from "../public/appSvgs/HeadsetIcon.jsx";
import BookingIcon from "../public/appSvgs/BookingIcon.jsx";
import EquipmentIcon from "../public/appSvgs/EquipmentIcon.jsx";
import PackageIcon from "../public/appSvgs/PackageIcon.jsx";

export const TEAM_COLORS: Record<string, { fill: string; hoverFill: string }> = {
    "grey": { fill: "#9ca3af", hoverFill: "#6b7280" },
    "yellow": { fill: "#eab308", hoverFill: "#ca8a04" },
    "green": { fill: "#4ade80", hoverFill: "#22c55e" },
    "blue": { fill: "#93c5fd", hoverFill: "#3b82f6" },
    "purple": { fill: "#c084fc", hoverFill: "#a855f7" },
    "orange": { fill: "#fb923c", hoverFill: "#f97316" },
    "red": { fill: "#ef4444", hoverFill: "#dc2626" },
};

export interface TeamEntity {
    id: string;
    name: string;
    colorKey: keyof typeof TEAM_COLORS;
    icon: React.ComponentType<any>;
    description: string;
}

export const TEAM_ENTITIES: TeamEntity[] = [
    {
        id: "school",
        name: "Schools",
        colorKey: "grey",
        icon: AdminIcon,
        description: "We Help You Scale",
    },
    {
        id: "student",
        name: "Students",
        colorKey: "yellow",
        icon: HelmetIcon,
        description: "Registration & tracking",
    },
    {
        id: "teacher",
        name: "Teachers",
        colorKey: "green",
        icon: HeadsetIcon,
        description: "Hours & commissions",
    },
    {
        id: "booking",
        name: "Bookings",
        colorKey: "blue",
        icon: BookingIcon,
        description: "Smart scheduling",
    },
    {
        id: "equipment",
        name: "Equipment",
        colorKey: "purple",
        icon: EquipmentIcon,
        description: "Lifecycle management",
    },
    {
        id: "schoolPackage",
        name: "Packages",
        colorKey: "orange",
        icon: PackageIcon,
        description: "Set your prices",
    },
    {
        id: "rental",
        name: "Rentals",
        colorKey: "red",
        icon: HelmetIcon,
        description: "Equipment hire",
    },
];
