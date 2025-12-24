"use client";

export interface EntityActionBtns4SchoolFormProps {
    onSubmit: () => Promise<void> | void;
    onCancel: () => void;
    onReset?: () => void;
    isLoading?: boolean;
    isFormValid?: boolean;
    entityColor?: string;
    showReset?: boolean;
    submitLabel?: string;
}

export function EntityActionBtns4SchoolForm({
    onSubmit,
    onCancel,
    onReset,
    isLoading = false,
    isFormValid = true,
    entityColor = "#3b82f6",
    showReset = false,
    submitLabel = "Submit",
}: EntityActionBtns4SchoolFormProps) {
    return (
        <div className="mt-6 flex gap-3">
            <button
                onClick={onSubmit}
                disabled={isLoading || !isFormValid}
                className="flex-1 px-4 py-2 rounded-md border-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                style={{
                    borderColor: entityColor,
                    backgroundColor: isFormValid && !isLoading ? `${entityColor}20` : "transparent",
                }}
                onMouseEnter={(e) => {
                    if (isFormValid && !isLoading) {
                        e.currentTarget.style.backgroundColor = `${entityColor}30`;
                    }
                }}
                onMouseLeave={(e) => {
                    if (isFormValid && !isLoading) {
                        e.currentTarget.style.backgroundColor = `${entityColor}20`;
                    }
                }}
            >
                {isLoading ? "Saving..." : submitLabel}
            </button>

            {showReset && onReset && (
                <button
                    onClick={onReset}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Reset
                </button>
            )}

            <button
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Cancel
            </button>
        </div>
    );
}
