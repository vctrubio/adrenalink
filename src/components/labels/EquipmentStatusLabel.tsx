"use client";

import { useState, useRef } from "react";
import { ChevronDown, Check, Settings, Trash2, ShoppingCart, User, AlertCircle, Package } from "lucide-react";
import { EQUIPMENT_STATUS_CONFIG, type EquipmentStatus } from "@/types/status";
import { updateEquipmentStatus } from "@/supabase/server/equipment-status";
import { Dropdown } from "@/src/components/ui/dropdown";
import toast from "react-hot-toast";

interface EquipmentStatusLabelProps {
    equipmentId: string;
    status: string;
}

const ICON_MAP: Record<string, any> = {
    rental: Package,
    public: User,
    selling: ShoppingCart,
    sold: Trash2,
    inrepair: Settings,
    rip: AlertCircle,
};

export function EquipmentStatusLabel({ equipmentId, status }: EquipmentStatusLabelProps) {
    const [isPending, setIsPending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const currentStatus = status.toLowerCase() as EquipmentStatus;
    const config = EQUIPMENT_STATUS_CONFIG[currentStatus] || { label: status, color: "#6b7280" };

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === status) return;

        setIsPending(true);
        setIsOpen(false);

        const result = await updateEquipmentStatus(equipmentId, newStatus);

        if (result.success) {
            toast.success(`Equipment status updated to ${newStatus}`);
        } else {
            toast.error(result.error || "Failed to update status");
        }

        setIsPending(false);
    };

    const dropdownItems = Object.entries(EQUIPMENT_STATUS_CONFIG).map(([key, cfg]) => ({
        label: cfg.label,
        icon: ICON_MAP[key] || Check,
        onClick: () => handleStatusChange(key),
        className: currentStatus === key ? "bg-accent" : "",
    }));

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border transition-all ${isPending ? "opacity-50 cursor-wait" : "hover:opacity-80"}`}
                style={{
                    backgroundColor: `${config.color}15`,
                    color: config.color,
                    borderColor: `${config.color}30`,
                }}
            >
                <span>{config.label}</span>
                <ChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} items={dropdownItems} triggerRef={triggerRef} align="right" />
        </div>
    );
}
