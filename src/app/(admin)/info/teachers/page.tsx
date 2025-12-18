import { getTeachers } from "@/actions/databoard-action";
import { InfoHeader } from "../InfoHeader";
import Link from "next/link";

export default async function TeachersPage() {
    const result = await getTeachers();

    if (!result.success) {
        return (
            <>
                <InfoHeader title="Teachers" />
                <div>Error loading teachers</div>
            </>
        );
    }

    const teachers = result.data;

    return (
        <>
            <InfoHeader title="Teachers" />
            <div className="flex flex-col gap-2">
                {teachers.map((teacher) => (
                    <Link
                        key={teacher.schema.id}
                        href={`/info/teachers/${teacher.schema.id}`}
                        className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                        <h3 className="font-semibold">
                            {teacher.schema.firstName} {teacher.schema.lastName}
                        </h3>
                    </Link>
                ))}
            </div>
        </>
    );
}
