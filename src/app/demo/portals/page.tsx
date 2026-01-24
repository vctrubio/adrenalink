import { getDemoSchoolLists } from "@/supabase/server/demo-lists";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import HelmetIcon from "@/public/appSvgs/HelmetIcon.jsx";
import AdminIcon from "@/public/appSvgs/AdminIcon.jsx";
import { User } from "lucide-react";
import { DemoUserCard } from "./DemoUserCard";
import { DemoSystemUserCard } from "./DemoSystemUserCard";

export default async function DemoPortalsPage() {
    const result = await getDemoSchoolLists();

    if (!result.success || !result.data) {
        return (
            <div className="max-w-7xl mx-auto p-12 text-center text-muted-foreground">
                <p>Could not load school data. Ensure you are accessing this page via a school subdomain.</p>
            </div>
        );
    }

    const { teachers, students, owner, schoolName } = result.data;

    // Aggregate Active System Users (Clerk Linked)
    const systemUsers = [
        ...(owner?.clerk_id
            ? [
                  {
                      clerkId: owner.clerk_id,
                      role: "owner",
                      entityId: owner.id,
                      name: "School Owner",
                  },
              ]
            : []),
        ...teachers
            .filter((t: any) => t.clerk_id)
            .map((t: any) => ({
                clerkId: t.clerk_id,
                role: "teacher",
                entityId: t.id,
                name: t.username,
            })),
        ...students
            .filter((s: any) => s.clerk_id)
            .map((s: any) => ({
                clerkId: s.clerk_id,
                role: "student",
                entityId: s.id,
                name: `${s.first_name} ${s.last_name}`,
            })),
    ];

    return (
        <div className="max-w-[1600px] mx-auto px-8 py-12">
            <div className="mb-12">
                <h1 className="text-2xl font-bold text-foreground mb-2">User Portals</h1>
                <p className="text-muted-foreground">
                    Quick access to user portals for <strong>{schoolName}</strong>.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* 1. Admins Column */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-700 dark:text-purple-400">
                            <AdminIcon size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Admins</h2>
                    </div>

                    <div className="grid gap-3">
                        {owner && <DemoUserCard user={owner} type="admin" />}
                        <div className="p-4 bg-muted/20 border border-border/50 border-dashed rounded-xl text-center text-sm text-muted-foreground">
                            + Add School Admin
                        </div>
                    </div>
                </section>

                {/* 2. Teachers Column */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400">
                            <HeadsetIcon size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Teachers ({teachers.length})</h2>
                    </div>

                    <div className="grid gap-3">
                        {teachers.map((teacher: any) => (
                            <DemoUserCard key={teacher.id} user={teacher} type="teacher" />
                        ))}
                    </div>
                </section>

                {/* 3. Students Column */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-700 dark:text-yellow-400">
                            <HelmetIcon size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Students ({students.length})</h2>
                    </div>

                    <div className="grid gap-3">
                        {students.map((student: any) => (
                            <DemoUserCard key={student.id} user={student} type="student" />
                        ))}
                    </div>
                </section>

                {/* 4. Users Column (Active Clerk Sessions) */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                        <div className="p-2 bg-muted text-muted-foreground rounded-lg">
                            <User size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Users ({systemUsers.length})</h2>
                    </div>

                    <div className="grid gap-3">
                        {systemUsers.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground italic">No active users linked</div>
                        ) : (
                            systemUsers.map((user, idx) => (
                                <DemoSystemUserCard
                                    key={user.clerkId + idx}
                                    clerkId={user.clerkId}
                                    role={user.role}
                                    entityId={user.entityId}
                                    name={user.name}
                                />
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
