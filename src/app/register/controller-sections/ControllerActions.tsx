interface ControllerActionsProps {
    onSubmit: () => void;
    onReset: () => void;
    loading: boolean;
    canSubmit: boolean;
    submitLabel: string;
    resetLabel?: string;
    error?: string | null;
}

export function ControllerActions({
    onSubmit,
    onReset,
    loading,
    canSubmit,
    submitLabel,
    resetLabel = "Cancel",
    error,
}: ControllerActionsProps) {
    return (
        <>
            {/* Error Display */}
            {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
                <button
                    onClick={onSubmit}
                    disabled={!canSubmit || loading}
                    className="w-full h-10 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {loading ? "Processing..." : submitLabel}
                </button>
                <button
                    onClick={onReset}
                    disabled={loading}
                    className="w-full h-10 px-4 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {resetLabel}
                </button>
            </div>
        </>
    );
}
