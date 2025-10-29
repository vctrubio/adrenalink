import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

export default function ADoubleShape() {
    return (
        <div className="mx-auto w-fit relative" style={{ width: "64px", height: "64px" }}>
            <div className="absolute inset-0">
                <AdranlinkIcon size={64} className="text-primary" />
            </div>
            <div className="absolute inset-0 transform scale-y-[-1] translate-y-1">
                <AdranlinkIcon size={64} className="text-primary opacity-70" />
            </div>
        </div>
    );
}
