"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ENTITY_DATA } from "@/config/entities";
import { Dropdown, type DropdownItem } from "@/src/components/ui/dropdown";
import Link from "next/link";

// Detect user role based on current pathname
const getUserRoleFromPath = (pathname: string): "student" | "teacher" | null => {
	if (pathname.includes("/student")) {
		return "student";
	}
	if (pathname.includes("/teacher")) {
		return "teacher";
	}
	return null;
};

// Get the entity config for the current role
const getRoleEntityConfig = (role: "student" | "teacher" | null) => {
	if (!role) return null;
	return ENTITY_DATA.find((entity) => entity.id === role);
};

const LeftSection = () => <div className="flex-1" />;

const CenterSection = () => (
	<div className="flex flex-1 items-center justify-center">
		<h1 className="text-2xl font-bold text-primary">Adrenalink</h1>
	</div>
);

const NavigationDropdown = ({ role }: { role: "student" | "teacher" }) => {
	const [isOpen, setIsOpen] = useState(false);
	const entityConfig = getRoleEntityConfig(role);

	if (!entityConfig) return null;

	const EntityIcon = entityConfig.icon;

	const dropdownItems: DropdownItem[] = [
		{ id: "student", label: "Student", href: "/student", icon: EntityIcon, color: entityConfig.color },
		{ id: "teacher", label: "Teacher", href: "/teacher", icon: EntityIcon, color: entityConfig.color },
		{ id: "students", label: "Students", href: "/students", icon: EntityIcon, color: entityConfig.color },
		{ id: "teachers", label: "Teachers", href: "/teachers", icon: EntityIcon, color: entityConfig.color },
	];

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex h-14 w-24 items-center justify-center text-muted-foreground transition-colors hover:bg-accent rounded-lg"
				style={isOpen ? { color: entityConfig.color } : {}}
			>
				<EntityIcon className="w-6 h-6" />
			</button>

			<Dropdown
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				items={dropdownItems}
				align="right"
			/>
		</div>
	);
};

export default function UserNavBar() {
	const pathname = usePathname();
	const userRole = getUserRoleFromPath(pathname);

	return (
		<header className="sticky top-0 z-40 w-full bg-facebook border-b border-facebook shadow-sm">
			<div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 mx-auto">
				<LeftSection />
				<CenterSection />
				<div className="flex-1 flex items-center justify-end">
					{userRole && <NavigationDropdown role={userRole} />}
				</div>
			</div>
		</header>
	);
}
