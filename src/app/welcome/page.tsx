import { WelcomeSchoolForm } from "@/src/components/forms/WelcomeSchoolForm";
import { R2ConnectivityCheck } from "@/src/components/R2ConnectivityCheck";

export default function SchoolFormsPage() {
    return (
        <div className="w-full min-h-screen flex items-center justify-center px-2 py-4 md:p-6">
            <div className="w-full max-w-5xl mx-auto">
                <R2ConnectivityCheck />
                <WelcomeSchoolForm />
            </div>
        </div>
    );
}
