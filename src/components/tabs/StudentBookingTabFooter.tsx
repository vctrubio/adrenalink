"use client";

import FlagIcon from "@/public/appSvgs/FlagIcon";
import { Settings } from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import type { ActiveBookingModel } from "@/backend/models/ActiveBookingModel";

export type TabType = "equipment" | "events" | "settings" | null;

interface StudentBookingTabFooterProps {
    booking: ActiveBookingModel;
    activeTab: TabType;
    onTabClick: (tab: TabType) => void;
}

// Equipment Footer Button
const EquipmentFooterButton = ({ categoryEquipment, capacity, isActive, onClick }: { categoryEquipment: "kite" | "wing" | "windsurf"; capacity: number; isActive: boolean; onClick: () => void }) => {
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === categoryEquipment);
    const EquipmentIcon = equipmentConfig?.icon;
    const equipmentColor = equipmentConfig?.color;
    const displayName = capacity > 1 ? `${categoryEquipment} (x${capacity})` : categoryEquipment;

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"}`}
            style={{ color: isActive ? equipmentColor : undefined }}
        >
            {EquipmentIcon && <EquipmentIcon width={16} height={16} />}
            <span className="capitalize">{displayName}</span>
        </button>
    );
};

// Events Footer Button
const EventsFooterButton = ({ eventCount, isActive, onClick }: { eventCount: number; isActive: boolean; onClick: () => void }) => {
    return (
        <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"}`}>
            <FlagIcon size={16} />
            <span>{eventCount} events</span>
        </button>
    );
};

// Settings Footer Button
const SettingsFooterButton = ({ isActive, onClick }: { isActive: boolean; onClick: () => void }) => {
    return (
        <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ml-auto ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"}`}>
            <Settings size={16} />
        </button>
    );
};

export const StudentBookingTabFooter = ({ booking, activeTab, onTabClick }: StudentBookingTabFooterProps) => {
    const handleTabClick = (tab: TabType) => {
        onTabClick(activeTab === tab ? null : tab);
    };

    return (
        <div className="border-t border-border">
            <div className="flex items-center">
                <EquipmentFooterButton categoryEquipment={booking.package.categoryEquipment} capacity={booking.package.capacityStudents} isActive={activeTab === "equipment"} onClick={() => handleTabClick("equipment")} />
                <EventsFooterButton eventCount={booking.events.length} isActive={activeTab === "events"} onClick={() => handleTabClick("events")} />
                <SettingsFooterButton isActive={activeTab === "settings"} onClick={() => handleTabClick("settings")} />
            </div>
        </div>
    );
};
