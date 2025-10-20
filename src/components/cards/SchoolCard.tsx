"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

import type { SchoolType } from "@/drizzle/schema";

interface SchoolCardProps {
    school: {
        tableName: string;
        schema: SchoolType;
        relations?: Record<string, any>;
        lambda?: Record<string, any>;
    };
}

export default function SchoolCard({ school }: SchoolCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();

    const studentCount = school.lambda?.studentCount || 0;

    const handleCardClick = () => {
        router.push(`/schools/${school.schema.username}`);
    };

    const handleSubdomainClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // For development testing - use lvh.me which automatically resolves to localhost
        const subdomainUrl = `http://${school.schema.username}.lvh.me:3000`;
        window.open(subdomainUrl, "_blank");
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6 transition-colors hover:bg-accent/30 cursor-pointer" onClick={handleCardClick}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{school.schema.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">@{school.schema.username}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{school.schema.country}</span>
                        <span>{school.schema.phone}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                            {studentCount} {studentCount === 1 ? "Student" : "Students"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{school.schema.username}.lvh.me:3000</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={handleSubdomainClick} className="p-2 hover:bg-blue-500/20 border border-blue-500/30 rounded-md transition-colors group" aria-label="Test subdomain portal" title={`Open ${school.schema.username}.lvh.me:3000`}>
                            <ExternalLink className="h-4 w-4 text-blue-500 group-hover:text-blue-400" />
                        </button>

                        {studentCount > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                className="p-2 hover:bg-accent rounded-md transition-colors"
                                aria-label={isExpanded ? "Hide students" : "Show students"}
                            >
                                {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isExpanded && studentCount > 0 && (
                <div className="mt-4 pt-4 border-t border-muted/30">
                    <h4 className="text-sm font-medium text-foreground mb-3">Students:</h4>
                    <div className="space-y-2">
                        {school.relations?.schoolStudents?.map((schoolStudent: any) => (
                            <Link key={schoolStudent.student.id} href={`/students/${schoolStudent.student.id}`} className="block p-3 bg-muted/50 rounded-md hover:bg-accent/50 transition-colors" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">{schoolStudent.student.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {schoolStudent.student.passport} • {schoolStudent.student.country}
                                        </p>
                                    </div>
                                    <div className="text-xs text-muted-foreground">View Details →</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
