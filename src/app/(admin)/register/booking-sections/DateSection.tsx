"use client";

import { ReactNode, useMemo, useState, useEffect } from "react";
import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { DoubleDatePicker, type DateRange } from "../../../../components/pickers";
import { calculateDaysDifference, toISOString, addDays } from "@/getters/date-getter";

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

    // Calculate if it's one day based on dates
    const isOneDay = useMemo(() => {
        if (!dateRange.startDate || !dateRange.endDate) return false;
        return calculateDaysDifference(dateRange.startDate, dateRange.endDate) === 0;
    }, [dateRange.startDate, dateRange.endDate]);

    const [oneDay, setOneDay] = useState(isOneDay);

    // Sync state when dates change externally
    useEffect(() => {
        setOneDay(isOneDay);
    }, [isOneDay]);

    const handleOneDayToggle = (newOneDay: boolean) => {
        setOneDay(newOneDay);
        if (newOneDay) {
            // Set end date to same as start date
            if (dateRange.startDate) {
                onDateChange({ startDate: dateRange.startDate, endDate: dateRange.startDate });
            }
        } else {
            // Expand to 2 days if currently one day
            if (dateRange.startDate) {
                const start = new Date(dateRange.startDate);
                start.setHours(12, 0, 0, 0);
                const end = addDays(start, 1);
                onDateChange({ startDate: dateRange.startDate, endDate: toISOString(end) });
            }
        }
    };

    const headerActions = (
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
                type="button"
                disabled={disabled}
                onClick={(e) => {
                    e.stopPropagation();
                    handleOneDayToggle(true);
                }}
                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                    oneDay
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
            >
                One day
            </button>
            <button
                type="button"
                disabled={disabled}
                onClick={(e) => {
                    e.stopPropagation();
                    handleOneDayToggle(false);
                }}
                className={`px-3 py-2 text-xs font-semibold transition-colors border-l border-border ${
                    !oneDay
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
            >
                Multiple
            </button>
        </div>
    );

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
            onExpand={onExpand}
            headerActions={headerActions}
        >
            <DoubleDatePicker
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                disabled={disabled}
                allowPastDates={true}
                showNavigationButtons={true}
                showDayCounter={true}
                oneDay={oneDay}
                onOneDayChange={handleOneDayToggle}
            />
        </Section>
    );
}
