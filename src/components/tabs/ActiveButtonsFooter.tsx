"use client";

import { useState } from "react";
import React from "react";
import { Plus, Loader2, Settings } from "lucide-react";
import { ENTITY_DATA } from "@/config/entities";
import { LinkTeacherLessonToBookingModal } from "@/src/components/modals";
import { createLesson } from "@/actions/lessons-action";
import { showEntityToast } from "@/getters/toast-getter";
import type { ClassboardLesson } from "@/backend/models/ClassboardModel";
import { useRouter } from "next/navigation";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";

interface ActiveButtonsFooterProps {
    bookingId: string;
    lessons: ClassboardLesson[];
    onAddLessonEvent?: (teacherUsername: string) => void;
    loadingLessonId?: string | null;
    bookingStatus: string;
}

const AddEventButton = ({ lessons, onAddLessonEvent, loadingLessonId }: { lessons: ClassboardLesson[]; onAddLessonEvent?: (teacherUsername: string) => void; loadingLessonId?: string | null }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (!onAddLessonEvent || lessons.length === 0) return null;

    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
    const TeacherIcon = teacherEntity?.icon;

    const handleAddLessonClick = (e: React.MouseEvent, teacherUsername: string) => {
        e.preventDefault();
        e.stopPropagation();
        onAddLessonEvent(teacherUsername);
    };

    if (lessons.length === 1) {
        const teacherUsername = lessons[0].teacher.username;
        return (
            <button
                onClick={(e) => handleAddLessonClick(e, teacherUsername)}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm transition-colors hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                disabled={loadingLessonId === teacherUsername}
            >
                {loadingLessonId === teacherUsername ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                <span>Event</span>
            </button>
        );
    }

    const dropdownItems: DropdownItemProps[] = lessons.map((lesson) => ({
        id: lesson.teacher.username,
        label: lesson.teacher.username,
        icon: TeacherIcon || (() => null),
        color: teacherEntity?.color,
        onClick: () => onAddLessonEvent(lesson.teacher.username),
    }));

    return (
        <div className="relative">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm transition-colors hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                disabled={loadingLessonId !== null}
            >
                {loadingLessonId ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                <span>Event</span>
            </button>
            <Dropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} items={dropdownItems} align="left" className="bottom-full mb-2" />
        </div>
    );
};

const AddTeacherButton = ({ onOpenModal }: { onOpenModal: () => void }) => {
    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenModal();
            }}
            onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm transition-colors hover:bg-accent/50 text-muted-foreground hover:text-foreground"
        >
            <Plus size={16} />
            <span>Teacher</span>
        </button>
    );
};

const SettingsButton = ({ bookingStatus }: { bookingStatus: string }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const dropdownItems: DropdownItemProps[] = (["active", "completed", "uncompleted"] as const).map((status) => ({
        id: status,
        label: status,
        icon: Settings,
        onClick: () => {
            // TODO: Handle status update
            console.log("Update booking status to:", status);
        },
    }));

    return (
        <div className="relative">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg"
            >
                <Settings size={16} />
            </button>
            <Dropdown isOpen={isDropdownOpen} onClose={() => setIsDropdownOpen(false)} items={dropdownItems} align="right" className="bottom-full mb-2" />
        </div>
    );
};

export const ActiveButtonsFooter = ({ bookingId, lessons, onAddLessonEvent, loadingLessonId, bookingStatus }: ActiveButtonsFooterProps) => {
    const router = useRouter();
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    const handleAssignTeacherToBooking = async (teacherId: string, commissionId: string) => {
        try {
            const result = await createLesson({ bookingId, teacherId, commissionId, status: "active" });
            if (result.success) {
                showEntityToast("lesson", { title: "Teacher Assigned" });
                router.refresh();
            } else {
                showEntityToast("lesson", { title: "Assignment Failed", description: result.error });
            }
        } catch (error) {
            showEntityToast("lesson", { title: "Assignment Error" });
        }
    };

    return (
        <>
            <div className="border-t border-border bg-footer">
                <div className="flex items-center justify-between">
                    <div className="flex items-center flex-wrap">
                        <AddEventButton lessons={lessons} onAddLessonEvent={onAddLessonEvent} loadingLessonId={loadingLessonId} />
                        <AddTeacherButton onOpenModal={() => setIsAssignModalOpen(true)} />
                    </div>
                    <SettingsButton bookingStatus={bookingStatus} />
                </div>
            </div>
            <LinkTeacherLessonToBookingModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} existingTeacherUsernames={lessons.map((l) => l.teacher.username)} onAssignTeacher={handleAssignTeacherToBooking} />
        </>
    );
};
