"use client";

import { useState, useCallback } from "react";
import { z } from "zod";
import { createCommission } from "@/supabase/server/commissions";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";

interface AddCommissionFormProps {
    teacherId: string;
    currency: string;
    onAdd: (commission: any) => void;
    onCancel?: () => void;
}

const commissionSchema = z.object({
    commissionType: z.enum(["fixed", "percentage"]),
    cph: z.string().min(1, "Commission value is required"),
    description: z.string().optional(),
});

type CommissionFormData = z.infer<typeof commissionSchema>;

export function AddCommissionForm({ teacherId, currency, onAdd, onCancel }: AddCommissionFormProps) {
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
                setErrors({});
                onCancel?.();
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
    }, [formData, teacherId, onAdd, onCancel]);

    const handleCancel = useCallback(() => {
        setFormData({ commissionType: "fixed", cph: "", description: "" });
        setErrors({});
        onCancel?.();
    }, [onCancel]);

    const canSubmit = formData.cph.trim() !== "" && !isSubmitting;

    return (
        <div className="rounded-xl bg-muted/10 border border-border/30 p-3 space-y-3">
            {errors.submit && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                    {errors.submit}
                </div>
            )}

            {/* Type Selection */}
            <div className="flex items-center gap-3">
                <div
                    className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors ${
                        canSubmit ? "bg-primary/20" : "bg-muted"
                    }`}
                >
                    <HandshakeIcon
                        size={16}
                        className={canSubmit ? "text-primary" : ""}
                    />
                </div>
                <div className="flex gap-4">
                {(["fixed", "percentage"] as const).map((type) => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, commissionType: type })}
                        className={`text-sm font-medium pb-1 transition-colors ${
                            formData.commissionType === type
                                ? "text-foreground border-b-2 border-foreground"
                                : "text-muted-foreground hover:text-foreground border-b border-transparent"
                        }`}
                    >
                        {type === "fixed" ? `Fixed (${currency}/hr)` : "Percentage (%)"}
                    </button>
                ))}
                </div>
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
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.cph}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Adding..." : "Add"}
                </button>
            </div>
        </div>
    );
}

// Keep the old export for backward compatibility
export const AddCommissionDropdown = AddCommissionForm;
