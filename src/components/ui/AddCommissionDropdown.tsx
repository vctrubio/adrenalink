"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { createCommission } from "@/supabase/server/commissions";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";
import { X } from "lucide-react";

interface AddCommissionDropdownProps {
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

export function AddCommissionDropdown({
  teacherId,
  currency,
  color,
  onAdd,
}: AddCommissionDropdownProps) {
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
      <div className="rounded-xl bg-muted/10 border border-border/30 overflow-hidden">
        {/* Header/Trigger - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-all"
        >
          <div
            className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
            style={{ backgroundColor: `${color}20`, color }}
          >
            <HandshakeIcon size={16} />
          </div>
          <span className="font-medium text-sm flex-1">Add Commission</span>
          <ToggleAdranalinkIcon isOpen={isExpanded} color={color} />
        </button>

        {/* Form Content - Expandable */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border/30"
            >

            {/* Form Fields */}
            <div className="px-4 py-3 space-y-3">
              {errors.submit && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                  {errors.submit}
                </div>
              )}

              {/* Type Selection */}
              <div className="flex gap-4">
                {(["fixed", "percentage"] as const).map((type) => (
                  <button
                    key={type}
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

            </div>

            {/* Footer Actions */}
            <div className="flex gap-2 px-4 py-3 border-t border-border/30">
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.cph}
                className="flex-1 px-4 py-2 text-foreground hover:bg-muted/50 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Adding..." : "Add"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
