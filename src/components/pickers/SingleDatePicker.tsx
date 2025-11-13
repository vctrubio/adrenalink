"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  getRelativeDateLabel,
  formatDateForInput,
  getTodayDateString,
  addDays,
} from "@/getters/date-getter";

interface SingleDatePickerProps {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  disabled?: boolean;
  allowPastDates?: boolean;
  showNavigationButtons?: boolean;
  showTodayButton?: boolean;
}

export function SingleDatePicker({
  selectedDate,
  onDateChange,
  disabled = false,
  allowPastDates = true,
  showNavigationButtons = true,
  showTodayButton = true,
}: SingleDatePickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isToday, setIsToday] = useState(false);
  const [relativeLabel, setRelativeLabel] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const today = getTodayDateString();
    const todayCheck = selectedDate === today;
    setIsToday(todayCheck);

    if (selectedDate && !todayCheck) {
      const label = getRelativeDateLabel(selectedDate);
      setRelativeLabel(label);
    } else {
      setRelativeLabel("");
    }
  }, [selectedDate]);

  const updateDate = (newDate: string) => {
    if (onDateChange) {
      onDateChange(newDate);
      return;
    }

    const currentParams = new URLSearchParams(window.location.search);

    if (newDate) {
      currentParams.set("date", newDate);
    } else {
      currentParams.delete("date");
    }

    const queryString = currentParams.toString();
    const newUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;
    router.push(newUrl);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newDate = e.target.value;
    updateDate(newDate);
  };

  const navigateDate = (direction: "prev" | "next") => {
    if (disabled) return;
    const currentDate = selectedDate ? new Date(selectedDate) : new Date();
    currentDate.setHours(12, 0, 0, 0);

    const delta = direction === "prev" ? -1 : 1;
    const newDate = addDays(currentDate, delta);

    const dateString = formatDateForInput(newDate);
    updateDate(dateString);
  };

  const getMinDate = () => {
    if (allowPastDates) return undefined;
    return getTodayDateString();
  };

  return (
    <div className={`space-y-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showTodayButton && isMounted && isToday ? (
            <span className="text-xs bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-md text-green-700 dark:text-green-300">
              Today
            </span>
          ) : showTodayButton && isMounted && !isToday ? (
            <button
              type="button"
              onClick={() => updateDate(getTodayDateString())}
              className="text-xs bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 px-2 py-1 rounded-md text-blue-700 dark:text-blue-300 transition-colors"
              title="Go to today"
            >
              Go to Today
            </button>
          ) : null}
        </div>
        {isMounted && relativeLabel && !isToday && (
          <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
            {relativeLabel}
          </span>
        )}
      </label>
      <div className="flex items-center gap-1">
        {showNavigationButtons && (
          <button
            type="button"
            onClick={() => navigateDate("prev")}
            disabled={disabled}
            className="p-2 border border-border rounded-lg bg-background hover:bg-muted active:bg-muted/80 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors font-mono"
            title="Previous day"
          >
            ←
          </button>
        )}
        <input
          type="date"
          value={formatDateForInput(selectedDate || "")}
          onChange={handleDateChange}
          min={getMinDate()}
          disabled={disabled}
          className="p-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring flex-1 min-w-0"
          placeholder="Select date"
        />
        {showNavigationButtons && (
          <button
            type="button"
            onClick={() => navigateDate("next")}
            disabled={disabled}
            className="p-2 border border-border rounded-lg bg-background hover:bg-muted active:bg-muted/80 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors font-mono"
            title="Next day"
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}
