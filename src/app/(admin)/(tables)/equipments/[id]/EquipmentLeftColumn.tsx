"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EntityLeftColumn } from "@/src/components/ids/EntityLeftColumn";
import { UpdateEntityColumnCard } from "@/src/components/ids/UpdateEntityColumnCard";
import { LessonEventRevenueBadge } from "@/src/components/ui/badge/lesson-event-revenue";
import { EquipmentTeacherManModal } from "@/src/components/modals/admin";
import { updateEquipmentStatus } from "@/supabase/server/equipment-status";
import { updateEquipment, deleteEquipment } from "@/supabase/server/equipments";
import { equipmentUpdateSchema, type EquipmentUpdateForm } from "@/src/validation/equipment";
import { formatDate } from "@/getters/date-getter";
import { getFullDuration } from "@/getters/duration-getter";
import { EquipmentTableGetters } from "@/getters/table-getters";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import type { EquipmentData } from "@/backend/data/EquipmentData";
import type { LeftColumnCardData } from "@/types/left-column";
import type { EquipmentStatus } from "@/types/status";

interface EquipmentLeftColumnProps {
    equipment: EquipmentData;
}

export function EquipmentLeftColumn({ equipment }: EquipmentLeftColumnProps) {
    const router = useRouter();
    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
    const rentalEntity = ENTITY_DATA.find((e) => e.id === "rental")!;
    const repairsEntity = ENTITY_DATA.find((e) => e.id === "repairs")!;

    const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === equipment.schema.category);
    const categoryColor = categoryConfig?.color || equipmentEntity.color;
    const CategoryIcon = categoryConfig?.icon || equipmentEntity.icon;

    // Form handlers
    const handleUpdateSubmit = async (data: EquipmentUpdateForm) => {
        const result = await updateEquipment(equipment.schema.id, {
            sku: data.sku,
            brand: data.brand,
            model: data.model,
            color: data.color,
            size: data.size,
            status: data.status,
        });

        if (result.success) {
            router.refresh();
        } else {
            console.error("Failed to update equipment:", result.error);
            throw new Error(result.error);
        }
    };

    const handleDelete = async () => {
        const result = await deleteEquipment(equipment.schema.id);

        if (result.success) {
            router.push("/equipments");
        } else {
            console.error("Failed to delete equipment:", result.error);
            throw new Error(result.error);
        }
    };

    // Check if equipment can be deleted
    const events = equipment.relations.events || [];
    const rentals = equipment.relations.rentals || [];
    const canDeleteEquipment = events.length === 0 && rentals.length === 0;
    const deleteMessage = canDeleteEquipment
        ? "Are you sure you want to delete this equipment?"
        : "Cannot delete equipment with events or rentals";

    // Form fields - Status at top
    const formFields = [
        { name: "status", label: "Status", type: "equipment-status" as const, section: "settings", required: true },
        { name: "sku", label: "SKU", type: "text" as const, section: "details", required: true },
        { name: "brand", label: "Brand", type: "text" as const, section: "details", required: true },
        { name: "model", label: "Model", type: "text" as const, section: "details", required: true },
        { name: "color", label: "Color", type: "text" as const, section: "details" },
        { name: "size", label: "Size", type: "number" as const, section: "details", placeholder: "Size in meters" },
    ];

    const defaultValues: EquipmentUpdateForm = {
        id: equipment.schema.id,
        sku: equipment.schema.sku,
        brand: equipment.schema.brand,
        model: equipment.schema.model,
        color: equipment.schema.color || "",
        size: equipment.schema.size || undefined,
        status: (equipment.schema.status as EquipmentStatus) || "rental",
    };

    // View mode fields
    const equipmentViewFields = [
        {
            label: "Status",
            value: equipment.schema.status || "rental",
        },
        {
            label: "Brand",
            value: equipment.schema.brand,
        },
        {
            label: "Model",
            value: equipment.schema.model,
        },
        {
            label: "Size",
            value: equipment.schema.size ? `${equipment.schema.size}m` : "N/A",
        },
        {
            label: "Color",
            value: equipment.schema.color || "N/A",
        },
        {
            label: "SKU",
            value: equipment.schema.sku,
        },
    ];

    const TeacherIcon = teacherEntity.icon;
    const StudentIcon = studentEntity.icon;
    const RentalIcon = rentalEntity.icon;
    const RepairsIcon = repairsEntity.icon;

    // Stats
    const eventCount = EquipmentTableGetters.getEventCount(equipment);
    const durationMinutes = EquipmentTableGetters.getTotalUsageMinutes(equipment);
    const revenue = EquipmentTableGetters.getRevenue(equipment);

    const handleStatusChange = async (newStatus: EquipmentStatus) => {
        const result = await updateEquipmentStatus(equipment.schema.id, newStatus);
        if (!result.success) {
            console.error("Error updating equipment status:", result.error);
        }
    };

    // Teachers Card
    const teachers = equipment.relations.teachers || [];

    const teacherFields = teachers.map((teacher) => ({
        label: teacher.username,
        value: `${teacher.first_name} ${teacher.last_name}`,
    }));

    const teachersCardData: LeftColumnCardData = {
        name: "Teachers",
        status: `${teachers.length} Assigned`,
        avatar: (
            <div className="flex-shrink-0" style={{ color: teacherEntity.color }}>
                <TeacherIcon className="w-10 h-10" />
            </div>
        ),
        fields: teacherFields.length > 0 ? teacherFields : [{ label: "Teachers", value: "No teachers assigned" }],
        accentColor: teacherEntity.color,
        isAddable: true,
        onAdd: () => setIsTeacherModalOpen(true),
    };

    // Students Card (Events with this equipment)
    const studentsCardData: LeftColumnCardData = {
        name: "Usage",
        status: (
            <LessonEventRevenueBadge
                lessonCount={eventCount}
                duration={getFullDuration(durationMinutes)}
                revenue={Math.round(revenue)}
            />
        ),
        avatar: (
            <div className="flex-shrink-0" style={{ color: studentEntity.color }}>
                <StudentIcon className="w-10 h-10" />
            </div>
        ),
        fields: [{ label: "Events", value: eventCount.toString() }],
        accentColor: studentEntity.color,
        isAddable: false,
    };

    // Rentals Card
    const rentalCount = rentals.length;

    const rentalFields = rentals.map((rental) => {
        const studentsStr = rental.students.map((s) => `${s.first_name} ${s.last_name}`).join(", ") || "Unknown";
        return {
            label: formatDate(rental.created_at),
            value: studentsStr,
        };
    });

    const rentalsCardData: LeftColumnCardData = {
        name: "Rentals",
        status: `${rentalCount} Total`,
        avatar: (
            <div className="flex-shrink-0" style={{ color: rentalEntity.color }}>
                <RentalIcon className="w-10 h-10" />
            </div>
        ),
        fields: rentalFields.length > 0 ? rentalFields : [{ label: "Rentals", value: "No rentals" }],
        accentColor: rentalEntity.color,
        isAddable: true,
    };

    // Repairs Card
    const repairs = equipment.relations.repairs || [];

    const repairFields = repairs.map((repair) => ({
        label: formatDate(repair.created_at),
        value: repair.description || "No description",
    }));

    const repairsCardData: LeftColumnCardData = {
        name: "Repairs",
        status: `${repairs.length} Total`,
        avatar: (
            <div className="flex-shrink-0" style={{ color: repairsEntity.color }}>
                <RepairsIcon className="w-10 h-10" />
            </div>
        ),
        fields: repairFields.length > 0 ? repairFields : [{ label: "Repairs", value: "No repairs" }],
        accentColor: repairsEntity.color,
        isAddable: true,
    };

    // Avatar - simple icon like StudentLeftColumn, with SKU in view mode
    const avatarFunction = (formValues: EquipmentUpdateForm) => {
        // Check if values match original equipment (view mode)
        const matchesOriginal = 
            formValues.sku === equipment.schema.sku &&
            formValues.brand === equipment.schema.brand &&
            formValues.model === equipment.schema.model &&
            formValues.color === (equipment.schema.color || "") &&
            formValues.size === (equipment.schema.size || undefined) &&
            formValues.status === (equipment.schema.status || "rental");
        
        return (
            <div className="flex-shrink-0" style={{ color: categoryColor }}>
                <CategoryIcon className="w-10 h-10" />
            </div>
        );
    };

    const nameFunction = (formValues: EquipmentUpdateForm) => {
        return (
            <div className="flex items-center gap-2">
                <span>{formValues.model}</span>
                {formValues.size && (
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded font-black text-xs">
                        {formValues.size}m
                    </span>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="space-y-6">
                <UpdateEntityColumnCard
                    name={nameFunction}
                    status={equipment.schema.status ? equipment.schema.status.charAt(0).toUpperCase() + equipment.schema.status.slice(1) : "Rental"}
                    avatar={avatarFunction}
                    fields={equipmentViewFields}
                    accentColor={categoryColor}
                    entityId="equipment"
                    formFields={formFields}
                    schema={equipmentUpdateSchema}
                    defaultValues={defaultValues}
                    onSubmit={handleUpdateSubmit}
                    onDelete={handleDelete}
                    canDelete={canDeleteEquipment}
                    deleteMessage={deleteMessage}
                />
                <EntityLeftColumn cards={[teachersCardData, studentsCardData, rentalsCardData, repairsCardData]} />
            </div>
            <EquipmentTeacherManModal
                isOpen={isTeacherModalOpen}
                onClose={() => setIsTeacherModalOpen(false)}
                equipment={equipment as any}
            />
        </>
    );
}
