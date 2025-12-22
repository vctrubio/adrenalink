export function getPricePerHour(
    pricePerStudent: number,
    capacityStudents: number,
    durationMinutes: number
): number {
    return (pricePerStudent * capacityStudents) / (durationMinutes / 60);
}
