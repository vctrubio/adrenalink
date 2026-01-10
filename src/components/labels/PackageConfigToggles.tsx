"use client";

import { useState } from "react";
import { Eye, EyeOff, Power, PowerOff, Loader2 } from "lucide-react";
import { updatePackageConfig } from "@/supabase/server/package-id";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface PackageConfigTogglesProps {
    packageId: string;
    isActive: boolean;
    isPublic: boolean;
}

export function PackageConfigToggles({ packageId, isActive, isPublic }: PackageConfigTogglesProps) {
    const [loading, setLoading] = useState<"active" | "public" | null>(null);
    const router = useRouter();

    const handleToggle = async (type: "active" | "is_public") => {
        setLoading(type === "active" ? "active" : "public");

        const updates = type === "active" ? { active: !isActive } : { is_public: !isPublic };

        const res = await updatePackageConfig(packageId, updates);

        if (res.success) {
            router.refresh();
            toast.success(`${type === "active" ? "Status" : "Visibility"} updated`);
        } else {
            toast.error(res.error || "Update failed");
        }

        setLoading(null);
    };

    return (
        <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-tight">
            {/* Status Toggle */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleToggle("active");
                }}
                disabled={!!loading}
                className="transition-colors"
            >
                {loading === "active" ? (
                    <span className="animate-pulse text-muted-foreground/40">...</span>
                ) : (
                    <span className={isActive ? "text-emerald-600 dark:text-emerald-500" : "text-muted-foreground/30"}>
                        {isActive ? "Active" : "Off"}
                    </span>
                )}
            </button>

            <span className="opacity-20 text-foreground">|</span>

            {/* Visibility Toggle */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleToggle("is_public");
                }}
                disabled={!!loading}
                className="transition-colors"
            >
                {loading === "public" ? (
                    <span className="animate-pulse text-muted-foreground/40">...</span>
                ) : (
                    <span className={isPublic ? "text-blue-600 dark:text-blue-500" : "text-muted-foreground/30"}>
                        {isPublic ? "Public" : "Private"}
                    </span>
                )}
            </button>
        </div>
    );
}
