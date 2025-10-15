"use client";

interface EntityIdCardProps {
    info: {
        id: string;
        name: string;
        country: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        [key: string]: any;
    };
}

export default function EntityIdCard({ info }: EntityIdCardProps) {
    return (
        <div className="bg-card border border-border rounded-xl p-8 max-w-2xl shadow-lg">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Name</h3>
                        <p className="text-lg font-semibold text-foreground">{info.name}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">ID</h3>
                        <p className="text-lg font-semibold text-foreground font-mono">{info.id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Country</h3>
                        <p className="text-lg text-foreground">{info.country}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Phone</h3>
                        <p className="text-lg text-foreground">{info.phone}</p>
                    </div>
                </div>

                {info.passport && (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Passport</h3>
                        <p className="text-lg text-foreground">{info.passport}</p>
                    </div>
                )}

                {info.username && (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Username</h3>
                        <p className="text-lg text-foreground">@{info.username}</p>
                    </div>
                )}

                <div className="border-t border-border pt-6">
                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                            <h3 className="text-muted-foreground uppercase tracking-wide mb-1">Created</h3>
                            <p className="text-foreground">{new Date(info.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <h3 className="text-muted-foreground uppercase tracking-wide mb-1">Updated</h3>
                            <p className="text-foreground">{new Date(info.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
