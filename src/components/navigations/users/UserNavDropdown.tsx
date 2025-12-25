"use client";

import { useState, useMemo, useRef } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { getStudentDropdownItems } from "@/config/student-nav-routes";
import { getTeacherDropdownItems } from "@/config/teacher-nav-routes";
import { Dropdown, type DropdownItemProps } from "@/src/components/ui/dropdown";

interface UserNavDropdownProps {
	role: "student" | "teacher" | null;
	userId?: string;
}

export default function UserNavDropdown({ role, userId }: UserNavDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);

	// Get base dropdown items from config
	const baseDropdownItems = role === "student" ? getStudentDropdownItems() : role === "teacher" ? getTeacherDropdownItems() : [];

	// Convert relative URLs to absolute if userId is provided
	const dropdownItems: DropdownItemProps[] = useMemo(() => {
		if (!userId) return baseDropdownItems;

		const basePath = `/${role}/${userId}`;
		return baseDropdownItems.map((item) => ({
			...item,
			href: `${basePath}${item.href}`,
		}));
	}, [baseDropdownItems, userId, role]);

	const roleConfig = ENTITY_DATA.find((entity) => entity.id === role);

	if (!roleConfig || !role) return null;

	const RoleIcon = roleConfig.icon;

	return (
		<div className="relative">
			<button
				ref={buttonRef}
				onClick={() => setIsOpen(!isOpen)}
				className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent"
				style={isOpen ? { color: roleConfig.color } : {}}
				aria-label="Navigation menu"
			>
				<RoleIcon className="w-5 h-5" />
			</button>

			<Dropdown
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				items={dropdownItems}
				align="right"
				triggerRef={buttonRef}
			/>
		</div>
	);
}
