/**
 * Debug logging utility that respects PRINTF environment variable
 * Usage: printf("message", data) - same signature as console.log
 */
export default function printf(...args) {
    // Check if PRINTF is set to "TRUE" (case insensitive)
    if (process.env.PRINTF?.toUpperCase() === "TRUE") {
        console.log(...args);
    }
    // If PRINTF is not set to TRUE, do nothing (return before logging)
}
