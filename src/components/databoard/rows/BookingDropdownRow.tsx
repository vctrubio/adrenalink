"use client";

import type { BookingModel } from "@/backend/models";

interface BookingDropdownRowProps {
    item: BookingModel;
}

export const BookingDropdownRow = ({ item }: BookingDropdownRowProps) => {
    return (
        <pre>{JSON.stringify(item, null, 2)}</pre>
    );
};
