"use client";

import Link from "next/link";
import { FACEBOOK_NAV_ROUTES } from "@/config/facebook-nav-routes";

const ROUTE_DESCRIPTIONS: Record<string, string> = {
    info: "to see",
    classboard: "to play",
    data: "to explore",
    users: "to register",
    invitations: "to understand",
};

export const AdminRoutes = () => {
    return (
        <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Navigation Routes</h2>
            <div className="grid grid-cols-5 gap-4">
                {FACEBOOK_NAV_ROUTES.map((route) => {
                    const Icon = route.icon;
                    return (
                        <Link
                            key={route.id}
                            href={route.href}
                            className="p-4 border rounded-lg hover:shadow-md transition-shadow hover:border-blue-500 flex flex-col items-center text-center"
                        >
                            <Icon className="w-8 h-8 mb-2 text-blue-600" />
                            <h3 className="font-semibold text-sm mb-1">{route.label}</h3>
                            <p className="text-xs text-gray-600">{ROUTE_DESCRIPTIONS[route.id]}</p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
