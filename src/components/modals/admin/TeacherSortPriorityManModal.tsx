"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Modal from "../Modal";
import { DragSortList, type DragSortItem } from "@/src/components/ui/DragSortList";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { useTeacherSortOrder } from "@/src/providers/teacher-sort-order-provider";
import { ENTITY_DATA } from "@/config/entities";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import type { TeacherModel } from "@/backend/models";

interface TeacherSortPriorityManModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TEACHER_SORT_STORAGE_KEY = "teacher-sort-priority";

interface TeacherSortItem extends DragSortItem {
  teacher: TeacherModel;
}

export function TeacherSortPriorityManModal({
  isOpen,
  onClose,
}: TeacherSortPriorityManModalProps) {
  const { teachers } = useSchoolTeachers();
  const { order: savedOrder, setOrder } = useTeacherSortOrder();
  const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
  const [pendingItems, setPendingItems] = useState<TeacherSortItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Load priority order from context on mount
  useEffect(() => {
    if (isOpen && teachers.length > 0) {
      let sorted = [...teachers];

      if (savedOrder.length > 0) {
        sorted = sorted.sort((a, b) => {
          const aIndex = savedOrder.indexOf(a.schema.id);
          const bIndex = savedOrder.indexOf(b.schema.id);
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
      }

      const items: TeacherSortItem[] = sorted.map((teacher) => ({
        id: teacher.schema.id,
        teacher,
      }));
      setPendingItems(items);
      setHasChanges(false);
    }
  }, [isOpen, teachers, savedOrder]);

  const handleReorder = (items: TeacherSortItem[]) => {
    setPendingItems(items);
    setHasChanges(true);
  };

  const handleSubmit = useCallback(() => {
    const ids = pendingItems.map((item) => item.teacher.schema.id);
    setOrder(ids);
    setHasChanges(false);
    onClose();
  }, [pendingItems, setOrder, onClose]);

  // Keyboard handler for Shift+Enter
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen && hasChanges && event.key === "Enter" && event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, hasChanges, handleSubmit]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sort Teachers"
      entityId="teacher"
      maxWidth="2xl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* Teachers List */}
        <div className="max-h-[500px] overflow-y-auto">
          {pendingItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No teachers found
            </div>
          ) : (
            <DragSortList
              items={pendingItems}
              onReorder={handleReorder}
              renderItem={(item) => (
                <div className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-all gap-4">
                  <div className="flex items-center gap-3">
                    <div style={{ color: teacherEntity?.color }}>
                      <HeadsetIcon size={18} />
                    </div>
                    <p className="font-medium text-foreground">
                      {item.teacher.schema.username}
                    </p>
                  </div>
                </div>
              )}
              className="space-y-0"
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <button
            onClick={handleSubmit}
            disabled={!hasChanges}
            style={{ backgroundColor: hasChanges ? teacherEntity?.color : undefined }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 text-white"
          >
            <Check size={18} />
            Apply Order
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="text-xs text-muted-foreground text-center">
          Press Shift+Enter to apply
        </div>
      </motion.div>
    </Modal>
  );
}
