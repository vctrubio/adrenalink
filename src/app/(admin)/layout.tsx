import { type ReactNode, cache } from "react";
import { redirect } from "next/navigation";
import { SchoolTeachersProvider } from "@/src/providers/school-teachers-provider";
import { SchoolCredentialsProvider } from "@/src/providers/school-credentials-provider";
import FacebookNav from "@/src/components/navigations/facebook/FacebookNav";
import { getSchoolCredentials as getSchoolCredentialsFromSupabase } from "@/supabase/server/admin";
import { getSchoolTeacherProvider } from "@/supabase/server/teachers";

export const dynamic = "force-dynamic";

interface AdminLayoutProps {
    children: ReactNode;
}

// Use React's cache() to memoize across the request
const getSchoolCredentials = cache(getSchoolCredentialsFromSupabase);
const getTeachers = cache(getSchoolTeacherProvider);

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const [credentials, teachersResult] = await Promise.all([getSchoolCredentials(), getTeachers()]);

    // if (!credentials) {
    //     redirect("/no-credentials");
    // }

    const initialTeachersData =
        teachersResult.success && teachersResult.data
            ? {
                allTeachers: teachersResult.data,
                teachers: teachersResult.data.filter((t) => t.schema.active),
            }
            : null;

    return (
        <SchoolCredentialsProvider credentials={credentials}>
            <SchoolTeachersProvider initialData={initialTeachersData}>
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
