export function Services() {
  const services = [
    { title: "Intelligent Booking Management", description: "Streamline reservations with our smart conflict-detection system." },
    { title: "Teacher Scheduling", description: "Dynamic availability tracking and automated lesson assignments." },
    { title: "Equipment Tracking", description: "Real-time inventory management for kites, boards, and safety gear." },
    { title: "Performance Analytics", description: "Comprehensive insights into school performance and revenue metrics." },
  ];

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold uppercase mb-3 text-primary border-b border-border pb-1">
        Services
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {services.map((service, index) => (
          <div key={index} className="bg-muted/30 p-3 rounded-md">
            <h3 className="font-semibold text-sm mb-1">{service.title}</h3>
            <p className="text-xs text-muted-foreground">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
