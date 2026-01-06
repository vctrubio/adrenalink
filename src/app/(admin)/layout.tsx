import { type ReactNode, cache } from "react";
import { headers } from "next/headers";
import { SchoolTeachersProvider } from "@/src/providers/school-teachers-provider";
import { SchoolCredentialsProvider } from "@/src/providers/school-credentials-provider";
import FacebookNav from "@/src/components/navigations/FacebookNav";
import type { SchoolCredentials } from "@/types/credentials";
import { getSchoolCredentials as getSchoolCredentialsFromSupabase } from "@/supabase/server/admin";

interface AdminLayoutProps {
    children: ReactNode;
}

async function getSchoolCredentialsImpl(): Promise<SchoolCredentials | null> {
    try {
        const headersList = await headers();
        const schoolUsername = headersList.get("x-school-username");

        if (!schoolUsername) {
            console.warn("⚠️ No x-school-username header found");
            return null;
        }

        const credentials = await getSchoolCredentialsFromSupabase(schoolUsername);
        return credentials as SchoolCredentials | null;
    } catch (error) {
        console.error("❌ [LAYOUT] Error fetching school credentials:", error);
        return null;
    }
}

// Use React's cache() to memoize across the request
const getSchoolCredentials = cache(getSchoolCredentialsImpl);

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
