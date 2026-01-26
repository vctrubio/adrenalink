import { LeftIcons, RightIcons } from "./NavAdrBarIcons";

export async function LeftIconsServer({ credentials }: { credentials: any }) {
    return <LeftIcons credentials={credentials} />;
}

export async function RightIconsServer({ credentials }: { credentials: any }) {
    return <RightIcons credentials={credentials} />;
}
