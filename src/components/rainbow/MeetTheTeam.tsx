"use client";

import { getEntityRainbowShade } from "@/config/rainbow";
import { TABLE_CONFIG } from "@/config/tables";
import type { RainbowShade } from "./Rainbow";

interface MeetTheTeamProps {
	hoveredShade: RainbowShade | null;
}

export const MeetTheTeam = ({ hoveredShade }: MeetTheTeamProps) => {
	let selectedEntity = null;

	if (hoveredShade) {
		const selectedEntityId = Object.entries(TABLE_CONFIG).find(([_, entity]) => {
			const shade = getEntityRainbowShade(entity.id);
			return shade === hoveredShade;
		})?.[1];

		selectedEntity = selectedEntityId;
	}

	return (
		<div className="relative z-[2] py-16">
			<h2 className="text-4xl md:text-5xl font-bold text-white text-center">Meet the Team</h2>
			{selectedEntity && (
				<div className="text-center mt-6 text-white">
					<p className="text-xl">Selected: {selectedEntity.id}</p>
				</div>
			)}
		</div>
	);
};
