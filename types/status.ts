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

/**
 * Get progress bar color based on event statuses
 * Priority: completed > tbc > uncompleted > planned
 */

/*
 *
 * this is horshit
    * this is what we want export function BookingProgressBar({ eventMinutes, totalMinutes }: BookingProgressBarProps) {
  if (!totalMinutes || totalMinutes === 0) {
    return <span className="text-xs text-muted-foreground">N/A</span>;
  }

  const completedPercentage = (eventMinutes.completed / totalMinutes) * 100;
  const plannedPercentage = (eventMinutes.planned / totalMinutes) * 100;
  const tbcPercentage = (eventMinutes.tbc / totalMinutes) * 100;

  // Calculate cumulative percentages for proper positioning
  const completedWidth = Math.min(completedPercentage, 100);
  const plannedWidth = Math.min(plannedPercentage, 100 - completedWidth);
  const tbcWidth = Math.min(tbcPercentage, 100 - completedWidth - plannedWidth);

  const totalUsedMinutes = eventMinutes.completed + eventMinutes.planned + eventMinutes.tbc;

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className="h-3 rounded-full overflow-hidden border border-border bg-gray-100 dark:bg-gray-800"
        style={{ width: "100px" }}
      >
        <div
          className="h-full bg-green-600 transition-all duration-300 float-left"
          style={{ width: `${completedWidth}%` }}
        />
        <div
          className="h-full bg-green-300 transition-all duration-300 float-left"
          style={{ width: `${plannedWidth}%` }}
        />
        <div
          className="h-full bg-purple-500 transition-all duration-300 float-left"
          style={{ width: `${tbcWidth}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {Math.round(totalUsedMinutes / 60 * 10) / 10}/<Duration minutes={totalMinutes} />
      </span>
    </div>
    *
    *
    */

export function getProgressBarColor(events: Array<{ status: EventStatus }>): string {
    if (events.length === 0) return STATUS_COLORS.eventPlanned;

    const statusPriority = { completed: 4, tbc: 3, uncompleted: 2, planned: 1 };
    const dominantStatus = events.reduce((max, evt) => {
        const maxPriority = statusPriority[max.status as keyof typeof statusPriority] || 0;
        const evtPriority = statusPriority[evt.status as keyof typeof statusPriority] || 0;
        return evtPriority > maxPriority ? evt : max;
    }).status;

    return getEventStatusColor(dominantStatus);
}
