"use client";

import { useState, useRef } from "react";
import { type EquipmentStatus, EQUIPMENT_STATUS_CONFIG } from "@/types/status";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";

const EQUIPMENT_STATUSES: EquipmentStatus[] = ["rental", "public", "selling", "sold", "inrepair", "rip"];

interface EquipmentStatusLabelProps {
  status: EquipmentStatus;
  onStatusChange: (newStatus: EquipmentStatus) => void;
  size?: number;
}

export function EquipmentStatusLabel({ status, onStatusChange, size = 16 }: EquipmentStatusLabelProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownTriggerRef = useRef<HTMLDivElement>(null);

  const statusConfig = EQUIPMENT_STATUS_CONFIG[status] || EQUIPMENT_STATUS_CONFIG.public;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const dropdownItems: DropdownItemProps[] = EQUIPMENT_STATUSES.map((statusOption) => ({
    id: statusOption,
    label: EQUIPMENT_STATUS_CONFIG[statusOption].label,
    icon: () => <div className="w-3 h-3 rounded-full" style={{ backgroundColor: EQUIPMENT_STATUS_CONFIG[statusOption].color }} />,
    color: EQUIPMENT_STATUS_CONFIG[statusOption].color,
    onClick: () => {
      onStatusChange(statusOption);
      setIsDropdownOpen(false);
    },
  }));

  return (
    <div className="relative inline-block">
      <div
        ref={dropdownTriggerRef}
        onClick={handleClick}
        className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors bg-muted hover:bg-muted/80"
        style={{ color: statusConfig.color }}
      >
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusConfig.color }} />
        {statusConfig.label}
      </div>
      <Dropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        items={dropdownItems}
        align="right"
        initialFocusedId={status}
        triggerRef={dropdownTriggerRef}
      />
    </div>
  );
}
