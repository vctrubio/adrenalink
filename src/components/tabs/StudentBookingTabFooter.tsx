"use client";

import FlagIcon from "@/public/appSvgs/FlagIcon";
import { Settings, Plus, Loader2 } from "lucide-react";
import { Menu } from "@headlessui/react";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { ENTITY_DATA } from "@/config/entities";
import type { ClassboardData, ClassboardLesson } from "@/backend/models/ClassboardModel";

export type TabType = "equipment" | "events" | "settings" | null;

interface StudentBookingTabFooterProps {
    data: ClassboardData;
    activeTab: TabType;
    onTabClick: (tab: TabType) => void;
    onAssignTeacher?: () => void;
    onAddLessonEvent?: (teacherUsername: string) => void;
    availableTeachers?: string[];
    loadingLessonId?: string | null;
}

// Equipment Footer Button
const EquipmentFooterButton = ({ categoryEquipment, capacity, isActive, onClick }: { categoryEquipment: "kite" | "wing" | "windsurf"; capacity: number; isActive: boolean; onClick: () => void }) => {
    const equipmentConfig = EQUIPMENT_CATEGORIES.find((cat) => cat.id === categoryEquipment);
    const EquipmentIcon = equipmentConfig?.icon;
    const equipmentColor = equipmentConfig?.color;
    const displayName = capacity > 1 ? `${categoryEquipment} (x${capacity})` : categoryEquipment;

    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"}`}
            style={{ color: isActive ? equipmentColor : undefined }}
        >
            {EquipmentIcon && <EquipmentIcon width={16} height={16} />}
            <span className="capitalize">{displayName}</span>
        </button>
    );
};

// Events Footer Button
const EventsFooterButton = ({ eventCount, isActive, onClick }: { eventCount: number; isActive: boolean; onClick: () => void }) => {
    return (
        <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"}`}>
            <FlagIcon size={16} />
            <span>{eventCount} events</span>
        </button>
    );
};

// Settings Footer Button
const SettingsFooterButton = ({ isActive, onClick }: { isActive: boolean; onClick: () => void }) => {
    return (
        <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ml-auto ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"}`}>
            <Settings size={16} />
        </button>
    );
};

// Add Lesson Event Footer Button
const AddLessonEventButton = ({ availableTeachers, onAddLessonEvent, loadingLessonId }: { availableTeachers?: string[]; onAddLessonEvent?: (teacherUsername: string) => void; loadingLessonId?: string | null }) => {
    if (!availableTeachers || !onAddLessonEvent || availableTeachers.length === 0) {
        return null;
    }

    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");

    const handleAddLessonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (availableTeachers.length === 1) {
            onAddLessonEvent(availableTeachers[0]);
        }
    };

    if (availableTeachers.length === 1) {
        return (
            <button
                onClick={handleAddLessonClick}
                onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm transition-colors hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                disabled={loadingLessonId !== null}
            >
                {loadingLessonId ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                <span>Add Lesson Event</span>
            </button>
        );
    }

    return (
        <Menu as="div" className="relative">
            <Menu.Button
                onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onMouseDown={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm transition-colors hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                disabled={loadingLessonId !== null}
            >
                {loadingLessonId ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                <span>Add Lesson Event</span>
            </Menu.Button>

            <Menu.Items className="absolute left-0 bottom-full mb-2 w-48 origin-bottom-left bg-background dark:bg-card border border-border rounded-lg shadow-lg focus:outline-none z-50">
                <div className="p-1">
                    {availableTeachers.map((teacherUsername) => (
                        <Menu.Item key={teacherUsername}>
                            {({ active }) => (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onAddLessonEvent(teacherUsername);
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                    className={`${active ? "bg-muted/50" : ""} group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm`}
                                    style={{ color: active ? teacherEntity?.color : undefined }}
                                >
                                    {teacherUsername}
                                </button>
                            )}
                        </Menu.Item>
                    ))}
                </div>
            </Menu.Items>
        </Menu>
    );
};

// Assign Teacher Footer Button
const AssignTeacherButton = ({ onAssignTeacher }: { onAssignTeacher?: () => void }) => {
    if (!onAssignTeacher) {
        return null;
    }

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAssignTeacher();
            }}
            onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm transition-colors hover:bg-accent/50 text-muted-foreground hover:text-foreground"
        >
            <Plus size={16} />
            <span>Assign Teacher</span>
        </button>
    );
};

export const StudentBookingTabFooter = ({ data, activeTab, onTabClick, onAssignTeacher, onAddLessonEvent, availableTeachers, loadingLessonId }: StudentBookingTabFooterProps) => {
    const handleTabClick = (tab: TabType) => {
        onTabClick(activeTab === tab ? null : tab);
    };

    // Calculate total events from all lessons
    const totalEvents = data.lessons.reduce((sum, lesson) => sum + lesson.events.length, 0);

    return (
        <div className="border-t border-border">
            <div className="flex items-center flex-wrap">
                <EquipmentFooterButton categoryEquipment={data.schoolPackage.categoryEquipment} capacity={data.schoolPackage.capacityStudents} isActive={activeTab === "equipment"} onClick={() => handleTabClick("equipment")} />
                <EventsFooterButton eventCount={totalEvents} isActive={activeTab === "events"} onClick={() => handleTabClick("events")} />
                <AddLessonEventButton availableTeachers={availableTeachers} onAddLessonEvent={onAddLessonEvent} loadingLessonId={loadingLessonId} />
                <AssignTeacherButton onAssignTeacher={onAssignTeacher} />
                <SettingsFooterButton isActive={activeTab === "settings"} onClick={() => handleTabClick("settings")} />
            </div>
        </div>
    );
};
