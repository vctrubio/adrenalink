import { getTeacherLessons } from "@/actions/teacher-action";

interface LessonPageProps {
	params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
	const { id: teacherId } = await params;

	const result = await getTeacherLessons(teacherId);

	if (!result.success) {
		return (
			<div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
				Error: {result.error}
			</div>
		);
	}

	const lessonsData = result.data;

	return (
		<div>
			<h2 className="text-xl font-bold text-foreground mb-4">My Lessons</h2>

			{lessonsData.length === 0 ? (
				<p className="text-muted-foreground">No lessons found</p>
			) : (
				<div className="space-y-4">
					{lessonsData.map((item) => {
						const lesson = item.lesson;
						const events = item.events;
						const totalDuration = events.reduce(
							(sum, evt) => sum + (evt.duration || 0),
							0,
						);

						return (
							<div
								key={lesson.id}
								className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
							>
								<div className="mb-3">
									<div className="flex items-center justify-between mb-2">
										<h3 className="font-bold text-foreground">Lesson</h3>
										<span
											className="text-xs px-2 py-1 rounded-full"
											style={{
												backgroundColor: `${lesson.status === "active" ? "#22c55e" : "#ef4444"}20`,
												color: lesson.status === "active" ? "#22c55e" : "#ef4444",
											}}
										>
											{lesson.status}
										</span>
									</div>
									<p className="text-sm text-muted-foreground">
										Total Duration: {totalDuration} minutes
									</p>
								</div>

								{/* Events */}
								{events.length > 0 && (
									<div className="space-y-2 mt-3 pt-3 border-t border-border">
										<p className="text-xs font-medium text-muted-foreground">
											Events ({events.length})
										</p>
										{events.map((evt) => (
											<div
												key={evt.id}
												className="pl-3 py-2 border-l-2 border-muted"
											>
												<div className="flex items-center justify-between mb-1">
													<span className="text-sm font-medium text-foreground">
														{evt.date
															? new Date(evt.date).toLocaleDateString("en-US", {
																	month: "short",
																	day: "numeric",
																	year: "numeric",
															  })
															: "Unknown date"}
													</span>
													<span className="text-xs text-muted-foreground">
														{evt.duration} min
													</span>
												</div>
												{evt.location && (
													<p className="text-xs text-muted-foreground">
														📍 {evt.location}
													</p>
												)}

												{/* Equipment used */}
												{evt.equipment && evt.equipment.length > 0 && (
													<div className="mt-2 flex flex-wrap gap-1">
														{evt.equipment.map((equip: any) => (
															<span
																key={equip.id}
																className="inline-block text-xs px-2 py-1 rounded bg-muted text-foreground"
															>
																{equip.model} ({equip.color || "N/A"})
															</span>
														))}
													</div>
												)}
											</div>
										))}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
