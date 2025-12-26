import type { EquipmentModel } from "@/backend/models";
import type { StatConfig } from "@/types/stats";

export const EquipmentIdStats = {
  getStats(equipment: EquipmentModel): StatConfig[] {
    const teacherEquipments = equipment.relations?.teacherEquipments || [];
    const rentals = equipment.relations?.rentals || [];
    const repairs = equipment.relations?.equipmentRepairs || [];

    return [
      {
        label: "Teachers",
        value: teacherEquipments.length.toString(),
      },
      {
        label: "Rentals",
        value: rentals.length.toString(),
      },
      {
        label: "Repairs",
        value: repairs.length.toString(),
      },
    ];
  },
};
