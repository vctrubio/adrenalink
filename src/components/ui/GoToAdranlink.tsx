"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

interface GoToAdranlinkProps {
    href: string;
    onNavigate?: () => void;
    className?: string;
    size?: number;
    isHovered?: boolean;
}

export function GoToAdranlink({ href, onNavigate, className = "", size = 20, isHovered = false }: GoToAdranlinkProps) {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onNavigate) {
            onNavigate();
        }
        router.push(href);
    };

    return (
        <motion.div
            className={`text-white/40 hover:text-white cursor-pointer p-1 inline-flex items-center justify-center ${className}`}
            animate={{ 
                rotate: isHovered ? 45 : 0, 
                color: isHovered ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.4)" 
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            onClick={handleClick}
        >
            <div className="rotate-45">
                <AdranlinkIcon size={size} />
            </div>
        </motion.div>
    );
}