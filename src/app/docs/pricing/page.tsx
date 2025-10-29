// Sub-component for pricing tiers
function PricingTier({ name, price, features, borderColor }: { name: string; price: string; features: string[]; borderColor: string }) {
    return (
        <div className="p-6 rounded-lg border-2 bg-card/80 backdrop-blur-md" style={{ borderColor }}>
            <h3 className="text-2xl font-bold mb-2 text-white">{name}</h3>
            <p className="text-3xl font-bold mb-4 text-white">{price}</p>
            <ul className="space-y-2">
                {features.map((feature, index) => (
                    <li key={index} className="text-sm text-white/90">
                        • {feature}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function PricingPage() {
    return (
        <div className="min-h-screen relative">
            {/* Background 3 Tiers Image */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: "url(/kritaps_ungurs_unplash/3tiers.jpg)",
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

            <div className="relative z-[2] max-w-6xl mx-auto space-y-12 py-8">
            {/* Onboarding Section */}
            <section>
                <h1 className="text-4xl font-bold mb-6 text-white drop-shadow-lg">Onboarding</h1>
                <div className="space-y-4 text-lg text-white/90">
                    <p>• 1 week of 1-on-1s to answer any questions before launch</p>
                    <p>• Use of the app to integrate in your school</p>
                    <p>• 60 days free trial to see your satisfaction</p>
                </div>
            </section>

            {/* Pricing Section */}
            <section>
                <h2 className="text-3xl font-bold mb-6 text-white drop-shadow-lg">Pricing</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <PricingTier
                        name="Blue"
                        price="50€/month"
                        features={["Cap of 3 teachers", "Unlimited lessons"]}
                        borderColor="rgb(59, 130, 246)"
                    />
                    <PricingTier
                        name="Silver"
                        price="100€/month"
                        features={["Unlimited teachers", "Unlimited lessons", "Rentals"]}
                        borderColor="rgb(192, 192, 192)"
                    />
                    <PricingTier
                        name="Gold"
                        price="200€/month"
                        features={["Everything from Silver", "Equipment tracking"]}
                        borderColor="rgb(255, 215, 0)"
                    />
                </div>
            </section>
            </div>
        </div>
    );
}
