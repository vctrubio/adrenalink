import { type ReactNode } from "react";
import { AdminSideBar } from "@/src/components/navigations/AdminSideBar";
import { getSchoolName } from "@/types/headers";
import { SchoolTeachersProvider } from "@/src/providers/school-teachers-provider";
import FacebookNav from "@/src/components/navigations/FacebookNav";
import { SearchProvider } from "@/src/providers/search-provider";
import FacebookSearch from "@/src/components/modals/FacebookSearch";

type AdminLayoutProps = {
    children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const schoolName = await getSchoolName();

    return (
        <SchoolTeachersProvider>
            <SearchProvider>
                <div className="flex flex-col h-screen bg-background">
                    <FacebookNav />
                    <div className="flex flex-1 overflow-hidden">
                        <AdminSideBar schoolName={schoolName} />
                        <main className="flex-1 overflow-y-auto p-8">
                            {children}
                        </main>
                    </div>
                    <FacebookSearch />
                </div>
            </SearchProvider>
        </SchoolTeachersProvider>
    );
}
