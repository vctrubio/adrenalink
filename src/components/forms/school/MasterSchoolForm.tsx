"use client";

import { useCallback, ReactNode } from "react";
import { EntityHeader4SchoolForm } from "./EntityHeader4SchoolForm";
import { SubmitCancelReset } from "@/src/components/ui/SubmitCancelReset";

export interface MasterSchoolFormProps {
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
    entityTitle: string;
    isFormReady: boolean;
    onSubmit: () => Promise<void>;
    onCancel: () => void;
    onClear?: () => void;
    isLoading?: boolean;
    showActionButtons?: boolean;
    submitLabel?: ReactNode;
    children: ReactNode;
}

export function MasterSchoolForm({
    icon,
    color,
    entityTitle,
    isFormReady,
    onSubmit,
    onCancel,
    onClear,
    isLoading = false,
    showActionButtons = true,
    submitLabel,
    children,
}: MasterSchoolFormProps) {
    const handleSubmit = useCallback(async () => {
        await onSubmit();
    }, [onSubmit]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <EntityHeader4SchoolForm icon={icon} color={color} entityTitle={entityTitle} isFormReady={isFormReady} />

            {/* Form Content */}
            <div className="space-y-6">{children}</div>

            {/* Action Buttons */}
            {showActionButtons && (
                <div className="pt-2">
                    <SubmitCancelReset
                        onSubmit={handleSubmit}
                        onCancel={onCancel}
                        onReset={onClear || (() => {})}
                        isSubmitting={isLoading}
                        hasChanges={true}
                        disableSubmit={!isFormReady}
                        submitLabel={typeof submitLabel === "string" ? submitLabel : undefined}
                        color={color}
                    />
                </div>
            )}
        </div>
    );
}
