import { ReactNode } from "react";
import { getStudents } from "@/actions/student-action";
import { getSchoolHeader } from "@/types/headers";
import UserNavBar from "@/src/components/navigations/users/UserNavBar";

interface StudentLayoutProps {
	params: Promise<{ id: string }>;
	children: ReactNode;
}

export default async function StudentLayout({ params, children }: StudentLayoutProps) {
	const { id } = await params;
	const schoolHeader = await getSchoolHeader();

	// Fetch current student data
	const result = await getStudents();
	const student = result.success ? result.data.find((s) => s.schema.id === id) : null;

	return (
		<div className="flex flex-col h-screen bg-background">
			<UserNavBar
				schoolUsername={schoolHeader?.name}
				userRole="student"
				userId={id}
				firstName={student?.schema.firstName}
				lastName={student?.schema.lastName}
			/>
			<main className="flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
