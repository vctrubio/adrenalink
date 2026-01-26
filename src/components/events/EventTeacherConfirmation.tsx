"use client";

import { useState, useCallback, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { TransactionEventData } from "@/types/transaction-event";
import { useTeacherEquipment } from "@/src/hooks/useTeacherEquipment";
import { useEquipment } from "@/src/hooks/useEquipment";
import { useTeacherUser } from "@/src/providers/teacher-user-provider";
import { assignEquipmentToEvent, updateEventStatus } from "@/supabase/server/classboard";
import { updateEventDuration } from "@/supabase/server/events";
import { getHMDuration } from "@/getters/duration-getter";
import { LESSON_STATUS_CONFIG } from "@/types/status";
import toast from "react-hot-toast";

interface EventTeacherConfirmationProps {
    event: TransactionEventData;
    currency: string;
}

export function EventTeacherConfirmation({ event, currency }: EventTeacherConfirmationProps) {
    // Only show if status is tbc
    if (event.event.status !== "tbc") {
        return null;
    }

    const teacherUser = useTeacherUser();
    const teacherId = teacherUser.data.teacher.id;
    const capacityEquipment = event.packageData.capacityEquipment || 1;

    const [modifiedDuration, setModifiedDuration] = useState(event.event.duration);
    const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
    const [isConfirming, setIsConfirming] = useState(false);
    const [useSchoolEquipment, setUseSchoolEquipment] = useState(false);

    const { equipment: teacherEquipment, fetchEquipment: fetchTeacherEquipment } = useTeacherEquipment(teacherId, event.packageData.categoryEquipment);
    const { availableEquipment: schoolEquipment, fetchAvailable: fetchSchoolEquipment, isLoading: isLoadingSchool } = useEquipment(event.packageData.categoryEquipment);

    // Auto-fetch teacher equipment on mount
    useEffect(() => {
        fetchTeacherEquipment();
    }, [fetchTeacherEquipment]);

    // Fetch school equipment when toggle is switched
    useEffect(() => {
        if (useSchoolEquipment && schoolEquipment.length === 0) {
            fetchSchoolEquipment();
        }
    }, [useSchoolEquipment, fetchSchoolEquipment, schoolEquipment.length]);

    const hours = Math.floor(modifiedDuration / 60);
    const minutes = modifiedDuration % 60;
    const remainingMinutes = event.packageData.durationMinutes - modifiedDuration;

    const handleHoursChange = (newHours: number) => {
        const h = Math.max(0, newHours);
        const totalMinutes = h * 60 + minutes;
        setModifiedDuration(Math.max(60, totalMinutes));
    };

    const handleMinutesChange = (newMinutes: number) => {
        const m = Math.max(0, Math.min(59, newMinutes));
        const totalMinutes = hours * 60 + m;
        setModifiedDuration(Math.max(60, totalMinutes));
    };

    const handleEquipmentToggle = useCallback(
        (equipmentId: string) => {
            setSelectedEquipmentIds((prev) => {
                if (prev.includes(equipmentId)) {
                    return prev.filter((id) => id !== equipmentId);
                } else if (prev.length < capacityEquipment) {
                    return [...prev, equipmentId];
                }
                return prev;
            });
        },
        [capacityEquipment],
    );

    const handleConfirm = useCallback(async () => {
        if (selectedEquipmentIds.length === 0 || isConfirming) return;

        setIsConfirming(true);

        try {
            // Step 1: Update duration if changed
            if (modifiedDuration !== event.event.duration) {
                const durationResult = await updateEventDuration(event.event.id, modifiedDuration);
                if (!durationResult.success) {
                    toast.error(durationResult.error || "Failed to update duration");
                    setIsConfirming(false);
                    return;
                }
            }

            // Step 2: Assign all selected equipment
            const assignPromises = selectedEquipmentIds.map((equipmentId) => assignEquipmentToEvent(event.event.id, equipmentId));
            const results = await Promise.all(assignPromises);

            const failedAssignments = results
                .map((result, index) => ({ result, equipmentId: selectedEquipmentIds[index] }))
                .filter(({ result }) => !result.success);

            if (failedAssignments.length > 0) {
                // Get current equipment list for error messages
                const equipmentList = useSchoolEquipment ? schoolEquipment : teacherEquipment;
                const errorMessages = failedAssignments.map(({ result, equipmentId }) => {
                    const equipment = equipmentList.find((eq) => eq.id === equipmentId);
                    const equipmentName = equipment ? `${equipment.brand} ${equipment.model}` : equipmentId;
                    return `${equipmentName}: ${result.error || "Failed to assign"}`;
                });
                toast.error(`Failed to assign equipment:\n${errorMessages.join("\n")}`, { duration: 5000 });
                console.error("Equipment assignment failures:", failedAssignments);
                setIsConfirming(false);
                return;
            }

            // Step 3: Update event status to completed
            const statusResult = await updateEventStatus(event.event.id, "completed");
            if (statusResult.success) {
                toast.success("Event confirmed successfully");
            } else {
                toast.error(statusResult.error || "Failed to complete event confirmation");
            }
        } catch (error) {
            console.error("An unexpected error occurred", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsConfirming(false);
        }
    }, [selectedEquipmentIds, isConfirming, event.event.id, modifiedDuration, event.event.duration, useSchoolEquipment, schoolEquipment, teacherEquipment]);

    const canSelectMore = selectedEquipmentIds.length < capacityEquipment;
    const currentEquipment = useSchoolEquipment ? schoolEquipment : teacherEquipment;
    const lessonStatusConfig = LESSON_STATUS_CONFIG[event.lesson.status as keyof typeof LESSON_STATUS_CONFIG];

    return (
        <div className="px-6 py-6 bg-card border-t border-border space-y-6 rounded-b-3xl">
            {/* Duration */}
            <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Duration</label>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-muted/30 border border-border rounded-lg px-3 py-2.5">
                        <input
                            type="number"
                            value={hours}
                            onChange={(e) => handleHoursChange(parseInt(e.target.value) || 0)}
                            min={0}
                            max={24}
                            className="w-10 text-center text-lg font-semibold text-foreground bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                        />
                        <span className="text-sm font-medium text-muted-foreground">h</span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/30 border border-border rounded-lg px-3 py-2.5">
                        <input
                            type="number"
                            value={minutes}
                            onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 0)}
                            min={0}
                            max={59}
                            className="w-10 text-center text-lg font-semibold text-foreground bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                        />
                        <span className="text-sm font-medium text-muted-foreground">m</span>
                    </div>
                </div>
            </div>

            {/* Equipment Selection */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Equipment</label>
                    {selectedEquipmentIds.length > 0 && (
                        <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                            {selectedEquipmentIds.length}/{capacityEquipment}
                        </span>
                    )}
                </div>

                {/* Toggle between teacher and school equipment */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setUseSchoolEquipment(false);
                            setSelectedEquipmentIds([]);
                        }}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            !useSchoolEquipment
                                ? "bg-foreground text-background"
                                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                        }`}
                    >
                        My Equipment
                    </button>
                    <button
                        onClick={() => {
                            setUseSchoolEquipment(true);
                            setSelectedEquipmentIds([]);
                        }}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            useSchoolEquipment
                                ? "bg-foreground text-background"
                                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                        }`}
                    >
                        School Equipment
                    </button>
                </div>

                {/* Equipment List */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {isLoadingSchool && useSchoolEquipment ? (
                        <div className="text-sm text-muted-foreground py-6 text-center">Loading equipment...</div>
                    ) : currentEquipment.length === 0 ? (
                        <div className="text-sm text-muted-foreground py-6 text-center">
                            {useSchoolEquipment ? "No school equipment available" : "No equipment available"}
                        </div>
                    ) : (
                        currentEquipment.map((eq) => {
                            const isSelected = selectedEquipmentIds.includes(eq.id);
                            const isDisabled = !isSelected && !canSelectMore;

                            return (
                                <button
                                    key={eq.id}
                                    onClick={() => {
                                        if (!isDisabled) {
                                            handleEquipmentToggle(eq.id);
                                        }
                                    }}
                                    disabled={isDisabled}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                                        isSelected
                                            ? "bg-foreground/10 border-foreground/30 shadow-sm"
                                            : isDisabled
                                            ? "opacity-40 cursor-not-allowed border-border/20 bg-muted/20"
                                            : "border-border/40 bg-muted/20 hover:border-foreground/40 hover:bg-muted/40"
                                    }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                            isSelected
                                                ? "border-foreground bg-foreground"
                                                : "border-border bg-background"
                                        }`}
                                    >
                                        {isSelected && <Check size={14} className="text-background" strokeWidth={3} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-foreground">
                                            {eq.brand} {eq.model}
                                            {eq.size ? ` (${eq.size})` : ""}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            {eq.sku}
                                            {eq.color ? ` • ${eq.color}` : ""}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Hours Left */}
            {remainingMinutes !== 0 && (
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Hours Left</label>
                    <div className="text-base font-semibold text-foreground">
                        {remainingMinutes < 0 ? "+" : ""}
                        {getHMDuration(Math.abs(remainingMinutes))}
                    </div>
                </div>
            )}

            {/* Lesson Status */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Lesson Status</label>
                {lessonStatusConfig ? (
                    <div className="inline-flex items-center gap-2">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: lessonStatusConfig.color }}
                        />
                        <span className="text-sm font-semibold text-foreground uppercase">{lessonStatusConfig.label}</span>
                    </div>
                ) : (
                    <div className="text-sm font-semibold text-foreground uppercase">{event.lesson.status}</div>
                )}
            </div>

            {/* Confirm Button */}
            <button
                onClick={handleConfirm}
                disabled={selectedEquipmentIds.length === 0 || isConfirming}
                className="w-full px-4 py-3 bg-foreground text-background font-semibold rounded-lg hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-foreground transition-all shadow-sm"
            >
                {isConfirming ? "Confirming..." : "Confirm Event"}
            </button>
        </div>
    );
}
