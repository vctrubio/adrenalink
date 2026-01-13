"use client";

import Image from "next/image";
import adrLogo from "@/public/ADR.webp";

interface UsernameBadgeProps {
    username: string;
    className?: string;
    variant?: "light" | "theme";
}

/**
 * Reusable username badge component
 */
export function UsernameBadge({ username, className = "", variant = "light" }: UsernameBadgeProps) {
    const isTheme = variant === "theme";
    
    return (
        <div className={`absolute top-0 right-0 z-20 ${className}`}>
            <div className={`
                ${isTheme ? "bg-card border-border/50" : "bg-white border-zinc-200"}
                px-6 py-2.5 md:px-8 md:py-3 rounded-bl-[2.5rem] border-b border-l flex items-center gap-3 shadow-sm
            `}>
                <Image 
                    src={adrLogo} 
                    alt="" 
                    width={16} 
                    height={16} 
                    className={isTheme ? "dark:invert" : "opacity-60"} 
                />
                <span className={`
                    text-sm md:text-md font-black tracking-[0.4em] uppercase
                    ${isTheme ? "text-primary" : "text-zinc-900"}
                `}>
                    {username}
                </span>
            </div>
        </div>
    );
}
