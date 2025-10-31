import type { RainbowShade } from "@/app/(playground)/rainbow/Rainbow";

export const entityToRainbowColor: Record<string, RainbowShade | null> = {
    equipment: "purple-0",
    repairs: "purple-1",
    booking: "blue-0",
    lesson: "blue-1",
    event: "blue-2",
    teacher: "green-0",
    commission: "green-1",
    student: "yellow-0",
    studentPackage: "orange-0",
    schoolPackage: "orange-1",
    rental: "red-0",
    school: "grey-0",
    referral: "grey-1",
};
