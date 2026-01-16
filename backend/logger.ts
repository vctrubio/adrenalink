/**
 * Centralized Logger Utility
 *
 * Replaces 202+ scattered console.error/console.log calls throughout codebase.
 * Single source of truth for logging format and behavior.
 *
 * Usage:
 *   logger.error("Failed to fetch student", error, { studentId: "123" });
 *   logger.warn("Retrying operation...", { attempt: 2 });
 *   logger.info("Created new booking", { bookingId: "abc" });
 *   logger.debug("Processing completed", { duration: 234 });
 */

type LogLevel = "error" | "warn" | "info" | "debug";
type LogContext = Record<string, any>;

/**
 * Format context object for logging
 */
function formatContext(context?: LogContext): string {
    if (!context || Object.keys(context).length === 0) return "";
    try {
        return JSON.stringify(context);
    } catch {
        return "[unable to serialize context]";
    }
}

/**
 * Get appropriate console method based on level
 */
function getConsoleMethod(level: LogLevel): typeof console.error {
    switch (level) {
        case "error":
            return console.error;
        case "warn":
            return console.warn;
        case "info":
            return console.info;
        case "debug":
            return console.debug;
        default:
            return console.log;
    }
}

/**
 * Format error for logging
 */
function formatError(error: unknown): string {
    if (error instanceof Error) {
        return `${error.name}: ${error.message}`;
    }
    if (typeof error === "string") {
        return error;
    }
    try {
        return JSON.stringify(error);
    } catch {
        return "[unable to serialize error]";
    }
}

/**
 * Logger instance
 */
export const logger = {
    /**
     * Log error
     * @param message Human-readable message
     * @param error Error object or message
     * @param context Additional context
     */
    error: (message: string, error?: unknown, context?: LogContext) => {
        const logFn = getConsoleMethod("error");
        const contextStr = formatContext(context);
        const errorStr = error ? ` | ${formatError(error)}` : "";
        logFn(`[ERROR] ${message}${errorStr} ${contextStr}`);
    },

    /**
     * Log warning
     * @param message Human-readable message
     * @param context Additional context
     */
    warn: (message: string, context?: LogContext) => {
        const logFn = getConsoleMethod("warn");
        const contextStr = formatContext(context);
        logFn(`[WARN] ${message} ${contextStr}`);
    },

    /**
     * Log info
     * @param message Human-readable message
     * @param context Additional context
     */
    info: (message: string, context?: LogContext) => {
        const logFn = getConsoleMethod("info");
        const contextStr = formatContext(context);
        logFn(`[INFO] ${message} ${contextStr}`);
    },

    /**
     * Log debug
     * @param message Human-readable message
     * @param context Additional context
     */
    debug: (message: string, context?: LogContext) => {
        const logFn = getConsoleMethod("debug");
        const contextStr = formatContext(context);
        logFn(`[DEBUG] ${message} ${contextStr}`);
    },
};

/**
 * Examples:
 *
 * BEFORE:
 * console.error("Error fetching student:", error);
 *
 * AFTER:
 * logger.error("Failed to fetch student", error, { studentId: "123" });
 *
 * ---
 *
 * BEFORE:
 * console.error("Unexpected error in getStudentById:", error);
 *
 * AFTER:
 * logger.error("Unexpected error in getStudentById", error);
 *
 * ---
 *
 * BEFORE:
 * if (result.length === 0) {
 *   console.error("No students found for school");
 * }
 *
 * AFTER:
 * if (result.length === 0) {
 *   logger.warn("No students found for school", { schoolId });
 * }
 */
