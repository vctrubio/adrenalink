"use client";

import { rainbowBaseColors, colorLabels, getColorGroups } from "@/config/rainbow";
import { RainbowColor, RainbowShade, getBaseColor, getShadeColor } from "./Rainbow";

// Constants
const GROUP_COLOR_BG = "bg-slate-800/50";
const COLOR_CARD_GROUPS = [["purple", "blue", "green"] as RainbowColor[], ["yellow", "orange", "red"] as RainbowColor[]];

// Props
interface ColorMappingProps {
	hoveredShade: RainbowShade | null;
	onShadeHover: (shade: RainbowShade | null) => void;
}

interface RainbowTagProps {
	icon: React.ComponentType<{ className?: string }>;
	iconColor: string;
	name: string;
	shade: RainbowShade;
	shadeColor: { fill: string; hoverFill: string };
	isHovered: boolean;
	onShadeHover: (shade: RainbowShade | null) => void;
}

// Sub-component: RainbowTag
const RainbowTag = ({ icon: Icon, iconColor, name, shade, shadeColor, isHovered, onShadeHover }: RainbowTagProps) => {
	return (
		<div
			className="flex items-center gap-2 px-3 py-1 rounded-md border-2 transition-all"
			style={{
				borderColor: shadeColor.fill,
				backgroundColor: isHovered ? shadeColor.fill : "transparent",
			}}
			onMouseEnter={() => onShadeHover(shade)}
			onMouseLeave={() => onShadeHover(null)}
		>
			<Icon className={`w-4 h-4 transition-colors ${isHovered ? "text-white" : iconColor}`} color={isHovered ? "white" : shadeColor.fill} />
			<span style={{ color: "white" }} className="font-medium text-sm">
				{name}
			</span>
		</div>
	);
};

// Parent component: ColorMapping (renders only)
export const ColorMapping = ({ hoveredShade, onShadeHover }: ColorMappingProps) => {
	const colorGroups = getColorGroups(hoveredShade);
	const hoveredBaseColor = hoveredShade ? getBaseColor(hoveredShade) : null;

	return (
		<div className="w-full px-6 py-12">
			{/* School Wrapper - Contains all color groups and school info */}
			{(() => {
				const color = "grey" as RainbowColor;
				const schoolEntities = colorGroups[color];
				const bgColor = rainbowBaseColors[color].fill;
				const isSchoolHovered = hoveredShade === "grey-0" || hoveredShade === "grey-1";
				const isColorGroupHovered = hoveredBaseColor && hoveredBaseColor !== "grey";

				return (
					<div
						className="rounded-lg p-6 transition-all duration-300 shadow-md border-2 flex flex-col justify-between"
						style={{
							borderColor: bgColor,
							opacity: hoveredShade && !isColorGroupHovered && !isSchoolHovered ? 0.5 : 1,
							boxShadow: isColorGroupHovered ? `0 8px 24px ${bgColor}40, 0 0 0 3px ${bgColor}20` : "0 4px 6px rgba(0, 0, 0, 0.1)",
						}}
					>
						{/* Color Groups */}
						<div className="space-y-6 mb-6">
							{COLOR_CARD_GROUPS.map((group, groupIndex) => (
								<div key={groupIndex} className={`${GROUP_COLOR_BG} rounded-lg p-6`}>
									<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
										{group.map((color) => {
											const entities = colorGroups[color];
											const isBaseColorHovered = hoveredBaseColor === color;
											const bgColor = rainbowBaseColors[color].fill;

											return (
												<div
													key={color}
													className="rounded-lg p-6 transition-all duration-300 shadow-md border-2 flex flex-col justify-between"
													style={{
														borderColor: bgColor,
														opacity: hoveredShade && !isBaseColorHovered ? 0.5 : 1,
														boxShadow: isBaseColorHovered ? `0 8px 24px ${bgColor}40, 0 0 0 3px ${bgColor}20` : "0 4px 6px rgba(0, 0, 0, 0.1)",
													}}
												>
													<div>
														<span className="inline-block px-4 py-2 rounded-full text-white font-semibold text-sm" style={{ backgroundColor: bgColor }}>
															{colorLabels[color].name}
														</span>
														<p className="text-white text-sm mt-3 leading-relaxed">{colorLabels[color].description}</p>
													</div>
													<div className="flex flex-wrap gap-2 mt-4">
														{entities.map(({ entity, shade }) => {
															const shadeColor = getShadeColor(shade);
															const isShadeHovered = hoveredShade === shade;
															return (
																<div
																	key={entity.id}
																	style={{
																		opacity: hoveredShade && !isShadeHovered ? 0.5 : 1,
																		transition: "opacity 0.3s",
																	}}
																>
																	<RainbowTag icon={entity.icon} iconColor={entity.color} name={entity.name} shade={shade} shadeColor={shadeColor} isHovered={hoveredShade === shade} onShadeHover={onShadeHover} />
																</div>
															);
														})}
													</div>
												</div>
											);
										})}
									</div>
								</div>
							))}
						</div>

						{/* School Info Section */}
						<div
							className="pt-6 border-t border-gray-700 transition-all duration-300"
							style={{
								opacity: isSchoolHovered ? 1 : 0.9,
							}}
						>
							<div className="flex justify-between items-center">
								<span className="inline-block px-4 py-2 rounded-full text-white font-semibold text-sm transition-colors" style={{ backgroundColor: isSchoolHovered ? rainbowBaseColors[color].hoverFill : bgColor }}>
									{colorLabels[color].name}
								</span>
								<span className="text-primary font-medium text-sm">your_school.adrenalink.tech</span>
							</div>
							<p className="text-white text-sm mt-3 leading-relaxed">{colorLabels[color].description}</p>
							<div className="flex flex-wrap gap-2 mt-4">
								{schoolEntities.map(({ entity, shade }) => {
									const shadeColor = getShadeColor(shade);
									const isShadeHovered = hoveredShade === shade;
									return (
										<div
											key={entity.id}
											style={{
												opacity: hoveredShade && !isShadeHovered ? 0.5 : 1,
												transition: "opacity 0.3s",
											}}
										>
											<RainbowTag icon={entity.icon} iconColor={entity.color} name={entity.name} shade={shade} shadeColor={shadeColor} isHovered={hoveredShade === shade} onShadeHover={onShadeHover} />
										</div>
									);
								})}
							</div>
						</div>
					</div>
				);
			})()}
		</div>
	);
};
