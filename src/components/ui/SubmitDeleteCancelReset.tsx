import React from "react";
import { Trash2, RefreshCw, Zap } from "lucide-react";

interface SubmitDeleteCancelResetProps {
    onSubmit: () => void;
    onCancel: () => void;
    onReset: () => void;
    onDelete?: () => void;
    isSubmitting?: boolean;
    isDeleting?: boolean;
    canDelete?: boolean;
    hasChanges?: boolean;
    color?: string;
    className?: string;
    deleteDisabledReason?: string;
}

export function SubmitDeleteCancelReset({
    onSubmit,
    onCancel,
    onReset,
    onDelete,
    isSubmitting = false,
    isDeleting = false,
    canDelete = false,
    hasChanges = false,
    color,
    className = "",
    deleteDisabledReason = "Cannot delete this item",
}: SubmitDeleteCancelResetProps) {
    return (
        <div className={`flex items-center justify-between w-full ${className}`}>
            {/* Delete Button - Left Side */}
            <div>
                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (canDelete && !isSubmitting && !isDeleting) {
                                onDelete();
                            }
                        }}
                        title={!canDelete ? deleteDisabledReason : "Delete this item"}
                        className={`
                            flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                            ${
                                canDelete && !isSubmitting && !isDeleting
                                    ? "bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 active:scale-95 cursor-pointer"
                                    : "bg-muted/30 text-muted-foreground/40 border border-transparent cursor-not-allowed"
                            }
                        `}
                    >
                        <Trash2 size={16} />
                        <span>Delete</span>
                    </button>
                )}
            </div>

            {/* Reset, Cancel & Submit - Right Side */}
            <div className="flex gap-3">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onReset();
                    }}
                    disabled={!hasChanges || isSubmitting || isDeleting}
                    className={`
                        flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 border
                        ${
                            hasChanges && !isSubmitting && !isDeleting
                                ? "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 hover:border-secondary/30 active:scale-95 cursor-pointer"
                                : "bg-muted/30 text-muted-foreground/30 border-transparent cursor-not-allowed"
                        }
                    `}
                    title="Reset changes"
                >
                    <RefreshCw size={18} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCancel();
                    }}
                    disabled={isSubmitting || isDeleting}
                    className={`
                        px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border
                        ${
                            isSubmitting || isDeleting
                                ? "bg-muted/30 text-muted-foreground/40 border-transparent cursor-not-allowed opacity-50"
                                : "bg-background text-foreground border-border hover:bg-muted/50 active:scale-95 cursor-pointer"
                        }
                    `}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    disabled={isSubmitting || isDeleting}
                    title={isSubmitting ? "Saving..." : "Save Changes"}
                    style={{
                        backgroundColor: !isSubmitting && !isDeleting && color ? color : undefined,
                        borderColor: !isSubmitting && !isDeleting && color ? color : undefined,
                    }}
                    className={`
                        flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 border
                        ${
                            isSubmitting || isDeleting
                                ? "bg-muted/50 text-muted-foreground/50 border-transparent cursor-not-allowed opacity-50"
                                : color
                                  ? "text-white hover:opacity-90 active:scale-95 cursor-pointer"
                                  : "bg-primary text-primary-foreground border-primary hover:bg-primary/90 active:scale-95 cursor-pointer"
                        }
                    `}
                >
                    <Zap size={18} />
                </button>
            </div>
        </div>
    );
}
