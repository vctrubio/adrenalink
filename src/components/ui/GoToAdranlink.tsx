"use client";

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
}

export function GoToAdranlink({ 
    href, 
    onNavigate, 
    onClick,
    className = "", 
    size = 20, 
    isHovered = false 
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
        <motion.div
            className={`cursor-pointer inline-flex items-center justify-center ${className}`}
            animate={{ 
                rotate: isHovered ? 45 : 0, 
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
