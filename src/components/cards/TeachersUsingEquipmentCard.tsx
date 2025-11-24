"use client";

import { useState } from "react";
import type { EquipmentModel } from "@/backend/models";
import { linkTeacherEquipment } from "@/actions/equipment-teacher-action";
import { showEntityToast } from "@/getters/toast-getter";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { EntityActionList } from "@/src/components/cards/EntityActionList";
import LinkTeacherEquipmentModal from "@/src/components/modals/LinkTeacherEquipmentModal";

interface TeachersUsingEquipmentCardProps {
    equipment: EquipmentModel;
    onTeacherAssigned?: () => void;
}

export const TeachersUsingEquipmentCard = ({ equipment, onTeacherAssigned }: TeachersUsingEquipmentCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    const teacherEquipments = equipment.relations?.teacherEquipments || [];
    const existingTeacherIds = teacherEquipments.map((te) => te.teacher?.id).filter(Boolean) as string[];

    const handleAssignTeacher = async (teacherId: string) => {
        setIsAssigning(true);
        try {
            const result = await linkTeacherEquipment(equipment.schema.id, teacherId);

            if (!result.success) {
                showEntityToast("equipment", {
                    title: "Assignment Failed",
                    description: result.error || "Failed to assign equipment to teacher",
                    duration: 5000,
                });
                return;
            }

            showEntityToast("equipment", {
                title: "Equipment Assigned",
                description: "Teacher successfully assigned to equipment",
                duration: 4000,
            });

            setIsModalOpen(false);
            onTeacherAssigned?.();
        } catch (error) {
            console.error("Error assigning teacher:", error);
            showEntityToast("equipment", {
                title: "Assignment Error",
                description: "An unexpected error occurred",
                duration: 5000,
            });
        } finally {
            setIsAssigning(false);
        }
    };

    return (
        <>
            <EntityActionList
                entityId={equipment.schema.id}
                entityType="Teachers"
                icon={HeadsetIcon}
                iconColor="#22c55e"
                accentColor="#22c55e"
                count={teacherEquipments.length}
                addButtonLabel="Add Teacher"
                onAddClick={() => setIsModalOpen(true)}
                emptyMessage="No teachers assigned yet."

                items={
                    <div className="space-y-3">
                        {teacherEquipments.map((te) => (
                            <div key={te.id} className="border-l-2 border-primary pl-3 flex items-start justify-between">
                                <div>
                                    <p className="font-medium text-foreground text-sm">{te.teacher ? `${te.teacher.firstName} ${te.teacher.lastName}` : "Unknown"}</p>
                                    <p className="text-xs text-muted-foreground mt-1">@{te.teacher?.username || "N/A"}</p>
                                </div>
                                {te.active && <span className="text-xs font-medium text-green-600 dark:text-green-400">Active</span>}
                            </div>
                        ))}
                    </div>
                }
            />

            <LinkTeacherEquipmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} existingTeacherIds={existingTeacherIds} onAssignTeacher={handleAssignTeacher} />
        </>
    );
};
