"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
    isHovered = false,
    isLoading = false,
}: GoToAdranlinkProps) {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsNavigating(true);

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

    const showLoading = isLoading || isNavigating;
    const startAngle = isHovered ? 45 : 0;
    const endAngle = startAngle + 360;

    return (
        <motion.div
            className={`cursor-pointer inline-flex items-center justify-center ${className}`}
            animate={
                showLoading
                    ? {
                          rotate: [startAngle, endAngle],
                          scale: 0.8,
                      }
                    : {
                          rotate: isHovered ? 45 : 0,
                          scale: 1,
                      }
            }
            transition={
                showLoading
                    ? {
                          rotate: { repeat: Infinity, duration: 1, ease: "linear" },
                          scale: { duration: 0.2 },
                      }
                    : {
                          duration: 0.6,
                          ease: "easeInOut",
                      }
            }
            onClick={handleClick}
        >
            <div className="rotate-45">
                <AdranlinkIcon size={size} />
            </div>
        </motion.div>
    );
}
