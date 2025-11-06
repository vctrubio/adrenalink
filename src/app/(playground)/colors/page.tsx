import ColorsDemo from "../../../components/colors-demo";
import { ENTITY_DATA } from "../../../../config/entities";
import { entityToRainbowColor, colorLabels, type RainbowColor } from "../../../../config/rainbow";

export default function ColorsPage() {
    const rainbowGroups: Record<RainbowColor, typeof ENTITY_DATA> = {
        purple: [],
        blue: [],
        green: [],
        yellow: [],
        orange: [],
        red: [],
        grey: [],
    };

    ENTITY_DATA.forEach((entity) => {
        const shade = entityToRainbowColor[entity.id];
        if (shade) {
            const baseColor = shade.split("-")[0] as RainbowColor;
            if (rainbowGroups[baseColor]) {
                rainbowGroups[baseColor].push(entity);
            }
        }
    });

    const colorMapping: Record<RainbowColor, { bg: string; text: string; hex: string }> = {
        purple: { bg: "bg-purple-500", text: "text-purple-500", hex: "#a855f7" },
        blue: { bg: "bg-blue-500", text: "text-blue-500", hex: "#3b82f6" },
        green: { bg: "bg-green-500", text: "text-green-500", hex: "#22c55e" },
        yellow: { bg: "bg-yellow-500", text: "text-yellow-500", hex: "#eab308" },
        orange: { bg: "bg-orange-500", text: "text-orange-500", hex: "#f97316" },
        red: { bg: "bg-red-500", text: "text-red-500", hex: "#ef4444" },
        grey: { bg: "bg-gray-500", text: "text-gray-500", hex: "#6b7280" },
    };

    return (
        <div className="p-8">
            <ColorsDemo />

            {/* Rainbow Entity Color Palette */}
            <div className="w-full max-w-6xl mx-auto mt-12 space-y-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">Rainbow Entity Color Palette</h2>
                    <p className="text-muted-foreground">
                        Entity groups organized by their rainbow color classification
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(Object.keys(rainbowGroups) as RainbowColor[]).map((color) => {
                        const entities = rainbowGroups[color];
                        if (entities.length === 0) return null;

                        const colorInfo = colorLabels[color];
                        const colorStyle = colorMapping[color];

                        return (
                            <div
                                key={color}
                                className="bg-card border border-border rounded-xl overflow-hidden"
                            >
                                {/* Header */}
                                <div className={`${colorStyle.bg} p-4 text-white`}>
                                    <h3 className="text-lg font-bold">{colorInfo.name}</h3>
                                    <p className="text-xs opacity-90 mt-1">{colorStyle.hex}</p>
                                </div>

                                {/* Description */}
                                <div className="p-4 bg-muted/30">
                                    <p className="text-sm text-muted-foreground">{colorInfo.description}</p>
                                </div>

                                {/* Entities */}
                                <div className="p-4 space-y-3">
                                    {entities.map((entity) => {
                                        const Icon = entity.icon;
                                        return (
                                            <div
                                                key={entity.id}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:bg-muted/50 transition-colors"
                                            >
                                                <div className={`p-2 rounded ${colorStyle.bg} bg-opacity-10`}>
                                                    <Icon className={`w-5 h-5 ${colorStyle.text}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground">{entity.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {entity.description[0]}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
