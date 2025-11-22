import { RAINBOW_COLORS } from "@/config/rainbow-entities";

const allShades = Object.keys(RAINBOW_COLORS);

export const Rainbow = ({ onShadeHover, hoveredShade }: { onShadeHover: (shade: string | null) => void; hoveredShade: string | null }) => {
  const centerX = 960;
  const centerY = 700;
  const baseRadius = 50;
  const strokeWidth = 50;

  const createArc = (radius: number, shade: string, index: number) => {
    const isHovered = hoveredShade === shade;
    const shadeColor = RAINBOW_COLORS[shade];
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
