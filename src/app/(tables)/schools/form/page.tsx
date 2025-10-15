import { WelcomeSchoolForm } from "@/src/components/forms/WelcomeSchoolForm";

export default function SchoolFormsPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">School Registration</h1>
                <p className="text-muted-foreground">Add a new school to the system</p>
            </div>
            <WelcomeSchoolForm />
        </div>
    );
}