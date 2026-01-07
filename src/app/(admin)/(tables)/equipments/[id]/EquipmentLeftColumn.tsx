"use client";

import { useState } from "react";
import { EntityLeftColumn } from "@/src/components/ids/EntityLeftColumn";
import { EquipmentStatusLabel } from "@/src/components/labels/EquipmentStatusLabel";
import { LessonEventRevenueBadge } from "@/src/components/ui/badge/lesson-event-revenue";
import { EquipmentTeacherManModal } from "@/src/components/modals/admin";
import { updateEquipment } from "@/actions/equipments-action";
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
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;
  const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
  const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
  const rentalEntity = ENTITY_DATA.find((e) => e.id === "rental")!;
  const repairsEntity = ENTITY_DATA.find((e) => e.id === "repairs")!;

  const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === equipment.schema.category);
  const categoryColor = categoryConfig?.color || equipmentEntity.color;
  const CategoryIcon = categoryConfig?.icon || equipmentEntity.icon;

  const TeacherIcon = teacherEntity.icon;
  const StudentIcon = studentEntity.icon;
  const RentalIcon = rentalEntity.icon;
  const RepairsIcon = repairsEntity.icon;

  // Stats
  const eventCount = EquipmentTableGetters.getEventCount(equipment);
  const durationMinutes = EquipmentTableGetters.getTotalUsageMinutes(equipment);
  const revenue = EquipmentTableGetters.getRevenue(equipment);

  // Equipment Card
  const equipmentName = `${equipment.schema.model}${equipment.schema.size ? ` - ${equipment.schema.size}m` : ""}`;

  const handleStatusChange = async (newStatus: EquipmentStatus) => {
    const result = await updateEquipment(equipment.schema.id, {
      status: newStatus,
    });
    if (!result.success) {
      console.error("Error updating equipment status:", result.error);
    }
  };

  const equipmentCardData: LeftColumnCardData = {
    name: equipmentName,
    status: (
      <EquipmentStatusLabel
        status={equipment.schema.status as EquipmentStatus}
        onStatusChange={handleStatusChange}
      />
    ),
    avatar: (
      <div className="flex-shrink-0" style={{ color: categoryColor }}>
        <CategoryIcon className="w-10 h-10" />
      </div>
    ),
    fields: [
      {
        label: "SKU",
        value: equipment.schema.sku,
      },
      {
        label: "Brand",
        value: equipment.schema.brand,
      },
      {
        label: "Category",
        value: equipment.schema.category,
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
        label: "Created",
        value: formatDate(equipment.schema.created_at),
      },
    ],
    accentColor: categoryColor,
    isEditable: true,
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
  const rentals = equipment.relations.rentals || [];
  const rentalCount = rentals.length;

  const rentalFields = rentals.map((rental) => {
    const studentsStr = rental.students.map(s => `${s.first_name} ${s.last_name}`).join(", ") || "Unknown";
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

  return (
    <>
      <EntityLeftColumn
        cards={[equipmentCardData, teachersCardData, studentsCardData, rentalsCardData, repairsCardData]}
      />
      <EquipmentTeacherManModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        equipment={equipment as any}
      />
    </>
  );
}
