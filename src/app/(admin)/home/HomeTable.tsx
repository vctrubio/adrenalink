"use client";

import { TransactionEventsTable, type GroupingType } from "@/src/components/school/TransactionEventsTable";
import type { TransactionEventData } from "@/types/transaction-event";

interface HomeTableProps {
    events: TransactionEventData[];
    groupBy: GroupingType;
}

export function HomeTable({ events, groupBy }: HomeTableProps) {
    return (
        <div className="space-y-4">
            <TransactionEventsTable events={events} groupBy={groupBy} />
        </div>
    );
}
