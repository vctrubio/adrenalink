"use client";

import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { motion } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useSchoolTeachers } from "@/src/hooks/useSchoolTeachers";
import { useTeacherSortOrder } from "@/src/providers/teacher-sort-order-provider";
import { updateTeacherActive } from "@/actions/teachers-action";
import { ENTITY_DATA } from "@/config/entities";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { GoToAdranlink } from "@/src/components/ui/GoToAdranlink";
import { PopUpHeader } from "@/src/components/ui/popup/PopUpHeader";
import { PopUpSearch } from "@/src/components/ui/popup/PopUpSearch";
import { KeyboardHint } from "@/src/components/ui/popup/KeyboardHint";
import { StatusToggle } from "@/src/components/ui/StatusToggle";
import { DragSortList } from "@/src/components/ui/DragSortList";
import type { TeacherModel } from "@/backend/models";
import { Check } from "lucide-react";
import { useModalNavigation } from "@/src/hooks/useModalNavigation";

interface TeacherSortPriorityManModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface TeacherSortItem {
    id: string;
    teacher: TeacherModel;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    isActive: boolean;
    color: string;
}

export function TeacherSortPriorityManModal({ isOpen, onClose }: TeacherSortPriorityManModalProps) {
    const { allTeachers, refetch } = useSchoolTeachers();
    const { order: savedOrder, setOrder } = useTeacherSortOrder();
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
    const router = useRouter();
    
    const [items, setItems] = useState<TeacherSortItem[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [statusChanges, setStatusChanges] = useState<Map<string, boolean>>(new Map());
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Initialize items based on order
    useEffect(() => {
        if (isOpen && allTeachers.length > 0) {
            let sorted = [...allTeachers];
            if (savedOrder.length > 0) {
                sorted = sorted.sort((a, b) => {
                    const aIndex = savedOrder.indexOf(a.schema.id);
                    const bIndex = savedOrder.indexOf(b.schema.id);
                    if (aIndex === -1) return 1;
                    if (bIndex === -1) return -1;
                    return aIndex - bIndex;
                });
            }

            const popUpItems: TeacherSortItem[] = sorted.map((teacher) => ({
                id: teacher.schema.id,
                title: teacher.schema.username,
                subtitle: `${teacher.schema.firstName} ${teacher.schema.lastName}`,
                icon: <HeadsetIcon size={20} />,
                isActive: teacher.schema.active,
                color: teacherEntity?.color || "#fff",
                teacher,
            }));

            setItems(popUpItems);
            setHasChanges(false);
            setStatusChanges(new Map());
        }
    }, [isOpen, allTeachers, savedOrder, teacherEntity]);

    const handleStatusToggle = useCallback((teacherId: string, active: boolean) => {
        setStatusChanges((prev) => {
            const newChanges = new Map(prev);
            newChanges.set(teacherId, active);
            return newChanges;
        });
        
        setItems((prev) =>
            prev.map((item) =>
                item.id === teacherId
                    ? { ...item, isActive: active, teacher: { ...item.teacher, schema: { ...item.teacher.schema, active } } }
                    : item
            )
        );
    }, []);

    const handleSubmit = useCallback(async () => {
        try {
            if (statusChanges.size > 0) {
                for (const [teacherId, active] of statusChanges.entries()) {
                    await updateTeacherActive(teacherId, active);
                }
            }

            const ids = items.map((item) => item.id);
            setOrder(ids);
            await refetch();

            setHasChanges(false);
            setStatusChanges(new Map());
            onClose();
        } catch (error) {
            console.error("Error submitting changes:", error);
        }
    }, [items, setOrder, refetch, statusChanges, onClose]);

    const {
        searchQuery,
        setSearchQuery,
        filteredItems,
        focusedIndex,
        setFocusedIndex
    } = useModalNavigation({
        items,
        filterField: "title",
        isOpen,
        isActive: true,
        onSelect: handleSubmit,
        onShiftSelect: (item) => handleStatusToggle(item.id, !item.isActive)
    });

    const handleReorder = (newItems: TeacherSortItem[]) => {
        if (searchQuery) return;
        setItems(newItems);
        setHasChanges(true);
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50">
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

                                <PopUpSearch
                                    value={searchQuery}
                                    onChange={(val) => setSearchQuery(val)}
                                    className="mb-4"
                                />

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
                                                                className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary"
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
                                                                 {item.subtitle && (
                                                                     <span className={`text-xs truncate transition-colors ${isFocused ? "popup-text-secondary" : "popup-text-tertiary"}`}>
                                                                         {item.subtitle}
                                                                     </span>
                                                                 )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-3 flex-shrink-0">
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
                                                                href={`/teachers/${item.teacher.schema.id}`}
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
                                     <button
                                        onClick={handleSubmit}
                                        disabled={!hasChanges && statusChanges.size === 0}
                                        style={{ backgroundColor: hasChanges || statusChanges.size > 0 ? teacherEntity?.color : undefined }}
                                        className={`
                                            flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all
                                            ${hasChanges || statusChanges.size > 0
                                                ? "text-white shadow-lg hover:opacity-90"
                                                : "popup-button-disabled"
                                            }
                                        `}
                                     >
                                        <Check size={20} />
                                        <span>Apply Changes</span>
                                        {(statusChanges.size > 0 || hasChanges) && (
                                            <span className="bg-black/20 px-2 py-0.5 rounded text-xs ml-2">
                                                {statusChanges.size + (hasChanges ? 1 : 0)} updates
                                            </span>
                                        )}
                                     </button>

                                     <KeyboardHint keys="ESC" action="to close" />
                                </div>
                            </motion.div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
