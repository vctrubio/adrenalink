import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

export default function AHorizontalShape() {
  return (
    <div className="mx-auto w-fit flex items-center">
      <div className="transform -rotate-90">
        <AdranlinkIcon size={64} className="text-primary" />
      </div>
      <div className="transform rotate-90">
        <AdranlinkIcon size={64} className="text-primary" />
      </div>
    </div>
  );
}
