import Link from "next/link";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import { BADGE_BG_OPACITY_MEDIUM } from "@/types/status";

interface StudentUsernameBadgeProps {
    id: string;
    firstName: string;
    lastName: string;
    color: string;
}

export function StudentUsernameBadge({ id, firstName, lastName, color }: StudentUsernameBadgeProps) {
    return (
        <Link
            href={`/students/${id}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-foreground transition-all hover:opacity-80"
            style={{ backgroundColor: `${color}${BADGE_BG_OPACITY_MEDIUM}` }}
            onClick={(e) => e.stopPropagation()}
            prefetch={false}
        >
            <div style={{ color }}>
                <HelmetIcon size={14} />
            </div>
            <span>
                {firstName} {lastName}
            </span>
        </Link>
    );
}
