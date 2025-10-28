import { Target, Users, Shield, Zap, TrendingUp, Layout } from "lucide-react";

export default function VisionPage() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold text-foreground">Our Vision</h1>
                    <p className="text-xl text-muted-foreground">Next Generation School Management</p>
                </div>

                {/* Mission Statement */}
                <div className="bg-card border border-border rounded-xl p-8 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Target className="w-8 h-8 text-primary" />
                        <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        To create a next-generation school lesson and rental application that revolutionizes how kitesurfing schools operate.
                        Built by kitesurfers, for kitesurfers, we deliver live-sync planning between teachers and students, powerful revenue
                        statistics, and intelligent lesson automation—all while keeping your data secure and protected.
                    </p>
                </div>

                {/* Key Features Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Live Sync Planning */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-3 hover:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                            <Zap className="w-6 h-6 text-yellow-500" />
                            <h3 className="text-2xl font-semibold text-foreground">Live Sync Planning</h3>
                        </div>
                        <p className="text-muted-foreground">
                            Real-time synchronization between teachers and students. When a lesson is created, modified, or cancelled,
                            all parties are instantly notified. No more miscommunication or double bookings.
                        </p>
                    </div>

                    {/* Revenue Statistics Machine */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-3 hover:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-6 h-6 text-green-500" />
                            <h3 className="text-2xl font-semibold text-foreground">Revenue Statistics Machine</h3>
                        </div>
                        <p className="text-muted-foreground">
                            Comprehensive analytics tracking every aspect of your business. Monitor equipment usage, teacher commissions,
                            student bookings, and overall profitability with powerful filtering and visualization tools.
                        </p>
                    </div>

                    {/* Lesson Automation */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-3 hover:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                            <Zap className="w-6 h-6 text-blue-500" />
                            <h3 className="text-2xl font-semibold text-foreground">Lesson Automation</h3>
                        </div>
                        <p className="text-muted-foreground">
                            From student request to lesson completion in just 2 clicks. Automatically calculate teacher commissions,
                            student pricing, equipment tracking, and hour confirmations. Save hours of administrative work every week.
                        </p>
                    </div>

                    {/* Data Protection */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-3 hover:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-purple-500" />
                            <h3 className="text-2xl font-semibold text-foreground">Protected Data</h3>
                        </div>
                        <p className="text-muted-foreground">
                            Your data security is our priority. Enterprise-grade encryption, role-based access control, and regular
                            backups ensure your school information remains safe and private.
                        </p>
                    </div>
                </div>

                {/* Classboard Feature */}
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-8 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Layout className="w-8 h-8 text-primary" />
                        <h2 className="text-3xl font-bold text-foreground">Classboard</h2>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Our flagship feature: an intuitive visual dashboard where you can easily create, modify, and manage events in real-time.
                        Think of it as your mission control—see all upcoming lessons, available equipment, teacher schedules, and student bookings
                        at a glance. Drag and drop to reschedule, click to edit details, and watch as changes sync instantly across all portals.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-card/50 rounded-lg p-4">
                            <h4 className="font-semibold text-foreground mb-2">Quick Creation</h4>
                            <p className="text-sm text-muted-foreground">Create lessons in seconds with smart defaults and templates</p>
                        </div>
                        <div className="bg-card/50 rounded-lg p-4">
                            <h4 className="font-semibold text-foreground mb-2">Visual Management</h4>
                            <p className="text-sm text-muted-foreground">Intuitive drag-and-drop interface for easy scheduling</p>
                        </div>
                        <div className="bg-card/50 rounded-lg p-4">
                            <h4 className="font-semibold text-foreground mb-2">Real-time Updates</h4>
                            <p className="text-sm text-muted-foreground">Instant synchronization across all user portals</p>
                        </div>
                    </div>
                </div>

                {/* Who We Are */}
                <div className="bg-card border border-border rounded-xl p-8 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Users className="w-8 h-8 text-cyan-500" />
                        <h2 className="text-3xl font-bold text-foreground">Built by Kitesurfers</h2>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        We are a group of passionate kitesurfers who understand the unique challenges of running a kitesurfing school.
                        We have experienced the pain points firsthand: managing equipment wear and tear, coordinating schedules with unpredictable
                        weather, tracking student progress, and ensuring fair teacher compensation. That is why we built Adrenalink—a solution
                        designed by the community, for the community.
                    </p>
                </div>
            </div>
        </div>
    );
}
