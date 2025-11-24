import { type ReactNode } from "react";
import { AdminSideBar } from "@/src/components/navigations/AdminSideBar";
import { getSchoolName } from "@/types/headers";
import { SchoolTeachersProvider } from "@/src/providers/school-teachers-provider";

type AdminLayoutProps = {
    children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const schoolName = await getSchoolName();

    return (
        <SchoolTeachersProvider>
            <div className="flex h-screen overflow-hidden bg-background">
                <AdminSideBar schoolName={schoolName} />
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </SchoolTeachersProvider>
    );
}
