"use client";

import { colorLabels, rainbowBaseColors } from "@/config/rainbow";
import { RainbowShade, getBaseColor, getShadeColor } from "./Rainbow";

interface RainbowIdentityProps {
	entity: {
		id: string;
		name: string;
		icon: React.ComponentType<{ className?: string }>;
		color: string;
	};
	shade: RainbowShade;
}

export const RainbowIdentity = ({ entity, shade }: RainbowIdentityProps) => {
	const baseColor = getBaseColor(shade);
	const shadeColor = getShadeColor(shade);
	const colorInfo = colorLabels[baseColor];
	const bgColor = rainbowBaseColors[baseColor].fill;
	const Icon = entity.icon;

	return (
		<div className="max-w-md mx-auto mt-8 animate-in slide-in-from-bottom-8 fade-in duration-500">
			{/* ID Card */}
			<div className="relative rounded-2xl overflow-hidden border-2 shadow-2xl backdrop-blur-xl" style={{ borderColor: bgColor, boxShadow: `0 20px 60px ${bgColor}40, 0 0 0 4px ${bgColor}20` }}>
				{/* Card Header - Color Stripe */}
				<div className="h-3" style={{ background: `linear-gradient(90deg, ${bgColor}, ${shadeColor.fill})` }} />

				{/* Card Body */}
				<div className="p-8 bg-black/60">
					{/* Top Section - Icon and Name */}
					<div className="flex items-center gap-6 mb-6">
						<div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: `${bgColor}20`, border: `3px solid ${bgColor}` }}>
							<Icon className={`w-10 h-10 ${entity.color}`} />
						</div>
						<div>
							<div className="text-xs uppercase tracking-wider text-white/60 mb-1">Entity</div>
							<h3 className="text-3xl font-bold text-white">{entity.name}</h3>
						</div>
					</div>

					{/* Divider */}
					<div className="h-px my-6" style={{ background: `linear-gradient(90deg, transparent, ${bgColor}60, transparent)` }} />

					{/* Team Section */}
					<div className="mb-6">
						<div className="text-xs uppercase tracking-wider text-white/60 mb-2">Team</div>
						<div className="inline-block px-4 py-2 rounded-full font-semibold text-white text-sm" style={{ backgroundColor: bgColor }}>
							{colorInfo.name}
						</div>
					</div>

					{/* Description Section */}
					<div className="mb-6">
						<div className="text-xs uppercase tracking-wider text-white/60 mb-2">Description</div>
						<p className="text-white/90 leading-relaxed">{colorInfo.description}</p>
					</div>

					{/* Badge Section */}
					<div>
						<div className="text-xs uppercase tracking-wider text-white/60 mb-2">Identity Badge</div>
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all" style={{ borderColor: shadeColor.fill, backgroundColor: `${shadeColor.fill}20` }}>
							<Icon className="w-5 h-5" style={{ color: shadeColor.fill }} />
							<span className="text-white font-medium">{entity.name}</span>
							<span className="text-xs px-2 py-1 rounded bg-white/10 text-white/80 font-mono">{shade}</span>
						</div>
					</div>
				</div>

				{/* Card Footer - Gradient Bar */}
				<div className="h-2" style={{ background: `linear-gradient(90deg, ${shadeColor.fill}, ${bgColor})` }} />
			</div>
		</div>
	);
};
