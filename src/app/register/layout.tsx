import { ReactNode } from "react";
import { getRegisterData } from "@/actions/register-action";
import { RegisterProvider } from "./RegisterContext";

interface RegisterLayoutProps {
    children: ReactNode;
}

export default async function Layout({ children }: RegisterLayoutProps) {
    const result = await getRegisterData();

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
        <RegisterProvider data={result.data}>
            {children}
        </RegisterProvider>
    );
}
