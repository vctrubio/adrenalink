"use client";

import { useState, useMemo } from "react";
import { Modal, TeacherModalListRow } from "@/src/components/modals";
import { PopUpSearch } from "@/src/components/ui/popup/PopUpSearch";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { useModalNavigation } from "@/src/hooks/useModalNavigation";
import { ENTITY_DATA } from "@/config/entities";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { Check, Plus, ArrowLeft } from "lucide-react";
import type { TeacherModel } from "@/backend/models";
import type { TeacherCommissionType } from "@/drizzle/schema";

interface TeacherLessonCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    existingLessons?: Array<{ teacherUsername: string; lessonId: string }>;
}

interface CreateCommissionFormProps {
    teacherId: string;
    teacherUsername: string;
    onCancel: () => void;
    onCommissionCreated: (commission: TeacherCommissionType) => void;
}

function CreateTeacherCommissionInstance({ teacherId, teacherUsername, onCancel, onCommissionCreated }: CreateCommissionFormProps) {
    const [commissionType, setCommissionType] = useState<"fixed" | "percentage">("fixed");
    const [description, setDescription] = useState("");
    const [cph, setCph] = useState("");

    const handleCreate = () => {
        console.log("DEV:DEBUG:STEPS: Creating new commission", { teacherId, commissionType, description, cph });

        // Create temporary commission object
        const newCommission: TeacherCommissionType = {
            id: `temp-${Date.now()}`, // Temporary ID
            teacherId,
            commissionType,
            description,
            cph,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        console.log("DEV:DEBUG:STEPS: Temporary commission created", newCommission);
        onCommissionCreated(newCommission);
    };

    return (
        <div className="popup-row p-4 rounded-xl">
            <h4 className="font-bold popup-text-primary mb-4">New Commission - {teacherUsername}</h4>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm popup-text-secondary mb-2 block">Type</label>
                        <select
                            value={commissionType}
                            onChange={(e) => setCommissionType(e.target.value as "fixed" | "percentage")}
                            className="w-full px-3 py-2 rounded-lg popup-row border-border/30"
                        >
                            <option value="fixed">Fixed</option>
                            <option value="percentage">Percentage</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm popup-text-secondary mb-2 block">Cost Per Hour (CHF)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={cph}
                            onChange={(e) => setCph(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg popup-row border-border/30"
                            placeholder="25.00"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm popup-text-secondary mb-2 block">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg popup-row border-border/30 min-h-[80px]"
                        placeholder="Description of this commission..."
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-lg popup-button-disabled"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!cph}
                        className="flex-1 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 font-bold hover:bg-green-500/30 transition-all disabled:opacity-50"
                    >
                        Create Commission
                    </button>
                </div>
            </div>
        </div>
    );
}

export function TeacherLessonCreateModal({
    isOpen,
    onClose,
    bookingId,
    existingLessons = []
}: TeacherLessonCreateModalProps) {
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherModel | null>(null);
    const [selectedCommission, setSelectedCommission] = useState<TeacherCommissionType | null>(null);
    const [showCreateCommission, setShowCreateCommission] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const { allTeachers } = useSchoolTeachers();
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");

    // Check if teacher already has a lesson for this booking
    const existingLessonMap = new Map(existingLessons.map(l => [l.teacherUsername, l.lessonId]));

    // Prepare items for navigation hook - sorted with lesson teachers first
    const teacherItems = useMemo(() => {
        return [...allTeachers].sort((a, b) => {
            const aHasLesson = existingLessonMap.has(a.schema.username);
            const bHasLesson = existingLessonMap.has(b.schema.username);
            // Teachers with lessons first
            if (aHasLesson && !bHasLesson) return -1;
            if (!aHasLesson && bHasLesson) return 1;
            return 0;
        });
    }, [allTeachers, existingLessonMap]);

    // Keyboard navigation for teacher selection
    const {
        searchQuery,
        setSearchQuery,
        filteredItems: filteredTeachers,
        focusedIndex: teacherFocusedIndex,
        setFocusedIndex: setTeacherFocusedIndex
    } = useModalNavigation({
        items: teacherItems,
        filterField: (teacher) => `${teacher.schema.username} ${teacher.schema.firstName} ${teacher.schema.lastName}`,
        isOpen,
        isActive: !selectedTeacher, // Only active when in teacher selection view
        onSelect: (teacher) => handleTeacherSelect(teacher),
    });

    // Get teacher's commissions
    const teacherCommissions = selectedTeacher?.relations?.teacherCommissions || [];

    // Keyboard navigation for commission selection
    const {
        focusedIndex: commissionFocusedIndex,
        setFocusedIndex: setCommissionFocusedIndex
    } = useModalNavigation({
        items: teacherCommissions,
        filterField: (commission) => `${commission.cph} ${commission.commissionType} ${commission.description || ""}`,
        isOpen,
        isActive: !!selectedTeacher && !showCreateCommission, // Only active when viewing commissions
        onSelect: (commission) => handleCommissionSelect(commission),
    });

    const handleTeacherSelect = (teacher: TeacherModel) => {
        console.log("DEV:DEBUG:STEPS: Teacher selected", {
            teacherId: teacher.schema.id,
            username: teacher.schema.username
        });
        setSelectedTeacher(teacher);
        setSelectedCommission(null);
        setShowCreateCommission(false);
    };

    const handleCommissionSelect = (commission: TeacherCommissionType) => {
        console.log("DEV:DEBUG:STEPS: Commission selected", commission);
        setSelectedCommission(commission);
        setShowCreateCommission(false);
    };

    const handleCommissionCreated = (commission: TeacherCommissionType) => {
        console.log("DEV:DEBUG:STEPS: New commission added to selection", commission);
        setSelectedCommission(commission);
        setShowCreateCommission(false);
    };

    const handleCreateLesson = async () => {
        if (!selectedTeacher || !selectedCommission) {
            console.log("DEV:DEBUG:STEPS: Missing teacher or commission");
            return;
        }

        console.log("DEV:DEBUG:STEPS: Starting lesson creation process");

        let commissionId = selectedCommission.id;

        // If commission is temporary (new), create it first
        if (commissionId.startsWith("temp-")) {
            console.log("DEV:DEBUG:STEPS: Creating new commission first", selectedCommission);

            // TODO: Call API to create commission
            // const result = await createTeacherCommission(selectedCommission);
            // commissionId = result.id;

            console.log("DEV:DEBUG:STEPS: New commission created with ID:", commissionId);
        }

        console.log("DEV:DEBUG:STEPS: Creating lesson", {
            bookingId,
            teacherId: selectedTeacher.schema.id,
            commissionId,
            status: "active"
        });

        // TODO: Call API to create lesson
        // await createLesson({ bookingId, teacherId: selectedTeacher.schema.id, commissionId, status: "active" });

        console.log("DEV:DEBUG:STEPS: Lesson created successfully");
        onClose();
    };

    const handleBack = () => {
        console.log("DEV:DEBUG:STEPS: Going back to teacher selection");
        setSelectedTeacher(null);
        setSelectedCommission(null);
        setShowCreateCommission(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={selectedTeacher ? `Assign Lesson - ${selectedTeacher.schema.username}` : "Select Teacher"}
            subtitle={selectedTeacher ? "Choose commission" : "Select a teacher for this booking"}
            entityId="teacher"
            icon={<HeadsetIcon size={32} />}
            iconColor={teacherEntity?.color}
            maxWidth="2xl"
        >
            <div className="flex flex-col gap-4">
                {/* Back Button */}
                {selectedTeacher && (
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 popup-text-secondary hover:popup-text-primary transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-sm">Back to teachers</span>
                    </button>
                )}

                {/* Teacher Selection */}
                {!selectedTeacher && (
                    <>
                        <PopUpSearch value={searchQuery} onChange={setSearchQuery} />

                        <div className="overflow-y-auto custom-scrollbar max-h-[400px] flex flex-col gap-3">
                            {filteredTeachers.length === 0 ? (
                                <div className="popup-loading py-8">
                                    <span>No teachers found</span>
                                </div>
                            ) : (
                                filteredTeachers.map((teacher, index) => {
                                    const hasLesson = existingLessonMap.has(teacher.schema.username);
                                    const isFocused = index === teacherFocusedIndex;
                                    const isHovered = index === hoveredIndex;

                                    return (
                                        <div key={teacher.schema.id} className={hasLesson ? "border-l-4 rounded-l-xl" : ""} style={hasLesson ? { borderLeftColor: teacherEntity?.color } : undefined}>
                                            <TeacherModalListRow
                                                teacher={teacher}
                                                index={index}
                                                isFocused={isFocused}
                                                isHovered={isHovered}
                                                onFocus={() => setTeacherFocusedIndex(index)}
                                                onHover={() => setHoveredIndex(index)}
                                                onHoverEnd={() => setHoveredIndex(null)}
                                                onClick={() => handleTeacherSelect(teacher)}
                                                statusBadge={
                                                    hasLesson ? (
                                                        <div className="popup-badge-success">
                                                            <Check size={14} />
                                                            <span className="text-xs font-bold">Has Lesson</span>
                                                        </div>
                                                    ) : null
                                                }
                                            />
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}

                {/* Commission Selection */}
                {selectedTeacher && (
                    <div className="flex flex-col gap-3">
                        <h3 className="font-bold popup-text-primary">Select Commission</h3>

                        {teacherCommissions.length === 0 && !showCreateCommission && (
                            <div className="popup-text-tertiary text-sm text-center py-4">
                                No commissions found. Create one below.
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            {teacherCommissions.map((commission, index) => {
                                const isFocused = index === commissionFocusedIndex;
                                const isSelected = selectedCommission?.id === commission.id;

                                return (
                                    <button
                                        key={commission.id}
                                        onClick={() => handleCommissionSelect(commission)}
                                        onMouseEnter={() => setCommissionFocusedIndex(index)}
                                        className={`p-4 rounded-xl border text-left transition-all ${
                                            isFocused || isSelected
                                                ? "popup-row-focused"
                                                : "popup-row"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold popup-text-primary">
                                                    {commission.cph} CHF/hour
                                                </div>
                                                <div className="text-sm popup-text-tertiary capitalize">
                                                    {commission.commissionType}
                                                </div>
                                                {commission.description && (
                                                    <div className="text-xs popup-text-tertiary mt-1">
                                                        {commission.description}
                                                    </div>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <Check size={20} style={{ color: teacherEntity?.color }} />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}

                            {!showCreateCommission && (
                                <button
                                    onClick={() => setShowCreateCommission(true)}
                                    className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed popup-row hover:bg-accent/10 transition-all"
                                >
                                    <Plus size={16} />
                                    <span className="font-medium">Create New Commission</span>
                                </button>
                            )}

                            {/* Create Commission Form */}
                            {showCreateCommission && (
                                <CreateTeacherCommissionInstance
                                    teacherId={selectedTeacher.schema.id}
                                    teacherUsername={selectedTeacher.schema.username}
                                    onCancel={() => setShowCreateCommission(false)}
                                    onCommissionCreated={handleCommissionCreated}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Create Lesson Button */}
                {selectedTeacher && !showCreateCommission && (
                    <button
                        onClick={handleCreateLesson}
                        disabled={!selectedCommission}
                        style={{ backgroundColor: selectedCommission ? teacherEntity?.color : undefined }}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                            selectedCommission
                                ? "text-white shadow-lg hover:opacity-90"
                                : "popup-button-disabled"
                        }`}
                    >
                        <Check size={20} />
                        <span>Create Lesson</span>
                    </button>
                )}
            </div>
        </Modal>
    );
}
