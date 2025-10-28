"use client";

type PropertyDetailProps = {
    label: string;
    description: string;
    note?: string;
};

export function PropertyDetail({ label, description, note }: PropertyDetailProps) {
    return (
        <div className="mb-3 last:mb-0">
            <div className="flex items-start gap-2">
                <span className="text-primary font-medium text-sm">→</span>
                <div className="flex-1">
                    <h4 className="font-medium text-foreground text-sm mb-1">{label}</h4>
                    <p className="text-xs text-muted-foreground">{description}</p>
                    {note && <p className="text-xs text-muted-foreground/70 italic mt-1">{note}</p>}
                </div>
            </div>
        </div>
    );
}
