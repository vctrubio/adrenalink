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
        <div className="space-y-3 border-t-2 pt-6" style={{ borderColor: commissionColor }}>
            {/* Header - Toggle Button */}
            <CommissionHeader
                commissionColor={commissionColor}
                commissionCount={commissions.length}
                isOpen={isOpen}
                onToggle={() => setIsOpen(!isOpen)}
                teacherId={teacherId}
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
                    teacherId={teacherId}
                    onFormDataChange={setFormData}
                    onSubmit={handleAddCommission}
                    onCancel={handleCancel}
                    getFieldError={getFieldError}
                />
            )}
        </div>
    );
}

// Sub-component: Header
function CommissionHeader({
    commissionColor,
    commissionCount,
    isOpen,
    onToggle,
    teacherId,
}: {
    commissionColor?: string;
    commissionCount: number;
    isOpen: boolean;
    onToggle: () => void;
    teacherId: string;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div 
                    className="w-6 h-6 flex items-center justify-center"
                    style={{ color: commissionColor }}
                >
                    <HandshakeIcon size={24} />
                </div>
                <h3 className="text-lg font-semibold">Commission</h3>
                {commissionCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                        ({commissionCount} {commissionCount === 1 ? "structure" : "structures"})
                    </span>
                )}
            </div>
            <button
                type="button"
                onClick={onToggle}
                className="px-3 py-1.5 text-sm border-2 border-border rounded-md hover:border-primary/50 transition-all"
            >
                {isOpen ? "Close" : `+ Add Commission for ${teacherId.slice(0, 8)}`}
            </button>
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
        <div className="space-y-2">
            {commissions.map((commission) => (
                <div
                    key={commission.id}
                    className="flex items-center justify-between p-3 rounded-lg border-2 border-border hover:border-primary/30 transition-all"
                >
                    <div className="flex items-center gap-3 flex-1">
                        <div 
                            className="w-8 h-8 flex items-center justify-center rounded-md"
                            style={{ 
                                color: commissionColor,
                                backgroundColor: commissionBgColor 
                            }}
                        >
                            <HandshakeIcon size={18} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                    {commission.commissionType === "fixed" 
                                        ? `€${commission.commissionValue}/hour` 
                                        : `${commission.commissionValue}%`}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    ({commission.commissionType === "fixed" ? "Fixed Rate" : "Percentage"})
                                </span>
                            </div>
                            {commission.commissionDescription && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    {commission.commissionDescription}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onEdit(commission)}
                            className="px-2 py-1 text-xs text-primary hover:underline"
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(commission.id)}
                            className="px-2 py-1 text-xs text-destructive hover:underline"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Sub-component: Form Fields
function CommissionFormFields({
    formData,
    editingCommission,
    commissionColor,
    teacherId,
    onFormDataChange,
    onSubmit,
    onCancel,
    getFieldError,
}: {
    formData: Omit<CommissionData, "id">;
    editingCommission: CommissionData | null;
    commissionColor?: string;
    teacherId: string;
    onFormDataChange: (data: Omit<CommissionData, "id">) => void;
    onSubmit: () => void;
    onCancel: () => void;
    getFieldError: (field: keyof Omit<CommissionData, "id">) => string | undefined;
}) {
    return (
        <div 
            className="p-4 rounded-lg space-y-4"
            style={{ backgroundColor: `${commissionColor}10` }}
        >
            <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: `${commissionColor}30` }}>
                <h4 className="text-sm font-semibold">
                    {editingCommission ? "Edit Commission" : `Add New Commission for ${teacherId.slice(0, 8)}`}
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
