"use client";

import { useState, useMemo, useCallback, Fragment, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useModalNavigation } from "@/src/hooks/useModalNavigation";
import { useEquipment } from "@/src/hooks/useEquipment";
import { linkTeacherToEquipment, removeTeacherFromEquipment } from "@/supabase/server/teacher-equipment";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { ENTITY_DATA } from "@/config/entities";
import type { TeacherData } from "@/backend/data/TeacherData";
import { PopUpHeader } from "@/src/components/ui/popup/PopUpHeader";
import { PopUpSearch } from "@/src/components/ui/popup/PopUpSearch";
import { StatusToggle } from "@/src/components/ui/StatusToggle";
import { GoToAdranlink } from "@/src/components/ui/GoToAdranlink";
import { SubmitCancelReset } from "@/src/components/ui/SubmitCancelReset";

interface TeacherEquipmentManModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: TeacherData;
}

type CategoryFilter = "all" | "kite" | "wing" | "windsurf";
type SortOption = "brand" | "size";

export function TeacherEquipmentManModal({ isOpen, onClose, teacher }: TeacherEquipmentManModalProps) {
    const router = useRouter();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [filterMode, setFilterMode] = useState<"assigned" | "all">("all");
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
    const [sortBy, setSortBy] = useState<SortOption>("brand");

    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment");

    // Fetch equipment for each category
    const kiteHook = useEquipment("kite");
    const wingHook = useEquipment("wing");
    const windsurfHook = useEquipment("windsurf");

    // Fetch equipment when modal opens
    useEffect(() => {
        if (isOpen) {
            kiteHook.fetchAvailable();
            wingHook.fetchAvailable();
            windsurfHook.fetchAvailable();
        }
    }, [isOpen]);

    // Combine all equipment
    const allEquipment = useMemo(() => {
        return [
            ...kiteHook.availableEquipment.map((e: any) => ({ ...e, category: "kite" })),
            ...wingHook.availableEquipment.map((e: any) => ({ ...e, category: "wing" })),
            ...windsurfHook.availableEquipment.map((e: any) => ({ ...e, category: "windsurf" })),
        ].filter((e) => e.status === "public");
    }, [kiteHook.availableEquipment, wingHook.availableEquipment, windsurfHook.availableEquipment]);

    // Track linkage state
    const [linkedEquipmentIds, setLinkedEquipmentIds] = useState<Set<string>>(
        new Set(teacher.relations?.teacher_equipment?.map((te: any) => te.equipment?.id).filter(Boolean) || [])
    );
    const [linkageChanges, setLinkageChanges] = useState<Map<string, boolean>>(new Map());

    const handleToggleLink = useCallback(
        (equipmentId: string, isLinked: boolean) => {
            const originallyLinked = teacher.relations?.teacher_equipment?.some((te: any) => te.equipment?.id === equipmentId) || false;

            setLinkageChanges((prev) => {
                const newChanges = new Map(prev);
                if (originallyLinked === isLinked) {
                    newChanges.delete(equipmentId);
                } else {
                    newChanges.set(equipmentId, isLinked);
                }
                return newChanges;
            });

            setLinkedEquipmentIds((prev) => {
                const newSet = new Set(prev);
                if (isLinked) {
                    newSet.add(equipmentId);
                } else {
                    newSet.delete(equipmentId);
                }
                return newSet;
            });
        },
        [teacher.relations?.teacher_equipment]
    );

    const handleSubmit = useCallback(async () => {
        try {
            if (linkageChanges.size > 0) {
                for (const [equipmentId, isLinked] of linkageChanges.entries()) {
                    if (isLinked) {
                        await linkTeacherToEquipment(equipmentId, teacher.schema.id);
                    } else {
                        await removeTeacherFromEquipment(equipmentId, teacher.schema.id);
                    }
                }
            }

            setLinkageChanges(new Map());
            router.refresh();
            onClose();
        } catch (error) {
            console.error("Error submitting changes:", error);
        }
    }, [linkageChanges, teacher.schema.id, router, onClose]);

    const handleReset = useCallback(() => {
        setLinkedEquipmentIds(new Set(teacher.relations?.teacher_equipment?.map((te: any) => te.equipment?.id).filter(Boolean) || []));
        setLinkageChanges(new Map());
        setFilterMode("all");
        setCategoryFilter("all");
        setSortBy("brand");
    }, [teacher.relations?.teacher_equipment]);

    const handleCancel = useCallback(() => {
        handleReset();
        onClose();
    }, [handleReset, onClose]);

    // Filter by category
    const categoryFilteredEquipment = useMemo(() => {
        if (categoryFilter === "all") return allEquipment;
        return allEquipment.filter((e) => e.category === categoryFilter);
    }, [allEquipment, categoryFilter]);

    // Filter by assigned/all and sort
    const displayEquipment = useMemo(() => {
        let filtered = filterMode === "all" ? categoryFilteredEquipment : categoryFilteredEquipment.filter((e) => linkedEquipmentIds.has(e.id));

        // Sort
        return [...filtered].sort((a, b) => {
            if (sortBy === "brand") {
                const brandCompare = (a.brand || "").localeCompare(b.brand || "");
                if (brandCompare !== 0) return brandCompare;
                return (a.model || "").localeCompare(b.model || "");
            } else {
                // Sort by size
                const aSize = parseFloat(a.size) || 0;
                const bSize = parseFloat(b.size) || 0;
                return aSize - bSize;
            }
        });
    }, [categoryFilteredEquipment, filterMode, linkedEquipmentIds, sortBy]);

    const { searchQuery, setSearchQuery, filteredItems: filteredEquipment, focusedIndex, setFocusedIndex } = useModalNavigation({
        items: displayEquipment,
        filterField: (equipment: any) => `${equipment.brand} ${equipment.model} ${equipment.size || ""}`,
        isOpen,
        isActive: true,
        onSelect: (equipment: any) => {
            router.push(`/equipments/${equipment.id}`);
            onClose();
        },
        onShiftSelect: () => handleSubmit(),
        onTabSelect: (equipment: any) => {
            const isLinked = linkedEquipmentIds.has(equipment.id);
            handleToggleLink(equipment.id, !isLinked);
        },
    });

    const assignedCount = linkedEquipmentIds.size;
    const kiteCount = allEquipment.filter((e) => e.category === "kite").length;
    const wingCount = allEquipment.filter((e) => e.category === "wing").length;
    const windsurfCount = allEquipment.filter((e) => e.category === "windsurf").length;

    const isLoading = kiteHook.isLoading || wingHook.isLoading || windsurfHook.isLoading;

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
                                transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                                className="relative flex flex-col max-h-[85vh] bg-background/95 backdrop-blur-xl rounded-3xl border border-border/40 p-6 shadow-2xl"
                            >
                                <PopUpHeader
                                    title={teacher.schema.username}
                                    subtitle="Assign Equipment"
                                    icon={<div style={{ color: teacherEntity?.color }}>{teacherEntity?.icon && <teacherEntity.icon size={32} />}</div>}
                                />

                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <PopUpSearch
                                        value={searchQuery}
                                        onChange={setSearchQuery}
                                        className="flex-1 min-w-[200px]"
                                    />

                                    <div className="flex p-1 bg-muted/30 rounded-xl border border-border/50 flex-shrink-0">
                                        <button
                                            onClick={() => setFilterMode("all")}
                                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterMode === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                        >
                                            All ({categoryFilteredEquipment.length})
                                        </button>
                                        <button
                                            onClick={() => setFilterMode("assigned")}
                                            className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterMode === "assigned" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                        >
                                            Assigned ({assignedCount})
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => setCategoryFilter("all")}
                                        className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground hover:text-foreground"}`}
                                    >
                                        All ({allEquipment.length})
                                    </button>
                                    {EQUIPMENT_CATEGORIES.map((cat) => {
                                        const count = cat.id === "kite" ? kiteCount : cat.id === "wing" ? wingCount : windsurfCount;
                                        const CategoryIcon = cat.icon;
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
                                                className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${categoryFilter === cat.id ? "text-white shadow-md" : "bg-muted/30 text-muted-foreground hover:text-foreground"}`}
                                                style={categoryFilter === cat.id ? { backgroundColor: cat.color } : {}}
                                            >
                                                <CategoryIcon size={14} />
                                                {cat.label} ({count})
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={() => setSortBy("brand")}
                                        className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === "brand" ? "bg-background shadow-sm text-foreground border border-border/50" : "bg-muted/30 text-muted-foreground hover:text-foreground"}`}
                                    >
                                        Sort by Brand
                                    </button>
                                    <button
                                        onClick={() => setSortBy("size")}
                                        className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === "size" ? "bg-background shadow-sm text-foreground border border-border/50" : "bg-muted/30 text-muted-foreground hover:text-foreground"}`}
                                    >
                                        Sort by Size
                                    </button>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25, duration: 0.3, ease: "easeOut" }}
                                    className="flex-1 min-h-0 overflow-y-auto custom-scrollbar mb-6 p-1"
                                >
                                    {isLoading ? (
                                        <div className="text-center py-8 text-muted-foreground">Loading equipment...</div>
                                    ) : filteredEquipment.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">No equipment found</div>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            {filteredEquipment.map((equipment: any, index: number) => {
                                                const isLinked = linkedEquipmentIds.has(equipment.id);
                                                const isFocused = index === focusedIndex;
                                                const isHovered = index === hoveredIndex;
                                                const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === equipment.category);
                                                const CategoryIcon = categoryConfig?.icon;

                                                return (
                                                    <motion.div
                                                        key={equipment.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.02 }}
                                                        className={`
                                                            flex items-center justify-between px-4 py-3 gap-4 rounded-xl border cursor-pointer group relative overflow-hidden transition-all
                                                            ${isFocused ? "border-border/30 shadow-sm" : "bg-muted/5 border-transparent hover:border-border/30"}
                                                        `}
                                                        onClick={() => setFocusedIndex(index)}
                                                        onMouseEnter={() => setHoveredIndex(index)}
                                                        onMouseLeave={() => setHoveredIndex(null)}
                                                    >
                                                        {isFocused && (
                                                            <motion.div
                                                                layoutId="teacher-equipment-indicator"
                                                                className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary"
                                                                style={{ backgroundColor: categoryConfig?.color }}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ duration: 0.2 }}
                                                            />
                                                        )}

                                                        <div
                                                            className="flex items-center gap-3 flex-1 min-w-0 transition-all duration-200"
                                                            style={{
                                                                opacity: isLinked ? 1 : 0.4,
                                                            }}
                                                        >
                                                            <div style={{ color: categoryConfig?.color }}>
                                                                {CategoryIcon && <CategoryIcon size={20} />}
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span
                                                                    className={`transition-colors truncate ${isFocused ? "font-black text-foreground" : `font-bold ${isLinked ? "text-foreground" : "text-muted-foreground/60"}`}`}
                                                                >
                                                                    {equipment.brand} {equipment.model}
                                                                </span>
                                                                {equipment.size && (
                                                                    <span className="text-xs text-muted-foreground">{equipment.size}m</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 flex-shrink-0">
                                                            <StatusToggle
                                                                isActive={isLinked}
                                                                onToggle={(linked) => {
                                                                    handleToggleLink(equipment.id, linked);
                                                                    setFocusedIndex(index);
                                                                }}
                                                                color={categoryConfig?.color}
                                                                className="popup-toggle-unchecked"
                                                            />

                                                            <GoToAdranlink
                                                                href={`/equipments/${equipment.id}`}
                                                                onNavigate={onClose}
                                                                isHovered={isHovered}
                                                            />
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.div>

                                <div className="flex flex-col gap-4">
                                    <SubmitCancelReset
                                        onSubmit={handleSubmit}
                                        onCancel={handleCancel}
                                        onReset={handleReset}
                                        hasChanges={linkageChanges.size > 0}
                                        submitLabel="Apply Changes"
                                        color={teacherEntity?.color}
                                        extraContent={
                                            linkageChanges.size > 0 && (
                                                <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-white/25 text-white text-[10px] font-extrabold ml-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-white/10">
                                                    {linkageChanges.size}
                                                </span>
                                            )
                                        }
                                    />

                                    <div className="grid grid-cols-5 gap-2">
                                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/20 border border-border/40">
                                            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">
                                                Go-To
                                            </span>
                                            <span className="bg-background px-1.5 py-0.5 rounded shadow-sm text-foreground font-black text-[10px]">
                                                ENTER
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/20 border border-border/40">
                                            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">
                                                Submit
                                            </span>
                                            <div className="flex gap-1">
                                                <span className="bg-background px-1 py-0.5 rounded shadow-sm text-foreground font-black text-[9px]">
                                                    ⇧
                                                </span>
                                                <span className="bg-background px-1.5 py-0.5 rounded shadow-sm text-foreground font-black text-[10px]">
                                                    ENTER
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/20 border border-border/40">
                                            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">
                                                Toggle
                                            </span>
                                            <span className="bg-background px-1.5 py-0.5 rounded shadow-sm text-foreground font-black text-[10px]">
                                                TAB
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/20 border border-border/40">
                                            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">
                                                Reset
                                            </span>
                                            <div className="flex gap-1">
                                                <span className="bg-background px-1 py-0.5 rounded shadow-sm text-foreground font-black text-[9px]">
                                                    ⇧
                                                </span>
                                                <span className="bg-background px-1.5 py-0.5 rounded shadow-sm text-foreground font-black text-[10px]">
                                                    TAB
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/20 border border-border/40">
                                            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">
                                                Close
                                            </span>
                                            <span className="bg-background px-1.5 py-0.5 rounded shadow-sm text-foreground font-black text-[10px]">
                                                ESC
                                            </span>
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
