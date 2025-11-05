export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Hello World</h1>
                <p className="text-muted-foreground">Welcome to the Adrenalink Admin Dashboard</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-lg bg-card border border-border">
                    <h2 className="text-xl font-semibold text-foreground mb-2">Getting Started</h2>
                    <p className="text-sm text-muted-foreground">
                        Explore the sidebar to navigate through different sections of the admin panel.
                    </p>
                </div>

                <div className="p-6 rounded-lg bg-card border border-border">
                    <h2 className="text-xl font-semibold text-foreground mb-2">Search Functionality</h2>
                    <p className="text-sm text-muted-foreground">
                        Use the search bar to quickly find bookings, students, or teachers.
                    </p>
                </div>

                <div className="p-6 rounded-lg bg-card border border-border">
                    <h2 className="text-xl font-semibold text-foreground mb-2">Theme Toggle</h2>
                    <p className="text-sm text-muted-foreground">
                        Switch between light and dark mode using the theme toggle in the sidebar header.
                    </p>
                </div>
            </div>
        </div>
    );
}
