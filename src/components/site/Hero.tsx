import heroFarm from "@/assets/hero-farm.jpg";
import { Sprout, CloudRain, TrendingUp, AlertTriangle } from "lucide-react";

const features = [
  { tag: "SIMPLE",     title: "Zhao et al. 2019 yield model",     Icon: Sprout },
  { tag: "NASA POWER", title: "Live weather & radiation",         Icon: CloudRain },
  { tag: "Economics",  title: "Per-hectare cost & profit",        Icon: TrendingUp },
  { tag: "Monte Carlo",title: "Loss & failure probability",       Icon: AlertTriangle },
];

export const Hero = () => (
  <section className="relative min-h-[100vh] overflow-hidden bg-sky-gradient">
    <img
      src={heroFarm}
      alt="Golden farmland at sunset with converging crop rows"
      className="absolute inset-0 h-full w-full object-cover opacity-90"
      width={1920}
      height={1088}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-cream/30 via-cream/10 to-cream" />
    <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-cream/85 via-cream/50 to-transparent" />

    <div className="relative">
      <div className="container pt-40 md:pt-48 pb-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-card/70 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-forest-soft border border-border/60 shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
            SIMPLE model · FarmVibes.AI patterns · NASA POWER
          </span>
          <h1 className="mt-7 font-serif text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-tight text-forest text-balance">
            Simulate the <em className="italic font-normal text-amber">harvest</em>,<br />
            before a seed is sown.
          </h1>
          <p className="mt-7 text-lg md:text-xl text-forest-soft/90 max-w-xl leading-relaxed">
            An AI-powered platform that models crop yield, cost, profit, and weather risk
            across India, the US Midwest, and African smallholder regions — grounded in
            open-source agronomy science.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#simulator" className="inline-flex items-center gap-2 rounded-full bg-warm-gradient text-primary-foreground px-7 py-3.5 text-sm font-medium shadow-glow hover:shadow-[0_14px_50px_-10px_hsl(var(--primary)/0.6)] hover:-translate-y-0.5 transition-all duration-300">
              Launch the simulator
            </a>
            <a href="#model" className="inline-flex items-center rounded-full bg-card border border-border px-7 py-3.5 text-sm font-medium text-forest hover:bg-secondary transition-colors">
              How it works
            </a>
          </div>
        </div>
      </div>

      <div className="container pb-24 -mt-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {features.map(({ tag, title, Icon }) => (
            <div key={tag} className="rounded-2xl bg-card/85 backdrop-blur-md border border-border/60 p-5 shadow-card hover:-translate-y-0.5 transition-transform">
              <Icon className="h-5 w-5 text-amber" strokeWidth={2.2} />
              <div className="mt-4 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{tag}</div>
              <div className="mt-1 text-base font-serif text-forest leading-tight">{title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-fade-bottom" />
  </section>
);
