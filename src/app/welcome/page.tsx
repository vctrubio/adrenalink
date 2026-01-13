import { WelcomeSchoolForm } from "@/src/components/forms/WelcomeSchoolForm";
import { getSchoolsUsernames } from "@/supabase/server/welcome";

export default async function SchoolFormsPage() {
    const usernameResult = await getSchoolsUsernames();
    const existingUsernames = usernameResult.success ? usernameResult.data : [];

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-16 md:py-32 pb-64 relative">
            <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center">
                <WelcomeSchoolForm existingUsernames={existingUsernames} />
            </div>
        </div>
    );
}
