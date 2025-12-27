"use client";

import { useState } from "react";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { useModalNavigation } from "@/src/hooks/useModalNavigation";
import { linkTeacherToEquipment, removeTeacherFromEquipment } from "@/actions/equipments-action";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { ENTITY_DATA } from "@/config/entities";
import type { EquipmentModel } from "@/backend/models";
import { Check, X } from "lucide-react";
import { PopUpSearch } from "@/src/components/ui/popup/PopUpSearch";
import { KeyboardHint } from "@/src/components/ui/popup/KeyboardHint";
import { Modal, TeacherModalListRow } from "@/src/components/modals";

interface EquipmentTeacherManModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: EquipmentModel;
}

export function EquipmentTeacherManModal({
  isOpen,
  onClose,
  equipment,
}: EquipmentTeacherManModalProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { teachers } = useSchoolTeachers();
  const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
  const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === equipment.schema.category);
  const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment");
  const EquipmentIcon = categoryConfig?.icon || equipmentEntity?.icon;
  const equipmentColor = categoryConfig?.color || equipmentEntity?.color;

  const equipmentDisplayName = `${equipment.schema.model}${equipment.schema.size ? ` - ${equipment.schema.size}m` : ""}`;

  // Get linked teacher IDs
  const linkedTeacherIds = new Set(
    equipment.relations?.teacherEquipments?.map((te: any) => te.teacher?.id).filter(Boolean) || []
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

  const handleToggleLink = (teacher: typeof teachers[number]) => {
    const isLinked = linkedTeacherIds.has(teacher.schema.id);
    if (isLinked) {
      handleRemoveTeacher(teacher.schema.id);
    } else {
      handleAddTeacher(teacher.schema.id);
    }
  };

  // Keyboard navigation
  const {
    searchQuery,
    setSearchQuery,
    filteredItems: filteredTeachers,
    focusedIndex,
    setFocusedIndex
  } = useModalNavigation({
    items: teachers,
    filterField: (teacher) => teacher.schema.username,
    isOpen,
    isActive: true,
    onSelect: handleToggleLink,
    onTabSelect: handleToggleLink,
  });

  const linkedCount = filteredTeachers.filter((t) => linkedTeacherIds.has(t.schema.id)).length;

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
        {/* Search with Counter */}
        <div className="flex items-center gap-3">
          <PopUpSearch
            value={searchQuery}
            onChange={setSearchQuery}
            className="flex-1"
          />
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
                  onClick={() => {
                    if (isLinked) {
                      handleRemoveTeacher(teacher.schema.id);
                    } else {
                      handleAddTeacher(teacher.schema.id);
                    }
                  }}
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

        {/* Keyboard Hint */}
        {filteredTeachers.length > 0 && (
          <KeyboardHint keys="TAB" action="to toggle link" className="mt-4" />
        )}
      </div>
    </Modal>
  );
}
