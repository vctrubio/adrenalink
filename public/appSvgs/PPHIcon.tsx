import React from "react";

export default function PPHIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {/* Card Body */}
            <rect x="2" y="5" width="20" height="14" rx="2" />
            {/* The Chip */}
            <rect x="5" y="9" width="4" height="3" rx="1" fill="currentColor" fillOpacity="0.2" stroke="none" />
            {/* Decorative lines representing card info */}
            <path d="M5 15h2" opacity="0.5" />
            <path d="M10 15h5" opacity="0.5" />
        </svg>
    );
}