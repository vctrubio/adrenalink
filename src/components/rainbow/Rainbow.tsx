import { RainbowHover } from "./RainbowHover";

export type RainbowColor = "purple" | "blue" | "green" | "yellow" | "orange" | "red" | "grey";
export type RainbowShade = `${RainbowColor}-${number}`;

interface RainbowProps {
    onShadeHover: (shade: RainbowShade | null) => void;
    hoveredShade: RainbowShade | null;
}

export const rainbowColors: Record<RainbowShade, { fill: string; hoverFill: string }> = {
    "purple-0": { fill: "#a855f7", hoverFill: "#d946ef" },
    "purple-1": { fill: "#c084fc", hoverFill: "#e879f9" },
    "blue-0": { fill: "#3b82f6", hoverFill: "#1d4ed8" },
    "blue-1": { fill: "#60a5fa", hoverFill: "#93c5fd" },
    "blue-2": { fill: "#93c5fd", hoverFill: "#3b82f6" },
    "green-0": { fill: "#22c55e", hoverFill: "#16a34a" },
    "green-1": { fill: "#4ade80", hoverFill: "#22c55e" },
    "yellow-0": { fill: "#eab308", hoverFill: "#ca8a04" },
    "orange-0": { fill: "#f97316", hoverFill: "#ea580c" },
    "orange-1": { fill: "#fb923c", hoverFill: "#f97316" },
    "red-0": { fill: "#ef4444", hoverFill: "#dc2626" },
    "grey-0": { fill: "#6b7280", hoverFill: "#4b5563" },
    "grey-1": { fill: "#9ca3af", hoverFill: "#6b7280" },
};

export const getBaseColor = (shade: RainbowShade): RainbowColor => {
    const [color] = shade.split("-") as [RainbowColor];
    return color;
};

export const getShadeColor = (shade: RainbowShade | null): { fill: string; hoverFill: string } => {
    return shade && rainbowColors[shade] ? rainbowColors[shade] : rainbowColors["grey-0"];
};

const allShades: RainbowShade[] = ["purple-0", "purple-1", "blue-0", "blue-1", "blue-2", "green-0", "green-1", "yellow-0", "orange-0", "orange-1", "red-0", "grey-0", "grey-1"];

export const Rainbow = ({ onShadeHover, hoveredShade }: RainbowProps) => {
    const centerX = 960;
    const centerY = 1000;
    const baseRadius = 200;
    const strokeWidth = 50;

    const createArc = (radius: number, shade: RainbowShade, index: number) => {
        const isHovered = hoveredShade === shade;
        const shadeColor = rainbowColors[shade];
        const fillColor = isHovered ? shadeColor.hoverFill : shadeColor.fill;

        return (
            <path
                key={shade}
                d={`M ${centerX - radius},${centerY} A ${radius},${radius} 0 0,1 ${centerX + radius},${centerY}`}
                fill="none"
                stroke={fillColor}
                strokeWidth={strokeWidth}
                className="transition-all duration-300 cursor-pointer"
                style={{
                    filter: isHovered ? `drop-shadow(0 0 12px ${fillColor})` : "none",
                    opacity: hoveredShade && !isHovered ? 0.5 : 1,
                }}
                onMouseEnter={() => onShadeHover(shade)}
                onMouseLeave={() => onShadeHover(null)}
            />
        );
    };

    return (
        <>
            <div className="flex justify-center items-start py-12 w-full">
                <svg width="1920" height="1200" viewBox="0 0 1920 1200" className="w-full h-auto border" xmlns="http://www.w3.org/2000/svg">
                    {allShades.map((shade, index) => {
                        const radius = baseRadius + index * strokeWidth;
                        return createArc(radius, shade, index);
                    })}
                </svg>
            </div>
            <RainbowHover hoveredShade={hoveredShade} />
        </>
    );
};
