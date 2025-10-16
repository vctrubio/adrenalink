"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSchoolsByStudentId } from "@/actions/students-action";
import { getSchoolName } from "@/getters/schools-getter";
import LinkStudentToSchoolModal from "./modals/LinkStudentToSchoolModal";

interface StudentSchoolsListProps {
    studentId: string;
}

export default function StudentSchoolsList({ studentId }: StudentSchoolsListProps) {
    const [schools, setSchools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchSchools();
    }, [studentId]);

    const fetchSchools = async () => {
        setLoading(true);
        try {
            const result = await getSchoolsByStudentId(studentId);
            if (result.success) {
                setSchools(result.data);
            }
        } catch (error) {
            console.error("Error fetching schools:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleModalSuccess = () => {
        fetchSchools();
    };

    if (loading) {
        return (
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">Schools</h2>
                <p className="text-muted-foreground">Loading schools...</p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-foreground">Schools ({schools.length})</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    Link to School
                </button>
            </div>

            {schools.length === 0 ? (
                <p className="text-muted-foreground">This student is not linked to any schools yet.</p>
            ) : (
                <div className="space-y-4">
                    {schools.map((school) => (
                        <div 
                            key={school.id}
                            onClick={() => router.push(`/schools/${school.username}`)}
                            className="bg-card border border-border rounded-lg p-4 hover:bg-accent/30 transition-colors cursor-pointer"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-foreground">{getSchoolName(school)}</h3>
                                    <p className="text-sm text-muted-foreground">@{school.username}</p>
                                    <p className="text-sm text-muted-foreground">Country: {school.country}</p>
                                    <p className="text-sm text-muted-foreground">Phone: {school.phone}</p>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    View Details →
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <LinkStudentToSchoolModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                studentId={studentId}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}