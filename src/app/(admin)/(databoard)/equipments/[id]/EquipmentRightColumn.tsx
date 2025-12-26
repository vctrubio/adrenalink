"use client";

import type { EquipmentModel } from "@/backend/models";
import { TeachersUsingEquipmentCard } from "@/src/components/cards/TeachersUsingEquipmentCard";
import { EquipmentRepairsCard } from "@/src/components/cards/EquipmentRepairsCard";

interface EquipmentRightColumnProps {
  equipment: EquipmentModel;
}

export function EquipmentRightColumn({ equipment }: EquipmentRightColumnProps) {
  return (
    <div className="space-y-4">
      <TeachersUsingEquipmentCard equipment={equipment} />
      <EquipmentRepairsCard equipment={equipment} />
    </div>
  );
}
