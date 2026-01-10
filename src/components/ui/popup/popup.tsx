import { ReactNode } from "react";

interface PopupProps {
    children: ReactNode;
    className?: string;
}

/**
 * A container component styled like a modern, dark-themed popup or card.
 * Inspired by the GitLoop login page design.
 */
export const Popup = ({ children, className = "" }: PopupProps) => {
    return (
        <div
            className={`
                bg-background/95 border border-border/40 rounded-3xl shadow-2xl 
                w-full h-full flex flex-col backdrop-blur-xl
                ${className}
            `}
            style={{
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(var(--border), 0.1)",
            }}
        >
            {children}
        </div>
    );
};
