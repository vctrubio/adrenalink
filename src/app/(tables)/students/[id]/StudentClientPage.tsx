"use client";

import { useState } from "react";
import type { StudentType } from "@/drizzle/schema";
import type { SerializedAbstractModel } from "@/backend/models";
import LinkStudentToSchoolModal from "@/src/components/modals/LinkStudentToSchoolModal";

interface StudentClientPageProps {
    student: SerializedAbstractModel<StudentType>;
}

export default function StudentClientPage({ student }: StudentClientPageProps) {
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

    const handleLinkSuccess = () => {
        window.location.reload();
    };

    return (
        <div className="space-y-8">
            <div className="bg-card p-6 rounded-lg border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-4">Student Information</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <p className="text-foreground">{student.schema.name}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Passport</label>
                        <p className="text-foreground">{student.schema.passport}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Country</label>
                        <p className="text-foreground">{student.schema.country}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-foreground">{student.schema.phone}</p>
                    </div>
                </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Schools</h2>
                    <button onClick={() => setIsLinkModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        Link to School
                    </button>
                </div>

                {student.relations?.schoolStudents && student.relations.schoolStudents.length > 0 ? (
                    <div className="space-y-4">
                        {student.relations.schoolStudents.map((relationship: any) => (
                            <div key={relationship.id} className="border border-border rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">School</label>
                                        <p className="text-foreground">{relationship.school?.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Username</label>
                                        <p className="text-foreground">{relationship.school?.username}</p>
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
                    <p className="text-muted-foreground">No schools linked to this student.</p>
                )}
            </div>

            <LinkStudentToSchoolModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} studentId={student.schema.id} onSuccess={handleLinkSuccess} />
        </div>
    );
}
