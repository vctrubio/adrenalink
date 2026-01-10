"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Receipt, User, Check } from "lucide-react";
import { motion } from "framer-motion";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { getCompactNumber } from "@/getters/integer-getter";
import { getHMDuration } from "@/getters/duration-getter";
import { getEventStatusCounts } from "@/getters/booking-progress-getter";
import { ClassboardProgressBar } from "./ClassboardProgressBar";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";
import type { ClassboardData } from "@/backend/classboard/ClassboardModel";
import { useEquipment } from "@/src/hooks/useEquipment";
import { updateEventStatus } from "@/supabase/server/classboard";

// Yellow student color from EventCard
const STUDENT_COLOR = "#eab308";

interface BookingOnboardCardProps {
    bookingData: ClassboardData;
    onClick?: () => void;
}

export default function BookingOnboardCard({ bookingData, onClick }: BookingOnboardCardProps) {
    const { booking, schoolPackage, lessons, bookingStudents } = bookingData;
    const studentCount = bookingStudents.length;

    const categoryEquipment = schoolPackage.categoryEquipment;
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === categoryEquipment);
    const EquipmentIcon = equipmentConfig?.icon;

    const { availableEquipment, fetchAvailable, assign, unassign, isLoading: isEquipmentLoading } = useEquipment(categoryEquipment);

    const [activeEventId, setActiveEventId] = useState<string | null>(null);
    const triggerRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    // Local state to track equipment assignments since real-time listener is removed
    const [localEvents, setLocalEvents] = useState<any[]>([]);

    // Enrich events with teacher and lesson info for the dropdown context
    const allEventsWithContext = useMemo(() => {
        return lessons.flatMap((lesson) =>
            (lesson.events || []).map((event) => ({
                ...event,
                teacher: lesson.teacher,
                lessonStatus: lesson.status,
                lessonId: lesson.id,
            })),
        );
    }, [lessons]);

    // Initialize localEvents when data changes
    useEffect(() => {
        setLocalEvents(allEventsWithContext);
    }, [allEventsWithContext]);

    // Fetch available equipment when dropdown opens
    useEffect(() => {
        if (activeEventId) {
            fetchAvailable();
        }
    }, [activeEventId, fetchAvailable]);

    // Calculate total revenue from all events
    const totalRevenue = allEventsWithContext.reduce((sum, event) => {
        const duration = event.duration || 0;
        const durationHours = duration / 60;
        const pricePerStudent = schoolPackage.pricePerStudent || 0;
        return sum + pricePerStudent * studentCount * durationHours;
    }, 0);

    const capacityEquipment = schoolPackage.capacityEquipment || 1;

    // Calculate event status counts and total minutes for progress bar
    const eventCounts = getEventStatusCounts(allEventsWithContext);
    const todayEventMinutes = allEventsWithContext.reduce((sum, event) => sum + (event.duration || 0), 0);

    const handleAssign = async (eventId: string, equipment: any) => {
        const success = await assign(eventId, equipment.id);
        if (success) {
            // Also mark the event as completed when equipment is assigned
            await updateEventStatus(eventId, "completed");

            setLocalEvents((prev) =>
                prev.map((evt) => {
                    if (evt.id === eventId) {
                        return {
                            ...evt,
                            status: "completed",
                            equipments: [...(evt.equipments || []), equipment],
                        };
                    }
                    return evt;
                }),
            );
        }
    };

    const handleUnassign = async (eventId: string, equipmentId: string) => {
        const success = await unassign(eventId, equipmentId);
        if (success) {
            setLocalEvents((prev) =>
                prev.map((evt) => {
                    if (evt.id === eventId) {
                        return {
                            ...evt,
                            equipments: (evt.equipments || []).filter((eq: any) => eq.id !== equipmentId),
                        };
                    }
                    return evt;
                }),
            );
        }
    };

    return (
        <div
            onClick={onClick}
            className="group relative w-full overflow-hidden rounded-xl border border-border transition-colors duration-200 cursor-pointer hover:bg-muted/30"
        >
            <ClassboardProgressBar counts={eventCounts} durationMinutes={todayEventMinutes} />

            <div className="h-12 flex items-center justify-between px-6 bg-background gap-4">
                {/* Left: Student Icon + Leader Name + Student Count Badge */}
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex-shrink-0" style={{ color: STUDENT_COLOR }}>
                        <HelmetIcon size={24} />
                    </div>
                    <span className="text-lg font-bold text-foreground truncate">{booking.leaderStudentName.split(" ")[0]}</span>
                    {studentCount > 1 && (
                        <span className="text-[10px] bg-foreground/5 px-1.5 py-0.5 rounded-md text-muted-foreground font-black shrink-0">
                            +{studentCount - 1}
                        </span>
                    )}
                </div>

                {/* Right: Equipment Events + Receipt */}
                <div className="flex items-center gap-4 shrink-0">
                    {/* Iterate through each event to show its equipment status */}
                    <div className="flex items-center gap-2">
                        {localEvents.map((event) => {
                            const assignedEquipments = event.equipments || [];
                            const hasEquipment = assignedEquipments.length > 0;
                            const isActive = activeEventId === event.id;

                            // Create dropdown items: Assigned gear first, then available gear
                            const dropdownItems: DropdownItemProps[] = [
                                {
                                    id: `header-${event.id}`,
                                    label: (
                                        <div className="flex items-center gap-3 leading-none">
                                            <span className="font-bold text-[#16a34a]">{event.teacher.username}</span>
                                            <div className="flex items-center gap-1 text-muted-foreground text-[10px] leading-none py-0.5">
                                                <FlagIcon size={12} className="opacity-70" />
                                                <span className="translate-y-[0.5px]">
                                                    {event.date.split("T")[1]?.substring(0, 5) || "--:--"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground text-[10px] leading-none py-0.5">
                                                <DurationIcon size={12} className="opacity-70" />
                                                <span className="translate-y-[0.5px]">{getHMDuration(event.duration)}</span>
                                            </div>
                                        </div>
                                    ) as any,
                                    icon: HeadsetIcon,
                                    color: "#16a34a", // Teacher Green
                                    disabled: true,
                                },
                                // Already assigned equipment
                                ...assignedEquipments.map((eq: any) => ({
                                    id: `assigned-${eq.id}`,
                                    label: `${eq.brand} ${eq.model}${eq.size ? ` (${eq.size})` : ""}`,
                                    description: `SKU: ${eq.sku}${eq.color ? ` • ${eq.color}` : ""}`,
                                    icon: EquipmentIcon || User,
                                    color: equipmentConfig?.color || "#3b82f6",
                                    onClick: (e?: React.MouseEvent) => {
                                        e?.stopPropagation();
                                        handleUnassign(event.id, eq.id);
                                    },
                                })),
                                // Available equipment (prioritizing teacher-preferred gear)
                                ...[...availableEquipment]
                                    .filter((eq) => !assignedEquipments.some((ae: any) => ae.id === eq.id))
                                    .sort((a, b) => {
                                        const teacherId = event.teacher.id;
                                        const aPreferred =
                                            teacherId && a.teacher_equipment?.some((te: any) => te.teacher_id === teacherId);
                                        const bPreferred =
                                            teacherId && b.teacher_equipment?.some((te: any) => te.teacher_id === teacherId);
                                        if (aPreferred && !bPreferred) return -1;
                                        if (!aPreferred && bPreferred) return 1;
                                        return 0;
                                    })
                                    .map((eq) => {
                                        const teacherId = event.teacher.id;
                                        const isPreferred =
                                            teacherId && eq.teacher_equipment?.some((te: any) => te.teacher_id === teacherId);
                                        return {
                                            id: eq.id,
                                            label: (
                                                <div
                                                    className={`inline-block ${isPreferred ? "border-b-[1.5px] border-primary/50 pb-0.5" : ""}`}
                                                >
                                                    <span className="font-bold text-foreground/90">
                                                        {eq.brand} {eq.model}
                                                        {eq.size ? ` (${eq.size})` : ""}
                                                    </span>
                                                </div>
                                            ) as any,
                                            description: `SKU: ${eq.sku}${eq.color ? ` • ${eq.color}` : ""}`,
                                            icon: EquipmentIcon || User,
                                            color: "rgb(var(--muted-foreground))",
                                            onClick: (e?: React.MouseEvent) => {
                                                e?.stopPropagation();
                                                handleAssign(event.id, eq);
                                            },
                                        };
                                    }),
                            ];

                            return (
                                <div key={event.id} className="relative">
                                    <div
                                        ref={(el) => {
                                            if (el) triggerRefs.current.set(event.id, el);
                                            else triggerRefs.current.delete(event.id);
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveEventId(isActive ? null : event.id);
                                        }}
                                        className={`flex items-center transition-all p-1 rounded hover:bg-muted/50 ${isActive ? "scale-110 bg-muted/80 ring-1 ring-border" : "hover:scale-110"}`}
                                        style={{
                                            color: hasEquipment ? equipmentConfig?.color || "inherit" : "rgb(var(--muted-foreground))",
                                            opacity: hasEquipment ? 1 : 0.3,
                                        }}
                                    >
                                        {EquipmentIcon && <EquipmentIcon size={18} />}
                                    </div>

                                    {isActive && (
                                        <Dropdown
                                            isOpen={isActive}
                                            onClose={() => setActiveEventId(null)}
                                            items={dropdownItems}
                                            align="right"
                                            triggerRef={{ current: triggerRefs.current.get(event.id) || null }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {totalRevenue > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 80,
                                damping: 12,
                                mass: 1,
                                duration: 1.2,
                            }}
                            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400"
                        >
                            <Receipt size={14} />
                            <span className="font-bold">{getCompactNumber(totalRevenue)}</span>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
