"use client";

import { getEntityRainbowShade, colorLabels, rainbowBaseColors } from "@/config/rainbow";
import { TABLE_CONFIG } from "@/config/tables";
import type { RainbowShade, RainbowColor } from "./Rainbow";
import { RainbowIdentity } from "./RainbowIdentity";

interface MeetTheTeamProps {
	hoveredShade: RainbowShade | null;
}

// Sub-component: Team
const Team = () => {
	const colors: RainbowColor[] = ["grey", "red", "orange", "yellow", "green", "blue", "purple"];

	return (
		<div className="max-w-7xl mx-auto px-6 mt-8">
			<div className="flex flex-wrap justify-center gap-4">
				{colors.map((color) => {
					const bgColor = rainbowBaseColors[color].fill;
					return (
						<div key={color} className="py-4 px-6 rounded-lg border-2 text-center transition-all" style={{ borderColor: bgColor }}>
							<span className="text-white text-lg font-medium">{colorLabels[color].name}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export const MeetTheTeam = ({ hoveredShade }: MeetTheTeamProps) => {
	let selectedEntity = null;
	let selectedShade: RainbowShade | null = null;

	if (hoveredShade) {
		const selectedEntityId = Object.entries(TABLE_CONFIG).find(([_, entity]) => {
			const shade = getEntityRainbowShade(entity.id);
			return shade === hoveredShade;
		})?.[1];

		selectedEntity = selectedEntityId;
		selectedShade = hoveredShade;
	}

	return (
		<div className="relative z-[2] py-16">
			{/* Rainbow Spotlight Effect */}
			<div className="absolute -top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 opacity-50 blur-3xl pointer-events-none z-[3]" style={{ background: "radial-gradient(ellipse at top, rgba(168, 85, 247, 0.5), rgba(59, 130, 246, 0.4), rgba(34, 197, 94, 0.4), rgba(234, 179, 8, 0.4), rgba(249, 115, 22, 0.4), rgba(239, 68, 68, 0.4), transparent 70%)" }} />

			<h2 className="text-4xl md:text-5xl font-bold text-white text-center relative z-[4]">
				{selectedEntity ? `Team: ${selectedEntity.name}` : "Meet the Team"}
			</h2>
			{selectedEntity && selectedShade ? (
				<RainbowIdentity entity={selectedEntity} shade={selectedShade} />
			) : (
				<div
					className="animate-in slide-in-from-bottom-8 fade-in duration-300"
					style={{
						animation: hoveredShade === null ? "slideUp 0.3s ease-out" : "slideDown 0.3s ease-out",
					}}
				>
					<Team />
				</div>
			)}
			<style jsx>{`
				@keyframes slideUp {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				@keyframes slideDown {
					from {
						opacity: 1;
						transform: translateY(0);
					}
					to {
						opacity: 0;
						transform: translateY(20px);
					}
				}
			`}</style>
		</div>
	);
};
