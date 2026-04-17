import { Sprout } from "lucide-react";

export const Footer = () => (
  <footer className="bg-forest text-cream/80">
    <div className="container py-14 grid md:grid-cols-3 gap-10">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-warm-gradient text-primary-foreground"><Sprout className="h-4.5 w-4.5" /></span>
          <span className="font-serif text-xl text-cream">CropSim</span>
        </div>
        <p className="mt-4 text-sm leading-relaxed max-w-sm">
          Open-source agronomy science, made interactive. For research and education — not a substitute for local extension advice.
        </p>
      </div>
      <div className="text-sm">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream/50">Built on</div>
        <ul className="mt-3 space-y-2">
          <li>SIMPLE model — Zhao et al. 2019</li>
          <li>FarmVibes.AI patterns</li>
          <li>NASA POWER climatology</li>
        </ul>
      </div>
      <div className="text-sm">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream/50">Regions</div>
        <ul className="mt-3 space-y-2">
          <li>Hyderabad, Telangana — India</li>
          <li>Des Moines, Iowa — US Midwest</li>
          <li>Nairobi — Kenya</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-cream/10">
      <div className="container py-5 text-xs text-cream/50 flex flex-wrap justify-between gap-3">
        <span>© {new Date().getFullYear()} CropSim Studio</span>
        <span className="font-mono">v0.1 · prototype</span>
      </div>
    </div>
  </footer>
);
