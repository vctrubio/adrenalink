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
                bg-[#1e2433] border border-white/10 rounded-2xl shadow-2xl 
                w-full h-full flex flex-col
                ${className}
            `}
            style={{
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)"
            }}
        >
            {children}
        </div>
    );
};
