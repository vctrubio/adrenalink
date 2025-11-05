import { ReactNode } from "react";

interface CardHeaderProps {
    name: string;
    status: string;
    avatar: ReactNode;
    accentColor?: string;
}

export const CardHeader = ({ name, status, avatar, accentColor = "#3b82f6" }: CardHeaderProps) => {
    return (
        <>
            <div className="flex items-center gap-6">
                {avatar}
                <div>
                    <h3 className="text-3xl font-bold">{name}</h3>
                    <div className="text-xs uppercase tracking-wider text-white/60 mb-1">{status}</div>
                </div>
            </div>
            <div className="h-1 w-full rounded-full my-6" style={{ backgroundColor: accentColor }} />
        </>
    );
};
