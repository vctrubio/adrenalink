import type { ClassboardModel } from "@/backend/classboard/ClassboardModel";
import { ClassboardStatistics } from "@/backend/classboard/ClassboardStatistics";
import type { TransactionEventData } from "@/types/transaction-event";
import type { DateGroup, TransactionEvent, HomeStats } from "./HomePage";

export function getHomeStats(classboardData: ClassboardModel): HomeStats {
    const stats = new ClassboardStatistics(classboardData, undefined, true).getDailyLessonStats();
    return {
        duration: stats.durationCount,
        commissions: stats.revenue.commission,
        profit: stats.revenue.profit,
        events: stats.eventCount,
    };
}

export function getGroupedEvents(classboardData: ClassboardModel): DateGroup[] {
    const stats = new ClassboardStatistics(classboardData, undefined, true);
    // Currency is arbitrary here as we only need the raw event data structure
    const allEvents = stats.getAllEventsWithFinancials("YEN");

    const groups: Record<string, DateGroup> = {};

    allEvents.forEach((data) => {
        const dateKey = data.event.date.split("T")[0];

        if (!groups[dateKey]) {
            groups[dateKey] = {
                date: dateKey,
                events: [],
            };
        }

        groups[dateKey].events.push(data); // Push the full TransactionEventData
    });

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
}

export function getAllTransactionEvents(classboardData: ClassboardModel, currency: string): TransactionEventData[] {
    // Use ClassboardStatistics as single source of truth for financial logic
    const stats = new ClassboardStatistics(classboardData, undefined, true);
    return stats.getAllEventsWithFinancials(currency);
}
