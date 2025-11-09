import { ReactNode } from "react";

interface CardHeaderProps {
    name: string;
    status: string;
    avatar: ReactNode;
    accentColor?: string;
    desc?: string;
}

export const CardHeader = ({ name, status, avatar, accentColor = "#3b82f6", desc }: CardHeaderProps) => {
    return (
        <>
            <div className="flex items-center gap-6">
                {avatar}
                <div>
                    <h3 className="text-3xl font-bold text-foreground">{name}</h3>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{status}</div>
                    {desc && (
                        <div className="mt-1 text-muted-foreground">
                            <p className="text-base leading-relaxed">{desc}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="h-1 w-full rounded-full my-4" style={{ backgroundColor: accentColor }} />
        </>
    );
};
