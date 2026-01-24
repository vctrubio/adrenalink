/**
 * Centralized Logger Utility
 *
 * Replaces 202+ scattered console.error/console.log calls throughout codebase.
 * Single source of truth for logging format and behavior.
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
    error: (message: string, error?: unknown, context?: LogContext) => {
        const logFn = getConsoleMethod("error");
        const contextStr = formatContext(context);
        const errorStr = error ? ` | ${formatError(error)}` : "";
        logFn(`[ERROR] ${message}${errorStr} ${contextStr}`);
    },

    warn: (message: string, context?: LogContext) => {
        const logFn = getConsoleMethod("warn");
        const contextStr = formatContext(context);
        logFn(`[WARN] ${message} ${contextStr}`);
    },

    info: (message: string, context?: LogContext) => {
        const logFn = getConsoleMethod("info");
        const contextStr = formatContext(context);
        logFn(`[INFO] ${message} ${contextStr}`);
    },

    debug: (message: string, context?: LogContext) => {
        const logFn = getConsoleMethod("debug");
        const contextStr = formatContext(context);
        logFn(`[DEBUG] ${message} ${contextStr}`);
    },
};