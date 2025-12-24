"use client";

export interface EntityActionBtns4SchoolFormProps {
    onSubmit: () => Promise<void> | void;
    onCancel: () => void;
    onClear?: () => void;
    isLoading?: boolean;
    isFormValid?: boolean;
    entityColor?: string;
    submitLabel?: string;
}

export function EntityActionBtns4SchoolForm({
    onSubmit,
    onCancel,
    onClear,
    isLoading = false,
    isFormValid = true,
    entityColor = "#3b82f6",
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

            {onClear && (
                <button
                    onClick={onClear}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                >
                    Clear
                </button>
            )}

            <button
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
            >
                Cancel
            </button>
        </div>
    );
}
