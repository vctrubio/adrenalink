"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStudentsBySchoolId } from "@/actions/schools-action";
import { getStudentName } from "@/getters/students-getter";
import LinkSchoolToStudentModal from "./modals/LinkSchoolToStudentModal";

interface SchoolStudentsListProps {
    schoolId: string;
}

export default function SchoolStudentsList({ schoolId }: SchoolStudentsListProps) {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchStudents();
    }, [schoolId]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const result = await getStudentsBySchoolId(schoolId);
            if (result.success) {
                setStudents(result.data);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleModalSuccess = () => {
        fetchStudents();
    };

    if (loading) {
        return (
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Students</h2>
                <p className="text-muted-foreground">Loading students...</p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-foreground">Students ({students.length})</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    Link to Student
                </button>
            </div>

            {students.length === 0 ? (
                <p className="text-muted-foreground">No students linked to this school yet.</p>
            ) : (
                <div className="space-y-4">
                    {students.map((student) => (
                        <div 
                            key={student.id}
                            onClick={() => router.push(`/students/${student.id}`)}
                            className="bg-card border border-border rounded-lg p-4 hover:bg-accent/30 transition-colors cursor-pointer"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-foreground">{getStudentName(student)}</h3>
                                    <p className="text-sm text-muted-foreground">Passport: {student.passport}</p>
                                    <p className="text-sm text-muted-foreground">Country: {student.country}</p>
                                    <p className="text-sm text-muted-foreground">Phone: {student.phone}</p>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    View Details →
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <LinkSchoolToStudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                schoolId={schoolId}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}