import { getSchoolHeader } from "@/types/headers";
import { LeftIcons, RightIcons } from "./NavAdrBarIcons";

export async function LeftIconsServer() {
    const credentials = await getSchoolHeader();
    return <LeftIcons credentials={credentials} />;
}

export async function RightIconsServer() {
    const credentials = await getSchoolHeader();
    return <RightIcons credentials={credentials} />;
}
