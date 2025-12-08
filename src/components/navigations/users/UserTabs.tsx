"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tab, TabGroup, TabList } from "@headlessui/react";
import { STUDENT_NAV_ROUTES } from "@/config/student-nav-routes";
import { TEACHER_NAV_ROUTES } from "@/config/teacher-nav-routes";

interface UserTabsProps {
	userId: string;
	role: "student" | "teacher";
}

const tabConfigs = {
	student: STUDENT_NAV_ROUTES,
	teacher: TEACHER_NAV_ROUTES,
};

export default function UserTabs({ userId, role }: UserTabsProps) {
	const pathname = usePathname();
	const router = useRouter();
	const tabs = tabConfigs[role];

	// Determine the selected tab index based on current pathname
	const getSelectedIndex = () => {
		const basePath = `/${role}/${userId}`;
		if (pathname === basePath) return 0;

		// Check which tab matches the current path
		for (let i = 1; i < tabs.length; i++) {
			if (pathname.includes(tabs[i].href)) {
				return i;
			}
		}
		return 0;
	};

	const handleTabChange = (index: number) => {
		const basePath = `/${role}/${userId}`;
		const href = tabs[index].href;
		router.push(`${basePath}${href}`);
	};

	return (
		<TabGroup selectedIndex={getSelectedIndex()} onChange={handleTabChange}>
			<TabList className="flex gap-2 mb-8">
				{tabs.map((tab) => (
					<Tab
						key={tab.name}
						className="px-4 py-2 rounded-lg font-medium text-sm transition-colors data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[hover]:bg-muted border border-border bg-background text-foreground"
					>
						{tab.name}
					</Tab>
				))}
			</TabList>
		</TabGroup>
	);
}
