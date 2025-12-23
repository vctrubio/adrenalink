import { ReactNode } from "react";
import { headers } from "next/headers";
import { supabase, getRegisterTables, type RegisterTables } from "@/supabase/server";
import { RegisterProvider } from "./RegisterContext";
import RegisterLayoutWrapper from "./RegisterLayoutWrapper";

interface RegisterLayoutProps {
    children: ReactNode;
}

// Server action for client-side refresh
async function refreshRegisterData(schoolId: string, schoolName: string, schoolUsername: string): Promise<RegisterTables> {
    "use server";
    const result = await getRegisterTables(schoolId, schoolName, schoolUsername);
    if (!result.success) throw new Error(result.error);
    return result.data;
}

export default async function Layout({ children }: RegisterLayoutProps) {
    const headersList = await headers();
    const username = headersList.get("x-school-username");

    if (!username) {
        return (
            <div className="p-6">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
                    School context not found
                </div>
            </div>
        );
    }

    // Get school by username
    const { data: schoolData, error: schoolError } = await supabase
        .from("school")
        .select("id, name, username")
        .eq("username", username)
        .single();

    if (schoolError || !schoolData) {
        return (
            <div className="p-6">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
                    School not found
                </div>
            </div>
        );
    }

    // Fetch all register data
    const result = await getRegisterTables(schoolData.id, schoolData.name, schoolData.username);

    if (!result.success) {
        return (
            <div className="p-6">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
                    {result.error}
                </div>
            </div>
        );
    }

    // Create bound refresh action
    const boundRefresh = refreshRegisterData.bind(null, schoolData.id, schoolData.name, schoolData.username);

    return (
        <RegisterProvider initialData={result.data} refreshAction={boundRefresh}>
            <RegisterLayoutWrapper>
                {children}
            </RegisterLayoutWrapper>
        </RegisterProvider>
    );
}
