import { Search, Filter, Calendar, TrendingUp, DollarSign, Users, Package, Zap } from "lucide-react";

export default function RevenuePage() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-5xl font-bold text-foreground">Revenue Statistics</h1>
                        <p className="text-xl text-muted-foreground mt-2">Real-time analytics dashboard</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">Last 30 Days</span>
                        </button>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search all entities..."
                                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        <button className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium">
                            All Entities
                        </button>
                        <button className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium">
                            Students
                        </button>
                        <button className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium">
                            Teachers
                        </button>
                        <button className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium">
                            Bookings
                        </button>
                        <button className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium">
                            Equipment
                        </button>
                        <button className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium">
                            Payments
                        </button>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <DollarSign className="w-8 h-8 text-green-500" />
                            <span className="text-xs font-medium text-green-500 bg-green-500/20 px-2 py-1 rounded">+12.5%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">$24,580</h3>
                        <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Users className="w-8 h-8 text-blue-500" />
                            <span className="text-xs font-medium text-blue-500 bg-blue-500/20 px-2 py-1 rounded">+8.2%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">342</h3>
                        <p className="text-sm text-muted-foreground mt-1">Active Students</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Zap className="w-8 h-8 text-purple-500" />
                            <span className="text-xs font-medium text-purple-500 bg-purple-500/20 px-2 py-1 rounded">+15.3%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">1,248</h3>
                        <p className="text-sm text-muted-foreground mt-1">Lessons Completed</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Package className="w-8 h-8 text-orange-500" />
                            <span className="text-xs font-medium text-orange-500 bg-orange-500/20 px-2 py-1 rounded">+5.7%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">89</h3>
                        <p className="text-sm text-muted-foreground mt-1">Active Bookings</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Revenue Chart Placeholder */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-foreground">Revenue Trend</h3>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center border border-dashed border-border">
                            <p className="text-muted-foreground">Chart visualization area</p>
                        </div>
                    </div>

                    {/* Bookings Chart Placeholder */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-foreground">Booking Distribution</h3>
                            <Package className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center border border-dashed border-border">
                            <p className="text-muted-foreground">Chart visualization area</p>
                        </div>
                    </div>
                </div>

                {/* Entity Tables */}
                <div className="space-y-6">
                    {/* Top Students */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-4">Top Students by Hours</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total Hours</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bookings</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-border hover:bg-muted/20 transition-colors">
                                        <td className="py-3 px-4 text-sm text-foreground">Sample Student 1</td>
                                        <td className="py-3 px-4 text-sm text-foreground">45.5</td>
                                        <td className="py-3 px-4 text-sm text-foreground">3</td>
                                        <td className="py-3 px-4 text-sm text-foreground">$2,275</td>
                                        <td className="py-3 px-4"><span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">Active</span></td>
                                    </tr>
                                    <tr className="border-b border-border hover:bg-muted/20 transition-colors">
                                        <td className="py-3 px-4 text-sm text-foreground">Sample Student 2</td>
                                        <td className="py-3 px-4 text-sm text-foreground">38.0</td>
                                        <td className="py-3 px-4 text-sm text-foreground">2</td>
                                        <td className="py-3 px-4 text-sm text-foreground">$1,900</td>
                                        <td className="py-3 px-4"><span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">Active</span></td>
                                    </tr>
                                    <tr className="hover:bg-muted/20 transition-colors">
                                        <td className="py-3 px-4 text-sm text-foreground">Sample Student 3</td>
                                        <td className="py-3 px-4 text-sm text-foreground">32.5</td>
                                        <td className="py-3 px-4 text-sm text-foreground">2</td>
                                        <td className="py-3 px-4 text-sm text-foreground">$1,625</td>
                                        <td className="py-3 px-4"><span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">Active</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Equipment Usage */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-4">Equipment Usage</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Equipment</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Flight Hours</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Condition</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-border hover:bg-muted/20 transition-colors">
                                        <td className="py-3 px-4 text-sm text-foreground">Kite Pro 12m</td>
                                        <td className="py-3 px-4 text-sm text-foreground">Kite</td>
                                        <td className="py-3 px-4 text-sm text-foreground">245.5</td>
                                        <td className="py-3 px-4 text-sm text-foreground">Good</td>
                                        <td className="py-3 px-4"><span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">Available</span></td>
                                    </tr>
                                    <tr className="border-b border-border hover:bg-muted/20 transition-colors">
                                        <td className="py-3 px-4 text-sm text-foreground">Wing Rider 5m</td>
                                        <td className="py-3 px-4 text-sm text-foreground">Wing</td>
                                        <td className="py-3 px-4 text-sm text-foreground">198.0</td>
                                        <td className="py-3 px-4 text-sm text-foreground">Excellent</td>
                                        <td className="py-3 px-4"><span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">Available</span></td>
                                    </tr>
                                    <tr className="hover:bg-muted/20 transition-colors">
                                        <td className="py-3 px-4 text-sm text-foreground">Windsurf XL</td>
                                        <td className="py-3 px-4 text-sm text-foreground">Windsurf</td>
                                        <td className="py-3 px-4 text-sm text-foreground">312.5</td>
                                        <td className="py-3 px-4 text-sm text-foreground">Fair</td>
                                        <td className="py-3 px-4"><span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded">In Use</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Feature Highlights */}
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Dashboard Features</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Filter className="w-8 h-8 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Advanced Filtering</h3>
                            <p className="text-sm text-muted-foreground">
                                Filter by date ranges, entity types, status, and custom criteria
                            </p>
                        </div>
                        <div className="space-y-2">
                            <TrendingUp className="w-8 h-8 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Real-time Updates</h3>
                            <p className="text-sm text-muted-foreground">
                                Live data synchronization across all metrics and reports
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Search className="w-8 h-8 text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Universal Search</h3>
                            <p className="text-sm text-muted-foreground">
                                Search across all entities with instant results and suggestions
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
