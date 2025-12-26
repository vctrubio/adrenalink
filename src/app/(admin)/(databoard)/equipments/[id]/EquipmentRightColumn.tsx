"use client";

import type { EquipmentModel } from "@/backend/models";
import { TeachersUsingEquipmentCard } from "@/src/components/cards/TeachersUsingEquipmentCard";
import { EquipmentRepairsCard } from "@/src/components/cards/EquipmentRepairsCard";
import { EquipmentStatsColumns } from "./EquipmentStatsColumns";

interface EquipmentRightColumnProps {
  equipment: EquipmentModel;
}

export function EquipmentRightColumn({ equipment }: EquipmentRightColumnProps) {
  return (
    <div className="space-y-4">
      <EquipmentStatsColumns equipment={equipment} />
      <TeachersUsingEquipmentCard equipment={equipment} />
      <EquipmentRepairsCard equipment={equipment} />
    </div>
  );
}
