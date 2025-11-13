"use client";

import { useEffect } from "react";
import {
  getRelativeDateLabel,
  formatDateForInput,
  getTodayISO,
  getTomorrowISO,
  isBeforeToday,
  toISOString,
  addDays,
  daysBetween,
} from "@/getters/date-getter";
import { DateNavigationButtons } from "./DateNavigationButtons";

export interface DateRange {
  startDate: string;
  endDate: string;
}

interface DoubleDatePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  disabled?: boolean;
  allowPastDates?: boolean;
  showNavigationButtons?: boolean;
  showDayCounter?: boolean;
}

export function DoubleDatePicker({
  dateRange,
  onDateRangeChange,
  disabled = false,
  allowPastDates = false,
  showNavigationButtons = true,
  showDayCounter = true,
}: DoubleDatePickerProps) {
  // Initialize with proper dates if empty
  useEffect(() => {
    if (!dateRange.startDate || !dateRange.endDate) {
      onDateRangeChange({
        startDate: getTodayISO(),
        endDate: getTomorrowISO(),
      });
    }
  }, [dateRange.startDate, dateRange.endDate]);

  // Force dates to be valid - if start date is before today and past dates not allowed, use today
  let safeStartDate = dateRange.startDate || getTodayISO();
  let safeEndDate = dateRange.endDate || getTomorrowISO();

  if (!allowPastDates && isBeforeToday(safeStartDate)) {
    safeStartDate = getTodayISO();
    safeEndDate = getTomorrowISO();

    // Update parent immediately with correct dates
    setTimeout(() => {
      onDateRangeChange({ startDate: safeStartDate, endDate: safeEndDate });
    }, 0);
  }

  const startDate = new Date(safeStartDate);
  const endDate = new Date(safeEndDate);

  const startRelativeLabel = getRelativeDateLabel(safeStartDate);
  const endRelativeLabel = getRelativeDateLabel(safeEndDate);

  const daysDifference = Math.max(1, daysBetween(startDate, endDate));

  const updateParent = (newStartDate: Date, newEndDate: Date) => {
    const startISO = toISOString(newStartDate);
    const endISO = toISOString(newEndDate);
    onDateRangeChange({ startDate: startISO, endDate: endISO });
  };

  const incrementEndDate = () => {
    if (disabled) return;
    const newEndDate = addDays(endDate, 1);
    updateParent(startDate, newEndDate);
  };

  const decrementEndDate = () => {
    if (disabled) return;
    if (daysDifference <= 1) return;
    const newEndDate = addDays(endDate, -1);
    updateParent(startDate, newEndDate);
  };

  const incrementStartDate = () => {
    if (disabled) return;
    const newStartDate = addDays(startDate, 1);
    let newEndDate = new Date(endDate);
    if (newStartDate >= newEndDate) {
      newEndDate = addDays(newStartDate, 1);
    }
    updateParent(newStartDate, newEndDate);
  };

  const decrementStartDate = () => {
    if (disabled) return;
    const newStartDate = addDays(startDate, -1);
    if (!allowPastDates && isBeforeToday(newStartDate.toISOString())) return;
    updateParent(newStartDate, endDate);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const dateString = e.target.value;
    const [year, month, day] = dateString.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(12, 0, 0, 0);

    let newEndDate = new Date(endDate);
    if (selectedDate >= endDate) {
      newEndDate = addDays(selectedDate, 1);
    }

    updateParent(selectedDate, newEndDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const dateString = e.target.value;
    const [year, month, day] = dateString.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    selectedDate.setHours(12, 0, 0, 0);

    if (selectedDate < startDate) return;

    updateParent(startDate, selectedDate);
  };

  const getMinEndDate = () => {
    return formatDateForInput(startDate);
  };

  const getMinStartDate = () => {
    if (allowPastDates) return undefined;
    return formatDateForInput(new Date());
  };

  return (
    <div
      className={`space-y-4 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Start and End Date Side by Side */}
      <div className="grid grid-cols-2 gap-8">
        {/* Start Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            Start Date
            {startRelativeLabel && (
              <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                {startRelativeLabel}
              </span>
            )}
            {showNavigationButtons && (
              <DateNavigationButtons
                onPrevious={decrementStartDate}
                onNext={incrementStartDate}
                disabled={disabled}
                className="ml-auto"
              />
            )}
          </label>
          <input
            type="date"
            value={formatDateForInput(startDate)}
            onChange={handleStartDateChange}
            min={getMinStartDate()}
            disabled={disabled}
            className="w-full p-3 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            End Date
            {endRelativeLabel && (
              <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                {endRelativeLabel}
              </span>
            )}
          </label>
          <input
            type="date"
            value={formatDateForInput(endDate)}
            onChange={handleEndDateChange}
            min={getMinEndDate()}
            disabled={disabled}
            className="w-full p-3 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>

      {/* Day Counter with Increment/Decrement Buttons */}
      {showDayCounter && (
        <div className="flex items-center justify-center space-x-4">
          <button
            type="button"
            onClick={decrementEndDate}
            disabled={disabled || daysDifference <= 1}
            className="btn-round-outline btn-round-sm"
          >
            - 1 Day
          </button>

          <span className="text-sm font-medium text-foreground px-2">
            {daysDifference} day{daysDifference !== 1 ? "s" : ""}
          </span>

          <button
            type="button"
            onClick={incrementEndDate}
            disabled={disabled}
            className="btn-round-outline btn-round-sm"
          >
            + 1 Day
          </button>
        </div>
      )}
    </div>
  );
}
