// ============ DURATION FORMATTING ============
// Converts minutes to human-readable format (e.g., "1:30 hrs", "55 mins")
// Never shows float numbers, always uses H:MM format

export function getPrettyDuration(durationMinutes: number): string {
    // Round to nearest minute to avoid floats
    const totalMinutes = Math.round(durationMinutes);

    if (totalMinutes === 0) {
        return "0 mins";
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
        return `${minutes} mins`;
    }

    return `${hours}:${minutes.toString().padStart(2, "0")} hrs`;
}
