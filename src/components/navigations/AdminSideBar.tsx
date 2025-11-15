"use client";

import { ADMIN_NAV_SECTIONS } from "../../../config/admin-nav-routes";
import { AdminSidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, useSidebar } from "./sidebar";
import { WindToggle } from "../themes/WindToggle";

interface AdminSideBarProps {
    schoolName?: string | null;
}

function AdminSideBarContent({ schoolName }: AdminSideBarProps) {
    const { collapsed } = useSidebar();

    return (
        <>
            <SidebarHeader schoolName={schoolName} />
            <SidebarMenu>
                {ADMIN_NAV_SECTIONS.map((section) => {
                    // MAIN section - Direct routes without grouping
                    if (section.section === "main" && section.routes) {
                        return (
                            <div key={section.section}>
                                {section.routes.map((route) => (
                                    <SidebarMenuItem
                                        key={route.href}
                                        href={route.href}
                                        icon={route.icon}
                                        label={route.name}
                                        count={route.count}
                                    />
                                ))}
                            </div>
                        );
                    }

                    // GROUPED sections - Operations, Tables, Settings, Support
                    if (section.section !== "main" && section.groups) {
                        return (
                            <div key={section.section}>
                                {section.groups.map((group) => (
                                    <div key={group.groupLabel} className="py-2">
                                        {collapsed ? (
                                            // Show separator when collapsed
                                            <div className="h-px bg-border/30 my-2" />
                                        ) : (
                                            // Show header when expanded
                                            <h3 className="px-3 py-1 text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                                                {group.groupLabel}
                                            </h3>
                                        )}
                                        <ul className="space-y-0.5">
                                            {group.routes.map((route) => (
                                                <SidebarMenuItem
                                                    key={route.href}
                                                    href={route.href}
                                                    icon={route.icon}
                                                    label={route.name}
                                                    count={route.count}
                                                    iconColor={route.color}
                                                />
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        );
                    }

                    return null;
                })}
            </SidebarMenu>
            <WindToggle />
            {/* <SidebarFooter /> */}
        </>
    );
}

export function AdminSideBar({ schoolName }: AdminSideBarProps) {
    return (
        <AdminSidebar>
            <AdminSideBarContent schoolName={schoolName} />
        </AdminSidebar>
    );
}
