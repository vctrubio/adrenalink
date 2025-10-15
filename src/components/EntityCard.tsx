"use client";

import { useRouter } from "next/navigation";

interface EntityCardProps {
    id: string;
    title: string;
    fields?: { label: string; value: string }[];
    entityType: "students" | "schools";
}

export default function EntityCard({ id, title, fields, entityType }: EntityCardProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/${entityType}/${id}`);
    };

    return (
        <div onClick={handleClick} className="bg-card border border-border rounded-lg p-4 hover:bg-accent/30 transition-colors cursor-pointer">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-medium text-foreground">{title}</h3>
                    {fields &&
                        fields.map((field, index) => (
                            <p key={index} className="text-sm text-muted-foreground">
                                {field.label}: {field.value}
                            </p>
                        ))}
                </div>
                <div className="text-xs text-muted-foreground">ID: {id}</div>
            </div>
        </div>
    );
}
