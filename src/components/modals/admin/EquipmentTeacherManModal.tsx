"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { useModalNavigation } from "@/src/hooks/useModalNavigation";
import { linkTeacherToEquipment, removeTeacherFromEquipment } from "@/actions/equipments-action";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { ENTITY_DATA } from "@/config/entities";
import type { EquipmentData } from "@/backend/data/EquipmentData";
import { Check, X } from "lucide-react";
import { PopUpSearch } from "@/src/components/ui/popup/PopUpSearch";
import { Modal, TeacherModalListRow } from "@/src/components/modals";

interface EquipmentTeacherManModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: EquipmentData;
}

export function EquipmentTeacherManModal({
  isOpen,
  onClose,
  equipment,
}: EquipmentTeacherManModalProps) {
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [filterMode, setFilterMode] = useState<"active" | "all">("all");
  const { teachers, allTeachers } = useSchoolTeachers();
  
  const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
  const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === equipment.schema.category);
  const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment");
  const EquipmentIcon = categoryConfig?.icon || equipmentEntity?.icon;
  const equipmentColor = categoryConfig?.color || equipmentEntity?.color;

  const equipmentDisplayName = `${equipment.schema.model}${equipment.schema.size ? ` - ${equipment.schema.size}m` : ""}`;

  // Get linked teacher IDs from standardized relations
  const linkedTeacherIds = new Set(
    equipment.relations?.teachers?.map((t: any) => t.id).filter(Boolean) || []
  );

  const handleAddTeacher = async (teacherId: string) => {
    const result = await linkTeacherToEquipment(equipment.schema.id, teacherId);
    if (!result.success) {
      console.error("Error adding teacher:", result.error);
    }
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    const result = await removeTeacherFromEquipment(equipment.schema.id, teacherId);
    if (!result.success) {
      console.error("Error removing teacher:", result.error);
    }
  };

  const handleToggleLink = (teacher: any) => {
    const isLinked = linkedTeacherIds.has(teacher.schema.id);
    if (isLinked) {
      handleRemoveTeacher(teacher.schema.id);
    } else {
      handleAddTeacher(teacher.schema.id);
    }
  };

  const handleNavigate = (teacher: any) => {
    router.push(`/teachers/${teacher.schema.id}`);
    onClose();
  };

  const displayTeachers = useMemo(() => {
    if (filterMode === "all") return allTeachers;
    return teachers;
  }, [teachers, allTeachers, filterMode]);

  // Keyboard navigation
  const {
    searchQuery,
    setSearchQuery,
    filteredItems: filteredTeachers,
    focusedIndex,
    setFocusedIndex
  } = useModalNavigation({
    items: displayTeachers,
    filterField: (teacher) => teacher.schema.username,
    isOpen,
    isActive: true,
    onSelect: handleNavigate,
    onShiftSelect: handleToggleLink,
    onTabSelect: handleToggleLink,
  });

  const linkedCount = filteredTeachers.filter((t) => linkedTeacherIds.has(t.schema.id)).length;
  const activeCount = teachers.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Teachers"
      subtitle={equipmentDisplayName}
      entityId="teacher"
      icon={EquipmentIcon && <EquipmentIcon size={32} />}
      iconColor={equipmentColor}
      maxWidth="2xl"
    >
      <div className="flex flex-col gap-4">
        {/* Search and Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <PopUpSearch
            value={searchQuery}
            onChange={setSearchQuery}
            className="flex-1 min-w-[200px]"
          />

          <div className="flex p-1 bg-muted/30 rounded-xl border border-border/50 flex-shrink-0">
            <button 
                onClick={() => setFilterMode("all")}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterMode === "all" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
                All ({allTeachers.length})
            </button>
            <button 
                onClick={() => setFilterMode("active")}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterMode === "active" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
                Active ({activeCount})
            </button>
          </div>

          {filteredTeachers.length > 0 && (
            <div className="flex-shrink-0 px-3 py-2.5 rounded-lg text-sm font-medium popup-text-secondary" style={{ backgroundColor: `${teacherEntity?.color}15` }}>
              {linkedCount}/{filteredTeachers.length}
            </div>
          )}
        </div>

        {/* Teachers List */}
        <div className="overflow-y-auto custom-scrollbar max-h-[400px] flex flex-col gap-3">
          {filteredTeachers.length === 0 ? (
            <div className="popup-loading py-8">
              <span>No teachers found</span>
            </div>
          ) : (
            filteredTeachers.map((teacher, index) => {
              const isLinked = linkedTeacherIds.has(teacher.schema.id);
              const isFocused = index === focusedIndex;
              const isHovered = index === hoveredIndex;

              return (
                <TeacherModalListRow
                  key={teacher.schema.id}
                  teacher={teacher}
                  index={index}
                  isFocused={isFocused}
                  isHovered={isHovered}
                  onFocus={() => setFocusedIndex(index)}
                  onHover={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                  onClick={() => handleToggleLink(teacher)}
                  iconColor={isLinked ? "#22c55e" : teacherEntity?.color}
                  layoutId="equipment-teacher-indicator"
                  statusBadge={
                    isLinked ? (
                      <div className="popup-badge-success">
                        <Check size={14} />
                        <span className="text-xs font-bold">Linked</span>
                      </div>
                    ) : (
                      <div className="popup-badge-inactive">
                        <X size={14} />
                        <span className="text-xs font-bold">Not Linked</span>
                      </div>
                    )
                  }
                />
              );
            })
          )}
        </div>

        {/* Keyboard Hints */}
        <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-border/20">
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/10">
                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Go-To</span>
                <span className="popup-hint-key text-[10px]">ENTER</span>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/10">
                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Submit</span>
                <div className="flex gap-1">
                    <span className="popup-hint-key text-[9px] px-1">⇧</span>
                    <span className="popup-hint-key text-[10px]">ENTER</span>
                </div>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/10">
                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Toggle</span>
                <span className="popup-hint-key text-[10px]">TAB</span>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/10">
                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Reset</span>
                <div className="flex gap-1">
                    <span className="popup-hint-key text-[9px] px-1">⇧</span>
                    <span className="popup-hint-key text-[10px]">TAB</span>
                </div>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/10">
                <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Close</span>
                <span className="popup-hint-key text-[10px]">ESC</span>
            </div>
        </div>
      </div>
    </Modal>
  );
}