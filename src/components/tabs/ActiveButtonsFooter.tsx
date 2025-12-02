"use client";

import { useState } from "react";
import React from "react";
import { Plus, Loader2, Settings } from "lucide-react";
import { Menu } from "@headlessui/react";
import { ENTITY_DATA } from "@/config/entities";
import { LinkTeacherLessonToBookingModal } from "@/src/components/modals";
import { createLesson } from "@/actions/lessons-action";
import { showEntityToast } from "@/getters/toast-getter";
import type { ClassboardLesson } from "@/backend/models/ClassboardModel";
import { useRouter } from "next/navigation";

interface ActiveButtonsFooterProps {
    bookingId: string;
    lessons: ClassboardLesson[];
    onAddLessonEvent?: (teacherUsername: string) => void;
    loadingLessonId?: string | null;
    bookingStatus: string;
}

const AddEventButton = ({ lessons, onAddLessonEvent, loadingLessonId }: { lessons: ClassboardLesson[]; onAddLessonEvent?: (teacherUsername: string) => void; loadingLessonId?: string | null }) => {
    if (!onAddLessonEvent || lessons.length === 0) return null;

    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");

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

    return (
        <Menu as="div" className="relative">
            <Menu.Button as="button" className="flex items-center gap-1.5 px-3 py-2 text-sm transition-colors hover:bg-accent/50 text-muted-foreground hover:text-foreground" disabled={loadingLessonId !== null}>
                {loadingLessonId ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                <span>Event</span>
            </Menu.Button>
            <Menu.Items className="absolute left-0 bottom-full mb-2 w-48 origin-bottom-left bg-background dark:bg-card border border-border rounded-lg shadow-lg focus:outline-none z-50">
                <div className="p-1">
                    {lessons.map((lesson) => (
                        <Menu.Item key={lesson.teacher.username}>
                            {({ active }) => (
                                <button
                                    onClick={(e) => handleAddLessonClick(e, lesson.teacher.username)}
                                    className={`${active ? "bg-muted/50" : ""} group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm`}
                                    style={{ color: active ? teacherEntity?.color : undefined }}
                                >
                                    {lesson.teacher.username}
                                </button>
                            )}
                        </Menu.Item>
                    ))}
                </div>
            </Menu.Items>
        </Menu>
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
    return (
        <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-1.5 px-3 py-2 text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg">
                <Settings size={16} />
            </Menu.Button>
            <Menu.Items className="absolute right-0 bottom-full mb-2 w-48 origin-bottom-right bg-background dark:bg-card border border-border rounded-lg shadow-lg focus:outline-none z-50">
                <div className="p-1">
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">Booking Status</div>
                    {(["active", "completed", "uncompleted"] as const).map((status) => (
                        <Menu.Item key={status}>
                            {({ active }) => (
                                <button
                                    className={`w-full text-left px-3 py-2 text-sm rounded-md capitalize transition-colors ${bookingStatus === status ? "bg-accent text-accent-foreground font-medium" : active ? "bg-accent/50 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/30"}`}
                                >
                                    {status}
                                </button>
                            )}
                        </Menu.Item>
                    ))}
                </div>
            </Menu.Items>
        </Menu>
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
