import { ReactNode } from "react";
import { getRegisterTables, type RegisterTables } from "@/supabase/server/register";
import { getSchoolCredentials } from "@/supabase/server/admin";
import { RegisterProvider } from "./RegisterContext";
import { RegisterFormLayout } from "@/src/components/layouts/RegisterFormLayout";
import RegisterController from "./RegisterController";

export const dynamic = "force-dynamic";

interface RegisterLayoutProps {
    children: ReactNode;
}

async function refreshRegisterData(): Promise<RegisterTables> {
    "use server";
    const result = await getRegisterTables();
    if (!result.success) throw new Error(result.error);
    return result.data;
}

export default async function Layout({ children }: RegisterLayoutProps) {
    // Fetch credentials and register tables
    const [credentialsResult, registerResult] = await Promise.all([getSchoolCredentials(), getRegisterTables()]);

    if (!credentialsResult) {
        return (
            <div className="p-6">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
                    School credentials not found
                </div>
            </div>
        );
    }

    if (!registerResult.success) {
        return (
            <div className="p-6">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
                    {registerResult.error}
                </div>
            </div>
        );
    }

    return (
        <RegisterProvider initialData={registerResult.data} refreshAction={refreshRegisterData} school={credentialsResult}>
            <RegisterFormLayout controller={<RegisterController />}>
                {children}
            </RegisterFormLayout>
        </RegisterProvider>
    );
}
