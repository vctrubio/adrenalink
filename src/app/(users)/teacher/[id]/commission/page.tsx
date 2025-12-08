import { getTeacherCommissions } from "@/actions/teacher-action";
import { getTeacherLessonCommission } from "@/getters/teacher-commission-getter";

interface CommissionPageProps {
	params: Promise<{ id: string }>;
}

export default async function CommissionPage({ params }: CommissionPageProps) {
	const { id: teacherId } = await params;

	const result = await getTeacherCommissions(teacherId);

	if (!result.success) {
		return (
			<div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
				Error: {result.error}
			</div>
		);
	}

	const commissionsData = result.data;

	return (
		<div>
			<h2 className="text-xl font-bold text-foreground mb-4">My Commissions</h2>

			{commissionsData.length === 0 ? (
				<p className="text-muted-foreground">No commissions found</p>
			) : (
				<div className="space-y-6">
					{commissionsData.map((item) => {
						const commission = item.commission;
						const lessons = item.lessons;

						return (
							<div
								key={commission.id}
								className="rounded-lg border border-border overflow-hidden"
							>
								{/* Commission Header */}
								<div className="p-4 bg-muted/50 border-b border-border">
									<div className="flex items-center justify-between mb-2">
										<h3 className="font-bold text-foreground">
											{commission.commissionType === "fixed"
												? "Fixed Rate"
												: "Percentage Based"}
										</h3>
										<span className="text-2xl font-bold text-foreground">
											{commission.commissionType === "fixed"
												? `$${parseFloat(commission.cph as any).toFixed(2)}/hr`
												: `${parseFloat(commission.cph as any).toFixed(2)}%`}
										</span>
									</div>
									{commission.description && (
										<p className="text-sm text-muted-foreground">
											{commission.description}
										</p>
									)}
								</div>

								{/* Lessons */}
								<div className="p-4">
									{lessons.length === 0 ? (
										<p className="text-muted-foreground">No lessons yet</p>
									) : (
										<div className="space-y-3">
											{lessons.map((lessonData) => {
												const lesson = lessonData.lesson;
												const events = lessonData.events;

												// Calculate commission for this lesson
												const commissionCalc = getTeacherLessonCommission(
													events,
													{
														type: commission.commissionType as any,
														cph: commission.cph as any,
													},
												);

												return (
													<div
														key={lesson.id}
														className="p-3 rounded border border-border/50 bg-card"
													>
														<div className="flex items-center justify-between mb-2">
															<span className="font-medium text-foreground">
																Lesson
															</span>
															<span
																className="text-xs px-2 py-1 rounded-full"
																style={{
																	backgroundColor:
																		lesson.status === "active"
																			? "#22c55e20"
																			: "#ef444420",
																	color:
																		lesson.status === "active"
																			? "#22c55e"
																			: "#ef4444",
																}}
															>
																{lesson.status}
															</span>
														</div>

														<div className="text-sm text-muted-foreground space-y-1 mb-3">
															<p>
																Events:{" "}
																<span className="text-foreground font-medium">
																	{events.length}
																</span>
															</p>
															<p>
																Duration:{" "}
																<span className="text-foreground font-medium">
																	{commissionCalc.hours}
																</span>
															</p>
														</div>

														<div className="p-3 rounded bg-muted/50 border border-border/50">
															<p className="text-xs text-muted-foreground mb-2">
																Calculation
															</p>
															<p className="font-mono text-sm text-foreground mb-3">
																{commissionCalc.formula}
															</p>
															<div className="flex justify-between items-center">
																<span className="text-foreground font-medium">
																	Earned:
																</span>
																<span className="text-lg font-bold text-primary">
																	{commissionCalc.earned}
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
