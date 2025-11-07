"use client";

import { ADMIN_NAV_SECTIONS } from "../../../config/admin-nav-routes";
import { AdminSidebar, SidebarHeader,  SidebarMenu, SidebarMenuItem, SidebarSubmenu, SidebarFooter } from "./sidebar";
import { WindToggle } from '../themes/WindToggle';
interface AdminSideBarProps {
    schoolName?: string | null;
}

export function AdminSideBar({ schoolName }: AdminSideBarProps) {
    return (
        <AdminSidebar>
            <SidebarHeader schoolName={schoolName} />
            {/* <SidebarSearch /> */}
            <SidebarMenu>
                {ADMIN_NAV_SECTIONS.map((section) => (
                    <div key={section.section}>
                        {section.routes.map((route) => {
                            if (route.children) {
                                return (
                                    <SidebarSubmenu key={route.name} label={route.name} icon={route.icon} iconColor={route.color}>
                                        {route.children.map((child) => (
                                            <SidebarMenuItem key={child.href} href={child.href} icon={child.icon} label={child.name} count={child.count} iconColor={child.color} />
                                        ))}
                                    </SidebarSubmenu>
                                );
                            }

                            return <SidebarMenuItem key={route.href} href={route.href} icon={route.icon} label={route.name} count={route.count} />;
                        })}
                    </div>
                ))}
            </SidebarMenu>
            <WindToggle/>
            {/* <SidebarFooter /> */}
        </AdminSidebar>
    );
}
