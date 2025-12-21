"use client";

import type { EventModel } from "@/backend/models";

interface EventDropdownRowProps {
    item: EventModel;
}

export const EventDropdownRow = ({ item }: EventDropdownRowProps) => {
    return (
        <pre>{JSON.stringify(item, null, 2)}</pre>
    );
};