"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Modal } from "@/src/components/modals";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { createLessonWithCommission } from "@/supabase/server/lessons";
import { ENTITY_DATA } from "@/config/entities";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import type { TeacherModel } from "@/backend/models";

interface TeacherLessonAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    bookingLeaderName: string;
    dateStart: string;
    dateEnd: string;
    teacher: TeacherModel;
    currency: string;
    onLessonCreated: () => void;
    categoryEquipment?: string | null;
    equipmentCapacity?: number;
    studentCapacity?: number;
    packageDurationHours?: number;
    pricePerHour?: number;
}

export function TeacherLessonAddModal({
    isOpen,
    onClose,
    bookingId,
    bookingLeaderName,
    dateStart,
    dateEnd,
    teacher,
    currency,
    onLessonCreated,
    categoryEquipment,
    equipmentCapacity = 0,
    studentCapacity = 0,
    packageDurationHours = 0,
    pricePerHour = 0,
}: TeacherLessonAddModalProps) {
    const [selectedCommissionId, setSelectedCommissionId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const commissions = teacher.relations?.commissions || [];
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking");
    const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission");

    const teacherColor = teacherEntity?.color || "#22c55e";
    const bookingColor = bookingEntity?.color || "#3b82f6";
    const commissionColor = commissionEntity?.color || "#8b5cf6";

    const handleCreateLesson = async () => {
        if (!selectedCommissionId) return;

        setIsCreating(true);
        try {
            const result = await createLessonWithCommission(bookingId, teacher.schema.id, selectedCommissionId);
            if (result.success) {
                setSelectedCommissionId(null);
                onLessonCreated();
                onClose();
            }
        } catch (error) {
            console.error("Failed to create lesson:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={teacher.schema.username}
            subtitle={
                <div className="p-2 rounded-lg bg-muted/20 border border-muted/30">
                    <EquipmentStudentPackagePriceBadge categoryEquipment={categoryEquipment} equipmentCapacity={equipmentCapacity} studentCapacity={studentCapacity} packageDurationHours={packageDurationHours} pricePerHour={pricePerHour} />
                </div>
            }
            entityId="teacher"
            maxWidth="md"
        >
            <div className="flex flex-col gap-4">
                {/* Booking Info */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-muted/30">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${bookingColor}20`, color: bookingColor }}>
                        <BookingIcon size={20} />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <DateRangeBadge startDate={dateStart} endDate={dateEnd} />
                        <span className="text-sm font-medium text-foreground mt-1">{bookingLeaderName}</span>
                    </div>
                </div>

                {/* Commission Selection */}
                <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-tight mb-2">Select Commission</div>

                    {commissions.length === 0 ? (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">This teacher has no commissions configured. Please add a commission first.</div>
                    ) : (
                        <div className="space-y-2">
                            {commissions.map((commission) => (
                                <motion.button
                                    key={commission.schema.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setSelectedCommissionId(commission.schema.id)}
                                    disabled={isCreating}
                                    className={`
                                        w-full flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all
                                        ${selectedCommissionId === commission.schema.id ? "bg-primary/10 border-primary/30" : "bg-muted/30 border-border/50 hover:border-primary/30 hover:bg-muted/50"}
                                        disabled:opacity-50
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${commissionColor}20`, color: commissionColor }}>
                                            <HandshakeIcon size={16} />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="font-medium text-sm">{commission.schema.commissionType === "fixed" ? `${commission.schema.cph} ${currency}/hour` : `${commission.schema.cph}%`}</span>
                                            {commission.schema.description && <span className="text-xs text-muted-foreground">{commission.schema.description}</span>}
                                        </div>
                                    </div>

                                    {selectedCommissionId === commission.schema.id && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0">
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                <Check size={14} className="text-primary-foreground" />
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Button */}
                {commissions.length > 0 && (
                    <button
                        onClick={handleCreateLesson}
                        disabled={!selectedCommissionId || isCreating}
                        className="w-full mt-4 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {isCreating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Lesson"
                        )}
                    </button>
                )}
            </div>
        </Modal>
    );
}
