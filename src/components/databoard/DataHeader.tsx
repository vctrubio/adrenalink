import { ReactNode } from "react";

interface DataHeaderProps {
    icon: ReactNode;
    color: string;
    title: string;
    subtitle: string;
}

export function DataHeader({ icon, color, title, subtitle }: DataHeaderProps) {
    return (
        <div>
            <div className="flex items-center gap-6">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full" style={{ color }}>
                    {icon}
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-foreground">{title}</h3>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{subtitle}</div>
                </div>
            </div>
            <div className="h-1 w-full rounded-full my-4" style={{ backgroundColor: color }} />
        </div>
    );
}
