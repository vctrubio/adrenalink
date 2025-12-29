"use client";

import { Eye, EyeOff } from "lucide-react";

interface ExpandCollapseButtonsProps {
    onExpandAll: () => void;
    onCollapseAll: () => void;
}

export default function ExpandCollapseButtons({ onExpandAll, onCollapseAll }: ExpandCollapseButtonsProps) {
    return (
        <>
            <button
                onClick={onExpandAll}
                className="p-2 text-foreground bg-muted/50 hover:bg-muted rounded-md transition-colors flex items-center"
                title="Expand All"
            >
                <Eye size={16} />
            </button>
            <button
                onClick={onCollapseAll}
                className="p-2 text-foreground bg-muted/50 hover:bg-muted rounded-md transition-colors flex items-center"
                title="Collapse All"
            >
                <EyeOff size={16} />
            </button>
        </>
    );
}
