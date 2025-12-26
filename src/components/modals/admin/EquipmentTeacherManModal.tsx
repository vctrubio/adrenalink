"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Modal from "../Modal";
import { SearchInput } from "@/src/components/SearchInput";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { linkTeacherToEquipment, removeTeacherFromEquipment } from "@/actions/equipments-action";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { ENTITY_DATA } from "@/config/entities";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import type { EquipmentModel, TeacherModel } from "@/backend/models";

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
  const [search, setSearch] = useState("");
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

  // Filter teachers based on search
  const filteredTeachers = teachers.filter((teacher) =>
    teacher.schema.username.toLowerCase().includes(search.toLowerCase())
  );

  const linkedCount = filteredTeachers.filter((t) => linkedTeacherIds.has(t.schema.id)).length;

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Teachers"
      entityId="teacher"
      equipmentIcon={EquipmentIcon}
      equipmentIconColor={equipmentColor}
      equipmentName={equipmentDisplayName}
      maxWidth="2xl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Search Input with Results Count */}
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Search teachers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            entityColor={teacherEntity?.color}
            className="flex-1"
          />
          {filteredTeachers.length > 0 && (
            <div className="flex-shrink-0 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground" style={{ backgroundColor: `${teacherEntity?.color}15` }}>
              {linkedCount}/{filteredTeachers.length}
            </div>
          )}
        </div>

        {/* Teachers List */}
        <div className="space-y-0 max-h-[400px] overflow-y-auto">
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No teachers found
            </div>
          ) : (
            filteredTeachers.map((teacher, index) => {
              const isLinked = linkedTeacherIds.has(teacher.schema.id);
              const iconColor = isLinked ? "#22c55e" : "#9ca3af";

              return (
                <div
                  key={teacher.schema.id}
                  onClick={() => {
                    if (isLinked) {
                      handleRemoveTeacher(teacher.schema.id);
                    } else {
                      handleAddTeacher(teacher.schema.id);
                    }
                  }}
                  className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 cursor-pointer transition-all group hover:bg-muted/30 gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div style={{ color: iconColor }} className="flex-shrink-0">
                      <HeadsetIcon size={18} className="transition-colors" />
                    </div>
                    <p className="font-medium text-foreground">
                      {teacher.schema.username}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground transition-all flex-shrink-0">
                    {isLinked ? "Dlt Relation" : "Add Relation"}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </Modal>
  );
}
