"use client";

import { useRouter } from "next/navigation";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

interface GoToAdranlinkProps {
    href?: string;
    onNavigate?: () => void;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    size?: number;
    isHovered?: boolean;
    isLoading?: boolean;
}

export function GoToAdranlink({
    href,
    onNavigate,
    onClick,
    className = "",
    size = 20,
}: GoToAdranlinkProps) {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (onClick) {
            onClick(e);
            return;
        }

        if (onNavigate) {
            onNavigate();
        }

        if (href) {
            router.push(href);
        }
    };

    return (
        <div
            className={`cursor-pointer inline-flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${className}`}
            onClick={handleClick}
        >
            <div className="rotate-45">
                <AdranlinkIcon size={size} />
            </div>
        </div>
    );
}