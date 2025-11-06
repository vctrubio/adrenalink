import { type ReactNode } from "react";
import { AdminSideBar } from "@/src/components/navigations/AdminSideBar";
import { getSchoolName } from "@/types/headers";

type AdminLayoutProps = {
    children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const schoolName = await getSchoolName();

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <AdminSideBar schoolName={schoolName} />
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
