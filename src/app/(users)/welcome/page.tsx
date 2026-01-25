import { WelcomeSchoolForm } from "@/src/components/forms/WelcomeSchoolForm";
import { getSchoolsUsernames } from "@/supabase/server/welcome";
import { getUserContext } from "@/src/providers/user-school-provider";

export default async function SchoolFormsPage() {
    const usernameResult = await getSchoolsUsernames();
    const existingUsernames = usernameResult.success ? usernameResult.data : [];
    
    // Get current Clerk user
    const user = await getUserContext();

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-16 md:py-32 pb-64 relative">
            <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center">
                <WelcomeSchoolForm 
                    existingUsernames={existingUsernames} 
                    user={user} 
                />
            </div>
        </div>
    );
}
