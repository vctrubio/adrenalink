"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  getRelativeDateLabel,
  formatDateForInput,
  getTodayDateString,
  addDays,
} from "@/getters/date-getter";

interface ClassboardDatePickerProps {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  disabled?: boolean;
  allowPastDates?: boolean;
}

export function ClassboardDatePicker({
  selectedDate,
  onDateChange,
  disabled = false,
  allowPastDates = true,
}: ClassboardDatePickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const today = getTodayDateString();
  const isToday = selectedDate === today;
  const relativeLabel = getRelativeDateLabel(selectedDate || today);

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 bg-background w-full ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="flex items-center gap-2">
        <button
            type="button"
            onClick={() => navigateDate("prev")}
            disabled={disabled}
            className="p-3 border border-border rounded-lg bg-background hover:bg-muted active:bg-muted/80 text-xl focus:outline-none focus:ring-2 focus:ring-ring transition-colors font-mono"
            title="Previous day"
          >
            ←
          </button>
        <input
          type="date"
          value={formatDateForInput(selectedDate || "")}
          onChange={handleDateChange}
          min={getMinDate()}
          disabled={disabled}
          className="p-3 border border-border rounded-lg bg-background text-xl focus:outline-none focus:ring-2 focus:ring-ring flex-1 min-w-0"
          placeholder="Select date"
        />
        <button
            type="button"
            onClick={() => navigateDate("next")}
            disabled={disabled}
            className="p-3 border border-border rounded-lg bg-background hover:bg-muted active:bg-muted/80 text-xl focus:outline-none focus:ring-2 focus:ring-ring transition-colors font-mono"
            title="Next day"
          >
            →
          </button>
      </div>
      <div className="flex items-center gap-4">
        {isMounted && !isToday ? (
            <button
              type="button"
              onClick={() => updateDate(getTodayDateString())}
              className="text-sm bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-md text-blue-700 dark:text-blue-300 transition-colors"
              title="Go to today"
            >
              Go to Today
            </button>
        ) : null}
        {isMounted && relativeLabel && (
          <span className="text-sm text-muted-foreground">
            {isToday ? "Today" : relativeLabel}
          </span>
        )}
      </div>
    </div>
  );
}
