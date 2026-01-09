"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Modal } from "@/src/components/modals";
import { CommissionTypeValue } from "@/src/components/ui/badge/commission-type-value";
import { DateRangeBadge } from "@/src/components/ui/badge/daterange";
import { AddCommissionDropdown } from "@/src/components/ui/AddCommissionDropdown";
import { TeacherActiveLesson } from "@/src/components/ui/badge/teacher-active-lesson";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { ENTITY_DATA } from "@/config/entities";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { createLessonWithCommission } from "@/supabase/server/lessons";
import type { ClassboardData, ClassboardLesson } from "@/backend/classboard/ClassboardModel";

interface AssignTeacherToLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: ClassboardData;
  onAssigned: (lesson: ClassboardLesson) => void;
}

export function AssignTeacherToLessonModal({
  isOpen,
  onClose,
  bookingData,
  onAssigned,
}: AssignTeacherToLessonModalProps) {
  console.log("AssignTeacherToLessonModal rendered with isOpen:", isOpen);
  const { teachers } = useSchoolTeachers();
  const credentials = useSchoolCredentials();
  const currency = credentials.currency || "YEN";

  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [selectedCommissionId, setSelectedCommissionId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission");

  // Build title with leader name and student count if > 1
  const studentCount = bookingData.bookingStudents.length;
  const modalTitle = studentCount > 1
    ? `${bookingData.booking.leaderStudentName} +${studentCount - 1}`
    : bookingData.booking.leaderStudentName;

  // Get existing teacher+commission combos in this booking
  const existingCombos = useMemo(() => {
    return new Set(
      bookingData.lessons
        .filter((l) => l.teacher?.id && l.commission?.id)
        .map((l) => `${l.teacher!.id}:${l.commission!.id}`)
    );
  }, [bookingData.lessons]);

  // Get selected teacher's data
  const selectedTeacher = selectedTeacherId
    ? teachers.find((t) => t.schema.id === selectedTeacherId)
    : null;

  const selectedTeacherCommissions = selectedTeacher?.schema.commissions || [];

  // Check if this combo already exists
  const comboAlreadyExists =
    selectedTeacherId && selectedCommissionId
      ? existingCombos.has(`${selectedTeacherId}:${selectedCommissionId}`)
      : false;

  const canAssign =
    selectedTeacherId &&
    selectedCommissionId &&
    !comboAlreadyExists &&
    !isAssigning;

  const handleAddCommission = useCallback(
    (newCommission: any) => {
      // When new commission is added, auto-select it
      // The hook will refetch and the commission will appear in selectedTeacherCommissions
      setSelectedCommissionId(newCommission.id);
    },
    []
  );

  const handleAssign = useCallback(async () => {
    if (!selectedTeacherId || !selectedCommissionId) return;

    setIsAssigning(true);
    try {
      const result = await createLessonWithCommission(
        bookingData.booking.id,
        selectedTeacherId,
        selectedCommissionId
      );

      if (result.success && result.data) {
        onAssigned(result.data);
        onClose();
      } else {
        console.error("Failed to create lesson:", result.error);
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
    } finally {
      setIsAssigning(false);
    }
  }, [selectedTeacherId, selectedCommissionId, bookingData.booking.id, onAssigned, onClose]);

  const handleClose = useCallback(() => {
    console.log("handleClose called in AssignTeacherToLessonModal");
    setSelectedTeacherId(null);
    setSelectedCommissionId(null);
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      subtitle={<DateRangeBadge startDate={bookingData.booking.dateStart} endDate={bookingData.booking.dateEnd} />}
      entityId="booking"
      maxWidth="md"
    >
      <div className="flex flex-col gap-4">

        {/* Teacher List */}
        <div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {teachers.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground bg-muted/20 rounded-xl border border-border/30">
                No teachers are active, please create or update.
              </div>
            ) : (
              teachers.map((teacher) => (
                <motion.div
                  key={teacher.schema.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    setSelectedTeacherId(teacher.schema.id);
                    setSelectedCommissionId(null);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all
                    ${
                      selectedTeacherId === teacher.schema.id
                        ? "bg-primary/10 border-primary/30 dark:bg-secondary/10 dark:border-secondary/30"
                        : "bg-muted/30 border-border/50 hover:border-primary/30 hover:bg-muted/50 dark:hover:border-secondary/30"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <HeadsetIcon size={14} style={{ color: "#22c55e", flexShrink: 0 }} />
                    <span className="font-medium text-sm">{teacher.schema.username}</span>
                  </div>

                  <TeacherActiveLesson
                    totalLessons={teacher.lessonStats.totalLessons}
                    completedLessons={teacher.lessonStats.completedLessons}
                  />

                  {selectedTeacherId === teacher.schema.id && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0">
                      <div className="w-5 h-5 rounded-full bg-primary dark:bg-secondary flex items-center justify-center">
                        <Check size={14} className="text-primary-foreground dark:text-secondary-foreground" />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Commission Selection */}
        <AnimatePresence>
          {selectedTeacher && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-border/30 space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">
                  Select or Create Commission
                </div>

                {selectedTeacherCommissions.length > 0 && (
                  <div className="space-y-2">
                    {selectedTeacherCommissions.map((commission) => {
                      const comboExists = existingCombos.has(
                        `${selectedTeacherId}:${commission.id}`
                      );

                      return (
                        <motion.div
                          key={commission.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => !comboExists && setSelectedCommissionId(commission.id)}
                          className={`
                            w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all
                            ${
                              selectedCommissionId === commission.id
                                ? "bg-primary/10 border-primary/30 dark:bg-secondary/10 dark:border-secondary/30"
                                : comboExists
                                  ? "bg-muted/20 border-border/30 opacity-50 cursor-not-allowed"
                                  : "bg-muted/30 border-border/50 hover:border-primary/30 hover:bg-muted/50 dark:hover:border-secondary/30 cursor-pointer"
                            }
                          `}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <CommissionTypeValue
                              value={commission.cph}
                              type={commission.commissionType as "fixed" | "percentage"}
                              description={commission.description}
                              isSelected={selectedCommissionId === commission.id}
                            />
                          </div>

                          {comboExists && (
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              Already assigned
                            </span>
                          )}

                          {selectedCommissionId === commission.id && !comboExists && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0">
                              <div className="w-5 h-5 rounded-full bg-primary dark:bg-secondary flex items-center justify-center">
                                <Check size={14} className="text-primary-foreground dark:text-secondary-foreground" />
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Add New Commission */}
                <AddCommissionDropdown
                  teacherId={selectedTeacherId}
                  currency={currency}
                  color={commissionEntity?.color || "#10b981"}
                  onAdd={handleAddCommission}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assign Button */}
        <button
          onClick={handleAssign}
          disabled={!canAssign}
          className="w-full mt-4 px-4 py-3 bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/90 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isAssigning ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground dark:border-secondary-foreground dark:border-t-transparent border-t-transparent rounded-full animate-spin" />
              Assigning...
            </>
          ) : comboAlreadyExists ? (
            "Teacher+Commission Already Assigned"
          ) : (
            "Assign Teacher"
          )}
        </button>
      </div>
    </Modal>
  );
}
