"use client";

import { type ReactNode } from "react";

type SectionContainerProps = {
    title?: string;
    icon?: React.ComponentType<{ className?: string; size?: number }>;
    children: ReactNode;
    variant?: "card" | "table" | "flat";
    headerAction?: ReactNode;
    iconColor?: string;
    onHeaderClick?: () => void;
};

export function SectionContainer({ title, icon: Icon, children, variant = "flat", headerAction, iconColor, onHeaderClick }: SectionContainerProps) {
    const getVariantClasses = () => {
        if (variant === "card") {
            return {
                container: "rounded-xl border border-border overflow-hidden bg-muted",
                header: "bg-muted/50 border-b border-border px-4 py-3",
                content: "p-4",
            };
        }
        if (variant === "table") {
            return {
                container: "rounded-lg border border-border overflow-hidden bg-muted",
                header: "bg-muted/30 border-b border-border px-4 py-2.5",
                content: "p-0",
            };
        }
        return {
            container: "bg-muted",
            header: "bg-muted border-b border-background px-3 py-2",
            content: "py-2",
        };
    };

    const classes = getVariantClasses();

    return (
        <div className={classes.container}>
            {title && (
                <div className={`flex items-center justify-between ${classes.header} ${onHeaderClick ? "cursor-pointer" : ""}`} onClick={onHeaderClick}>
                    <div className="flex items-center gap-2">
                        {Icon && <Icon size={18} className={iconColor || "text-foreground"} />}
                        <h3 className="text-sm font-medium text-foreground">{title}</h3>
                    </div>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}
            <div className={classes.content}>{children}</div>
        </div>
    );
}
