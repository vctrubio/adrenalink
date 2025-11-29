"use client";

import AdminIcon from "@/public/appSvgs/AdminIcon";
import { X } from "lucide-react";

interface FacebookSearchHeaderProps {
    onClose: () => void;
}

export function FacebookSearchHeader({ onClose }: FacebookSearchHeaderProps) {
    return (
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/80 backdrop-blur-md rounded-t-xl">
            <div className="flex items-center gap-2">
                <AdminIcon size={32} className="text-primary" />
                <h2 className="text-2xl font-bold tracking-tight text-foreground drop-shadow-sm">
                    Adrenalink Search
                </h2>
            </div>
            <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}
