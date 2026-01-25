"use client";

import { useState } from "react";
import Modal from "./Modal";
import { Unlink, Loader2, AlertTriangle } from "lucide-react";
import { unlinkEntityFromClerk } from "@/supabase/server/clerk-sync";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface UnlinkEntityFromClerkProps {
    isOpen: boolean;
    onClose: () => void;
    entityId: string;
    entityType: "teacher" | "student" | "school";
    entityName: string;
    clerkId: string;
    schoolId: string;
}

export function UnlinkEntityFromClerk({ isOpen, onClose, entityId, entityType, entityName, clerkId, schoolId }: UnlinkEntityFromClerkProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const getTitle = () => {
        switch (entityType) {
            case "teacher": return "Unlink Teacher";
            case "student": return "Unlink Student";
            case "school": return "Unlink School Admin";
            default: return "Unlink Identity";
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const result = await unlinkEntityFromClerk(entityId, entityType, clerkId, schoolId);
            if (result.success) {
                toast.success("Identity unlinked successfully");
                router.refresh();
                onClose();
            } else {
                toast.error("Failed to unlink identity");
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
            icon={<Unlink size={24} />}
            iconColor="#ef4444" // Destructive red
            maxWidth="md"
        >
            <div className="p-6 space-y-6">
                <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 flex gap-4 items-start">
                    <AlertTriangle className="text-destructive shrink-0" size={20} />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-destructive uppercase tracking-tight">Warning</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            This will remove the Clerk authentication link for <strong>{entityName}</strong>. 
                            The user will no longer be able to access the portal until re-linked.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Linked Identity</label>
                        <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                            <p className="text-xs font-mono text-foreground truncate">{clerkId}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-4 rounded-2xl border border-border bg-background hover:bg-muted/50 text-sm font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-4 rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-black uppercase tracking-widest shadow-xl shadow-destructive/10 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Unlinking...
                            </>
                        ) : (
                            <>
                                <Unlink size={16} />
                                Unlink Now
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
