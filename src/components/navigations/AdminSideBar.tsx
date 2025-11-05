"use client";

import { ADMIN_NAV_SECTIONS } from "../../../config/admin-nav-routes";
import {
    AdminSidebar,
    SidebarHeader,
    SidebarSearch,
    SidebarMenu,
    SidebarMenuItem,
    SidebarSubmenu,
    SidebarFooter,
} from "./sidebar";

export function AdminSideBar() {
    return (
        <AdminSidebar>
            <SidebarHeader />
            <SidebarSearch />
            <SidebarMenu>
                {ADMIN_NAV_SECTIONS.map((section) => (
                    <div key={section.section}>
                        {section.routes.map((route) => {
                            if (route.children) {
                                return (
                                    <SidebarSubmenu key={route.name} label={route.name} icon={route.icon}>
                                        {route.children.map((child) => (
                                            <SidebarMenuItem
                                                key={child.href}
                                                href={child.href}
                                                icon={child.icon}
                                                label={child.name}
                                                count={child.count}
                                            />
                                        ))}
                                    </SidebarSubmenu>
                                );
                            }

                            return (
                                <SidebarMenuItem
                                    key={route.href}
                                    href={route.href}
                                    icon={route.icon}
                                    label={route.name}
                                    count={route.count}
                                />
                            );
                        })}
                    </div>
                ))}
            </SidebarMenu>
            <SidebarFooter />
        </AdminSidebar>
    );
}
