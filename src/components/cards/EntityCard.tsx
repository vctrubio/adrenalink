"use client";

import { useRouter } from "next/navigation";

interface EntityCardProps {
    id: string;
    title: string;
    fields?: { label: string; value: string }[];
    entityType: "students" | "schools";
    count?: number;
    username?: string;
}

export default function EntityCard({ id, title, fields, entityType, count, username }: EntityCardProps) {
    const router = useRouter();

    const handleClick = () => {
        if (entityType === "schools" && username) {
            router.push(`/${entityType}/${username}`);
        } else {
            router.push(`/${entityType}/${id}`);
        }
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
                <div className="flex flex-col items-end space-y-1">
                    {count !== undefined && (
                        <div className="text-sm font-medium text-foreground">
                            {count} {entityType === "students" ? "Schools" : "Students"}
                        </div>
                    )}
                    <div className="text-xs text-muted-foreground">ID: {id}</div>
                </div>
            </div>
        </div>
    );
}
