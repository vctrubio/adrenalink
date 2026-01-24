"use client";

import { User, Copy, Check } from "lucide-react";
import { useState } from "react";

interface DemoSystemUserCardProps {
    clerkId: string;
    role: string;
    entityId: string;
    name: string;
}

export function DemoSystemUserCard({ clerkId, role, entityId, name }: DemoSystemUserCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(clerkId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Role color mapping
    const getRoleColor = (r: string) => {
        switch (r) {
            case "owner":
                return "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30";
            case "teacher":
                return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
            case "student":
                return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
            default:
                return "text-muted-foreground bg-muted";
        }
    };

    const roleClass = getRoleColor(role);

    return (
        <div className="group flex flex-col bg-card border border-border rounded-xl hover:border-primary/30 transition-all overflow-hidden">
            <div className="p-4 flex items-start gap-3">
                <div className="p-2 rounded-full bg-muted text-muted-foreground">
                    <User size={20} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm truncate">{name}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${roleClass}`}>
                            {role}
                        </span>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Clerk ID</span>
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 text-xs font-mono text-foreground hover:text-primary transition-colors text-left"
                                title="Click to copy Clerk ID"
                            >
                                <span className="truncate">{clerkId}</span>
                                {copied ? (
                                    <Check size={10} className="text-green-500" />
                                ) : (
                                    <Copy size={10} className="opacity-0 group-hover:opacity-50" />
                                )}
                            </button>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Entity ID</span>
                            <span className="text-xs font-mono text-muted-foreground truncate" title={entityId}>
                                {entityId}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
