"use client";

import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  MapPin,
} from "lucide-react";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { getPrettyDuration } from "@/getters/duration-getter";
import { getTimeFromISO } from "@/getters/timezone-getter";
import { timeToMinutes, minutesToTime } from "@/getters/timezone-getter";
import type { EventNode } from "@/backend/TeacherQueue";

interface EventModCardProps {
  event: EventNode;
  gapDuration?: number;
  hasGap?: boolean;
  gapMeetsRequirement?: boolean;
  isFirst: boolean;
  isLast: boolean;
  canMoveEarlier: boolean;
  canMoveLater?: boolean;
  onRemove: (eventId: string) => Promise<void>;
  onAdjustDuration: (eventId: string, increment: boolean) => void;
  onAdjustTime: (eventId: string, increment: boolean) => void;
  onMoveUp: (eventId: string) => void;
  onMoveDown: (eventId: string) => void;
  onRemoveGap?: (eventId: string) => void;
}

// Sub-components
const StudentGrid = ({ students }: { students: string[] }) => {
  const studentCount = students.length;

  return (
    <div
      className={`flex-shrink-0 ${
        studentCount === 4 ? "grid grid-cols-2 gap-1" : "flex gap-1"
      }`}
    >
      {students.map((_, index) => (
        <HelmetIcon key={index} className="w-7 h-7 text-yellow-500" />
      ))}
    </div>
  );
};

const QueueControls = ({
  isFirst,
  isLast,
  eventId,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  isFirst: boolean;
  isLast: boolean;
  eventId: string;
  onMoveUp: (eventId: string) => void;
  onMoveDown: (eventId: string) => void;
  onRemove: (eventId: string) => Promise<void>;
}) => {
  const handleRemoveClick = () => {
    onRemove(eventId);
  };

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {!isFirst && (
        <button
          onClick={() => onMoveUp(eventId)}
          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
          title="Move front in queue"
        >
          <ArrowUp className="w-3 h-3" />
        </button>
      )}
      {!isLast && (
        <button
          onClick={() => onMoveDown(eventId)}
          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
          title="Move back in queue"
        >
          <ArrowDown className="w-3 h-3" />
        </button>
      )}
      <button
        onClick={handleRemoveClick}
        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
        title="Remove from queue"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const TimeControls = ({
  event,
  canMoveEarlier,
  canMoveLater = true,
  eventId,
  onAdjustTime,
}: {
  event: EventNode;
  canMoveEarlier: boolean;
  canMoveLater?: boolean;
  eventId: string;
  onAdjustTime: (eventId: string, increment: boolean) => void;
}) => {
  const startTime = getTimeFromISO(event.eventData.date);
  const durationMinutes = event.eventData.duration;
  const endTimeMinutes =
    timeToMinutes(startTime) + durationMinutes;
  const endTime = minutesToTime(endTimeMinutes);

  return (
    <div className="flex-grow min-w-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-600 dark:text-gray-400">Start</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAdjustTime(eventId, false)}
            disabled={!canMoveEarlier}
            className="p-1.5 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              canMoveEarlier
                ? "30 minutes earlier"
                : "Cannot move earlier - would overlap"
            }
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onAdjustTime(eventId, true)}
            disabled={!canMoveLater}
            className="p-1.5 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              canMoveLater
                ? "30 minutes later"
                : "Cannot move later - would exceed 23:00"
            }
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <div className="flex flex-col text-center">
          <div className="text-base font-semibold text-green-600 dark:text-green-400">
            {startTime}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {endTime}
          </div>
        </div>
      </div>
    </div>
  );
};

const DurationControls = ({
  duration,
  eventId,
  onAdjustDuration,
}: {
  duration: number;
  eventId: string;
  onAdjustDuration: (eventId: string, increment: boolean) => void;
}) => {
  const handleDurationAdjustment = (increment: boolean) => {
    const newDuration = increment ? duration + 30 : duration - 30;
    if (newDuration < 60) return;
    onAdjustDuration(eventId, increment);
  };

  return (
    <div className="flex gap-2 justify-center w-16 min-w-[4rem]">
      <div className="flex flex-col">
        <button
          onClick={() => handleDurationAdjustment(true)}
          className="p-1.5 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="30 minutes more"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div className="text-base font-semibold text-gray-900 dark:text-white my-1">
          +{getPrettyDuration(duration)}
        </div>
        <button
          onClick={() => handleDurationAdjustment(false)}
          disabled={duration <= 60}
          className="p-1.5 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="30 minutes less (minimum 60 minutes)"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const GapWarning = ({
  gapDuration,
  eventId,
  meetsRequirement,
  onRemoveGap,
}: {
  gapDuration: number;
  eventId: string;
  meetsRequirement?: boolean;
  onRemoveGap?: (eventId: string) => void;
}) => {
  if (!gapDuration || gapDuration <= 0) return null;

  const isBlue = meetsRequirement;
  const bgColor = isBlue
    ? "bg-blue-50 dark:bg-blue-900/20"
    : "bg-orange-50 dark:bg-orange-900/20";
  const borderColor = isBlue
    ? "border-blue-200 dark:border-blue-800"
    : "border-orange-200 dark:border-orange-800";
  const textColor = isBlue
    ? "text-blue-600 dark:text-blue-400"
    : "text-orange-600 dark:text-orange-400";
  const hoverColor = isBlue
    ? "hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700"
    : "hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:border-orange-300 dark:hover:border-orange-700";

  return (
    <button
      onClick={() => onRemoveGap?.(eventId)}
      className={`flex items-center justify-center gap-1 mt-2 text-xs ${textColor} ${bgColor} p-2 rounded border ${borderColor} ${hoverColor} transition-colors cursor-pointer w-full`}
      title={isBlue ? "Gap meets requirements" : "Click to remove gap"}
    >
      {!isBlue && <AlertTriangle className="w-3 h-3 flex-shrink-0" />}
      <span>{getPrettyDuration(gapDuration)} gap {isBlue ? "(meets requirement)" : ""}</span>
    </button>
  );
};

const PackageInfo = ({ remainingMinutes }: { remainingMinutes: number }) => {
  return (
    <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center flex items-center justify-center gap-2">
      <span
        className={
          remainingMinutes < 0
            ? "text-orange-600 dark:text-orange-400 font-medium"
            : ""
        }
      >
        {getPrettyDuration(Math.abs(remainingMinutes))} remaining
      </span>
      {remainingMinutes < 0 && (
        <AlertTriangle className="w-3 h-3 text-orange-600 dark:text-orange-400" />
      )}
    </div>
  );
};

export default function EventModCard({
  event,
  gapDuration = 0,
  hasGap = false,
  gapMeetsRequirement = false,
  isFirst,
  isLast,
  canMoveEarlier,
  canMoveLater = true,
  onRemove,
  onAdjustDuration,
  onAdjustTime,
  onMoveUp,
  onMoveDown,
  onRemoveGap,
}: EventModCardProps) {
  const eventId = event.eventData.id || event.id;
  const studentNames = event.studentNames.join(", ");

  const getBgColor = () => {
    if (!hasGap || isFirst) return "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600";
    if (gapMeetsRequirement) return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
  };

  return (
    <div
      className={`w-[269px] p-4 rounded-lg border ${getBgColor()}`}
    >
      {/* Header: Students, names, controls */}
      <div className="flex items-center justify-between mb-3 w-full">
        <StudentGrid students={event.studentNames} />
        <div className="flex-1 mx-2 flex flex-wrap gap-1 items-center">
          <span className="text-base font-medium text-gray-900 dark:text-white">
            {studentNames}
          </span>
        </div>
        <QueueControls
          isFirst={isFirst}
          isLast={isLast}
          eventId={eventId}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onRemove={onRemove}
        />
      </div>

      {/* Time and Duration Controls - Side by Side */}
      <div className="flex gap-4">
        <TimeControls
          event={event}
          canMoveEarlier={canMoveEarlier}
          canMoveLater={canMoveLater}
          eventId={eventId}
          onAdjustTime={onAdjustTime}
        />

        {/* Separator */}
        <div className="w-px bg-gray-300 dark:bg-gray-500 my-1" />

        <DurationControls
          duration={event.eventData.duration}
          eventId={eventId}
          onAdjustDuration={onAdjustDuration}
        />
      </div>

      {/* Location display */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center flex items-center justify-center gap-2">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{event.eventData.location}</span>
        </div>
      </div>

      {/* Gap warning - only show if not first and has gap */}
      {!isFirst && hasGap && (
        <GapWarning
          gapDuration={gapDuration}
          eventId={eventId}
          meetsRequirement={gapMeetsRequirement}
          onRemoveGap={onRemoveGap}
        />
      )}
    </div>
  );
}
