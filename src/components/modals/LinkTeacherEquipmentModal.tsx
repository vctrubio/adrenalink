"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Table, TableBody, TableRow, TableCell } from "@/src/components/ui/table";
import { CardHeader } from "@/src/components/ui/card/card-header";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import type { TeacherModel } from "@/backend/models";
import { ENTITY_DATA } from "@/config/entities";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";

interface LinkTeacherEquipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    existingTeacherIds: string[];
    onAssignTeacher: (teacherId: string) => Promise<void>;
}

const TeachersList = ({ teachers, onSelectTeacher }: { teachers: TeacherModel[]; onSelectTeacher: (teacher: TeacherModel) => void }) => {
    return (
        <div>
            <CardHeader name="Teachers" status={`${teachers.length} Available`} avatar={<HeadsetIcon className="w-16 h-16 text-green-600 dark:text-green-400" size={64} />} accentColor="#16a34a" />
            <Table>
                <TableBody>
                    {teachers.map((teacher) => (
                        <TableRow key={teacher.schema.id} onClick={() => onSelectTeacher(teacher)} className="cursor-pointer">
                            <TableCell className="font-medium">
                                <div>
                                    <div className="text-foreground">
                                        {teacher.schema.firstName} {teacher.schema.lastName}
                                    </div>
                                    <div className="text-xs text-muted-foreground">@{teacher.schema.username}</div>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

const SelectedTeacher = ({ teacher, onDeselect }: { teacher: TeacherModel; onDeselect: () => void }) => {
    return (
        <div>
            <CardHeader name="Teacher" status="Selected" avatar={<HeadsetIcon className="w-16 h-16 text-green-600 dark:text-green-400" size={64} />} accentColor="#16a34a" />
            <Table>
                <TableBody>
                    <TableRow onClick={onDeselect} isSelected={true} className="cursor-pointer">
                        <TableCell className="font-medium">
                            <div>
                                <div className="text-foreground">
                                    {teacher.schema.firstName} {teacher.schema.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">@{teacher.schema.username}</div>
                            </div>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
};

const ModalFooter = ({ onCancel, onAssign, canAssign, isAssigning }: { onCancel: () => void; onAssign: () => void; canAssign: boolean; isAssigning: boolean }) => (
    <div className="flex justify-end gap-3 pt-4">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cancel
        </button>
        <button onClick={onAssign} disabled={!canAssign || isAssigning} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isAssigning ? "Assigning..." : "Assign Equipment"}
        </button>
    </div>
);

export default function LinkTeacherEquipmentModal({ isOpen, onClose, existingTeacherIds, onAssignTeacher }: LinkTeacherEquipmentModalProps) {
    const { teachers, loading } = useSchoolTeachers();
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherModel | null>(null);
    const [assigning, setAssigning] = useState(false);

    const availableTeachers = teachers.filter((teacher) => !existingTeacherIds.includes(teacher.schema.id));

    const handleTeacherSelect = (teacher: TeacherModel) => {
        if (selectedTeacher?.schema.id === teacher.schema.id) {
            setSelectedTeacher(null);
        } else {
            setSelectedTeacher(teacher);
        }
    };

    const handleAssign = async () => {
        if (!selectedTeacher) return;

        setAssigning(true);
        try {
            await onAssignTeacher(selectedTeacher.schema.id);
            onClose();
            setSelectedTeacher(null);
        } catch (error) {
            console.error("Error assigning equipment:", error);
        } finally {
            setAssigning(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assign Equipment to Teacher" maxWidth="2xl">
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading teachers...</div>
                ) : availableTeachers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No available teachers.</div>
                ) : selectedTeacher ? (
                    <SelectedTeacher teacher={selectedTeacher} onDeselect={() => handleTeacherSelect(selectedTeacher)} />
                ) : (
                    <TeachersList teachers={availableTeachers} onSelectTeacher={handleTeacherSelect} />
                )}

                {availableTeachers.length > 0 && <ModalFooter onCancel={onClose} onAssign={handleAssign} canAssign={!!selectedTeacher} isAssigning={assigning} />}
            </div>
        </Modal>
    );
}
