import { ENTITY_DATA } from "@/config/entities";

interface BookingLeaderLadderProps {
  leaderName: string;
  accentColor?: string;
}

export function BookingLeaderLadder({ leaderName, accentColor }: BookingLeaderLadderProps) {
  const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
  const StudentIcon = studentEntity.icon;
  const color = accentColor || studentEntity.color;

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color }}
      >
        <StudentIcon className="w-8 h-8" style={{ color: "white" }} />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">{leaderName}</h2>
        <p className="text-xs text-muted-foreground">Leader</p>
      </div>
    </div>
  );
}
