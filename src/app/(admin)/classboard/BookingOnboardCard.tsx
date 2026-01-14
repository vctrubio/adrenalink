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

// --- Constants ---
const STUDENT_COLOR = "#eab308";
const TEACHER_COLOR = "#16a34a";

interface BookingOnboardCardProps {
    bookingData: ClassboardData;
    selectedDate: string;
    onClick?: () => void;
}

/**
 * BookingOnboardCard
 * Displays a student's booking status for the day, including equipment assignment.
 * Follows Clean Code Thesis: Parent handles logic, sub-components handle render.
 */
export default function BookingOnboardCard({ bookingData, selectedDate, onClick }: BookingOnboardCardProps) {
    // 1. Unpack Data
    const { booking, schoolPackage, lessons, bookingStudents } = bookingData;
    const studentCount = bookingStudents.length;
    const categoryEquipment = schoolPackage.categoryEquipment;

    // 2. Filter & Prepare Events (Today Only)
    const todaysEvents = useMemo(() => {
        return lessons.flatMap((lesson) =>
            (lesson.events || [])
                .filter((event) => event.date.startsWith(selectedDate)) // ONLY today's events
                .map((event) => ({
                    ...event,
                    teacher: lesson.teacher,
                    lessonStatus: lesson.status,
                    lessonId: lesson.id,
                })),
        );
    }, [lessons, selectedDate]);

    // 3. Equipment Hook
    const { availableEquipment, fetchAvailable, assign, unassign } = useEquipment(categoryEquipment);
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === categoryEquipment);
    const EquipmentIcon = equipmentConfig?.icon;

    // 4. Local State for Optimistic Updates
    const [localEvents, setLocalEvents] = useState<any[]>(todaysEvents);
    const [activeEventId, setActiveEventId] = useState<string | null>(null);

    // Sync local state when source data changes
    useEffect(() => {
        setLocalEvents(todaysEvents);
    }, [todaysEvents]);

    // Fetch equipment when dropdown opens
    useEffect(() => {
        if (activeEventId) {
            fetchAvailable();
        }
    }, [activeEventId, fetchAvailable]);

    // 5. Calculate Stats (Today Only)
    const { totalRevenue, todayEventMinutes, eventCounts } = useMemo(() => {
        const revenue = localEvents.reduce((sum, event) => {
            const durationHours = (event.duration || 0) / 60;
            const price = schoolPackage.pricePerStudent || 0;
            return sum + price * studentCount * durationHours;
        }, 0);

        const minutes = localEvents.reduce((sum, event) => sum + (event.duration || 0), 0);
        const counts = getEventStatusCounts(localEvents);

        return { totalRevenue: revenue, todayEventMinutes: minutes, eventCounts: counts };
    }, [localEvents, schoolPackage.pricePerStudent, studentCount]);

    // 6. Actions
    const handleAssign = async (eventId: string, equipment: any) => {
        const success = await assign(eventId, equipment.id);
        if (success) {
            await updateEventStatus(eventId, "completed");
        }
    };

    const handleUnassign = async (eventId: string, equipmentId: string) => {
        await unassign(eventId, equipmentId);
    };

    // 7. Render
    return (
        <div
            onClick={onClick}
            className="group relative w-full overflow-hidden rounded-xl border border-border transition-colors duration-200 cursor-pointer hover:bg-muted/30"
        >
            <ClassboardProgressBar counts={eventCounts} durationMinutes={todayEventMinutes} />

            <div className="h-12 flex items-center justify-between px-6 bg-background gap-4">
                <StudentInfoSection booking={booking} studentCount={studentCount} />

                <div className="flex items-center gap-4 shrink-0">
                    <EquipmentEventList
                        events={localEvents}
                        activeEventId={activeEventId}
                        setActiveEventId={setActiveEventId}
                        availableEquipment={availableEquipment}
                        handleAssign={handleAssign}
                        handleUnassign={handleUnassign}
                        EquipmentIcon={EquipmentIcon}
                        equipmentConfig={equipmentConfig}
                    />

                    <RevenueDisplay totalRevenue={totalRevenue} />
                </div>
            </div>
        </div>
    );
}

// --- Sub-Components (Same File) ---

function StudentInfoSection({ booking, studentCount }: { booking: any; studentCount: number }) {
    return (
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
    );
}

function RevenueDisplay({ totalRevenue }: { totalRevenue: number }) {
    if (totalRevenue <= 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 12, mass: 1, duration: 1.2 }}
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400"
        >
            <Receipt size={14} />
            <span className="font-bold">{getCompactNumber(totalRevenue)}</span>
        </motion.div>
    );
}

function EquipmentEventList({
    events,
    activeEventId,
    setActiveEventId,
    availableEquipment,
    handleAssign,
    handleUnassign,
    EquipmentIcon,
    equipmentConfig,
}: {
    events: any[];
    activeEventId: string | null;
    setActiveEventId: (id: string | null) => void;
    availableEquipment: any[];
    handleAssign: (eventId: string, eq: any) => void;
    handleUnassign: (eventId: string, eqId: string) => void;
    EquipmentIcon: any;
    equipmentConfig: any;
}) {
    // Refs for dropdown positioning
    const triggerRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    return (
        <div className="flex items-center gap-2">
            {events.map((event) => (
                <EquipmentEventItem
                    key={event.id}
                    event={event}
                    isActive={activeEventId === event.id}
                    onToggle={() => setActiveEventId(activeEventId === event.id ? null : event.id)}
                    triggerRef={(el) => {
                        if (el) triggerRefs.current.set(event.id, el);
                        else triggerRefs.current.delete(event.id);
                    }}
                    getTriggerRef={() => triggerRefs.current.get(event.id) || null}
                    availableEquipment={availableEquipment}
                    handleAssign={handleAssign}
                    handleUnassign={handleUnassign}
                    EquipmentIcon={EquipmentIcon}
                    equipmentConfig={equipmentConfig}
                />
            ))}
        </div>
    );
}

function EquipmentEventItem({
    event,
    isActive,
    onToggle,
    triggerRef,
    getTriggerRef,
    availableEquipment,
    handleAssign,
    handleUnassign,
    EquipmentIcon,
    equipmentConfig,
}: {
    event: any;
    isActive: boolean;
    onToggle: () => void;
    triggerRef: (el: HTMLDivElement | null) => void;
    getTriggerRef: () => HTMLDivElement | null;
    availableEquipment: any[];
    handleAssign: (eventId: string, eq: any) => void;
    handleUnassign: (eventId: string, eqId: string) => void;
    EquipmentIcon: any;
    equipmentConfig: any;
}) {
    const assignedEquipments = event.equipments || [];
    const hasEquipment = assignedEquipments.length > 0;

    // Build Dropdown Items
    const dropdownItems = useMemo(() => {
        if (!isActive) return [];

        const headerItem: DropdownItemProps = {
            id: `header-${event.id}`,
            label: (
                <div className="flex items-center gap-3 leading-none">
                    <span className="font-bold" style={{ color: TEACHER_COLOR }}>
                        {event.teacher.username}
                    </span>
                    <div className="flex items-center gap-1 text-muted-foreground text-[10px] leading-none py-0.5">
                        <FlagIcon size={12} className="opacity-70" />
                        <span className="translate-y-[0.5px]">{event.date.split("T")[1]?.substring(0, 5) || "--:--"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-[10px] leading-none py-0.5">
                        <DurationIcon size={12} className="opacity-70" />
                        <span className="translate-y-[0.5px]">{getHMDuration(event.duration)}</span>
                    </div>
                </div>
            ) as any,
            icon: HeadsetIcon,
            color: TEACHER_COLOR,
            disabled: true,
        };

        const assignedItems = assignedEquipments.map((eq: any) => ({
            id: `assigned-${eq.id}`,
            label: `${eq.brand} ${eq.model}${eq.size ? ` (${eq.size})` : ""}`,
            description: `SKU: ${eq.sku}${eq.color ? ` • ${eq.color}` : ""}`,
            icon: EquipmentIcon || User,
            color: equipmentConfig?.color || "#3b82f6",
            onClick: (e?: React.MouseEvent) => {
                e?.stopPropagation();
                handleUnassign(event.id, eq.id);
            },
        }));

        const availableItems = [...availableEquipment]
            .filter((eq) => !assignedEquipments.some((ae: any) => ae.id === eq.id))
            .sort((a, b) => {
                // Sort by preferred teacher
                const teacherId = event.teacher.id;
                const aPref = teacherId && a.teacher_equipment?.some((te: any) => te.teacher_id === teacherId);
                const bPref = teacherId && b.teacher_equipment?.some((te: any) => te.teacher_id === teacherId);
                return (bPref ? 1 : 0) - (aPref ? 1 : 0);
            })
            .map((eq) => {
                const teacherId = event.teacher.id;
                const isPreferred = teacherId && eq.teacher_equipment?.some((te: any) => te.teacher_id === teacherId);
                return {
                    id: eq.id,
                    label: (
                        <div className={`inline-block ${isPreferred ? "border-b-[1.5px] border-primary/50 pb-0.5" : ""}`}>
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
            });

        return [headerItem, ...assignedItems, ...availableItems];
    }, [isActive, event, assignedEquipments, availableEquipment, equipmentConfig, handleAssign, handleUnassign, EquipmentIcon]);

    return (
        <div className="relative">
            <div
                ref={triggerRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
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
                    onClose={() => onToggle()} // Toggle off
                    items={dropdownItems}
                    align="right"
                    triggerRef={{ current: getTriggerRef() }}
                />
            )}
        </div>
    );
}
