"use client";

import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { DoubleDatePicker, type DateRange } from "../../../components/pickers";

interface DateSectionProps {
  dateRange: DateRange;
  onDateChange: (field: "startDate" | "endDate", value: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function DateSection({
  dateRange,
  onDateChange,
  isExpanded,
  onToggle,
  disabled = false,
}: DateSectionProps) {
  const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking");

  const handleDateRangeChange = (newDateRange: DateRange) => {
    onDateChange("startDate", newDateRange.startDate);
    onDateChange("endDate", newDateRange.endDate);
  };

  return (
    <Section
      id="dates-section"
      title="Booking Dates"
      isExpanded={isExpanded}
      onToggle={onToggle}
      entityIcon={bookingEntity?.icon}
      entityColor={bookingEntity?.color}
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
