"use client";

import { AdminTitle } from "./AdminTitle";
import { AdminRoutes } from "./AdminRoutes";
import { AdminInfo } from "./AdminInfo";
import { AdminFooter } from "./AdminFooter";

export default function AdminPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <AdminTitle />
            <AdminRoutes />
            <AdminInfo />
            <AdminFooter />
        </div>
    );
}
