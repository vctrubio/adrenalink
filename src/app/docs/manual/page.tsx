export default function ManualPage() {
    return (
        <div className="min-h-screen relative flex items-center justify-center">
            {/* Background Boat Image */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: "url(/kritaps_ungurs_unplash/boat.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

            {/* Gradient Overlay */}
            <div
                className="fixed inset-0 z-[1]"
                style={{
                    background: "linear-gradient(to bottom, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.5) 50%, rgba(15, 23, 42, 0.85) 100%)",
                }}
            />

            {/* Content Card */}
            <div className="relative z-[2] p-8 rounded-lg border border-secondary/60 bg-card/80 backdrop-blur-md shadow-xl max-w-2xl mx-4">
                <h1 className="text-4xl font-bold text-center text-white drop-shadow-lg">hello manual page</h1>
            </div>
        </div>
    );
}
