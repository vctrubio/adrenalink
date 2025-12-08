import { getTeachers } from "@/actions/teacher-action";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import Link from "next/link";

export default async function TeacherPage() {
	const result = await getTeachers();

	if (!result.success) {
		return (
			<div className="p-6">
				<h1 className="text-2xl font-bold text-foreground mb-4">Teachers</h1>
				<p className="text-destructive">Error: {result.error}</p>
			</div>
		);
	}

	const teachers = result.data;

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold text-foreground mb-6">Teachers</h1>

			<div className="space-y-2">
				{teachers.length === 0 ? (
					<p className="text-muted-foreground">No teachers found</p>
				) : (
					teachers.map((teacher) => (
						<Link
							key={teacher.schema.id}
							href={`/teacher/${teacher.schema.id}`}
							className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary transition-colors"
						>
							<HelmetIcon size={20} />
							<div className="flex flex-col">
								<span className="font-medium text-foreground">
									{teacher.schema.firstName} {teacher.schema.lastName}
								</span>
								<span className="text-xs text-muted-foreground">
									{teacher.schema.username}
								</span>
							</div>
						</Link>
					))
				)}
			</div>
		</div>
	);
}
