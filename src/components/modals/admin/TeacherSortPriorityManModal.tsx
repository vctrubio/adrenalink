"use client";

import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { motion } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { useTeacherSortOrder, updateTeacherSortOrder } from "@/src/hooks/useTeacherSortOrder";
import { updateTeacherActive } from "@/actions/teachers-action";
import { ENTITY_DATA } from "@/config/entities";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { GoToAdranlink } from "@/src/components/ui/GoToAdranlink";
import { PopUpHeader } from "@/src/components/ui/popup/PopUpHeader";
import { PopUpSearch } from "@/src/components/ui/popup/PopUpSearch";
import { StatusToggle } from "@/src/components/ui/StatusToggle";
import { DragSortList } from "@/src/components/ui/DragSortList";
import { SubmitCancelReset } from "@/src/components/ui/SubmitCancelReset";
import type { TeacherProvider } from "@/supabase/server/teachers";
import { Check } from "lucide-react";
import { useModalNavigation } from "@/src/hooks/useModalNavigation";
import { TeacherActiveLesson } from "@/src/components/ui/badge/teacher-active-lesson";

interface TeacherSortPriorityManModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface TeacherSortItem {
    id: string;
    teacher: TeacherProvider;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    isActive: boolean;
    color: string;
}

export function TeacherSortPriorityManModal({ isOpen, onClose }: TeacherSortPriorityManModalProps) {
    const { allTeachers, refetch } = useSchoolTeachers();
    const savedOrder = useTeacherSortOrder();
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
    const router = useRouter();

    const [items, setItems] = useState<TeacherSortItem[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [statusChanges, setStatusChanges] = useState<Map<string, boolean>>(new Map());
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [filterMode, setFilterMode] = useState<"active" | "all">("all");

    // Initialize items based on order from hook
    const initializeItems = useCallback(() => {
        if (allTeachers.length > 0) {

            let sorted = [...allTeachers];
            if (savedOrder.length > 0) {
                sorted = sorted.sort((a, b) => {
                    const aIndex = savedOrder.indexOf(a.id);
                    const bIndex = savedOrder.indexOf(b.id);
                    if (aIndex === -1) return 1;
                    if (bIndex === -1) return -1;
                    return aIndex - bIndex;
                });
            }

            const popUpItems: TeacherSortItem[] = sorted.map((teacher) => ({
                id: teacher.id,
                title: teacher.username,
                subtitle: "",
                icon: <HeadsetIcon size={20} />,
                isActive: teacher.active,
                color: teacherEntity?.color || "#fff",
                teacher,
            }));

            setItems(popUpItems);
            setHasChanges(false);
            setStatusChanges(new Map());
        }
    }, [allTeachers, savedOrder, teacherEntity]);

    useEffect(() => {
        if (isOpen) {
            initializeItems();
        }
    }, [isOpen, initializeItems]);

    const handleStatusToggle = useCallback((teacherId: string, active: boolean) => {
        const originalTeacher = allTeachers.find(t => t.id === teacherId);
        const originalActive = originalTeacher?.active;

        setStatusChanges((prev) => {
            const newChanges = new Map(prev);
            if (originalActive === active) {
                newChanges.delete(teacherId);
            } else {
                newChanges.set(teacherId, active);
            }
            return newChanges;
        });
        
        setItems((prev) =>
            prev.map((item) =>
                item.id === teacherId
                    ? { ...item, isActive: active, teacher: { ...item.teacher, active } }
                    : item
            )
        );
    }, [allTeachers]);

    const handleSubmit = useCallback(async () => {
        try {
            if (statusChanges.size > 0) {
                for (const [teacherId, active] of statusChanges.entries()) {
                    await updateTeacherActive(teacherId, active);
                }
                await refetch();
            }

            const ids = items.map((item) => item.id);
            updateTeacherSortOrder(ids);

            setHasChanges(false);
            setStatusChanges(new Map());
            onClose();
        } catch (error) {
            console.error("Error submitting changes:", error);
        }
    }, [items, statusChanges, onClose, refetch]);

    const handleReset = useCallback(() => {
        initializeItems();
    }, [initializeItems]);

    const handleCancel = useCallback(() => {
        initializeItems();
        onClose();
    }, [initializeItems, onClose]);

    const displayItems = useMemo(() => {
        if (filterMode === "all") return items;
        return items.filter(item => item.isActive);
    }, [items, filterMode]);

    const {
        searchQuery,
        setSearchQuery,
        filteredItems,
        focusedIndex,
        setFocusedIndex
    } = useModalNavigation({
        items: displayItems,
        filterField: "title",
        isOpen,
        isActive: true,
        onSelect: (item) => {
            router.push(`/teachers/${item.id}`);
            onClose();
        },
        onShiftSelect: () => handleSubmit(),
        onTabSelect: (item) => handleStatusToggle(item.id, !item.isActive)
    });

    const handleReorder = (newItems: TeacherSortItem[]) => {
        if (searchQuery || filterMode === "active") return;
        setItems(newItems);
        setHasChanges(true);
    };

    const activeCount = items.filter(i => i.isActive).length;

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={handleCancel} className="relative z-50">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="popup-backdrop" />
                </Transition.Child>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95 translate-y-4"
                        enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100 translate-y-0"
                        leaveTo="opacity-0 scale-95 translate-y-4"
                    >
                        <Dialog.Panel className="w-full max-w-2xl outline-none">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="relative flex flex-col max-h-[85vh]"
                            >
                                <PopUpHeader
                                    title="Manage Teachers"
                                    subtitle="Sort priority & toggle availability"
                                    icon={<HeadsetIcon size={32} />}
                                />

                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <PopUpSearch
                                        value={searchQuery}
                                        onChange={(val) => setSearchQuery(val)}
                                        className="flex-1 min-w-[200px]"
                                    />

                                    <div className="flex p-1 bg-muted/30 rounded-xl border border-border/50 flex-shrink-0">
                                        <button 
                                            onClick={() => setFilterMode("all")}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterMode === "all" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                        >
                                            All ({items.length})
                                        </button>
                                        <button 
                                            onClick={() => setFilterMode("active")}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterMode === "active" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                        >
                                            Active ({activeCount})
                                        </button>
                                    </div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25, duration: 0.3, ease: "easeOut" }}
                                    className="flex-1 min-h-0 overflow-y-auto custom-scrollbar mb-6 p-1"
                                >
                                    {filteredItems.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No teachers found
                                        </div>
                                    ) : (
                                        <DragSortList
                                            items={filteredItems}
                                            onReorder={handleReorder}
                                            renderItem={(item, isDragging) => {
                                                const index = filteredItems.findIndex(i => i.id === item.id);
                                                const isFocused = index === focusedIndex;
                                                const isHovered = index === hoveredIndex;

                                                return (
                                                    <motion.div
                                                        className={`
                                                            flex items-center justify-between px-4 py-3 gap-4 mb-3 rounded-xl border cursor-grab active:cursor-grabbing group relative overflow-hidden
                                                            ${isFocused ? "popup-row-focused" : "popup-row"}
                                                        `}
                                                        onClick={() => setFocusedIndex(index)}
                                                        onMouseEnter={() => setHoveredIndex(index)}
                                                        onMouseLeave={() => setHoveredIndex(null)}
                                                    >
                                                        {isFocused && (
                                                            <motion.div
                                                                layoutId="active-indicator"
                                                                className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-secondary"
                                                                style={{ backgroundColor: item.color }}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ duration: 0.2 }}
                                                            />
                                                        )}

                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div
                                                                style={{
                                                                    color: item.isActive ? item.color : "#9ca3af",
                                                                    opacity: item.isActive ? 1 : 0.5,
                                                                }}
                                                                className="transition-all duration-200 flex-shrink-0"
                                                            >
                                                                {item.icon}
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                 <span className={`transition-colors truncate ${isFocused ? "font-black popup-text-primary" : `font-medium ${item.isActive ? "popup-text-primary" : "popup-text-secondary"}`}`}>
                                                                    {item.title}
                                                                 </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-3 flex-shrink-0">
                                                            {(() => {
                                                                const stats = item.teacher.lessonStats;
                                                                return <TeacherActiveLesson totalLessons={stats.totalLessons} completedLessons={stats.completedLessons} />;
                                                            })()}

                                                            <StatusToggle
                                                                isActive={item.isActive || false}
                                                                onToggle={(active) => {
                                                                    handleStatusToggle(item.id, active);
                                                                    setFocusedIndex(index);
                                                                }}
                                                                color={item.color}
                                                                className="popup-toggle-unchecked"
                                                            />
                                                            
                                                            <GoToAdranlink
                                                                href={`/teachers/${item.teacher.id}`}
                                                                onNavigate={onClose}
                                                                isHovered={isHovered}
                                                            />
                                                        </div>
                                                    </motion.div>
                                                );
                                            }}
                                        />
                                    )}
                                </motion.div>

                                <div className="flex flex-col gap-4">
                                     <SubmitCancelReset
                                        onSubmit={handleSubmit}
                                        onCancel={handleCancel}
                                        onReset={handleReset}
                                        hasChanges={hasChanges || statusChanges.size > 0}
                                        submitLabel="Apply Changes"
                                        color={teacherEntity?.color}
                                        extraContent={(statusChanges.size > 0 || hasChanges) && (
                                            <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-white/25 text-white text-[10px] font-extrabold ml-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-white/10">
                                                {statusChanges.size + (hasChanges ? 1 : 0)}
                                            </span>
                                        )}
                                     />

                                     <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-border/20">
                                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/10">
                                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Go-To</span>
                                            <span className="popup-hint-key text-[10px]">ENTER</span>
                                        </div>
                                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/10">
                                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Submit</span>
                                            <div className="flex gap-1">
                                                <span className="popup-hint-key text-[9px] px-1">⇧</span>
                                                <span className="popup-hint-key text-[10px]">ENTER</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/10">
                                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Toggle</span>
                                            <span className="popup-hint-key text-[10px]">TAB</span>
                                        </div>
                                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/10">
                                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Reset</span>
                                            <div className="flex gap-1">
                                                <span className="popup-hint-key text-[9px] px-1">⇧</span>
                                                <span className="popup-hint-key text-[10px]">TAB</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/10">
                                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Close</span>
                                            <span className="popup-hint-key text-[10px]">ESC</span>
                                        </div>
                                     </div>
                                </div>
                            </motion.div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
