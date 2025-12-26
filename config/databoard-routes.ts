import { ENTITY_DATA, type EntityConfig } from "./entities";

// Entities that appear in the databoard navigation
export const DATABOARD_ENTITY_IDS = [
    "student",
    "teacher",
    "booking",
    "equipment",
    "schoolPackage",
] as const;

export type DataboardEntityId = (typeof DATABOARD_ENTITY_IDS)[number];

// Get entity configs for databoard navigation
export const DATABOARD_ENTITIES: EntityConfig[] = ENTITY_DATA.filter((entity) =>
    DATABOARD_ENTITY_IDS.includes(entity.id as DataboardEntityId)
);

// Helper to check if a route is a databoard route
export function isDataboardRoute(pathname: string): boolean {
    return DATABOARD_ENTITIES.some((entity) => pathname.startsWith(entity.link));
}

// Get entity from pathname
export function getDataboardEntityFromPath(pathname: string): EntityConfig | undefined {
    return DATABOARD_ENTITIES.find((entity) => pathname.startsWith(entity.link));
}
