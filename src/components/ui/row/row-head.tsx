import { ReactNode } from "react";

interface RowHeadProps {
    avatar: ReactNode;
    name: string;
    status: string;
}

export const RowHead = ({ avatar, name, status }: RowHeadProps) => {
    return (
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
                {avatar}
            </div>
            <div>
                <div className="text-base font-semibold">{name}</div>
                <div className="text-xs text-muted-foreground">{status}</div>
            </div>
        </div>
    );
};
