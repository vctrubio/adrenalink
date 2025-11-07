import { WelcomeStudentForm } from "@/src/components/forms/WelcomeStudentForm";

export default function CreateStudentPage() {
    return (
        <div className="p-8 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Create Student</h1>
                <p className="text-muted-foreground mt-2">Add a new student to the system</p>
            </div>
            <WelcomeStudentForm />
        </div>
    );
}
