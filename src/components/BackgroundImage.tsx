import Image from "next/image";

interface BackgroundImageProps {
  src: string;
  position?: "fixed" | "absolute" | "relative";
  overlay?: string;
  priority?: boolean;
  transform?: string;
}

export const BackgroundImage = ({
  src,
  position = "fixed",
  overlay,
  priority = true,
  transform,
}: BackgroundImageProps) => {
  const positionClass = position === "fixed" ? "fixed" : position === "absolute" ? "absolute" : "relative";

  return (
    <>
      {/* Background Image */}
      <div
        className={`inset-0 z-0 pointer-events-none ${positionClass}`}
        style={transform ? { transform } : undefined}
      >
        <Image
          src={src}
          alt="Background"
          fill
          priority={priority}
          quality={85}
          className="object-cover"
        />
      </div>

      {/* Gradient Overlay */}
      {overlay && (
        <div
          className={`inset-0 z-[1] pointer-events-none ${positionClass}`}
          style={{ background: overlay }}
        />
      )}
    </>
  );
};
