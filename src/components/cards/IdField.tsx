"use client";

import type { SerializedAbstractModel } from "@/backend/models";
import type { StudentType } from "@/drizzle/schema";
import { ENTITY_DATA } from "@/config/entities";

interface IdFieldProps {
    student: SerializedAbstractModel<StudentType>;
}

export default function IdField({ student }: IdFieldProps) {
    const studentConfig = ENTITY_DATA.find((entity) => entity.id === "Student");

    return (
        <div className="bg-card border-2 border-foreground/20 rounded-lg shadow-sm">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-sm flex items-center justify-center">{studentConfig && <studentConfig.icon className="w-6 h-6 text-muted-foreground" />}</div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground tracking-wider">STUDENT ID</h3>
                            <p className="text-xs text-muted-foreground">ADRENALINK</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">ID</p>
                        <p className="text-lg font-mono font-bold text-foreground">{student.schema.id.toString().padStart(6, "0")}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Name</p>
                        <p className="text-lg font-bold text-foreground">{student.schema.name}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Passport</p>
                        <p className="text-sm font-mono text-foreground">{student.schema.passport}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Country</p>
                        <p className="text-sm text-foreground">{student.schema.country}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Phone</p>
                        <p className="text-sm text-foreground">{student.schema.phone}</p>
                    </div>
                </div>

                <div className="border-t border-border pt-4">
                    <div>
                        <p className="text-xs text-muted-foreground">Member Since</p>
                        <p className="text-sm font-medium text-foreground">{new Date(student.schema.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
