import Link from "next/link";

export default function InfoPage() {
    const routes = [
        { name: "Students", href: "/info/students" },
        { name: "Teachers", href: "/info/teachers" },
        { name: "Packages", href: "/info/packages" },
        { name: "Bookings", href: "/info/bookings" },
        { name: "Lessons", href: "/info/lessons" },
        { name: "Equipments", href: "/info/equipments" },
    ];

    return (
        <>
            <h1 className="text-3xl font-bold mb-8">Info</h1>
            <div className="flex flex-col gap-4">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className="p-6 border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                        <h2 className="text-xl font-semibold">{route.name}</h2>
                    </Link>
                ))}
            </div>
        </>
    );
}
