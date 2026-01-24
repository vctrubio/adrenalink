"use client";

import { useState } from "react";
import Modal from "./Modal";
import { LinkIcon, Loader2 } from "lucide-react";
import { linkEntityToClerk } from "@/supabase/server/clerk-sync";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface LinkEntityToClerkProps {
    isOpen: boolean;
    onClose: () => void;
    entityId: string;
    entityType: "teacher" | "student" | "school";
    entityName: string;
    currentClerkId?: string | null;
}

export function LinkEntityToClerk({ isOpen, onClose, entityId, entityType, entityName, currentClerkId }: LinkEntityToClerkProps) {
    const [clerkId, setClerkId] = useState(currentClerkId || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const getTitle = () => {
        switch (entityType) {
            case "teacher":
                return "Link Teacher";
            case "student":
                return "Link Student";
            case "school":
                return "Link School Admin";
            default:
                return "Link Identity";
        }
    };

    const handleSubmit = async () => {
        if (!clerkId) {
            toast.error("Please enter a Clerk User ID");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await linkEntityToClerk(entityId, entityType, clerkId);
            if (result.success) {
                toast.success("Identity linked successfully");
                router.refresh();
                onClose();
            } else {
                toast.error(result.error || "Failed to link identity");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={getTitle()}
            icon={<LinkIcon size={24} />}
            iconColor="#3b82f6" // Primary blue
            maxWidth="md"
        >
            <div className="p-6 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Target Entity</label>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50 text-foreground font-mono text-sm">
                        {entityName} <span className="opacity-50">({entityId ? `${entityId.slice(0, 8)}...` : "N/A"})</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="clerkId" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                        Clerk User ID
                    </label>
                    <input
                        id="clerkId"
                        type="text"
                        value={clerkId}
                        onChange={(e) => setClerkId(e.target.value)}
                        placeholder="user_2..."
                        disabled={isSubmitting}
                        className="w-full p-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-sm disabled:opacity-50"
                    />
                    <p className="text-xs text-muted-foreground">
                        Paste the User ID from the Clerk Dashboard or the User Debug Context.
                    </p>
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 rounded-xl border border-border bg-background hover:bg-muted/50 text-foreground font-semibold transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !clerkId}
                        className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Linking...
                            </>
                        ) : (
                            "Link Identity"
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
