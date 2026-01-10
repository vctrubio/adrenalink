export const EQUIPMENT_STATUS = {
    RENTAL: "rental",
    PUBLIC: "public",
    SELLING: "selling",
    SOLD: "sold",
    INREPAIR: "inrepair",
    RIP: "rip",
} as const;

export type EquipmentStatus = typeof EQUIPMENT_STATUS[keyof typeof EQUIPMENT_STATUS];
