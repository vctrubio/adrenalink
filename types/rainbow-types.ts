/**
 * Entity info containing description and example data
 * @description - Human-readable description of the entity
 * @schema - Mapping of field names to their types (e.g., { username: "string", price: "int" })
 *           Types reference the drizzle schema definitions
 * @rows - Array of example data rows, each row is an array of strings corresponding to schema field order
 *         e.g., [["value1", "value2"], ["value3", "value4"]]
 */
export interface EntityInfo {
  description: string;
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
  info: EntityInfo; // All entity details
}
