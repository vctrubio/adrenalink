// ============ STATUS COLORS ============
// Define all status-to-color mappings for entities

export const STATUS_COLORS = {
	// Event Status Colors
	eventPlanned: "#9ca3af", // grey
	eventTbc: "#a855f7", // purple
	eventCompleted: "#86efac", // light green
	eventUncompleted: "#fbbf24", // light orange
} as const;

// ============ EVENT STATUS CONFIGURATION ============
export type EventStatus = "planned" | "tbc" | "completed" | "uncompleted";

export interface EventStatusConfig {
	status: EventStatus;
	color: string;
	label: string;
}

export const EVENT_STATUS_CONFIG: Record<EventStatus, EventStatusConfig> = {
	planned: {
		status: "planned",
		color: STATUS_COLORS.eventPlanned,
		label: "Planned",
	},
	tbc: {
		status: "tbc",
		color: STATUS_COLORS.eventTbc,
		label: "To Be Confirmed",
	},
	completed: {
		status: "completed",
		color: STATUS_COLORS.eventCompleted,
		label: "Completed",
	},
	uncompleted: {
		status: "uncompleted",
		color: STATUS_COLORS.eventUncompleted,
		label: "Uncompleted",
	},
} as const;

// ============ HELPER FUNCTIONS ============

/**
 * Get status configuration by status value
 */
export function getEventStatusConfig(status: EventStatus): EventStatusConfig {
	return EVENT_STATUS_CONFIG[status] || EVENT_STATUS_CONFIG.planned;
}

/**
 * Get status color by status value
 */
export function getEventStatusColor(status: EventStatus): string {
	return getEventStatusConfig(status).color;
}

/**
 * Get status label by status value
 */
export function getEventStatusLabel(status: EventStatus): string {
	return getEventStatusConfig(status).label;
}
