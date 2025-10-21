import { ReactNode } from "react";
import { Breadcrumbs } from "@/src/components/navigations/Breadcrumbs";
import Devbar from "@/src/components/navigations/Devbar";

interface TablesLayoutProps {
    children: ReactNode;
}

export default function TablesLayout({ children }: TablesLayoutProps) {
    return (
        <div>
            <Devbar />
            <Breadcrumbs />
            <main>{children}</main>
        </div>
    );
}
