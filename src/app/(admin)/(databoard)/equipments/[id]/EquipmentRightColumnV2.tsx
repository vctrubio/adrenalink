"use client";

import type { EquipmentModel } from "@/backend/models";
import { TeachersUsingEquipmentCard } from "@/src/components/cards/TeachersUsingEquipmentCard";
import { EquipmentRepairsCard } from "@/src/components/cards/EquipmentRepairsCard";
import { EquipmentStatsColumns } from "./EquipmentStatsColumns";

interface EquipmentRightColumnV2Props {
  equipment: EquipmentModel;
}

export function EquipmentRightColumnV2({ equipment }: EquipmentRightColumnV2Props) {
  return (
    <div className="space-y-4">
      <EquipmentStatsColumns equipment={equipment} />
      <TeachersUsingEquipmentCard equipment={equipment} />
      <EquipmentRepairsCard equipment={equipment} />
    </div>
  );
}
