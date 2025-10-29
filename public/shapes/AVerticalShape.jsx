import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

export default function AVerticalShape() {
  return (
    <div className="mx-auto w-fit flex flex-col items-center">
      <AdranlinkIcon size={64} className="text-primary" />
      <div className="transform scale-y-[-1]">
        <AdranlinkIcon size={64} className="text-primary" />
      </div>
    </div>
  );
}
