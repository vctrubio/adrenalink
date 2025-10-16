"use client";

import { useState } from "react";
import type { SchoolType } from "@/drizzle/schema";
import type { SerializedAbstractModel } from "@/backend/models";
import LinkSchoolToStudentModal from "@/src/components/modals/LinkSchoolToStudentModal";

interface SchoolClientPageProps {
    school: SerializedAbstractModel<SchoolType>;
}

export default function SchoolClientPage({ school }: SchoolClientPageProps) {
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

    const handleLinkSuccess = () => {
        window.location.reload();
    };

    return (
        <div className="space-y-8">
            <div className="bg-card p-6 rounded-lg border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-4">School Information</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <p className="text-foreground">{school.schema.name}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Username</label>
                        <p className="text-foreground">{school.schema.username}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Country</label>
                        <p className="text-foreground">{school.schema.country}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-foreground">{school.schema.phone}</p>
                    </div>
                </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Students</h2>
                    <button
                        onClick={() => setIsLinkModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                        Link Student
                    </button>
                </div>
                
                {school.relations?.schoolStudents && school.relations.schoolStudents.length > 0 ? (
                    <div className="space-y-4">
                        {school.relations.schoolStudents.map((relationship: any) => (
                            <div key={relationship.id} className="border border-border rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Student</label>
                                        <p className="text-foreground">{relationship.student?.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Passport</label>
                                        <p className="text-foreground">{relationship.student?.passport}</p>
                                    </div>
                                </div>
                                {relationship.description && (
                                    <div className="mt-2">
                                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                                        <p className="text-foreground">{relationship.description}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No students linked to this school.</p>
                )}
            </div>

            <LinkSchoolToStudentModal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                schoolId={school.schema.id}
                onSuccess={handleLinkSuccess}
            />
        </div>
    );
}