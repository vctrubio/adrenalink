import React from "react";
import { ACTION_BUTTON_CONFIG } from "@/types/status";
import { Zap, RefreshCw, X } from "lucide-react";

interface SubmitCancelResetProps {
    onSubmit: () => void;
    onCancel: () => void;
    onReset: () => void;
    isSubmitting?: boolean;
    hasChanges: boolean;
    submitLabel?: string;
    extraContent?: React.ReactNode;
    color?: string; // Custom color for submit button active state
    className?: string;
}

export function SubmitCancelReset({
    onSubmit,
    onCancel,
    onReset,
    isSubmitting = false,
    hasChanges,
    submitLabel,
    extraContent,
    color,
    className = "",
}: SubmitCancelResetProps) {
    return (
        <div className={`grid grid-cols-4 gap-2 w-full ${className}`}>
            <button 
                onClick={onCancel} 
                className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 active:scale-95 ${ACTION_BUTTON_CONFIG.cancel.className}`}
                title={ACTION_BUTTON_CONFIG.cancel.label}
            >
                <span className="font-bold text-xs">Cancel</span>
            </button>
            <button 
                onClick={onReset} 
                disabled={!hasChanges}
                className={`
                    flex items-center justify-center p-3 rounded-xl transition-all duration-200 border-2
                    ${hasChanges 
                        ? "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 hover:border-secondary/30 active:scale-95 cursor-pointer" 
                        : "bg-muted/30 text-muted-foreground/30 border-transparent cursor-not-allowed"
                    }
                `}
                title={ACTION_BUTTON_CONFIG.reset.label}
            >
                <RefreshCw size={20} />
            </button>
            
            <button 
                onClick={onSubmit} 
                disabled={!hasChanges && !isSubmitting} 
                style={{ backgroundColor: (hasChanges || isSubmitting) && color ? color : undefined }}
                className={`
                    col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95
                    ${hasChanges || isSubmitting
                        ? "text-white shadow-lg hover:opacity-90 bg-cyan-600"
                        : "bg-muted/50 dark:bg-white/5 text-muted-foreground/50 dark:text-white/30 cursor-not-allowed"
                    }
                `}
            >
                {isSubmitting ? (
                    <span className="text-sm">Saving...</span>
                ) : (
                    <>
                        <Zap size={20} />
                        <span className="truncate">{submitLabel || ACTION_BUTTON_CONFIG.submit.label}</span>
                        {extraContent}
                    </>
                )}
            </button>
        </div>
    );
}
