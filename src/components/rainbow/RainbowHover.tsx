"use client";

import { useState, useEffect } from "react";
import type { RainbowShade } from "@/types/rainbow-types";
import { TABLE_CONFIG } from "@/config/tables";
import { RAINBOW_COLORS, RAINBOW_ENTITIES } from "@/config/rainbow-entities";

interface RainbowHoverProps {
	hoveredShade: RainbowShade | null;
}

interface MousePosition {
	x: number;
	y: number;
}

const RainbowTag = ({ entity, shade }: { entity: (typeof TABLE_CONFIG)[0]; shade: RainbowShade }) => {
	const shadeColor = RAINBOW_COLORS[shade];

	return (
		<div
			className="flex items-center gap-2 px-3 py-1 rounded-md border-2 transition-all"
			style={{
				borderColor: shadeColor.fill,
				backgroundColor: "transparent",
			}}
		>
			<entity.icon className={`w-4 h-4 ${entity.color}`} />
			<span className="text-xs font-medium text-white">{entity.name}</span>
		</div>
	);
};

const RainbowHoverHead = ({ hoveredShade, bgColor }: { hoveredShade: RainbowShade; bgColor: string }) => {
	const entity = RAINBOW_ENTITIES.find((e) => e.shadeId === hoveredShade);

	return (
		<div
			className="px-6 py-4 flex items-center gap-3 border-b border-white/10"
			style={{
				background: `${bgColor}15`,
			}}
		>
			<div
				className="w-10 h-10 rounded-full flex items-center justify-center"
				style={{
					background: bgColor,
				}}
			>
				<div
					className="w-6 h-6 rounded-full"
					style={{
						background: `${bgColor}40`,
					}}
				/>
			</div>
			<div>
				<h3 className="text-sm font-semibold text-white">{entity?.name}</h3>
				<p className="text-xs text-white/60">{hoveredShade}</p>
			</div>
		</div>
	);
};

const RainbowHoverBody = ({ hoveredShade }: { hoveredShade: RainbowShade }) => {
	const entity = RAINBOW_ENTITIES.find((e) => e.shadeId === hoveredShade);
	const Description = entity?.description;

	return (
		<div className="px-6 py-4 border-b border-white/10">
			{Description && <Description />}
		</div>
	);
};

const RainbowHoverTags = ({ hoveredShade }: { hoveredShade: RainbowShade }) => {
	const baseColor = hoveredShade.split("-")[0];
	const entitiesForColor = TABLE_CONFIG.filter((entity) => {
		const rainbowEntity = RAINBOW_ENTITIES.find((e) => e.id === entity.id);
		return rainbowEntity?.shadeId.split("-")[0] === baseColor;
	});

	return (
		<div className="px-6 py-4 flex flex-wrap gap-2">
			{entitiesForColor.map((entity) => {
				const rainbowEntity = RAINBOW_ENTITIES.find((e) => e.id === entity.id);
				return rainbowEntity ? <RainbowTag key={entity.id} entity={entity} shade={rainbowEntity.shadeId as RainbowShade} /> : null;
			})}
		</div>
	);
};

export const RainbowHover = ({ hoveredShade }: RainbowHoverProps) => {
	const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			setMousePos({ x: e.clientX, y: e.clientY });
		};

		if (hoveredShade) {
			window.addEventListener("mousemove", handleMouseMove);
			return () => window.removeEventListener("mousemove", handleMouseMove);
		}
	}, [hoveredShade]);

	if (!hoveredShade) return null;

	const bgColor = RAINBOW_COLORS[hoveredShade].fill;

	return (
		<div
			className="fixed z-50 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden shadow-2xl max-w-sm transition-transform duration-100 fade-in pointer-events-none"
			style={{
				background: "rgba(15, 23, 42, 0.95)",
				left: "0",
				top: "0",
				transform: `translate(${mousePos.x + 12}px, ${mousePos.y + 12}px)`,
			}}
		>
			<RainbowHoverHead hoveredShade={hoveredShade} bgColor={bgColor} />
			<RainbowHoverBody hoveredShade={hoveredShade} />
			<RainbowHoverTags hoveredShade={hoveredShade} />
		</div>
	);
};
