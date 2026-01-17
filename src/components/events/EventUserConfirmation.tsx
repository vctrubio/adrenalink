"use client";

import { useState, useRef, useCallback } from "react";
import { Plus, Minus } from "lucide-react";
import type { EventNode } from "@/types/classboard-teacher-queue";
import { EventUserCard } from "@/src/components/events/EventUserCard";
import { CardList } from "@/src/components/ui/card/card-list";
import { EquipmentStudentCommissionBadge } from "@/src/components/ui/badge/equipment-student-commission";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import { useEquipment } from "@/src/hooks/useEquipment";
import { confirmEventWithEquipment } from "@/supabase/server/events";
import { calculateLessonRevenue } from "@/getters/commission-calculator";
import { getHMDuration } from "@/getters/duration-getter";
import { getTimeFromISO } from "@/getters/queue-getter";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import Image from "next/image";

interface EventUserConfirmationProps {
    event: EventNode;
    viewMode: "teacher" | "student";
    currency: string;
    onConfirm?: () => void;
}

// Sub-component: Duration Controls (Teacher Mode)
const DurationControls = ({
    duration,
    onDurationChange,
    packageDuration,
}: {
    duration: number;
    onDurationChange: (newDuration: number) => void;
    packageDuration: number;
}) => {
    const stepDuration = 30; // 30 minutes step
    const minDuration = 60; // Minimum 60 minutes

    const handleIncrease = () => {
        onDurationChange(duration + stepDuration);
    };

    const handleDecrease = () => {
        if (duration > minDuration) {
            onDurationChange(duration - stepDuration);
        }
    };

    const remainingMinutes = packageDuration - duration;

    return (
        <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Duration</span>
                <div className="flex gap-2">
                    <button
                        onClick={handleDecrease}
                        disabled={duration <= minDuration}
                        className="p-2 rounded-md bg-background hover:bg-muted border border-border/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Decrease duration"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleIncrease}
                        className="p-2 rounded-md bg-background hover:bg-muted border border-border/50 transition-colors"
                        title="Increase duration"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <DurationIcon size={20} className="text-muted-foreground/80" />
                    <span className="text-2xl font-black tracking-tighter text-foreground">{getHMDuration(duration)}</span>
                </div>

                {remainingMinutes !== 0 && (
                    <div className="flex flex-col items-end">
                        <span className={`text-sm font-bold ${remainingMinutes < 0 ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"}`}>
                            {remainingMinutes < 0 ? "+" : "-"}
                            {getHMDuration(Math.abs(remainingMinutes))}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            {remainingMinutes < 0 ? "Over" : "Left"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-component: Equipment Assignment Dropdown (Teacher Mode)
const EquipmentAssignmentDropdown = ({
    categoryEquipment,
    selectedEquipmentId,
    onEquipmentSelect,
    teacherId,
    teacherUsername,
    eventTime,
    eventDuration,
}: {
    categoryEquipment: string;
    selectedEquipmentId: string | null;
    onEquipmentSelect: (equipmentId: string) => void;
    teacherId: string;
    teacherUsername: string;
    eventTime: string;
    eventDuration: number;
}) => {
    const { availableEquipment, fetchAvailable } = useEquipment(categoryEquipment);
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === categoryEquipment);
    const CategoryIcon = equipmentConfig?.icon;

    const handleOpen = () => {
        if (!isOpen) {
            fetchAvailable();
        }
        setIsOpen(!isOpen);
    };

    const selectedEquipment = availableEquipment.find((eq) => eq.id === selectedEquipmentId);

    const dropdownItems: DropdownItemProps[] = [
        {
            id: "header",
            label: (
                <div className="flex items-center gap-3 leading-none">
                    <span className="font-bold">{teacherUsername}</span>
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
            icon: () => (
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-border/50 shadow-sm">
                    <Image src="/prototypes/north-icon.png" alt="School" fill className="object-cover" />
                </div>
            ),
            color: "#16a34a",
            disabled: true,
        },
        ...availableEquipment
            .sort((a, b) => {
                const aPreferred = a.teacher_equipment?.some((te: any) => te.teacher_id === teacherId);
                const bPreferred = b.teacher_equipment?.some((te: any) => te.teacher_id === teacherId);
                if (aPreferred && !bPreferred) return -1;
                if (!aPreferred && bPreferred) return 1;
                return 0;
            })
            .map((eq) => {
                const isPreferred = eq.teacher_equipment?.some((te: any) => te.teacher_id === teacherId);
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
                    onClick: () => {
                        onEquipmentSelect(eq.id);
                        setIsOpen(false);
                    },
                };
            }),
    ];

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                onClick={handleOpen}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border transition-colors ${selectedEquipmentId ? "bg-primary/10 border-primary/50 text-primary" : "bg-muted/30 border-border/50 hover:bg-muted"}`}
            >
                <div className="flex items-center gap-2">
                    {CategoryIcon && <CategoryIcon size={20} />}
                    <span className="text-sm font-semibold">
                        {selectedEquipment ? `${selectedEquipment.brand} ${selectedEquipment.model}${selectedEquipment.size ? ` (${selectedEquipment.size})` : ""}` : "Select Equipment"}
                    </span>
                </div>
                {!selectedEquipmentId && <span className="text-xs text-destructive font-bold">Required</span>}
            </button>

            {isOpen && (
                <Dropdown
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    items={dropdownItems}
                    align="left"
                    triggerRef={triggerRef}
                />
            )}
        </div>
    );
};

// Sub-component: Confirm Button (Teacher Mode)
const ConfirmButton = ({
    disabled,
    isConfirming,
    onClick,
}: {
    disabled: boolean;
    isConfirming: boolean;
    onClick: () => void;
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled || isConfirming}
            className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
            {isConfirming ? "Confirming..." : "Confirm Event"}
        </button>
    );
};

// Sub-component: Confirmation Details (Student Mode)
const ConfirmationDetails = ({
    event,
    currency,
}: {
    event: EventNode;
    currency: string;
}) => {
    const hours = (event.eventData.duration / 60).toFixed(1);
    const studentCount = event.bookingStudents.length;

    // Calculate price per student using existing function
    const pricePerStudent = calculateLessonRevenue(
        event.pricePerStudent,
        1, // Per student
        event.eventData.duration,
        event.packageDuration,
    );

    const equipment = event.equipments?.[0];

    const fields = [
        { label: "Confirmed Hours", value: `${hours} hrs` },
        { label: "Price Per Student", value: `${pricePerStudent.toFixed(0)} ${currency}` },
        ...(equipment ? [{ label: "Equipment", value: `${equipment.brand} ${equipment.model}${equipment.size ? ` (${equipment.size})` : ""}` }] : []),
        { label: "Location", value: event.eventData.location },
    ];

    return <CardList fields={fields} />;
};

// Main Component
export function EventUserConfirmation({ event, viewMode, currency, onConfirm }: EventUserConfirmationProps) {
    const [modifiedDuration, setModifiedDuration] = useState(event.eventData.duration);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const isPending = event.eventData.status !== "completed";
    const isTBC = event.eventData.status === "tbc";

    // Get event time from date string directly (Wall Clock Time)
    const eventTime = getTimeFromISO(event.eventData.date);

    // Teacher-specific data
    const teacherId = event.teacher?.id || "";
    const teacherUsername = event.teacher?.username || "Unknown";

    const handleConfirm = useCallback(async () => {
        if (!selectedEquipmentId || isConfirming) return;

        setIsConfirming(true);

        try {
            const result = await confirmEventWithEquipment(
                event.id,
                selectedEquipmentId,
                modifiedDuration !== event.eventData.duration ? modifiedDuration : undefined,
            );

            if (result.success) {
                console.log("Event confirmed successfully");
                onConfirm?.();
            } else {
                console.error(result.error || "Failed to confirm event");
            }
        } catch (error) {
            console.error("An unexpected error occurred");
        } finally {
            setIsConfirming(false);
        }
    }, [selectedEquipmentId, isConfirming, event.id, modifiedDuration, event.eventData.duration, onConfirm]);

    // Footer content
    const footerLeftContent = (
        <EquipmentStudentCommissionBadge
            categoryEquipment={event.categoryEquipment}
            equipmentCapacity={event.capacityEquipment}
            studentCapacity={event.capacityStudents}
            commissionType={event.commission.type}
            commissionValue={event.commission.cph}
        />
    );

    // Body content based on viewMode
    const bodyContent =
        viewMode === "teacher" && isPending ? (
            <div className="flex flex-col gap-4">
                <DurationControls
                    duration={modifiedDuration}
                    onDurationChange={setModifiedDuration}
                    packageDuration={event.packageDuration}
                />

                <EquipmentAssignmentDropdown
                    categoryEquipment={event.categoryEquipment}
                    selectedEquipmentId={selectedEquipmentId}
                    onEquipmentSelect={setSelectedEquipmentId}
                    teacherId={teacherId}
                    teacherUsername={teacherUsername}
                    eventTime={eventTime}
                    eventDuration={modifiedDuration}
                />

                <ConfirmButton disabled={!selectedEquipmentId} isConfirming={isConfirming} onClick={handleConfirm} />
            </div>
        ) : (
            <ConfirmationDetails event={event} currency={currency} />
        );

    return (
        <div className={`${isTBC && viewMode === "teacher" ? "ring-2 ring-purple-500/50 rounded-3xl" : ""}`}>
            <EventUserCard date={event.eventData.date} duration={event.eventData.duration} status={event.eventData.status} footerLeftContent={footerLeftContent}>
                {bodyContent}
            </EventUserCard>
        </div>
    );
}
