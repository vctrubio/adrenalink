import { ArrowRight, CheckCircle2, DollarSign, Users, Calendar, Package } from "lucide-react";

export default function AutomationPage() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold text-foreground">Lesson Automation</h1>
                    <p className="text-xl text-muted-foreground">From Student Request to Payment in 2 Clicks</p>
                </div>

                {/* Overview */}
                <div className="bg-card border border-border rounded-xl p-8">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Our automation system transforms the entire lesson lifecycle—from initial booking request to final payment—into
                        a seamless, automated process. What used to take hours of manual coordination now happens automatically, with
                        every detail tracked and every calculation precise.
                    </p>
                </div>

                {/* The Workflow */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-8">The 2-Click Workflow</h2>

                    {/* Step 1: Student Request */}
                    <div className="relative">
                        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-yellow-500/20 p-3 rounded-full">
                                    <Package className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-semibold text-foreground mb-2">Step 1: Student Requests a Package</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Students browse available packages on your school subdomain and submit a booking request.
                                        The system captures all necessary details: preferred dates, skill level, and special requirements.
                                    </p>
                                    <div className="bg-card/50 rounded-lg p-4 space-y-2">
                                        <p className="text-sm text-muted-foreground"><strong>What gets captured:</strong></p>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                            <li>Student information and contact details</li>
                                            <li>Selected package (hours, equipment type, pricing)</li>
                                            <li>Preferred dates and time slots</li>
                                            <li>Current skill level and learning goals</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center my-4">
                            <ArrowRight className="w-8 h-8 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Step 2: Admin Accepts Booking */}
                    <div className="relative">
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-500/20 p-3 rounded-full">
                                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-semibold text-foreground mb-2">Click 1: Accept the Booking</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Admin reviews the request and clicks accept. The system verifies availability and creates a confirmed booking
                                        with all package details locked in.
                                    </p>
                                    <div className="bg-card/50 rounded-lg p-4 space-y-2">
                                        <p className="text-sm text-muted-foreground"><strong>What happens automatically:</strong></p>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                            <li>Booking status changes from pending to confirmed</li>
                                            <li>Student receives confirmation notification</li>
                                            <li>Booking period and hours are locked in the system</li>
                                            <li>Equipment availability is reserved</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center my-4">
                            <ArrowRight className="w-8 h-8 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Step 3: Link Teacher via Lesson */}
                    <div className="relative">
                        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-green-500/20 p-3 rounded-full">
                                    <Users className="w-6 h-6 text-green-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-semibold text-foreground mb-2">Click 2: Assign Teacher & Create Lesson</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Admin selects an available teacher and creates the lesson. The system automatically handles all the complex
                                        calculations and relationships.
                                    </p>
                                    <div className="bg-card/50 rounded-lg p-4 space-y-2">
                                        <p className="text-sm text-muted-foreground"><strong>Automatic calculations:</strong></p>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                            <li>Teacher commission rate applied to lesson pricing</li>
                                            <li>Student hourly rate calculated from package</li>
                                            <li>Equipment assigned and tracked for the lesson</li>
                                            <li>Lesson schedule created and synced to all portals</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center my-4">
                            <ArrowRight className="w-8 h-8 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Step 4: Event Tracking */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-purple-500/20 p-3 rounded-full">
                                <Calendar className="w-6 h-6 text-purple-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-semibold text-foreground mb-2">Automatic Event Tracking</h3>
                                <p className="text-muted-foreground mb-4">
                                    Every lesson session becomes an event that automatically tracks all relevant data in real-time.
                                </p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-card/50 rounded-lg p-4">
                                        <h4 className="font-semibold text-foreground mb-2">Teacher Commission</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Automatically calculated based on lesson hours and commission rate
                                        </p>
                                    </div>
                                    <div className="bg-card/50 rounded-lg p-4">
                                        <h4 className="font-semibold text-foreground mb-2">Student Pricing</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Per-hour rate tracked against package total and remaining hours
                                        </p>
                                    </div>
                                    <div className="bg-card/50 rounded-lg p-4">
                                        <h4 className="font-semibold text-foreground mb-2">Equipment Usage</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Flight hours logged for each piece of equipment used
                                        </p>
                                    </div>
                                    <div className="bg-card/50 rounded-lg p-4">
                                        <h4 className="font-semibold text-foreground mb-2">Hour Confirmation</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Both teacher and student confirm actual hours taught
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefits */}
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-8">
                    <h2 className="text-3xl font-bold text-foreground mb-6">Why This Matters</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <DollarSign className="w-8 h-8 text-green-500" />
                            <h3 className="text-xl font-semibold text-foreground">Accurate Financials</h3>
                            <p className="text-muted-foreground">
                                Every cent is tracked automatically. No more manual calculations or payment disputes.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <CheckCircle2 className="w-8 h-8 text-blue-500" />
                            <h3 className="text-xl font-semibold text-foreground">Zero Errors</h3>
                            <p className="text-muted-foreground">
                                Automated workflows eliminate human error in bookings, scheduling, and payments.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Calendar className="w-8 h-8 text-purple-500" />
                            <h3 className="text-xl font-semibold text-foreground">Save Time</h3>
                            <p className="text-muted-foreground">
                                What took hours now takes 2 clicks. Spend more time on the water, less on admin.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
