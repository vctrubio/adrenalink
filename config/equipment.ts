import KiteIcon from "../public/appSvgs/Equipments/KiteIcon.jsx";
import WingIcon from "../public/appSvgs/Equipments/WingIcon.jsx";
import WindsurfIcon from "../public/appSvgs/Equipments/WindsurfIcon.jsx";

export type EquipmentCategoryConfig = {
    id: string;
    name: string;
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
};

export const EQUIPMENT_CATEGORIES: EquipmentCategoryConfig[] = [
    {
        id: "kite",
        name: "Kite",
        icon: KiteIcon,
        color: "text-purple-500",
        bgColor: "bg-purple-300",
    },
    {
        id: "wing",
        name: "Wing",
        icon: WingIcon,
        color: "text-purple-600",
        bgColor: "bg-purple-400",
    },
    {
        id: "windsurf",
        name: "Windsurf",
        icon: WindsurfIcon,
        color: "text-purple-700",
        bgColor: "bg-purple-500",
    },
] as const;
