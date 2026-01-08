"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { createCommission, deleteCommission } from "@/supabase/server/commissions";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import { Trash2, Plus, Check } from "lucide-react";
import { Modal } from "@/src/components/modals";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";
import { useModalNavigation } from "@/src/hooks/useModalNavigation";

// ============================================================================
// TeacherCommissionDropdown - Subcomponent for adding commissions
// ============================================================================

interface TeacherCommissionDropdownProps {
    teacherId: string;
    currency: string;
    color: string;
    onAdd: (commission: any) => void;
}

const commissionSchema = z.object({
    commissionType: z.enum(["fixed", "percentage"]),
    cph: z.string().min(1, "Commission value is required"),
    description: z.string().optional(),
});

type CommissionFormData = z.infer<typeof commissionSchema>;

function TeacherCommissionDropdown({ teacherId, currency, color, onAdd }: TeacherCommissionDropdownProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<CommissionFormData>({
        commissionType: "fixed",
        cph: "",
        description: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = useCallback(async () => {
        try {
            setErrors({});
            const validated = commissionSchema.parse(formData);

            setIsSubmitting(true);
            const result = await createCommission({
                teacherId,
                commissionType: validated.commissionType,
                cph: validated.cph,
                description: validated.description || null,
            });

            if (result.success && result.data) {
                onAdd(result.data);
                setFormData({ commissionType: "fixed", cph: "", description: "" });
                setIsExpanded(false);
            } else {
                setErrors({ submit: result.error || "Failed to create commission" });
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                error.issues.forEach((issue) => {
                    if (issue.path[0]) {
                        newErrors[issue.path[0]] = issue.message;
                    }
                });
                setErrors(newErrors);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, teacherId, onAdd]);

    const handleCancel = useCallback(() => {
        setFormData({ commissionType: "fixed", cph: "", description: "" });
        setErrors({});
        setIsExpanded(false);
    }, []);

    return (
        <div className="mb-4">
            {/* Trigger Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all
                    ${isExpanded
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-card/50 border border-border hover:border-primary/30 hover:bg-card/80"
                    }
                `}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 flex items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${color}20`, color }}
                    >
                        <Plus size={16} />
                    </div>
                    <span className="font-medium text-sm">Add Commission</span>
                </div>
                <ToggleAdranalinkIcon isOpen={isExpanded} color={color} />
            </button>

            {/* Expandable Form */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-3 space-y-3">
                            {errors.submit && (
                                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                                    {errors.submit}
                                </div>
                            )}

                            {/* Type Selection */}
                            <div className="grid grid-cols-2 gap-2">
                                {(["fixed", "percentage"] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFormData({ ...formData, commissionType: type })}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            formData.commissionType === type
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "bg-muted/30 hover:bg-muted/50 text-foreground"
                                        }`}
                                    >
                                        {type === "fixed" ? `Fixed (${currency}/hr)` : "Percentage (%)"}
                                    </button>
                                ))}
                            </div>

                            {/* Value and Description */}
                            <div className="flex gap-2">
                                <div className="relative w-32">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                                        {formData.commissionType === "fixed" ? currency : "%"}
                                    </span>
                                    <input
                                        type="number"
                                        value={formData.cph}
                                        onChange={(e) => setFormData({ ...formData, cph: e.target.value })}
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                        disabled={isSubmitting}
                                        className="w-full pl-12 pr-3 py-2.5 h-10 rounded-xl bg-muted/30 border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    onKeyDown={(e) => {
                                        if (e.shiftKey && e.key === "Enter") {
                                            e.preventDefault();
                                            handleSubmit();
                                        }
                                    }}
                                    placeholder="Notes (optional)"
                                    disabled={isSubmitting}
                                    className="flex-1 px-3 py-2.5 h-10 rounded-xl bg-muted/30 border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !formData.cph}
                                    className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                                >
                                    {isSubmitting ? "Adding..." : "Add"}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                    className="px-4 py-2.5 bg-muted/30 hover:bg-muted/50 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

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
    currency?: string;
}

export function TeacherCommissionPanelModal({
    isOpen,
    onClose,
    teacherId,
    teacherUsername,
    commissions: initialCommissions,
    lessons,
    currency = "EUR",
}: TeacherCommissionPanelModalProps) {
    const [commissions, setCommissions] = useState(initialCommissions);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission");
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");
    const color = commissionEntity?.color || "#fff";

    // Helper to get equipment category counts from lessons for a specific commission
    const getCategoryCounts = (commissionId: string) => {
        const counts: Record<string, number> = {};
        const commissionLessons = (lessons || []).filter(l => l.commission_id === commissionId);
        
        commissionLessons.forEach((lesson: any) => {
            const category = lesson.booking?.school_package?.category_equipment;
            if (category) {
                counts[category] = (counts[category] || 0) + 1;
            }
        });
        return counts;
    };

    // Map commissions to items for navigation
    const commissionItems = useMemo(() =>
        commissions.map((c: any) => ({
            id: c.id,
            commission: c,
        })),
        [commissions]
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

    const {
        filteredItems,
        focusedIndex,
        setFocusedIndex
    } = useModalNavigation({
        items: commissionItems,
        filterField: (item) => {
            const c = item.commission;
            return `${c.commission_type} ${c.cph} ${c.description || ""}`;
        },
        isOpen,
        isActive: true,
        onSelect: (item) => {
            const inUse = (lessons || []).some(l => l.commission_id === item.id);
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
                <TeacherCommissionDropdown
                    teacherId={teacherId}
                    currency={currency}
                    color={color}
                    onAdd={handleAddCommission}
                />

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
                            const commissionLessons = (lessons || []).filter(l => l.commission_id === data.id);
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
                                        <div
                                            className="w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 transition-all"
                                            style={{ backgroundColor: `${color}20`, color }}
                                        >
                                            <HandshakeIcon size={18} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className={`font-medium truncate ${isFocused ? "font-bold popup-text-primary" : "popup-text-primary"}`}>
                                                {data.commission_type === "fixed"
                                                    ? `${data.cph} ${currency}/hour`
                                                    : `${data.cph}%`}
                                            </span>
                                            {data.description && (
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {data.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        {Object.keys(categoryCounts).length > 0 ? (
                                            <div className="flex items-center gap-2">
                                                {Object.entries(categoryCounts).map(([category, count]) => {
                                                    const categoryConfig = EQUIPMENT_CATEGORIES.find(c => c.id === category);
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