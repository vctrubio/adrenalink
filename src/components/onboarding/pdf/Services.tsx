import { ENTITY_DATA } from "@/config/entities";

const servicesConfig = [
  { 
    entityId: "student",
    title: "Student Registration", 
    description: "Simplify enrollments with cross-school history information."
  },
  { 
    entityId: "teacher",
    title: "Teacher Management", 
    description: "Track hours, commissions, and availability."
  },
  { 
    entityId: "booking",
    title: "Booking Scheduling", 
    description: "Progression and revenue metrics, with real-time lesson synchronization."
  },
  { 
    entityId: "equipment",
    title: "Equipment Lifecycle", 
    description: "Full inventory visibility, flight time, repairs and rentals."
  },
];

export function Services() {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold uppercase mb-3 text-primary border-b border-border pb-1">
        Framework
      </h2>
      <p className="text-base text-muted-foreground mb-6">
        4 pillars that define the structure. These core components work together to streamline operations, from student enrollment and teacher coordination to scheduling and equipment management.
      </p>
      <div className="grid grid-cols-2 gap-6">
        {servicesConfig.map((service, index) => {
          const entity = ENTITY_DATA.find((e) => e.id === service.entityId);
          const IconComponent = entity?.icon;
          const color = entity?.color;
          
          return (
            <div
              key={index}
              className="flex items-start gap-4"
            >
              <div 
                className="w-12 h-12 flex items-center justify-center border rounded-full flex-shrink-0"
                style={{
                  borderColor: color ? `${color}40` : undefined,
                  backgroundColor: color ? `${color}10` : undefined,
                }}
              >
                {IconComponent && (
                  <div style={{ color: color || undefined }}>
                    <IconComponent 
                      className="w-5 h-5" 
                    />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
