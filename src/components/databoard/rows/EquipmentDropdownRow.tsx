"use client";

import type { EquipmentModel } from "@/backend/models";

interface EquipmentDropdownRowProps {
    item: EquipmentModel;
}

export const EquipmentDropdownRow = ({ item }: EquipmentDropdownRowProps) => {
    return (
        <pre>{JSON.stringify(item, null, 2)}</pre>
    );
};
