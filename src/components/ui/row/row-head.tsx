import { ReactNode } from "react";

interface RowHeadProps {
    avatar: ReactNode;
    name: string | ReactNode;
    status: string;
}

export const RowHead = ({ avatar, name, status }: RowHeadProps) => {
    return (
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0">{avatar}</div>
            <div>
                <div className="text-base font-semibold text-foreground">{name}</div>
                <div className="bg-muted px-3 text-sm rounded-2xl text-center">active</div>
            </div>
        </div>
    );
};
