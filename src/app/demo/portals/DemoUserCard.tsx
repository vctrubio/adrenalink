"use client";

import { useState } from "react";
import Link from "next/link";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import HelmetIcon from "@/public/appSvgs/HelmetIcon.jsx";
import AdminIcon from "@/public/appSvgs/AdminIcon.jsx";
import { LinkIcon } from "lucide-react";
import { LinkEntityToClerk } from "@/src/components/modals/LinkEntityToClerk";

interface DemoUserCardProps {
    user: any;
    type: "teacher" | "student" | "admin";
}

export function DemoUserCard({ user, type }: DemoUserCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isUnlinked = !user.clerk_id;
    const isInactive = type === "teacher" && !user.active;
    const isRental = type === "student" && user.rental;

    // Determine style
    let bgClass = "";
    let borderClass = "";
    let Icon = HelmetIcon;
    let displayName = "";
    let statusLabel = "";

    if (type === "admin") {
        Icon = AdminIcon;
        bgClass = "bg-purple-100 text-purple-700 dark:bg-purple-900/30";
        borderClass = "hover:border-purple-500/50";
        displayName = "Owner"; // Or use user.username if preferred, but usually 'Owner' is clearer here
        statusLabel = isUnlinked ? "Unlinked" : "Active";

        if (isUnlinked) {
            bgClass = "bg-purple-100/50 text-purple-700/70 dark:bg-purple-900/20";
            borderClass = "hover:border-purple-500/30";
        }
    } else if (type === "teacher") {
        Icon = HeadsetIcon;
        displayName = `@${user.username}`;
        statusLabel = isUnlinked ? "Unlinked" : isInactive ? "Inactive" : "Active";

        bgClass = "bg-green-100 text-green-700 dark:bg-green-900/30";
        borderClass = "hover:border-green-500/50";
        if (isUnlinked) {
            bgClass = "bg-blue-100 text-blue-700 dark:bg-blue-900/30";
            borderClass = "hover:border-blue-500/50";
        } else if (isInactive) {
            bgClass = "bg-muted text-muted-foreground";
            borderClass = "hover:border-border";
        }
    } else {
        // Student
        Icon = HelmetIcon;
        displayName = `${user.first_name} ${user.last_name}`;
        statusLabel = isUnlinked ? "Unlinked" : isRental ? "Rental" : "Active";

        bgClass = isRental ? "bg-red-100 text-red-700 dark:bg-red-900/30" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30";
        borderClass = isRental ? "hover:border-red-500/50" : "hover:border-yellow-500/50";
        if (isUnlinked) {
            bgClass = "bg-blue-100 text-blue-700 dark:bg-blue-900/30";
            borderClass = "hover:border-blue-500/50";
        }
    }

    // LinkEntity params
    const entityType = type === "admin" ? "school" : type;

    return (
        <>
            <div
                className={`group flex flex-col bg-card border border-border rounded-xl ${borderClass} transition-all overflow-hidden`}
            >
                <Link
                    href={`/${type === "admin" ? "home" : `${type}s/${user.id}`}`}
                    className="flex items-center justify-between p-4 hover:bg-muted/5 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${bgClass}`}>
                            <Icon size={20} rental={type === "student" && isRental && !isUnlinked} />
                        </div>
                        <div>
                            <div className={`font-bold text-sm ${type === "student" ? "group-hover:opacity-80" : "font-mono"}`}>
                                {displayName}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                {statusLabel}
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Footer */}
                <div className="px-4 py-2 bg-muted/20 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isUnlinked ? "bg-blue-500 animate-pulse" : "bg-green-500"}`} />
                        <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[120px]">
                            {user.clerk_id || "No Identity"}
                        </span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setIsModalOpen(true);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        title="Link Identity"
                    >
                        <LinkIcon size={14} />
                    </button>
                </div>
            </div>

            <LinkEntityToClerk
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                entityId={user.id}
                entityType={entityType}
                entityName={displayName}
                currentClerkId={user.clerk_id}
            />
        </>
    );
}
