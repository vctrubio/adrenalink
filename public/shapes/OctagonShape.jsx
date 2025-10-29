import OctagonIcon from "@/public/appSvgs/OctagonIcon";

export default function OctagonShape() {
  const sides = ["a", "b", "c", "d", "e", "f", "g", "h"];

  return (
    <div className="mx-auto w-fit relative">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <OctagonIcon size={256} className="text-primary" />
        {sides.map((label, index) => (
          <OctagonLabel key={label} label={label} position={index} />
        ))}
      </div>
    </div>
  );
}

function OctagonLabel({ label, position }) {
  const positions = [
    { top: "-10%", left: "50%", transform: "translateX(-50%)" },
    { top: "5%", right: "-10%", transform: "translate(50%, -50%)" },
    { top: "50%", right: "-10%", transform: "translateY(-50%)" },
    { bottom: "5%", right: "-10%", transform: "translate(50%, 50%)" },
    { bottom: "-10%", left: "50%", transform: "translateX(-50%)" },
    { bottom: "5%", left: "-10%", transform: "translate(-50%, 50%)" },
    { top: "50%", left: "-10%", transform: "translateY(-50%)" },
    { top: "5%", left: "-10%", transform: "translate(-50%, -50%)" }
  ];

  const style = positions[position];

  return (
    <div
      className="absolute w-8 h-8 flex items-center justify-center bg-background border-2 border-primary rounded-full font-semibold"
      style={style}
    >
      {label}
    </div>
  );
}
