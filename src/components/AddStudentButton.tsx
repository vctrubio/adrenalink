"use client";

import { useRouter } from "next/navigation";

interface AddStudentButtonProps {
    schoolUsername: string;
}

export default function AddStudentButton({ schoolUsername }: AddStudentButtonProps) {
    const router = useRouter();

    const handleAddStudent = () => {
        router.push(`/students/form?schoolId=${schoolUsername}`);
    };

    return (
        <div className="mt-6">
            <button
                onClick={handleAddStudent}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors"
            >
                Add Student
            </button>
        </div>
    );
}