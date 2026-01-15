import Image from "next/image";

interface BackgroundImageProps {
    src: string;
    position?: "fixed" | "absolute" | "relative";
    overlay?: string;
    priority?: boolean;
    transform?: string;
}

const BLUR_DATA_URL =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Crect fill='%231e1b4b' width='1200' height='800'/%3E%3C/svg%3E";

export const BackgroundImage = ({ src, position = "fixed", overlay, priority = true, transform }: BackgroundImageProps) => {
    const positionClass = position === "fixed" ? "fixed" : position === "absolute" ? "absolute" : "relative";

    return (
        <div className={`inset-0 z-0 pointer-events-none ${positionClass}`} style={transform ? { transform } : undefined}>
            {/* Background Image */}
            <Image
                src={src}
                alt="Background"
                fill
                priority={priority}
                quality={85}
                sizes="100vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover"
                fetchPriority={priority ? "high" : "auto"}
                loading={priority ? "eager" : "lazy"}
            />

            {/* Overlay using CSS pseudo-element */}
            {overlay && <div className="absolute inset-0 pointer-events-none" style={{ background: overlay }} />}
        </div>
    );
};
