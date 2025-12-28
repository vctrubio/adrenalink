import { getTeacherEquipment } from "@/actions/teacher-action";

interface EquipmentPageProps {
	params: Promise<{ id: string }>;
}

export default async function EquipmentPage({ params }: EquipmentPageProps) {
	const { id: teacherId } = await params;

	const result = await getTeacherEquipment(teacherId);

	if (!result.success) {
		return (
			<div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
				Error: {result.error}
			</div>
		);
	}

	const equipmentList = result.data;

	return (
		<div>
			<h2 className="text-xl font-bold text-foreground mb-4">My Equipment</h2>

			{equipmentList.length === 0 ? (
				<p className="text-muted-foreground">No equipment relations found</p>
			) : (
				<div className="space-y-3">
					{equipmentList.map((item) => {
						const equip = item.equipment;

						return (
							<div
								key={item.id}
								className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<h3 className="font-bold text-foreground">
												{equip.model}
											</h3>
											<span
												className="text-xs px-2 py-1 rounded-full"
												style={{
													backgroundColor: item.active ? "#22c55e20" : "#ef444420",
													color: item.active ? "#22c55e" : "#ef4444",
												}}
											>
												{item.active ? "Active" : "Inactive"}
											</span>
										</div>
										<div className="text-sm text-muted-foreground space-y-1">
											<p>
												Category:{" "}
												<span className="text-foreground font-medium capitalize">
													{equip.category}
												</span>
											</p>
											{equip.color && (
												<p>
													Color:{" "}
													<span className="text-foreground font-medium">
														{equip.color}
													</span>
												</p>
											)}
											{equip.size && (
												<p>
													Size:{" "}
													<span className="text-foreground font-medium">
														{equip.size}
													</span>
												</p>
											)}
											<p>
												SKU:{" "}
												<span className="text-foreground font-medium font-mono">
													{equip.sku}
												</span>
											</p>
											<p>
												Status:{" "}
												<span
													className="text-foreground font-medium capitalize"
													style={{
														color:
															equip.status === "public"
																? "#22c55e"
																: equip.status === "rental"
																	? "#3b82f6"
																	: "#ef4444",
													}}
												>
													{equip.status}
												</span>
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-xs text-muted-foreground mb-1">
											Equipment ID
										</p>
										<p className="text-xs font-mono text-foreground">
											{equip.id.slice(0, 8)}...
										</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
