import { type ReactNode, cache } from "react";
import { SchoolCredentialsProvider } from "@/src/providers/school-credentials-provider";
import { getSchoolCredentials as getSchoolCredentialsFromSupabase } from "@/supabase/server/admin";

interface ExampleLayoutProps {
    children: ReactNode;
}

// Use React's cache() to memoize across the request
const getSchoolCredentials = cache(getSchoolCredentialsFromSupabase);

export default async function ExampleLayout({ children }: ExampleLayoutProps) {
    const credentials = await getSchoolCredentials();

    return (
        <SchoolCredentialsProvider credentials={credentials}>
            {children}
        </SchoolCredentialsProvider>
    );
}
