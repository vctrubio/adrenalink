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
        color: "#a855f7",
        bgColor: "#d8b4fe",
    },
    {
        id: "wing",
        name: "Wing",
        icon: WingIcon,
        color: "#9333ea",
        bgColor: "#c084fc",
    },
    {
        id: "windsurf",
        name: "Windsurf",
        icon: WindsurfIcon,
        color: "#7c3aed",
        bgColor: "#a78bfa",
    },
] as const;
