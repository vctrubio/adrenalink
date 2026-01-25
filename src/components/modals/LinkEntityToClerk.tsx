"use client";

import { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import { LinkIcon, Loader2, Search, User, Check, X } from "lucide-react";
import { linkEntityToClerk } from "@/supabase/server/clerk-sync";
import { searchClerkUsers, ClerkSearchResult } from "@/supabase/server/clerk-search";
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
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<ClerkSearchResult[]>([]);
    const [selectedUser, setSelectedUser] = useState<ClerkSearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Initial load for current identity
    useEffect(() => {
        if (isOpen && currentClerkId) {
            // We don't search for current identity details to keep it simple, 
            // but we could if we wanted to show the linked user profile.
        }
    }, [isOpen, currentClerkId]);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        setIsSearching(true);
        searchTimeout.current = setTimeout(async () => {
            const result = await searchClerkUsers(query);
            if (result.success && result.data) {
                setSearchResults(result.data);
            }
            setIsSearching(false);
        }, 400);
    };

    const getTitle = () => {
        switch (entityType) {
            case "teacher": return "Link Teacher";
            case "student": return "Link Student";
            case "school": return "Link School Admin";
            default: return "Link Identity";
        }
    };

    const handleSubmit = async () => {
        if (!selectedUser) {
            toast.error("Please select a Clerk user");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await linkEntityToClerk(entityId, entityType, selectedUser.id);
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
            iconColor="#3b82f6"
            maxWidth="md"
        >
            <div className="p-6 space-y-6">
                {/* Entity Context */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target Entity</label>
                    <div className="p-3 bg-muted/30 rounded-xl border border-border/50 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <User size={16} />
                        </div>
                        <div>
                            <p className="font-bold text-sm leading-none">{entityName}</p>
                            <p className="text-[10px] text-muted-foreground font-mono mt-1 opacity-50">ID: {entityId}</p>
                        </div>
                    </div>
                </div>

                {/* User Search */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Find Clerk User (Name or Email)
                    </label>
                    
                    {selectedUser ? (
                        <div className="flex items-center justify-between p-3 bg-secondary/10 border border-secondary/30 rounded-xl animate-in fade-in zoom-in-95">
                            <div className="flex items-center gap-3">
                                {selectedUser.imageUrl ? (
                                    <img src={selectedUser.imageUrl} className="w-10 h-10 rounded-full border border-secondary/20" alt="" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                                        {selectedUser.fullName?.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-sm leading-none">{selectedUser.fullName}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{selectedUser.email}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="p-2 hover:bg-secondary/20 rounded-lg text-secondary-foreground/60 hover:text-secondary-foreground transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full pl-11 pr-4 py-4 bg-muted/20 border border-border rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 transition-all"
                            />
                            {isSearching && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Results Dropdown */}
                    {!selectedUser && searchQuery.length >= 2 && (
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl max-h-60 overflow-y-auto">
                            {searchResults.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {searchResults.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => setSelectedUser(user)}
                                            className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors text-left group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                                                {user.imageUrl ? (
                                                    <img src={user.imageUrl} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <User size={20} className="text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{user.fullName}</p>
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                <p className="text-[9px] font-mono text-muted-foreground/40 mt-1 uppercase tracking-tighter">{user.id}</p>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Check className="text-primary" size={18} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : !isSearching && (
                                <div className="p-8 text-center text-muted-foreground">
                                    <p className="text-sm font-medium">No users found</p>
                                    <p className="text-[10px] uppercase tracking-widest mt-1">Try a different name or email</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
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
                        disabled={isSubmitting || !selectedUser}
                        className="flex-1 px-4 py-4 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Linking...
                            </>
                        ) : (
                            <>
                                <LinkIcon size={16} />
                                Link Identity
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}