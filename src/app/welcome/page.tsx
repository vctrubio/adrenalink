import { WelcomeSchoolForm } from "@/src/components/forms/WelcomeSchoolForm";
import { ChangeTheWindFooter } from "@/src/components/ui/ChangeTheWindFooter";

export default function SchoolFormsPage() {
    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-16 md:py-32 pb-64 relative">
            <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center">
                <WelcomeSchoolForm />
            </div>
            <ChangeTheWindFooter
                showFooter={true}
                minimal={true}
            />
        </div>
    );
}
