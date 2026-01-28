"use client";

import { useCallback, ReactNode, useState, createContext, useContext } from "react";
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
    showSubmit?: boolean;
    submitLabel?: ReactNode;
    children: ReactNode;
}

const MasterFormContext = createContext<{ hasSubmitted: boolean }>({ hasSubmitted: false });

export const useMasterForm = () => useContext(MasterFormContext);

export function MasterSchoolForm({
    icon,
    color,
    entityTitle,
    isFormReady,
    onSubmit,
    onCancel,
    onClear,
    isLoading = false,
    showSubmit = true,
    submitLabel,
    children,
}: MasterSchoolFormProps) {
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const handleSubmit = useCallback(async () => {
        setHasSubmitted(true);
        await onSubmit();
    }, [onSubmit]);

    const handleClear = useCallback(() => {
        setHasSubmitted(false);
        onClear?.();
    }, [onClear]);

    return (
        <MasterFormContext.Provider value={{ hasSubmitted }}>
            <div className="space-y-6">
                {/* Header */}
                <EntityHeader4SchoolForm icon={icon} color={color} entityTitle={entityTitle} isFormReady={isFormReady} />

                {/* Form Content */}
                <div className="space-y-6">{children}</div>

                {/* Action Buttons */}
                {showSubmit && (
                    <div className="pt-2">
                        <SubmitCancelReset
                            onSubmit={handleSubmit}
                            onCancel={onCancel}
                            onReset={handleClear}
                            isSubmitting={isLoading}
                            hasChanges={true}
                            disableSubmit={!isFormReady}
                            submitLabel={typeof submitLabel === "string" ? submitLabel : undefined}
                            color={color}
                        />
                    </div>
                )}
            </div>
        </MasterFormContext.Provider>
    );
}
