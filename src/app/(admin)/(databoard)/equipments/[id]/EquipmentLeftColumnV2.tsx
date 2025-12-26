"use client";

import { EntityLeftColumn } from "@/src/components/ids/EntityLeftColumn";
import { EquipmentStatusLabel } from "@/src/components/labels/EquipmentStatusLabel";
import { LessonEventRevenueBadge } from "@/src/components/ui/badge/lesson-event-revenue";
import { updateEquipment } from "@/actions/equipments-action";
import { formatDate } from "@/getters/date-getter";
import { getFullDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import type { EquipmentModel } from "@/backend/models";
import type { LeftColumnCardData } from "@/types/left-column";
import type { EquipmentStatus } from "@/types/status";
import type { EquipmentIdStats } from "@/getters/databoard-sql-equipment";

interface EquipmentLeftColumnV2Props {
  equipment: EquipmentModel;
  equipmentStats: EquipmentIdStats;
}

const MOCK_RENTAL_PPH = 21; // Mock price per hour for rentals

export function EquipmentLeftColumnV2({ equipment, equipmentStats }: EquipmentLeftColumnV2Props) {
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
        value: formatDate(equipment.schema.createdAt),
      },
    ],
    accentColor: categoryColor,
    isEditable: true,
  };

  // Teachers Card
  const teacherEquipments = equipment.relations?.teacherEquipments || [];
  const teachers = teacherEquipments.map((te: any) => te.teacher).filter(Boolean);

  const teacherFields = teachers.map((teacher: any) => ({
    label: teacher.username,
    value: `${teacher.firstName} ${teacher.lastName}`,
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
  };

  // Students Card (Events with this equipment)
  const studentsCardData: LeftColumnCardData = {
    name: "Students",
    status: (
      <LessonEventRevenueBadge
        lessonCount={equipmentStats.lessons_count}
        duration={getFullDuration(equipmentStats.total_duration_minutes)}
        revenue={Math.round(equipmentStats.total_revenue)}
      />
    ),
    avatar: (
      <div className="flex-shrink-0" style={{ color: studentEntity.color }}>
        <StudentIcon className="w-10 h-10" />
      </div>
    ),
    fields: [{ label: "Events", value: equipmentStats.events_count.toString() }],
    accentColor: studentEntity.color,
    isAddable: false,
  };

  // Rentals Card
  const rentals = equipment.relations?.rentals || [];

  // Calculate rental stats
  const rentalCount = rentals.length;
  const totalRentalDuration = rentals.reduce((sum: number, rental: any) => sum + (rental.duration || 0), 0);
  const rentalRevenue = Math.round((totalRentalDuration / 60) * MOCK_RENTAL_PPH);

  const rentalFields = rentals.map((rental: any) => {
    const studentName = rental.student ? `${rental.student.firstName} ${rental.student.lastName}` : "Unknown";
    return {
      label: formatDate(rental.date),
      value: studentName,
    };
  });

  const rentalsCardData: LeftColumnCardData = {
    name: "Rentals",
    status: (
      <LessonEventRevenueBadge
        lessonCount={rentalCount}
        duration={getFullDuration(totalRentalDuration)}
        revenue={rentalRevenue}
      />
    ),
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
  const repairs = equipment.relations?.equipmentRepairs || [];

  const repairFields = repairs.map((repair: any) => ({
    label: formatDate(repair.date),
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
    <EntityLeftColumn
      header={`Equipment ${equipment.schema.sku}`}
      cards={[equipmentCardData, teachersCardData, studentsCardData, rentalsCardData, repairsCardData]}
    />
  );
}
