"use client";
import { Plus, Search, Sun, Moon } from "lucide-react";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useSearch } from "@/src/providers/search-provider";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import FacebookSearch from "@/src/components/modals/FacebookSearch";
import { ENTITY_DATA } from "@/config/entities";
import { Dropdown, DropdownItem, type DropdownItemProps } from "@/src/components/ui/dropdown";

const CREATE_ENTITIES = ["student", "teacher", "schoolPackage", "booking", "equipment"];

const ActionButton = ({ icon: Icon, children, onClick }: { icon?: React.ElementType; children?: React.ReactNode; onClick?: () => void }) => (
    <button
        onClick={onClick}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent"
    >
        {Icon && <Icon className="h-5 w-5" />}
        {children}
    </button>
);

export const NavRight = () => {
    const [mounted, setMounted] = useState(false);
    const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
    const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { onOpen } = useSearch();
    const credentials = useSchoolCredentials();

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDarkMode = mounted && (theme === "dark" || resolvedTheme === "dark");

    const createEntities = ENTITY_DATA.filter((entity) => CREATE_ENTITIES.includes(entity.id));
    const createDropdownItems: DropdownItemProps[] = createEntities.map((entity) => ({
        id: entity.id,
        label: entity.name,
        href: entity.link,
        icon: entity.icon,
        color: entity.color,
    }));

    const adminDropdownItems: DropdownItemProps[] = credentials ? [
        {
            id: "username",
            label: `Username: ${credentials.username}`,
            href: undefined,
        },
        {
            id: "currency",
            label: `Currency: ${credentials.currency}`,
            href: undefined,
        },
        {
            id: "status",
            label: `Status: ${credentials.status}`,
            href: undefined,
        },
        {
            id: "ownerId",
            label: `Owner ID: ${credentials.ownerId}`,
            href: undefined,
        },
    ] : [];

    const renderCredentialItem = (item: DropdownItemProps) => {
        const [key, value] = item.label?.split(": ") || [];
        return (
            <div className="px-4 py-2 text-sm">
                <div className="text-xs text-muted-foreground font-medium">{key}</div>
                <div className="text-foreground font-semibold truncate">{value}</div>
            </div>
        );
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <div className="relative">
                    <ActionButton icon={Plus} onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)} />
                    <Dropdown
                        isOpen={isCreateDropdownOpen}
                        onClose={() => setIsCreateDropdownOpen(false)}
                        items={createDropdownItems}
                        align="right"
                    />
                </div>
                <ActionButton icon={Search} onClick={onOpen} />
                <ActionButton
                    onClick={() => setTheme(isDarkMode ? "light" : "dark")}
                    icon={mounted ? (isDarkMode ? Sun : Moon) : undefined}
                />
                <div className="relative">
                    <ActionButton onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}>
                        <AdminIcon className="h-6 w-6" />
                    </ActionButton>
                    <Dropdown
                        isOpen={isAdminDropdownOpen}
                        onClose={() => setIsAdminDropdownOpen(false)}
                        items={adminDropdownItems}
                        renderItem={renderCredentialItem}
                        align="right"
                    />
                </div>
            </div>
            <FacebookSearch />
        </>
    );
};
