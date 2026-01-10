import { getTeacherId } from "@/supabase/server/teacher-id";
import { LESSON_STATUS_CONFIG, type LessonStatus } from "@/types/status";

export const dynamic = "force-dynamic";

interface CommissionsPageProps {
    params: Promise<{ id: string }>;
}

export default async function CommissionPage({ params }: CommissionPageProps) {
    const { id: teacherId } = await params;

    const result = await getTeacherId(teacherId);

    if (!result.success || !result.data) {
        return (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
                Error: {result.error || "Teacher not found"}
            </div>
        );
    }

    const teacherData = result.data;
    const commissions = teacherData.relations.teacher_commission;
    const lessons = teacherData.relations.lesson;

    // Group lessons by commission_id
    const groupedData = commissions.map((commission) => {
        return {
            commission,
            lessons: lessons.filter((l) => l.commission_id === commission.id),
        };
    });

    return (
        <div>
            <h2 className="text-xl font-bold text-foreground mb-4">My Commissions</h2>

            {commissions.length === 0 ? (
                <p className="text-muted-foreground">No commissions found</p>
            ) : (
                <div className="space-y-6">
                    {groupedData.map((item) => {
                        const commission = item.commission;
                        const itemLessons = item.lessons;

                        return (
                            <div key={commission.id} className="rounded-lg border border-border overflow-hidden">
                                {/* Commission Header */}
                                <div className="p-4 bg-muted/50 border-b border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-foreground">
                                            {commission.commission_type === "fixed" ? "Fixed Rate" : "Percentage Based"}
                                        </h3>
                                        <span className="text-2xl font-bold text-foreground">
                                            {commission.commission_type === "fixed"
                                                ? `$${parseFloat(commission.cph as any).toFixed(2)}/hr`
                                                : `${parseFloat(commission.cph as any).toFixed(2)}%`}
                                        </span>
                                    </div>
                                    {commission.description && (
                                        <p className="text-sm text-muted-foreground">{commission.description}</p>
                                    )}
                                </div>

                                {/* Lessons */}
                                <div className="p-4">
                                    {itemLessons.length === 0 ? (
                                        <p className="text-muted-foreground">No lessons yet</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {itemLessons.map((lesson) => {
                                                const events = lesson.event || [];
                                                const booking = lesson.booking;
                                                const schoolPackage = booking?.school_package;
                                                const studentCount = (booking as any)?.booking_student?.length || 1; // Approx if students not loaded

                                                const durationMinutes = events.reduce(
                                                    (acc: number, e: any) => acc + (e.duration || 0),
                                                    0,
                                                );

                                                // Calculate commission for this lesson
                                                const lessonRevenue = schoolPackage
                                                    ? calculateLessonRevenue(
                                                          schoolPackage.price_per_student,
                                                          studentCount,
                                                          durationMinutes,
                                                          schoolPackage.duration_minutes,
                                                      )
                                                    : 0;

                                                const commissionInfo: CommissionInfo = {
                                                    type: commission.commission_type as any,
                                                    cph: parseFloat(commission.cph),
                                                };

                                                const commissionCalc = calculateCommission(
                                                    durationMinutes,
                                                    commissionInfo,
                                                    lessonRevenue,
                                                    schoolPackage?.duration_minutes || 0,
                                                );

                                                const statusConfig =
                                                    LESSON_STATUS_CONFIG[lesson.status as LessonStatus] || LESSON_STATUS_CONFIG.active;

                                                return (
                                                    <div key={lesson.id} className="p-3 rounded border border-border/50 bg-card">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-medium text-foreground">Lesson</span>
                                                            <span
                                                                className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                                                                style={{
                                                                    backgroundColor: `${statusConfig.color}20`,
                                                                    color: statusConfig.color,
                                                                }}
                                                            >
                                                                {statusConfig.label}
                                                            </span>
                                                        </div>

                                                        <div className="text-sm text-muted-foreground space-y-1 mb-3">
                                                            <p>
                                                                Events:{" "}
                                                                <span className="text-foreground font-medium">{events.length}</span>
                                                            </p>
                                                            <p>
                                                                Duration:{" "}
                                                                <span className="text-foreground font-medium">
                                                                    {commissionCalc.hours}
                                                                </span>
                                                            </p>
                                                        </div>

                                                        <div className="p-3 rounded bg-muted/50 border border-border/50">
                                                            <p className="text-xs text-muted-foreground mb-2">Calculation</p>
                                                            <p className="font-mono text-sm text-foreground mb-3">
                                                                {commissionCalc.commissionRate} × {commissionCalc.hours} ={" "}
                                                                {commissionCalc.earnedDisplay}
                                                            </p>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-foreground font-medium">Earned:</span>
                                                                <span className="text-lg font-bold text-primary">
                                                                    {commissionCalc.earnedDisplay}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
