"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table";
import { CardHeader } from "@/src/components/ui/card/card-header";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import type { TeacherModel } from "@/backend/models";
import { ENTITY_DATA } from "@/config/entities";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";

interface LinkTeacherLessonToBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    existingTeacherUsernames: string[];
    onAssignTeacher: (teacherId: string, commissionId: string) => Promise<void>;
}

// Helper function to get active lessons
const getActiveLessons = (teacher: TeacherModel) => {
    const lessons = teacher.relations?.lessons || [];
    return lessons.filter((lesson) => lesson.status === "active");
};

const TeachersList = ({ teachers, onSelectTeacher }: { teachers: TeacherModel[]; onSelectTeacher: (teacher: TeacherModel) => void }) => {
    const totalActiveLessons = teachers.reduce((sum, teacher) => sum + getActiveLessons(teacher).length, 0);

    return (
        <div>
            <CardHeader name="Teachers" status={`${totalActiveLessons} Active Lessons`} avatar={<HeadsetIcon className="w-16 h-16 text-green-600 dark:text-green-400" size={64} />} accentColor="#16a34a" />
            <Table>
                <TableBody>
                    {teachers.map((teacher) => {
                        const activeLessons = getActiveLessons(teacher);

                        return (
                            <TableRow key={teacher.schema.id} onClick={() => onSelectTeacher(teacher)}>
                                <TableCell className="font-medium">
                                    <div>
                                        <div className="text-foreground">
                                            {teacher.schema.firstName} {teacher.schema.lastName}
                                        </div>
                                        <div className="text-xs text-muted-foreground">@{teacher.schema.username}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center text-foreground font-semibold border-l border-border">{activeLessons.length}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

const SelectedTeacher = ({ teacher, onDeselect }: { teacher: TeacherModel; onDeselect: () => void }) => {
    const activeLessons = getActiveLessons(teacher);

    return (
        <div>
            <CardHeader name="Teacher" status={`${activeLessons.length} Active Lessons`} avatar={<HeadsetIcon className="w-16 h-16 text-green-600 dark:text-green-400" size={64} />} accentColor="#16a34a" />
            <Table>
                <TableBody>
                    <TableRow onClick={onDeselect} isSelected={true}>
                        <TableCell className="font-medium">
                            <div>
                                <div className="text-foreground">
                                    {teacher.schema.firstName} {teacher.schema.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">@{teacher.schema.username}</div>
                            </div>
                        </TableCell>
                        <TableCell className="text-center text-foreground font-semibold border-l border-border">{activeLessons.length}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
};

const CommissionsList = ({ teacher, selectedCommissionId, onSelectCommission, getCommissionDisplay }: { teacher: TeacherModel; selectedCommissionId: string | null; onSelectCommission: (id: string) => void; getCommissionDisplay: (commission: any) => string }) => {
    const commissions = teacher.relations?.commissions || [];
    const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission");

    if (commissions.length === 0) {
        return <div className="p-6 text-center text-sm text-muted-foreground">No commissions available</div>;
    }

    return (
        <div>
            <CardHeader name="Commissions" status={`${commissions.length} Available`} avatar={<HandshakeIcon className="w-16 h-16" style={{ color: commissionEntity?.color }} size={64} />} accentColor={commissionEntity?.color || "#16a34a"} />
            <Table>
                <TableBody>
                    {commissions.map((commission) => (
                        <TableRow key={commission.id} onClick={() => onSelectCommission(commission.id)} isSelected={selectedCommissionId === commission.id}>
                            <TableCell className="font-medium font-mono border-l border-border">{getCommissionDisplay(commission)}</TableCell>
                            <TableCell className="text-muted-foreground border-l border-border">{commission.description || "-"}</TableCell>
                        </TableRow>
                    ))}
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
            {isAssigning ? "Assigning..." : "Assign Teacher"}
        </button>
    </div>
);

export default function LinkTeacherLessonToBookingModal({ isOpen, onClose, existingTeacherUsernames, onAssignTeacher }: LinkTeacherLessonToBookingModalProps) {
    const { teachers, loading } = useSchoolTeachers();
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherModel | null>(null);
    const [selectedCommissionId, setSelectedCommissionId] = useState<string | null>(null);
    const [assigning, setAssigning] = useState(false);

    // Filter out teachers that already have lessons for this booking
    const availableTeachers = teachers.filter((teacher) => !existingTeacherUsernames.includes(teacher.schema.username));

    const handleTeacherSelect = (teacher: TeacherModel) => {
        if (selectedTeacher?.schema.id === teacher.schema.id) {
            setSelectedTeacher(null);
            setSelectedCommissionId(null);
        } else {
            setSelectedTeacher(teacher);
            setSelectedCommissionId(null);
        }
    };

    const handleAssign = async () => {
        if (!selectedTeacher || !selectedCommissionId) return;

        setAssigning(true);
        try {
            await onAssignTeacher(selectedTeacher.schema.id, selectedCommissionId);
            onClose();
            setSelectedTeacher(null);
            setSelectedCommissionId(null);
        } catch (error) {
            console.error("Error assigning teacher:", error);
        } finally {
            setAssigning(false);
        }
    };

    const getCommissionDisplay = (commission: { commissionType: string; cph: string }) => {
        return commission.commissionType === "fixed" ? `${commission.cph} €/h` : `${commission.cph} %/h`;
    };

    const canAssign = selectedTeacher && selectedCommissionId;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Link Teacher to Booking" maxWidth="4xl">
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading teachers...</div>
                ) : availableTeachers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No available teachers. All teachers are already assigned to this booking.</div>
                ) : selectedTeacher ? (
                    <div className="grid grid-cols-2 gap-4">
                        <SelectedTeacher teacher={selectedTeacher} onDeselect={() => handleTeacherSelect(selectedTeacher)} />
                        <CommissionsList teacher={selectedTeacher} selectedCommissionId={selectedCommissionId} onSelectCommission={setSelectedCommissionId} getCommissionDisplay={getCommissionDisplay} />
                    </div>
                ) : (
                    <TeachersList teachers={availableTeachers} onSelectTeacher={handleTeacherSelect} />
                )}

                {availableTeachers.length > 0 && <ModalFooter onCancel={onClose} onAssign={handleAssign} canAssign={!!canAssign} isAssigning={assigning} />}
            </div>
        </Modal>
    );
}
