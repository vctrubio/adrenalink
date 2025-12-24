"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import toast from "react-hot-toast";
import { EntityHeader4SchoolForm } from "./EntityHeader4SchoolForm";
import { EntityActionBtns4SchoolForm } from "./EntityActionBtns4SchoolForm";

export interface MasterSchoolFormProps {
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
    entityTitle: string;
    isFormReady: boolean;
    onSubmit: () => Promise<void>;
    onCancel: () => void;
    onReset?: () => void;
    isLoading?: boolean;
    showActionButtons?: boolean;
    submitLabel?: string;
    children: ReactNode;
}

export function MasterSchoolForm({
    icon,
    color,
    entityTitle,
    isFormReady,
    onSubmit,
    onCancel,
    onReset,
    isLoading = false,
    showActionButtons = true,
    submitLabel = "Submit",
    children,
}: MasterSchoolFormProps) {
    const handleSubmit = useCallback(async () => {
        try {
            await onSubmit();
            toast.success(entityTitle);
        } catch (error) {
            const message = error instanceof Error ? error.message : "An error occurred";
            toast.error(message);
        }
    }, [onSubmit, entityTitle]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <EntityHeader4SchoolForm
                icon={icon}
                color={color}
                entityTitle={entityTitle}
                isFormReady={isFormReady}
            />

            {/* Form Content */}
            <div className="space-y-6">{children}</div>

            {/* Action Buttons */}
            {showActionButtons && (
                <EntityActionBtns4SchoolForm
                    onSubmit={handleSubmit}
                    onCancel={onCancel}
                    onReset={onReset}
                    isLoading={isLoading}
                    isFormValid={isFormReady}
                    entityColor={color}
                    showReset={!!onReset}
                    submitLabel={submitLabel}
                />
            )}
        </div>
    );
}
