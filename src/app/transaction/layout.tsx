import { type ReactNode, cache } from "react";
import { SchoolCredentialsProvider } from "@/src/providers/school-credentials-provider";
import { getSchoolCredentials as getSchoolCredentialsFromSupabase } from "@/supabase/server/admin";

interface TransactionLayoutProps {
    children: ReactNode;
}

// Use React's cache() to memoize across the request
const getSchoolCredentials = cache(getSchoolCredentialsFromSupabase);

export default async function TransactionLayout({ children }: TransactionLayoutProps) {
    const credentials = await getSchoolCredentials();

    return <SchoolCredentialsProvider credentials={credentials}>{children}</SchoolCredentialsProvider>;
}
