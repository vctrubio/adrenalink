"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Activity } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { BrandSizeCategoryList } from "@/src/components/ui/badge/brand-size-category";
import { getHMDuration } from "@/getters/duration-getter";
import { useEquipment } from "@/src/hooks/useEquipment";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { updateEventStatus } from "@/supabase/server/classboard";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";

export interface EquipmentFulfillmentProps {
    eventId: string;
    eventTime: string;
    eventDuration: number;
    equipments?: { 
        id: string; 
        brand?: string; 
        model: string; 
        size: number | null; 
        sku?: string; 
        color?: string;
        icon?: React.ComponentType<any>;
    }[];
    categoryId?: string;
    teacherId?: string;
    teacherUsername?: string;
    eventStatus?: string;
    onUpdate?: (eventId: string, equipment: any) => void;
}

export function EquipmentFulfillmentCell({
    eventId,
    eventTime,
    eventDuration,
    equipments,
    categoryId,
    teacherId,
    teacherUsername,
    eventStatus,
    onUpdate,
}: EquipmentFulfillmentProps) {
    const { availableEquipment, fetchAvailable, assign, isLoading } = useEquipment(categoryId || "");
    const [isOpen, setIsOpen] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === categoryId);
    const CategoryIcon = equipmentConfig?.icon || Activity;

    const handleAssign = async (equipment: any) => {
        if (isAssigning) return;
        setIsAssigning(true);
        try {
            const success = await assign(eventId, equipment.id);
            if (success) {
                // Only update event status if it's not already completed
                if (eventStatus !== "completed") {
                    await updateEventStatus(eventId, "completed");
                }
                if (onUpdate) {
                    onUpdate(eventId, equipment);
                }
                setIsOpen(false);
            }
        } catch (error) {
            console.error("Error assigning equipment:", error);
        } finally {
            setIsAssigning(false);
        }
    };

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOpen && !isLoading) {
            try {
                await fetchAvailable();
            } catch (error) {
                console.error("Error fetching available equipment:", error);
            }
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (isOpen && availableEquipment.length > 0 && teacherId) {
            const firstEq = availableEquipment[0];
            console.log(`[EquipmentFulfillmentCell] 🔍 Checking preferred gear for ${teacherUsername} (${teacherId})`, {
                gearRelations: firstEq.teacher_equipment?.map((te: any) => te.teacher_id),
            });
        }
    }, [isOpen, availableEquipment, teacherId, teacherUsername]);

    if (equipments && equipments.length > 0) {
        return (
            <BrandSizeCategoryList
                equipments={equipments.map((eq) => ({
                    id: eq.id,
                    model: eq.brand ? `${eq.brand} ${eq.model}` : eq.model,
                    size: eq.size,
                    icon: eq.icon,
                }))}
                showIcon={true}
            />
        );
    }

    if (!categoryId) {
        return <span className="text-zinc-400 text-[10px] font-bold">N/A</span>;
    }

    // Always allow equipment assignment if equipment is N/A (not assigned)
    // If event is not completed, we'll update status when assigning

    const dropdownItems: DropdownItemProps[] = [
        {
            id: "header",
            label: (
                <div className="flex items-center gap-3 leading-none">
                    {teacherUsername && <span className="font-bold">{teacherUsername}</span>}
                    <div className="flex items-center gap-1 text-muted-foreground text-[10px] leading-none py-0.5">
                        <FlagIcon size={12} className="opacity-70" />
                        <span className="translate-y-[0.5px]">{eventTime}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-[10px] leading-none py-0.5">
                        <DurationIcon size={12} className="opacity-70" />
                        <span className="translate-y-[0.5px]">{getHMDuration(eventDuration)}</span>
                    </div>
                </div>
            ) as any,
            icon: HeadsetIcon,
            color: "#16a34a",
            disabled: true,
        },
        ...(isLoading
            ? [
                  {
                      id: "loading",
                      label: "Loading equipment...",
                      disabled: true,
                  } as DropdownItemProps,
              ]
            : availableEquipment.length === 0
              ? [
                    {
                        id: "no-equipment",
                        label: "No available equipment",
                        disabled: true,
                    } as DropdownItemProps,
                ]
              : availableEquipment
                    .sort((a, b) => {
                        if (!teacherId) return 0;
                        const aPreferred = a.teacher_equipment?.some((te: any) => te.teacher_id === teacherId);
                        const bPreferred = b.teacher_equipment?.some((te: any) => te.teacher_id === teacherId);
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
                            onClick: (e?: React.MouseEvent) => {
                                e?.stopPropagation();
                                handleAssign(eq);
                            },
                            disabled: isAssigning,
                        };
                    })),
    ];

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                onClick={handleToggle}
                disabled={isLoading || isAssigning}
                className="flex items-center gap-1 px-2 py-1 rounded bg-muted/30 border border-border/50 hover:bg-muted/50 text-muted-foreground transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Plus size={12} className="group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                    {isLoading ? "..." : isAssigning ? "..." : "N/A"}
                </span>
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
