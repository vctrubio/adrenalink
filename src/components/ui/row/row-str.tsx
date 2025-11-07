"use client";

import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import DropdownBullsIcon from "@/public/appSvgs/DropdownBullsIcon.jsx";

interface RowStrProps {
    label: string;
    items: Array<{
        label: string;
        value: string | number;
    }>;
    entityColor: string;
}

export const RowStr = ({ label, items, entityColor }: RowStrProps) => {
    return (
        <Menu>
            {({ open }) => (
                <>
                    <MenuButton
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors border-2 ${
                            open ? "bg-muted" : ""
                        } hover:bg-muted`}
                        style={{ borderColor: entityColor }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span>{label}</span>
                        <DropdownBullsIcon className="text-muted-foreground" size={12} />
                    </MenuButton>
                    <MenuItems
                        anchor="bottom"
                        className="mt-2 w-64 origin-top-right rounded-md border border-border bg-card p-4 shadow-lg focus:outline-none z-50"
                    >
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <MenuItem key={index}>
                                    {({ focus }) => (
                                        <div
                                            className="flex items-center justify-between py-2 border-b border-border last:border-0 rounded-md px-2 -mx-2 transition-colors"
                                            style={{
                                                backgroundColor: focus ? `${entityColor}40` : "transparent"
                                            }}
                                        >
                                            <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                                {item.label}
                                            </span>
                                            <span className="text-sm font-medium">{item.value}</span>
                                        </div>
                                    )}
                                </MenuItem>
                            ))}
                        </div>
                    </MenuItems>
                </>
            )}
        </Menu>
    );
};
