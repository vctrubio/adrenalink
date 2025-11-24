import ColorsDemo from "../../../components/colors-demo";
import { RAINBOW_ENTITIES, RAINBOW_COLORS } from "../../../../config/rainbow-entities";

const COLOR_LABELS: Record<string, { name: string }> = {
    purple: { name: "Purple" },
    blue: { name: "Blue" },
    green: { name: "Green" },
    yellow: { name: "Yellow" },
    orange: { name: "Orange" },
    red: { name: "Red" },
    grey: { name: "Grey" },
};

const COLOR_STYLES: Record<string, { bg: string; text: string }> = {
    purple: { bg: "bg-purple-500", text: "text-purple-500" },
    blue: { bg: "bg-blue-500", text: "text-blue-500" },
    green: { bg: "bg-green-500", text: "text-green-500" },
    yellow: { bg: "bg-yellow-500", text: "text-yellow-500" },
    orange: { bg: "bg-orange-500", text: "text-orange-500" },
    red: { bg: "bg-red-500", text: "text-red-500" },
    grey: { bg: "bg-gray-500", text: "text-gray-500" },
};

export default function ColorsPage() {
    // Group entities by base color
    const rainbowGroups: Record<string, typeof RAINBOW_ENTITIES> = {
        purple: [],
        blue: [],
        green: [],
        yellow: [],
        orange: [],
        red: [],
        grey: [],
    };

    RAINBOW_ENTITIES.forEach((entity) => {
        const baseColor = entity.shadeId.split("-")[0];
        if (rainbowGroups[baseColor]) {
            rainbowGroups[baseColor].push(entity);
        }
    });

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
                    {Object.entries(rainbowGroups).map(([color, entities]) => {
                        if (entities.length === 0) return null;

                        const colorInfo = COLOR_LABELS[color];
                        const colorStyle = COLOR_STYLES[color];
                        const firstShade = entities[0]?.shadeId;
                        const hexColor = firstShade ? RAINBOW_COLORS[firstShade]?.fill : "#000000";

                        return (
                            <div
                                key={color}
                                className="bg-card border border-border rounded-xl overflow-hidden"
                            >
                                {/* Header */}
                                <div className={`${colorStyle.bg} p-4 text-white`}>
                                    <h3 className="text-lg font-bold">{colorInfo.name}</h3>
                                    <p className="text-xs opacity-90 mt-1">{hexColor}</p>
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
                                                    <p className="text-xs text-muted-foreground">{entity.shadeId}</p>
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
