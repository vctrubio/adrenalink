import { Wifi, Radio, ArrowRight, Users, GraduationCap, Shield, CheckCircle2 } from "lucide-react";

export default function SyncPage() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold text-foreground">Live Sync Architecture</h1>
                    <p className="text-xl text-muted-foreground">Real-time event broadcasting across portals</p>
                </div>

                {/* Overview */}
                <div className="bg-card border border-border rounded-xl p-8">
                    <div className="flex items-start gap-4">
                        <Radio className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-3">How Live Sync Works</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Our live sync system uses real-time event broadcasting to ensure that when any user—whether a school admin,
                                teacher, or student—creates, modifies, or cancels an event, all affected parties are instantly notified across
                                their respective portals. No page refreshes, no delays, just instant updates.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Three Portals */}
                <div className="space-y-8">
                    <h2 className="text-3xl font-bold text-foreground text-center">The Three Portals</h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Admin Portal */}
                        <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border border-indigo-500/30 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-indigo-500/20 p-3 rounded-full">
                                    <Shield className="w-6 h-6 text-indigo-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground">School Admin</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                                    <span>Manage all bookings and lessons</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                                    <span>Assign teachers to students</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                                    <span>Create and modify events</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                                    <span>View complete school analytics</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                                    <span>Broadcast changes to all users</span>
                                </li>
                            </ul>
                        </div>

                        {/* Teacher Portal */}
                        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-green-500/20 p-3 rounded-full">
                                    <Users className="w-6 h-6 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground">Teacher Portal</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>View assigned lessons</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Create lesson events</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Confirm lesson hours</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Track commission earnings</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span>Receive instant notifications</span>
                                </li>
                            </ul>
                        </div>

                        {/* Student Portal */}
                        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-yellow-500/20 p-3 rounded-full">
                                    <GraduationCap className="w-6 h-6 text-yellow-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground">Student Portal</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <span>Request booking packages</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <span>View scheduled lessons</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <span>Confirm lesson attendance</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <span>Track remaining hours</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                    <span>Receive real-time updates</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Event Broadcasting Diagram */}
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-8">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-8">Event Broadcasting Flow</h2>

                    <div className="space-y-8">
                        {/* Event Creation */}
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1 bg-card border border-border rounded-xl p-6">
                                <h3 className="text-xl font-semibold text-foreground mb-2">1. Event Creation</h3>
                                <p className="text-muted-foreground text-sm">
                                    A user (admin, teacher, or student) creates or modifies an event in their portal
                                </p>
                            </div>
                            <ArrowRight className="w-8 h-8 text-muted-foreground rotate-90 md:rotate-0" />
                            <div className="flex-1 bg-card border border-border rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Radio className="w-5 h-5 text-primary" />
                                    <h3 className="text-xl font-semibold text-foreground">2. Event Broadcast</h3>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    The event is immediately broadcast to our real-time event system
                                </p>
                            </div>
                        </div>

                        {/* Event Processing */}
                        <div className="flex justify-center">
                            <div className="bg-primary/20 border-2 border-primary rounded-xl p-6 max-w-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <Wifi className="w-6 h-6 text-primary" />
                                    <h3 className="text-xl font-semibold text-foreground">Live Sync Engine</h3>
                                </div>
                                <p className="text-muted-foreground text-sm mb-4">
                                    The sync engine processes the event and determines which users need to be notified based on:
                                </p>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-2" />
                                        <span>User roles and permissions</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-2" />
                                        <span>Related entities (teacher, student, booking, equipment)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-2" />
                                        <span>Event type (creation, modification, cancellation)</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Distribution */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
                                <Shield className="w-6 h-6 text-indigo-500 mb-3" />
                                <h4 className="font-semibold text-foreground mb-2">Admin Portal</h4>
                                <p className="text-sm text-muted-foreground">Receives all event updates for oversight and management</p>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                                <Users className="w-6 h-6 text-green-500 mb-3" />
                                <h4 className="font-semibold text-foreground mb-2">Teacher Portal</h4>
                                <p className="text-sm text-muted-foreground">Notified of events related to their assigned lessons</p>
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                                <GraduationCap className="w-6 h-6 text-yellow-500 mb-3" />
                                <h4 className="font-semibold text-foreground mb-2">Student Portal</h4>
                                <p className="text-sm text-muted-foreground">Notified of events related to their bookings</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Example Scenarios */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-foreground text-center">Real-World Scenarios</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Scenario 1 */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="text-xl font-semibold text-foreground mb-3">Teacher Creates a Lesson Event</h3>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-start gap-3">
                                    <div className="bg-green-500/20 text-green-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                                    <p>Teacher logs into their portal and creates a new lesson event for tomorrow at 10am</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                                    <p>The event is broadcast through the live sync engine</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-yellow-500/20 text-yellow-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                                    <p>Student instantly sees the new lesson appear in their schedule</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-indigo-500/20 text-indigo-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</div>
                                    <p>Admin receives notification and can monitor from the dashboard</p>
                                </div>
                            </div>
                        </div>

                        {/* Scenario 2 */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="text-xl font-semibold text-foreground mb-3">Admin Cancels a Lesson</h3>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-start gap-3">
                                    <div className="bg-indigo-500/20 text-indigo-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                                    <p>Admin cancels a scheduled lesson due to weather conditions</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                                    <p>Cancellation event is immediately broadcast to all related parties</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-green-500/20 text-green-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                                    <p>Teacher sees the cancellation in real-time and updates their schedule</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-yellow-500/20 text-yellow-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</div>
                                    <p>Student receives instant notification and can reschedule</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefits */}
                <div className="bg-card border border-border rounded-xl p-8">
                    <h2 className="text-3xl font-bold text-foreground mb-6">Why Live Sync Matters</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Wifi className="w-8 h-8 text-blue-500" />
                            <h3 className="text-xl font-semibold text-foreground">Zero Delays</h3>
                            <p className="text-muted-foreground">
                                Updates appear instantly. No need to refresh pages or wait for emails.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                            <h3 className="text-xl font-semibold text-foreground">No Miscommunication</h3>
                            <p className="text-muted-foreground">
                                Everyone sees the same information at the same time. No confusion.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Users className="w-8 h-8 text-purple-500" />
                            <h3 className="text-xl font-semibold text-foreground">Better Coordination</h3>
                            <p className="text-muted-foreground">
                                Teachers and students stay perfectly synchronized with school operations.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
