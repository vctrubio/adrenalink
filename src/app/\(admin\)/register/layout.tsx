import { ReactNode } from "react";
import { getRegisterTables, type RegisterTables } from "@/supabase/server/register";
import { RegisterProvider } from "./RegisterContext";
import RegisterLayoutWrapper from "./RegisterLayoutWrapper";

interface RegisterLayoutProps {
    children: ReactNode;
}

// Server action for client-side refresh
async function refreshRegisterData(): Promise<RegisterTables> {
    "use server";
    const result = await getRegisterTables();
    if (!result.success) throw new Error(result.error);
    return result.data;
}

export default async function Layout({ children }: RegisterLayoutProps) {
    // Fetch all register data
    const result = await getRegisterTables();

    if (!result.success) {
        return (
            <div className="p-6">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
                    {result.error}
                </div>
            </div>
        );
    }

    return (
        <RegisterProvider initialData={result.data} refreshAction={refreshRegisterData}>
            <RegisterLayoutWrapper>
                {children}
            </RegisterLayoutWrapper>
        </RegisterProvider>
    );
}
