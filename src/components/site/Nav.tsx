import { Sprout } from "lucide-react";

const links = [
  { label: "Model", href: "#model" },
  { label: "AI Scout", href: "#scout" },
  { label: "Simulator", href: "#simulator" },
];

export const Nav = () => (
  <header className="absolute inset-x-0 top-0 z-30">
    <div className="container flex items-center justify-between py-6">
      <a href="#" className="flex items-center gap-2.5 group">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-warm-gradient text-primary-foreground shadow-glow transition-transform group-hover:scale-105">
          <Sprout className="h-4.5 w-4.5" strokeWidth={2.4} />
        </span>
        <span className="font-serif text-xl font-semibold text-forest">CropSim</span>
      </a>
      <nav className="hidden md:flex items-center gap-1 rounded-full bg-card/60 backdrop-blur-md px-2 py-1.5 border border-border/60 shadow-soft">
        {links.map(l => (
          <a key={l.href} href={l.href} className="px-4 py-1.5 text-sm text-forest-soft hover:text-forest rounded-full hover:bg-secondary transition-colors">
            {l.label}
          </a>
        ))}
      </nav>
      <div className="hidden md:flex items-center gap-1 rounded-full bg-card/60 backdrop-blur-md px-1.5 py-1 border border-border/60 shadow-soft text-xs font-mono">
        <span className="px-2 py-1 text-muted-foreground">🌐</span>
        <span className="px-2.5 py-1 rounded-full bg-warm-gradient text-primary-foreground">EN</span>
        <span className="px-2 py-1 text-muted-foreground">हि</span>
        <span className="px-2 py-1 text-muted-foreground">sw</span>
      </div>
    </div>
  </header>
);
