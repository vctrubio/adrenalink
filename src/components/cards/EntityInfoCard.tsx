import { Card, CardHeader, CardList } from "@/src/components/ui/card";

interface EntityStat {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | number;
    color: string;
}

interface EntityInfoCardProps {
    entity: {
        id: string;
        name: string;
        icon: React.ComponentType<{ className?: string }>;
        color: string;
        bgColor: string;
    };
    status?: string;
    stats: [EntityStat, EntityStat, EntityStat];
    fields: {
        label: string;
        value: string | number;
    }[];
    accentColor: string;
}

export const EntityInfoCard = ({ entity, status = "Entity", stats, fields, accentColor }: EntityInfoCardProps) => {
    const Icon = entity.icon;

    const avatar = (
        <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
                backgroundColor: `${accentColor}20`,
                border: `3px solid ${accentColor}`,
            }}
        >
            <div style={{ color: entity.color }}>
                <Icon className="w-10 h-10" />
            </div>
        </div>
    );

    return (
        <Card accentColor={accentColor} stats={stats} isActionable={false}>
            <CardHeader name={entity.name} status={status} avatar={avatar} accentColor={accentColor} />
            <CardList fields={fields} />
        </Card>
    );
};
