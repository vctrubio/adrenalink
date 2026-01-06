import { type ReactNode, cache } from "react";
import { SchoolTeachersProvider } from "@/src/providers/school-teachers-provider";
import { SchoolCredentialsProvider } from "@/src/providers/school-credentials-provider";
import FacebookNav from "@/src/components/navigations/FacebookNav";
import { getSchoolCredentials as getSchoolCredentialsFromSupabase } from "@/supabase/server/admin";

interface AdminLayoutProps {
    children: ReactNode;
}

// Use React's cache() to memoize across the request
const getSchoolCredentials = cache(getSchoolCredentialsFromSupabase);

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const credentials = await getSchoolCredentials();

    return (
        <SchoolCredentialsProvider credentials={credentials}>
            <SchoolTeachersProvider>
                <div className="flex flex-col h-screen bg-background">
                    <FacebookNav />
                    <div className="">
                        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
                    </div>
                </div>
            </SchoolTeachersProvider>
        </SchoolCredentialsProvider>
    );
}

