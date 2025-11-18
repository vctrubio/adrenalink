import { ReactNode } from "react";

interface LinkColumnHeaderProps {
    name: string;
    status: string;
    avatar: ReactNode;
    accentColor?: string;
}

export const LinkColumnHeader = ({ name, status, avatar, accentColor = "#3b82f6" }: LinkColumnHeaderProps) => {
    return (
        <div className="flex items-center gap-6 border-l-4 pl-4" style={{ borderLeftColor: accentColor }}>
            {avatar}
            <div>
                <h3 className="text-3xl font-bold text-foreground">{name}</h3>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{status}</div>
            </div>
        </div>
    );
};
