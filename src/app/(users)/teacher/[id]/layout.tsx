import { ReactNode } from "react";
import { getTeachers } from "@/actions/teacher-action";
import { getSchoolHeader } from "@/types/headers";
import UserNavBar from "@/src/components/navigations/users/UserNavBar";

interface TeacherLayoutProps {
	params: Promise<{ id: string }>;
	children: ReactNode;
}

export default async function TeacherLayout({ params, children }: TeacherLayoutProps) {
	const { id } = await params;
	const schoolHeader = await getSchoolHeader();

	// Fetch current teacher data
	const result = await getTeachers();
	const teacher = result.success ? result.data.find((t) => t.schema.id === id) : null;

	return (
		<div className="flex flex-col h-screen bg-background">
			<UserNavBar
				schoolUsername={schoolHeader?.name}
				userRole="teacher"
				userId={id}
				firstName={teacher?.schema.firstName}
				lastName={teacher?.schema.lastName}
			/>
			<main className="flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
