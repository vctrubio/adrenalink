import KitesurfingIcon from "@/public/appSvgs/KitesurfingIcon";
import WingFoilingIcon from "@/public/appSvgs/WingFoilingIcon";
import WindsurfingIcon from "@/public/appSvgs/WindsurfingIcon";
import SurfingIcon from "@/public/appSvgs/SurfingIcon";
import SnowboardingIcon from "@/public/appSvgs/SnowboardingIcon";
import { ComponentType } from "react";

export type EquipmentCategory = "kite" | "wing" | "windsurf" | "surf" | "snowboard";

export interface CategoryConfig {
    id: EquipmentCategory;
    name: string;
    icon: ComponentType<any>;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
}

export const EQUIPMENT_CATEGORIES: CategoryConfig[] = [
    {
        id: "kite",
        name: "Kitesurfing",
        icon: KitesurfingIcon,
        color: "text-blue-800",
        bgColor: "bg-blue-100",
        borderColor: "border-blue-200",
        description: "High-performance kitesurfing with power kites and boards"
    },
    {
        id: "wing",
        name: "Wing Foiling",
        icon: WingFoilingIcon,
        color: "text-purple-800",
        bgColor: "bg-purple-100",
        borderColor: "border-purple-200",
        description: "Innovative wing foiling with handheld wings and hydrofoils"
    },
    {
        id: "windsurf",
        name: "Windsurfing",
        icon: WindsurfingIcon,
        color: "text-cyan-800",
        bgColor: "bg-cyan-100",
        borderColor: "border-cyan-200",
        description: "Classic windsurfing with sail-powered boards"
    },
    {
        id: "surf",
        name: "Surfing",
        icon: SurfingIcon,
        color: "text-green-800",
        bgColor: "bg-green-100",
        borderColor: "border-green-200",
        description: "Traditional surfing on ocean waves"
    },
    {
        id: "snowboard",
        name: "Snowboarding",
        icon: SnowboardingIcon,
        color: "text-orange-800",
        bgColor: "bg-orange-100",
        borderColor: "border-orange-200",
        description: "Mountain snowboarding and terrain park sessions"
    }
];

export const CATEGORY_MAP = EQUIPMENT_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = category;
    return acc;
}, {} as Record<EquipmentCategory, CategoryConfig>);

// Helper functions
export function getCategoryConfig(categoryId: EquipmentCategory): CategoryConfig {
    return CATEGORY_MAP[categoryId] || CATEGORY_MAP.kite; // fallback to kite
}

export function getCategoryIcon(categoryId: EquipmentCategory) {
    return getCategoryConfig(categoryId).icon;
}

export function getCategoryColors(categoryId: EquipmentCategory): {
    color: string;
    bgColor: string;
    borderColor: string;
} {
    const config = getCategoryConfig(categoryId);
    return {
        color: config.color,
        bgColor: config.bgColor,
        borderColor: config.borderColor,
    };
}