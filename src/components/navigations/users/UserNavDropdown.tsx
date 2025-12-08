"use client";

import { useState, useMemo } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { getStudentDropdownItems } from "@/config/student-nav-routes";
import { getTeacherDropdownItems } from "@/config/teacher-nav-routes";
import { Dropdown } from "@/src/components/ui/dropdown";

interface UserNavDropdownProps {
	role: "student" | "teacher";
	userId?: string;
}

export default function UserNavDropdown({ role, userId }: UserNavDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);

	// Get base dropdown items from config
	const baseDropdownItems = role === "student" ? getStudentDropdownItems() : getTeacherDropdownItems();

	// Convert relative URLs to absolute if userId is provided
	const dropdownItems = useMemo(() => {
		if (!userId) return baseDropdownItems;

		const basePath = `/${role}/${userId}`;
		return baseDropdownItems.map((item) => ({
			...item,
			href: `${basePath}${item.href}`,
		}));
	}, [baseDropdownItems, userId, role]);

	const roleConfig = ENTITY_DATA.find((entity) => entity.id === role);

	if (!roleConfig) return null;

	const RoleIcon = roleConfig.icon;

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex h-14 w-24 items-center justify-center text-muted-foreground transition-colors hover:bg-accent rounded-lg"
				style={isOpen ? { color: roleConfig.color } : {}}
			>
				<RoleIcon className="w-6 h-6" />
			</button>

			<Dropdown
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				items={dropdownItems}
				align="right"
			/>
		</div>
	);
}
