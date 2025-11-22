import type { RAINBOW_COLORS } from "@/config/rainbow-entities";

/**
 * Rainbow shade type - valid shade IDs from RAINBOW_COLORS
 * e.g., "grey-1", "blue-2", "purple-1"
 */
export type RainbowShade = keyof typeof RAINBOW_COLORS;

/**
 * Entity info containing schema and example data
 * @schema - Mapping of field names to their types (e.g., { username: "string", price: "int" })
 *           Types reference the drizzle schema definitions
 * @rows - Array of example data rows, each row is an array of strings corresponding to schema field order
 *         e.g., [["value1", "value2"], ["value3", "value4"]]
 */
export interface EntityInfo {
  schema: Record<string, string>; // Field name -> Type mapping
  rows: string[][]; // Example data rows
}

/**
 * Entity configuration - single source of truth for rainbow entities
 * All data derived from manual.md
 */
export interface EntityConfig {
  id: string; // Unique identifier (e.g., "school", "teacher")
  name: string; // Display name (e.g., "Schools")
  shadeId: string; // Rainbow shade ID (e.g., "grey-1", "blue-2")
  icon: React.ComponentType<{ className?: string }>; // Icon component
  description: React.ComponentType; // Description component
  info: EntityInfo; // Schema and example data
}
