"use client";

import { TransactionEventsTable } from "@/src/app/(admin)/(tables)/TransactionEventsTable";
import type { TransactionEventData } from "@/types/transaction-event";

export function HomeTable({ events }: { events: TransactionEventData[] }) {
    return <TransactionEventsTable events={events} />;
}
