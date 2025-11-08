import Link from "next/link";
import { ReactNode } from "react";
import { StatusLabel } from "@/src/components/ui/label/status-label";

interface RowHeadProps {
    avatar: ReactNode;
    name: string;
    status: string;
    id?: string;
    entity?: string;
    statusOptions?: string[];
    onStatusChange?: (newStatus: string) => void;
}

export const RowHead = ({ avatar, name, status, id, entity, statusOptions = [], onStatusChange }: RowHeadProps) => {
    const href = id && entity ? `/${entity}/${id}` : undefined;

    return (
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
                {avatar}
            </div>
            <div>
                {href ? (
                    <Link href={href} className="text-base font-semibold hover:underline text-foreground" onClick={(e) => e.stopPropagation()}>
                        {name}
                    </Link>
                ) : (
                    <div className="text-base font-semibold">{name}</div>
                )}
                <div className="mt-1">
                    <StatusLabel status={status} options={statusOptions} onStatusChange={onStatusChange} />
                </div>
            </div>
        </div>
    );
};
