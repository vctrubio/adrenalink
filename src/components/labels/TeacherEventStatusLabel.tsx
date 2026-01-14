"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { type EventStatus, EVENT_STATUS_CONFIG } from "@/types/status";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { useTeacherEquipment, type TeacherEquipmentItem } from "@/src/hooks/useTeacherEquipment";
import { useEquipment } from "@/src/hooks/useEquipment";
import { updateEventStatus } from "@/supabase/server/classboard";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { Activity, CheckCircle } from "lucide-react";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { getHMDuration } from "@/getters/duration-getter";

interface TeacherEventStatusLabelProps {
    eventId: string;
    status: EventStatus;
    teacherId: string;
    teacherUsername?: string;
    categoryEquipment?: string;
    eventTime?: string;
    eventDuration?: number;
    hasEquipmentAssigned?: boolean;
    onStatusChange?: (newStatus: EventStatus) => void;
    onEquipmentAssign?: (eventId: string, equipment: TeacherEquipmentItem) => void;
    className?: string;
}

export function TeacherEventStatusLabel({
    eventId,
    status,
    teacherId,
    teacherUsername,
    categoryEquipment,
    eventTime,
    eventDuration = 0,
    hasEquipmentAssigned = false,
    onStatusChange,
    onEquipmentAssign,
    className = "",
}: TeacherEventStatusLabelProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const dropdownTriggerRef = useRef<HTMLButtonElement>(null);

    // Fetch teacher's preferred equipment
    const { equipment: teacherEquipment, isLoading: isLoadingTeacherEquipment, fetchEquipment: fetchTeacherEquipment } = useTeacherEquipment(teacherId, categoryEquipment);

    // Fallback to all available equipment if teacher has none
    const { availableEquipment, isLoading: isLoadingAllEquipment, fetchAvailable: fetchAllEquipment, assign } = useEquipment(categoryEquipment || "");

    const statusConfig = EVENT_STATUS_CONFIG[status] || EVENT_STATUS_CONFIG.planned;
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === categoryEquipment);
    const CategoryIcon = equipmentConfig?.icon || Activity;

    const isCompleted = status === "completed";
    const needsEquipment = categoryEquipment && !hasEquipmentAssigned && !isCompleted;
    const isLoading = isLoadingTeacherEquipment || isLoadingAllEquipment;

    // Fetch equipment when dropdown opens
    useEffect(() => {
        if (isDropdownOpen && needsEquipment) {
            fetchTeacherEquipment();
            fetchAllEquipment();
        }
    }, [isDropdownOpen, needsEquipment, fetchTeacherEquipment, fetchAllEquipment]);

    const handleEquipmentSelect = async (equipment: TeacherEquipmentItem) => {
        if (isUpdating) return;
        setIsUpdating(true);

        try {
            // Assign equipment to event
            const success = await assign(eventId, equipment.id);
            if (success) {
                // Update status to completed
                await updateEventStatus(eventId, "completed");
                onEquipmentAssign?.(eventId, equipment);
                onStatusChange?.("completed");
            }
            setIsDropdownOpen(false);
        } catch (error) {
            console.error("Error assigning equipment:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCompleteWithoutEquipment = async () => {
        if (isUpdating) return;
        setIsUpdating(true);

        try {
            await updateEventStatus(eventId, "completed");
            onStatusChange?.("completed");
            setIsDropdownOpen(false);
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleToggle = () => {
        if (isCompleted) return; // Don't open dropdown if completed
        setIsDropdownOpen(!isDropdownOpen);
    };

    // Build dropdown items
    const buildDropdownItems = (): DropdownItemProps[] => {
        const items: DropdownItemProps[] = [];

        // Header with event info
        items.push({
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
                    {eventDuration > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground text-[10px] leading-none py-0.5">
                            <DurationIcon size={12} className="opacity-70" />
                            <span className="translate-y-[0.5px]">{getHMDuration(eventDuration)}</span>
                        </div>
                    )}
                </div>
            ) as any,
            icon: HeadsetIcon,
            color: "#16a34a",
            disabled: true,
        });

        if (needsEquipment) {
            // Show loading state
            if (isLoading) {
                items.push({
                    id: "loading",
                    label: "Loading equipment...",
                    disabled: true,
                });
                return items;
            }

            // Prioritize teacher's equipment, then fall back to all available
            const equipmentList = teacherEquipment.length > 0 ? teacherEquipment : availableEquipment;

            if (equipmentList.length === 0) {
                items.push({
                    id: "no-equipment",
                    label: "No equipment available",
                    disabled: true,
                });
            } else {
                // Add equipment options
                equipmentList.forEach((eq) => {
                    const isPreferred = teacherEquipment.some((te) => te.id === eq.id);
                    items.push({
                        id: eq.id,
                        label: (
                            <div className={`inline-block ${isPreferred ? "border-b-[1.5px] border-primary/50" : ""}`}>
                                <span className="font-bold text-foreground/90">
                                    {eq.brand} {eq.model}
                                    {eq.size ? ` (${eq.size})` : ""}
                                </span>
                            </div>
                        ) as any,
                        description: eq.sku ? `SKU: ${eq.sku}${eq.color ? ` - ${eq.color}` : ""}` : undefined,
                        icon: CategoryIcon,
                        color: "rgb(var(--muted-foreground))",
                        onClick: (e?: React.MouseEvent) => {
                            e?.stopPropagation();
                            handleEquipmentSelect(eq);
                        },
                        disabled: isUpdating,
                    });
                });
            }

            // Add option to complete without equipment
            items.push({
                id: "complete-no-equipment",
                label: "Complete without equipment",
                icon: CheckCircle,
                color: "#22c55e",
                onClick: (e?: React.MouseEvent) => {
                    e?.stopPropagation();
                    handleCompleteWithoutEquipment();
                },
                disabled: isUpdating,
            });
        } else {
            // No equipment needed, just complete
            items.push({
                id: "complete",
                label: "Mark as Completed",
                icon: CheckCircle,
                color: "#22c55e",
                onClick: (e?: React.MouseEvent) => {
                    e?.stopPropagation();
                    handleCompleteWithoutEquipment();
                },
                disabled: isUpdating,
            });
        }

        return items;
    };

    return (
        <div className={`relative ${className}`}>
            <button
                ref={dropdownTriggerRef}
                onClick={handleToggle}
                disabled={isCompleted || isUpdating}
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors border border-border relative ${
                    isCompleted
                        ? "bg-muted/30 cursor-not-allowed opacity-60"
                        : "bg-muted hover:bg-muted/80"
                }`}
                style={{ color: statusConfig.color }}
            >
                {/* Glow pulse ring when updating */}
                {isUpdating && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-2"
                        style={{ borderColor: statusConfig.color }}
                        initial={{ scale: 0.8, opacity: 0.8 }}
                        animate={{ scale: 1.4, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    />
                )}

                {/* Icon with smooth scale pulse */}
                <motion.div
                    animate={isUpdating ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                    transition={{ duration: 2, repeat: isUpdating ? Infinity : 0, ease: "easeInOut" }}
                >
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: statusConfig.color }} />
                </motion.div>

                {/* Equipment indicator badge */}
                {needsEquipment && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-sm border border-border/50">
                        !
                    </span>
                )}
            </button>

            {isDropdownOpen && (
                <Dropdown
                    isOpen={isDropdownOpen}
                    onClose={() => setIsDropdownOpen(false)}
                    items={buildDropdownItems()}
                    align="right"
                    triggerRef={dropdownTriggerRef}
                />
            )}
        </div>
    );
}
