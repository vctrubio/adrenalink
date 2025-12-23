"use client";

import { useState } from "react";
import { z } from "zod";
import { FormField, FormInput } from "@/src/components/ui/form";
import { ENTITY_DATA } from "@/config/entities";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";

export const commissionSchema = z.object({
    commissionType: z.enum(["fixed", "percentage"]),
    commissionValue: z.number().min(0, "Commission value must be 0 or greater"),
    commissionDescription: z.string().optional(),
});

export type CommissionData = z.infer<typeof commissionSchema> & { id: string };

interface TeacherCommissionFormProps {
    teacherId: string; // For reference when saving
    commissions: CommissionData[];
    onCommissionsChange: (commissions: CommissionData[]) => void;
}

export default function TeacherCommissionForm({ teacherId, commissions, onCommissionsChange }: TeacherCommissionFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingCommission, setEditingCommission] = useState<CommissionData | null>(null);
    const [formData, setFormData] = useState<Omit<CommissionData, "id">>({
        commissionType: "fixed",
        commissionValue: 0,
        commissionDescription: "",
    });

    const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission");
    const commissionColor = commissionEntity?.color;
    const commissionBgColor = commissionEntity?.bgColor;

    const getFieldError = (field: keyof Omit<CommissionData, "id">): string | undefined => {
        try {
            commissionSchema.shape[field].parse(formData[field]);
            return undefined;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return error.issues[0]?.message;
            }
            return undefined;
        }
    };

    const handleAddCommission = () => {
        if (formData.commissionValue <= 0) return;

        const newCommission: CommissionData = {
            ...formData,
            id: editingCommission?.id || Date.now().toString(),
        };

        if (editingCommission) {
            // Update existing
            onCommissionsChange(commissions.map((c) => (c.id === editingCommission.id ? newCommission : c)));
        } else {
            // Add new
            onCommissionsChange([...commissions, newCommission]);
        }

        // Reset form
        setFormData({
            commissionType: "fixed",
            commissionValue: 0,
            commissionDescription: "",
        });
        setEditingCommission(null);
        setIsOpen(false);
    };

    const handleEditCommission = (commission: CommissionData) => {
        setEditingCommission(commission);
        setFormData({
            commissionType: commission.commissionType,
            commissionValue: commission.commissionValue,
            commissionDescription: commission.commissionDescription,
        });
        setIsOpen(true);
    };

    const handleDeleteCommission = (id: string) => {
        onCommissionsChange(commissions.filter((c) => c.id !== id));
    };

    const handleCancel = () => {
        setFormData({
            commissionType: "fixed",
            commissionValue: 0,
            commissionDescription: "",
        });
        setEditingCommission(null);
        setIsOpen(false);
    };

    return (
        <div className="space-y-4 border-t pt-6 mt-6">
            {/* Header - Toggle Button */}
            <CommissionHeader
                commissionColor={commissionColor}
                commissionCount={commissions.length}
                isOpen={isOpen}
                onToggle={() => setIsOpen(!isOpen)}
            />

            {/* Commission List */}
            {commissions.length > 0 && (
                <CommissionList
                    commissions={commissions}
                    commissionColor={commissionColor}
                    commissionBgColor={commissionBgColor}
                    onEdit={handleEditCommission}
                    onDelete={handleDeleteCommission}
                />
            )}

            {/* Add/Edit Form */}
            {isOpen && (
                <CommissionFormFields
                    formData={formData}
                    editingCommission={editingCommission}
                    commissionColor={commissionColor}
                    onFormDataChange={setFormData}
                    onSubmit={handleAddCommission}
                    onCancel={handleCancel}
                    getFieldError={getFieldError}
                />
            )}
        </div>
    );
}

// Sub-component: Commission List
function CommissionList({
    commissions,
    commissionColor,
    commissionBgColor,
    onEdit,
    onDelete,
}: {
    commissions: CommissionData[];
    commissionColor?: string;
    commissionBgColor?: string;
    onEdit: (commission: CommissionData) => void;
    onDelete: (id: string) => void;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commissions.map((commission) => (
                <div
                    key={commission.id}
                    className="group relative flex flex-col p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 bg-card/50"
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-8 h-8 flex items-center justify-center rounded-lg shadow-sm"
                                style={{ 
                                    color: commissionColor,
                                    backgroundColor: commissionBgColor 
                                }}
                            >
                                <HandshakeIcon size={16} />
                            </div>
                            <div>
                                <div className="text-lg font-bold leading-none">
                                    {commission.commissionType === "fixed" 
                                        ? `€${commission.commissionValue}` 
                                        : `${commission.commissionValue}%`}
                                </div>
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                    {commission.commissionType === "fixed" ? "Per Hour" : "Commission"}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                type="button"
                                onClick={() => onEdit(commission)}
                                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => onDelete(commission.id)}
                                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                            </button>
                        </div>
                    </div>
                    
                    {commission.commissionDescription ? (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {commission.commissionDescription}
                        </div>
                    ) : (
                         <div className="text-xs text-muted-foreground/50 italic mt-1">
                            No description
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// Sub-component: Header
function CommissionHeader({
    commissionColor,
    commissionCount,
    isOpen,
    onToggle,
}: {
    commissionColor?: string;
    commissionCount: number;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    Commission Structure
                </h3>
            </div>
            <button
                type="button"
                onClick={onToggle}
                className="text-sm font-medium text-primary hover:underline flex items-center gap-1 transition-all"
            >
                {isOpen ? "Close Form" : "+ Add New Rate"}
            </button>
        </div>
    );
}

// Sub-component: Form Fields
function CommissionFormFields({
    formData,
    editingCommission,
    commissionColor,
    onFormDataChange,
    onSubmit,
    onCancel,
    getFieldError,
}: {
    formData: Omit<CommissionData, "id">;
    editingCommission: CommissionData | null;
    commissionColor?: string;
    teacherId?: string; // Removed usage
    onFormDataChange: (data: Omit<CommissionData, "id">) => void;
    onSubmit: () => void;
    onCancel: () => void;
    getFieldError: (field: keyof Omit<CommissionData, "id">) => string | undefined;
}) {
    return (
        <div 
            className="p-5 rounded-xl border border-border bg-card/50 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <h4 className="text-sm font-semibold">
                    {editingCommission ? "Edit Rate" : "New Commission Rate"}
                </h4>
            </div>

            {/* Type and Value in same row */}
            <div className="grid grid-cols-2 gap-4">
                {/* Commission Type */}
                <FormField label="Type" required error={getFieldError("commissionType")}>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => onFormDataChange({ ...formData, commissionType: "fixed" })}
                            className={`px-3 py-2 text-sm border-2 rounded-md transition-all ${
                                formData.commissionType === "fixed"
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-primary/50"
                            }`}
                        >
                            Fixed (€/h)
                        </button>
                        <button
                            type="button"
                            onClick={() => onFormDataChange({ ...formData, commissionType: "percentage" })}
                            className={`px-3 py-2 text-sm border-2 rounded-md transition-all ${
                                formData.commissionType === "percentage"
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-primary/50"
                            }`}
                        >
                            % Rate
                        </button>
                    </div>
                </FormField>

                {/* Commission Value */}
                <FormField 
                    label="Rate"
                    required
                    error={getFieldError("commissionValue")}
                >
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {formData.commissionType === "fixed" ? "€" : "%"}
                        </span>
                        <FormInput
                            type="number"
                            value={formData.commissionValue || ""}
                            onChange={(e) => onFormDataChange({ ...formData, commissionValue: parseFloat(e.target.value) || 0 })}
                            placeholder={formData.commissionType === "fixed" ? "15" : "20"}
                            min={0}
                            step={1}
                            className="pl-8"
                        />
                    </div>
                </FormField>
            </div>

            {/* Description */}
            <FormField label="Notes (Optional)">
                <textarea
                    value={formData.commissionDescription || ""}
                    onChange={(e) => onFormDataChange({ ...formData, commissionDescription: e.target.value })}
                    placeholder="Add notes about this commission structure (optional)"
                    className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[60px]"
                />
            </FormField>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={formData.commissionValue <= 0}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {editingCommission ? "Update Commission" : "Add Commission"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium rounded-md border-2 border-border hover:border-primary/50"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
