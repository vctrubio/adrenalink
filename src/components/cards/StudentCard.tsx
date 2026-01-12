"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

import type { StudentModel } from "@/backend/models";
import { getStudentSchoolCount } from "@/getters/students-getter";

interface StudentCardProps {
    student: StudentModel;
}

export default function StudentCard({ student }: StudentCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();

    const schoolCount = getStudentSchoolCount(student);

    const handleCardClick = () => {
        router.push(`/students/${student.schema.id}`);
    };

    return (
        <div
            className="bg-card border border-border rounded-lg p-6 transition-colors hover:bg-accent/30 cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{student.schema.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{student.schema.passport}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{student.schema.country}</span>
                        <span>{student.schema.phone}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                            {schoolCount} {schoolCount === 1 ? "School" : "Schools"}
                        </p>
                    </div>

                    {schoolCount > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="p-2 hover:bg-accent rounded-md transition-colors"
                            aria-label={isExpanded ? "Hide schools" : "Show schools"}
                        >
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && schoolCount > 0 && (
                <div className="mt-4 pt-4 border-t border-muted/30">
                    <h4 className="text-sm font-medium text-foreground mb-3">Schools:</h4>
                    <div className="space-y-2">
                        {student.relations?.schoolStudents?.map((schoolRelation: any) => (
                            <Link
                                key={schoolRelation.school.id}
                                href={"/discover"}
                                className="block p-3 bg-muted/50 rounded-md hover:bg-accent/50 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">{schoolRelation.school.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            @{schoolRelation.school.username} • {schoolRelation.school.country}
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
