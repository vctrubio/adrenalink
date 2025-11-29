"use client";

import { usePathname } from "next/navigation";
import { ENTITY_DATA } from "@/config/entities";
import { DataboardStats } from "./DataboardStats";
import type { DataboardController, DataboardFilterByDate, DataboardGroupByDate } from "@/types/databoard";
import { DATABOARD_DATE_FILTERS, DATABOARD_DATE_GROUPS, DATABOARD_ENTITY_GROUP_FIELDS } from "@/config/databoard";
import { Listbox } from "@headlessui/react";

interface DataboardNavigationProps {
  controller: DataboardController;
}

// Sub-component: Returns entity state from pathname
function useEntityState() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentSegment = pathSegments[0];

  const entityMap: Record<string, string> = {
    "students": "student",
    "teachers": "teacher",
    "bookings": "booking",
    "packages": "schoolPackage",
    "equipments": "equipment",
    "events": "event",
    "rentals": "rental",
    "referrals": "referral",
    "requests": "studentPackage",
  };

  const entityId = entityMap[currentSegment];
  const currentEntity = entityId ? ENTITY_DATA.find((e) => e.id === entityId) : null;
  const groupFields = currentSegment ? DATABOARD_ENTITY_GROUP_FIELDS[currentSegment] || [] : [];

  return { currentEntity, groupFields };
}

export const DataboardNavigation = ({
  controller,
}: DataboardNavigationProps) => {
  const { currentEntity, groupFields } = useEntityState();
  const {
    stats,
    totalCount,
    filter,
    onFilterChange,
    group,
    onGroupChange,
    selectedCount,
    isSelectionMode,
    onSelectionModeToggle,
    onAddClick,
    isLoading,
  } = controller;

  if (!currentEntity) return null;

  return (
    <div className="w-full space-y-6 px-4 py-6">
      {/* Stats Display */}
      {stats.length > 0 && (
        <DataboardStats stats={stats} totalCount={totalCount} isLoading={isLoading} />
      )}

      {/* Control Panel */}
      <div className="space-y-4 bg-card rounded-lg p-4 border-2" style={{ borderColor: `${currentEntity.color}40` }}>
        {/* Filter & Group Row */}
        <div className="flex gap-4 flex-wrap sm:flex-nowrap">
          {/* Filter Dropdown */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Filter</label>
            <Listbox value={filter} onChange={(value) => onFilterChange?.(value as DataboardFilterByDate)}>
              <div className="relative">
                <Listbox.Button className="w-full px-3 py-2 text-sm font-medium text-left bg-background rounded-md border-2 transition-all hover:shadow-sm focus:outline-none" style={{ borderColor: `${currentEntity.color}50` }}>
                  {filter}
                  <svg className="absolute right-3 top-2.5 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 w-full mt-1 bg-background rounded-md shadow-lg border-2" style={{ borderColor: `${currentEntity.color}40` }}>
                  {DATABOARD_DATE_FILTERS.map((option) => (
                    <Listbox.Option key={option} value={option} className={({ active }) => `px-3 py-2 cursor-pointer ${active ? "bg-muted" : ""}`}>
                      {option}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          {/* Group Dropdown */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase">Group</label>
            <Listbox value={group} onChange={(value) => onGroupChange?.(value)}>
              <div className="relative">
                <Listbox.Button className="w-full px-3 py-2 text-sm font-medium text-left bg-background rounded-md border-2 transition-all hover:shadow-sm focus:outline-none" style={{ borderColor: `${currentEntity.color}50` }}>
                  {typeof group === "string" && group.charAt(0).toUpperCase() + group.slice(1)}
                  <svg className="absolute right-3 top-2.5 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 w-full mt-1 bg-background rounded-md shadow-lg border-2" style={{ borderColor: `${currentEntity.color}40` }}>
                  <Listbox.Option value="All" className={({ active }) => `px-3 py-2 cursor-pointer ${active ? "bg-muted" : ""}`}>
                    All
                  </Listbox.Option>
                  {DATABOARD_DATE_GROUPS.filter((g) => g !== "All").map((option) => (
                    <Listbox.Option key={option} value={option} className={({ active }) => `px-3 py-2 cursor-pointer ${active ? "bg-muted" : ""}`}>
                      {option}
                    </Listbox.Option>
                  ))}
                  {Array.isArray(groupFields) &&
                    groupFields.map((field) => {
                      const fieldName = typeof field === "string" ? field : field.field;
                      const fieldLabel = typeof field === "string" ? String(fieldName).charAt(0).toUpperCase() + String(fieldName).slice(1) : field.label;
                      return (
                        <Listbox.Option key={fieldName} value={fieldName} className={({ active }) => `px-3 py-2 cursor-pointer ${active ? "bg-muted" : ""}`}>
                          By {fieldLabel}
                        </Listbox.Option>
                      );
                    })}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {/* Selection Button */}
          <button
            onClick={() => onSelectionModeToggle?.(!isSelectionMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all border-2 ${
              isSelectionMode
                ? "text-white"
                : "text-foreground hover:shadow-sm"
            }`}
            style={
              isSelectionMode
                ? { borderColor: currentEntity.color, backgroundColor: `${currentEntity.color}20` }
                : { borderColor: `${currentEntity.color}40` }
            }
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 9a2 2 0 114 0A2 2 0 015 9zm0 6a2 2 0 114 0 2 2 0 01-4 0zm6-8a2 2 0 114 0 2 2 0 01-4 0zm0 6a2 2 0 114 0 2 2 0 01-4 0z" />
            </svg>
            <span>Select</span>
            {isSelectionMode && selectedCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: `${currentEntity.color}40` }}>
                {selectedCount}
              </span>
            )}
          </button>

          {/* Add Button */}
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white transition-all border-2 ml-auto hover:shadow-md"
            style={{ borderColor: currentEntity.color, backgroundColor: currentEntity.color }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
