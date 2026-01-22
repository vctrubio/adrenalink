import ClassboardIcon from "@/public/appSvgs/ClassboardIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";

export function PowerOfAdrenalink() {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold uppercase mb-6 text-primary border-b border-border pb-1">
        The Power of Adrenalink
      </h2>
      <div className="flex gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-foreground/90">
            <div className="p-2 rounded-lg bg-[#7dd3fc]/10 border border-[#7dd3fc]/20" style={{ color: "#7dd3fc" }}>
              <ClassboardIcon size={24} />
            </div>
            <h3 className="font-bold text-lg leading-tight tracking-tight">Classboard</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Streamlining the experience in real time. A unified, living view of your school's daily pulse.
          </p>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-foreground/90">
            <div className="p-2 rounded-lg bg-[#eab308]/10 border border-[#eab308]/20" style={{ color: "#eab308" }}>
              <HelmetIcon size={24} />
            </div>
            <h3 className="font-bold text-lg leading-tight tracking-tight">Registration</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Manage and filter students who can rent, completed first sessions, and track progress effortlessly.
          </p>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-foreground/90">
            <div className="p-2 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20" style={{ color: "#22c55e" }}>
              <HeadsetIcon size={24} />
            </div>
            <h3 className="font-bold text-lg leading-tight tracking-tight">management</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            With special focus on seeing hours, commissions and overall students. Full transparency for your team.
          </p>
        </div>
      </div>
    </section>
  );
}