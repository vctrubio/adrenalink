import Link from "next/link";
import type { EntityConfig } from "@/config/entities";

interface HoverToEntityProps {
    entity: EntityConfig;
    id: string;
    children: React.ReactNode;
    className?: string;
}

export const HoverToEntity = ({ entity, id, children, className = "" }: HoverToEntityProps) => {
    return (
        <Link
            href={`${entity.link}/${id}`}
            className={`transition-colors rounded px-2 py-1 -mx-2 -my-1 ${className}`}
            style={{
                color: "inherit",
                textDecoration: "none",
            }}
            onClick={(e) => {
                e.stopPropagation();
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${entity.color}20`;
                e.currentTarget.style.textDecoration = "none";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.textDecoration = "none";
            }}
        >
            {children}
        </Link>
    );
};
