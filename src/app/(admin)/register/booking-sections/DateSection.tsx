"use client";

import { ReactNode } from "react";
import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { DoubleDatePicker, type DateRange } from "../../../../components/pickers";

interface DateSectionProps {
    dateRange: DateRange;
    onDateChange: (dateRange: DateRange) => void;
    isExpanded: boolean;
    onToggle: () => void;
    onExpand?: () => void;
    disabled?: boolean;
    title?: ReactNode;
}

export function DateSection({
    dateRange,
    onDateChange,
    isExpanded,
    onToggle,
    onExpand,
    disabled = false,
    title = "Booking Dates",
}: DateSectionProps) {
    const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking");

    const handleDateRangeChange = (newDateRange: DateRange) => {
        onDateChange(newDateRange);
    };

    const hasDates = !!(dateRange.startDate && dateRange.endDate);

    return (
        <Section
            id="dates-section"
            title={title}
            isExpanded={isExpanded}
            onToggle={onToggle}
            entityIcon={bookingEntity?.icon}
            entityColor={bookingEntity?.color}
            state={{
                isSelected: hasDates,
            }}
            hasSelection={hasDates}
            onClear={() => onDateChange({ startDate: "", endDate: "" })}
            onExpand={onExpand}
        >
            <DoubleDatePicker
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                disabled={disabled}
                allowPastDates={false}
                showNavigationButtons={true}
                showDayCounter={true}
            />
        </Section>
    );
}
