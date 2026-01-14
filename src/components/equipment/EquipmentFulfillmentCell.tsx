"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Activity, Check } from "lucide-react";
import Image from "next/image";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { useEquipment } from "@/src/hooks/useEquipment";
import { updateEventStatus } from "@/supabase/server/classboard";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { BrandSizeCategoryList } from "@/src/components/ui/badge/brand-size-category";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { getHMDuration } from "@/getters/duration-getter";

interface EquipmentFulfillmentCellProps {
    eventId: string;
    equipments?: { id: string; brand: string; model: string; size: number | null; sku?: string; color?: string }[];
    categoryId?: string;
    teacherId?: string;
    teacherUsername?: string;
    eventTime?: string;
    eventDuration?: number;
    eventStatus?: string;
    onUpdate?: (eventId: string, equipment: any) => void;
}

export function EquipmentFulfillmentCell({
    eventId,
    equipments,
    categoryId,
    teacherId,
    teacherUsername,
    eventTime,
    eventDuration,
    eventStatus,
    onUpdate,
}: EquipmentFulfillmentCellProps) {
    const { availableEquipment, fetchAvailable, assign } = useEquipment(categoryId || "");
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === categoryId);
    const CategoryIcon = equipmentConfig?.icon || Activity;

    const handleAssign = async (equipment: any) => {
        const success = await assign(eventId, equipment.id);
        if (success) {
            // Only update event status if it's not already completed
            if (eventStatus !== "completed") {
                await updateEventStatus(eventId, "completed");
            }
            onUpdate?.(eventId, equipment);
            setIsOpen(false);
        }
    };

    if (equipments && equipments.length > 0) {
        return <BrandSizeCategoryList equipments={equipments} />;
    }

    if (!categoryId) return null;

    const dropdownItems: DropdownItemProps[] = [
        {
            id: "header",
            label: (
                <div className="flex items-center gap-3 leading-none">
                    {teacherUsername && <span className="font-bold">{teacherUsername}</span>}
                    {eventTime && (
                        <div className="flex items-center gap-1 text-muted-foreground text-[10px] leading-none py-0.5">
                            <FlagIcon size={12} className="opacity-70" />
                            <span className="translate-y-[0.5px]">{eventTime}</span>
                        </div>
                    )}
                    {eventDuration && (
                        <div className="flex items-center gap-1 text-muted-foreground text-[10px] leading-none py-0.5">
                            <DurationIcon size={12} className="opacity-70" />
                            <span className="translate-y-[0.5px]">{getHMDuration(eventDuration)}</span>
                        </div>
                    )}
                </div>
            ) as any,
            icon: () => (
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-border/50 shadow-sm">
                    <Image src="/prototypes/north-icon.png" alt="North" fill className="object-cover" />
                </div>
            ),
            color: "#16a34a",
            disabled: true,
        },
        ...availableEquipment
            .sort((a, b) => {
                const aPreferred = teacherId ? a.teacher_equipment?.some((te: any) => te.teacher_id === teacherId) : false;
                const bPreferred = teacherId ? b.teacher_equipment?.some((te: any) => te.teacher_id === teacherId) : false;
                if (aPreferred && !bPreferred) return -1;
                if (!aPreferred && bPreferred) return 1;
                return 0;
            })
            .map((eq) => {
                const isPreferred = teacherId ? eq.teacher_equipment?.some((te: any) => te.teacher_id === teacherId) : false;
                return {
                    id: eq.id,
                    label: (
                        <div className={`inline-block ${isPreferred ? "border-b-[1.5px] border-primary/50" : ""}`}>
                            <span className="font-bold text-foreground/90">
                                {eq.brand} {eq.model}
                                {eq.size ? ` (${eq.size})` : ""}
                            </span>
                        </div>
                    ) as any,
                    description: `SKU: ${eq.sku}${eq.color ? ` • ${eq.color}` : ""}`,
                    icon: CategoryIcon,
                    color: "rgb(var(--muted-foreground))",
                    onClick: () => handleAssign(eq),
                };
            }),
    ];

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isOpen) fetchAvailable();
                    setIsOpen(!isOpen);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/30 border border-border/50 hover:bg-muted/50 text-muted-foreground transition-all group"
            >
                <Plus size={12} className="group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest">N/A</span>
            </button>

            {isOpen && (
                <Dropdown
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    items={dropdownItems}
                    align="right"
                    triggerRef={triggerRef}
                />
            )}
        </div>
    );
}