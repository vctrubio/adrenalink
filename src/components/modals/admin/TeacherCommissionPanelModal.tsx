"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { deleteCommission } from "@/supabase/server/commissions";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { CommissionTypeValue } from "@/src/components/ui/badge/commission-type-value";
import { AddCommissionDropdown } from "@/src/components/ui/AddCommissionDropdown";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { Trash2, Check } from "lucide-react";
import { Modal } from "@/src/components/modals";
import { useModalNavigation } from "@/src/hooks/useModalNavigation";

// ============================================================================
// TeacherCommissionPanelModal - Main component
// ============================================================================

interface TeacherCommissionPanelModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherId: string;
    teacherUsername: string;
    commissions: any[];
    lessons: any[];
}

export function TeacherCommissionPanelModal({
    isOpen,
    onClose,
    teacherId,
    teacherUsername,
    commissions: initialCommissions,
    lessons,
}: TeacherCommissionPanelModalProps) {
    const credentials = useSchoolCredentials();
    const currency = credentials.currency || "YEN";
    const [commissions, setCommissions] = useState(initialCommissions);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission");
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
    const color = commissionEntity?.color || "#fff";

    // Helper to get equipment category counts from lessons for a specific commission
    const getCategoryCounts = (commissionId: string) => {
        const counts: Record<string, number> = {};
        const commissionLessons = (lessons || []).filter((l) => l.commission_id === commissionId);

        commissionLessons.forEach((lesson: any) => {
            const category = lesson.booking?.school_package?.category_equipment;
            if (category) {
                counts[category] = (counts[category] || 0) + 1;
            }
        });
        return counts;
    };

    // Map commissions to items for navigation
    const commissionItems = useMemo(
        () =>
            commissions.map((c: any) => ({
                id: c.id,
                commission: c,
            })),
        [commissions],
    );

    const handleDelete = useCallback(async (commissionId: string) => {
        setIsDeleting(commissionId);
        try {
            const result = await deleteCommission(commissionId);
            if (result.success) {
                setCommissions((prev) => prev.filter((c: any) => c.id !== commissionId));
            }
        } catch (error) {
            console.error("Error deleting commission:", error);
        } finally {
            setIsDeleting(null);
        }
    }, []);

    const handleAddCommission = useCallback((newCommission: any) => {
        setCommissions((prev) => [...prev, newCommission]);
    }, []);

    const { filteredItems, focusedIndex, setFocusedIndex } = useModalNavigation({
        items: commissionItems,
        filterField: (item) => {
            const c = item.commission;
            return `${c.commission_type} ${c.cph} ${c.description || ""}`;
        },
        isOpen,
        isActive: true,
        onSelect: (item) => {
            const inUse = (lessons || []).some((l) => l.commission_id === item.id);
            if (!inUse) {
                handleDelete(item.id);
            }
        },
    });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={teacherUsername}
            subtitle={
                <span className="flex items-center gap-2">
                    <HandshakeIcon size={16} style={{ color }} />
                    <span>Manage Commissions</span>
                </span>
            }
            entityId="commission"
            icon={<HeadsetIcon size={32} />}
            iconColor={teacherEntity?.color}
            maxWidth="2xl"
        >
            <div className="flex flex-col gap-4">
                {/* Add Commission Dropdown */}
                <AddCommissionDropdown teacherId={teacherId} currency={currency} color={color} onAdd={handleAddCommission} />

                {/* Commissions List */}
                <div className="overflow-y-auto custom-scrollbar max-h-[400px] flex flex-col gap-2">
                    {filteredItems.length === 0 ? (
                        <div className="popup-loading py-8">
                            <span>{commissions.length === 0 ? "No commissions yet" : "No matching commissions"}</span>
                        </div>
                    ) : (
                        filteredItems.map((item, index) => {
                            const commission = item.commission;
                            const data = commission;
                            const commissionLessons = (lessons || []).filter((l) => l.commission_id === data.id);
                            const canDelete = commissionLessons.length === 0;
                            const categoryCounts = getCategoryCounts(data.id);
                            const isFocused = index === focusedIndex;

                            return (
                                <motion.div
                                    key={data.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03, duration: 0.15 }}
                                    onClick={() => setFocusedIndex(index)}
                                    className={`
                                        relative flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all
                                        ${isFocused ? "popup-row-focused" : "popup-row"}
                                    `}
                                >
                                    {isFocused && (
                                        <motion.div
                                            layoutId="commission-indicator"
                                            className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                                            style={{ backgroundColor: color }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}

                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <CommissionTypeValue
                                            value={data.cph}
                                            type={data.commission_type as "fixed" | "percentage"}
                                            description={data.description}
                                            isSelected={isFocused}
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        {Object.keys(categoryCounts).length > 0 ? (
                                            <div className="flex items-center gap-2">
                                                {Object.entries(categoryCounts).map(([category, count]) => {
                                                    const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === category);
                                                    if (!categoryConfig) return null;
                                                    const CategoryIcon = categoryConfig.icon;
                                                    return (
                                                        <div key={category} className="flex items-center gap-1">
                                                            <CategoryIcon size={14} style={{ color: categoryConfig.color }} />
                                                            <span className="text-xs text-muted-foreground">{count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">No lessons</span>
                                        )}

                                        {canDelete ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(data.id);
                                                }}
                                                disabled={isDeleting === data.id}
                                                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:opacity-50"
                                            >
                                                {isDeleting === data.id ? (
                                                    <motion.div
                                                        className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                        ) : (
                                            <div className="popup-badge-success">
                                                <Check size={14} />
                                                <span className="text-xs font-bold">In use</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Keyboard Hints */}
                <div className="grid grid-cols-4 gap-2 mt-2 pt-4 border-t border-border/20">
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/10">
                        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Delete</span>
                        <span className="popup-hint-key text-[10px]">ENTER</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/10">
                        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Add</span>
                        <span className="popup-hint-key text-[10px]">TAB</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/10">
                        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Navigate</span>
                        <span className="popup-hint-key text-[10px]">↑↓</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/10">
                        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Close</span>
                        <span className="popup-hint-key text-[10px]">ESC</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
