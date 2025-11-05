import { type ReactNode } from "react";
import { AdminSideBar } from "@/src/components/navigations/AdminSideBar";

type AdminLayoutProps = {
    children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="flex h-screen overflow-hidden">
            <AdminSideBar />
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
