import PillarsMinimal from "@/src/landing/pillars-minimal";
import Link from "next/link";

export default function PillarsPage() {
    return (
        <main className="bg-background min-h-screen">
            <PillarsMinimal />
            
            {/* Guides Action Section */}
            <section className="py-40 flex flex-col items-center gap-12 bg-white border-t border-slate-100">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">Ready to get started?</h2>
                    <p className="text-xl text-slate-500 font-medium">Explore our comprehensive guides for schools and administrations.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Link 
                        href="/csv"
                        className="px-10 py-4 bg-secondary text-white rounded-full font-black uppercase tracking-widest hover:bg-secondary/90 transition-all shadow-xl hover:scale-105 active:scale-95"
                    >
                        Administration Guide
                    </Link>
                    
                    <Link 
                        href="/onboarding"
                        className="px-10 py-4 bg-white text-slate-900 border-2 border-slate-900 rounded-full font-black uppercase tracking-widest hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                    >
                        Onboarding Guide
                    </Link>
                </div>
            </section>
        </main>
    );
}
