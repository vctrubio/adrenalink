import { rainbowColors } from "@/config/rainbow";

export type RainbowColor = "purple" | "blue" | "green" | "yellow" | "orange" | "red" | "grey";
export type RainbowShade = `${RainbowColor}-${number}`;

interface RainbowProps {
    onShadeHover: (shade: RainbowShade | null) => void;
    hoveredShade: RainbowShade | null;
}

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
    const centerY = 700;
    const baseRadius = 50;
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
        <div className="flex justify-center items-start pt-8 w-full">
            <svg width="1920" height="800" viewBox="0 0 1920 800" className="w-full h-auto max-h-[50vh]" xmlns="http://www.w3.org/2000/svg">
                {allShades.map((shade, index) => {
                    const radius = baseRadius + index * strokeWidth;
                    return createArc(radius, shade, index);
                })}
            </svg>
        </div>
    );
};
