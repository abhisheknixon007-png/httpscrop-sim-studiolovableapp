import { useMemo, useState } from "react";
import { CROPS, REGIONS, monteCarlo, runSim, type CropKey, type RegionKey } from "@/lib/cropModel";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Tab = "growth" | "costs" | "risk";

const fmt = (n: number, d = 0) => n.toLocaleString(undefined, { maximumFractionDigits: d });

export const Simulator = () => {
  const [regionKey, setRegionKey] = useState<RegionKey>("hyderabad");
  const [cropKey, setCropKey] = useState<CropKey>("rice");
  const [fertilizer, setFertilizer] = useState(100);
  const [irrigation, setIrrigation] = useState(0);
  const [mechanization, setMechanization] = useState(45);
  const [area, setArea] = useState(2);
  const [tab, setTab] = useState<Tab>("growth");

  const region = REGIONS.find(r => r.key === regionKey)!;
  const crop = CROPS.find(c => c.key === cropKey)!;
  const inputs = { region, crop, fertilizer, irrigation, mechanization, area };

  const result = useMemo(() => runSim(inputs), [regionKey, cropKey, fertilizer, irrigation, mechanization, area]);
  const mc = useMemo(() => monteCarlo(inputs, 200), [regionKey, cropKey, fertilizer, irrigation, mechanization]);

  const reset = () => { setFertilizer(100); setIrrigation(0); setMechanization(45); setArea(2); };

  const stressData = result.daily.filter((_, i) => i % 2 === 0).map(d => ({
    day: d.day, Temp: d.tempStress, Water: d.waterStress, N: d.nStress, Canopy: d.canopy,
  }));
  const weatherData = result.daily.map(d => ({ day: d.day, rain: d.rain, temp: d.temp }));
  const costData = [
    { name: "Inputs", value: result.costPerHa * 0.45 },
    { name: "Labor",  value: result.costPerHa * 0.20 },
    { name: "Irrig.", value: irrigation * 1.2 * region.seasonDays },
    { name: "Other",  value: result.costPerHa * 0.20 },
  ];

  return (
    <section id="simulator" className="relative py-28 bg-cream">
      <div className="container">
        <div className="max-w-2xl">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber">The simulator</div>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl text-forest tracking-tight text-balance">
            Test a farming strategy.
          </h2>
          <p className="mt-5 text-lg text-forest-soft leading-relaxed">
            Pick a region, a crop, and tune inputs. The platform runs a SIMPLE-style daily growth model,
            a per-hectare economics model, and 200 Monte Carlo trials to quantify risk.
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-[380px_1fr] gap-6">
          {/* Controls */}
          <div className="rounded-3xl bg-card border border-border/70 p-6 shadow-card space-y-7">
            <Field label="Region" value={region.label}>
              <select value={regionKey} onChange={e => setRegionKey(e.target.value as RegionKey)}
                className="w-full mt-2 rounded-xl bg-secondary border border-border px-3 py-2.5 text-sm text-forest focus:outline-none focus:ring-2 focus:ring-amber">
                {REGIONS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
              <div className="mt-3 flex justify-between text-xs font-mono text-muted-foreground">
                <span>Avg temp: <span className="text-forest">{region.avgTemp}°C</span></span>
                <span>Avg rainfall: <span className="text-forest">{region.avgRain}mm</span></span>
              </div>
            </Field>

            <Field label="Crop" value={`${crop.emoji} ${crop.label}`}>
              <div className="mt-2 grid grid-cols-5 gap-1.5">
                {CROPS.map(c => (
                  <button key={c.key} onClick={() => setCropKey(c.key)}
                    className={`rounded-xl border px-2 py-2.5 text-lg transition-all ${cropKey === c.key ? "bg-warm-gradient text-primary-foreground border-transparent shadow-glow" : "bg-secondary border-border hover:border-amber/60"}`}
                    title={c.label}>
                    {c.emoji}
                  </button>
                ))}
              </div>
            </Field>

            <SliderField label="Fertilizer rate" suffix="% N" value={fertilizer} onChange={setFertilizer} min={0} max={150} />
            <SliderField label="Irrigation" suffix="mm/day" value={irrigation} onChange={setIrrigation} min={0} max={10} />
            <SliderField label="Mechanization" suffix="%" value={mechanization} onChange={setMechanization} min={0} max={100} />
            <SliderField label="Farm area" suffix="ha" value={area} onChange={setArea} min={0.5} max={50} step={0.5} />

            <button onClick={reset} className="w-full rounded-full border border-border bg-secondary px-4 py-2.5 text-sm text-forest hover:bg-sand transition-colors">
              Reset to regional baseline
            </button>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <Stat label="Yield" value={`${fmt(result.yieldTHa, 2)} t/ha`} delta={`${result.yieldDeltaPct >= 0 ? "+" : ""}${fmt(result.yieldDeltaPct)}% vs reference`} positive={result.yieldDeltaPct >= 0} />
              <Stat label="Revenue" value={`${region.currency}${fmt(result.revenuePerHa)}`} delta="per hectare" />
              <Stat label="Net profit" value={`${region.currency}${fmt(result.profitPerHa)}`} delta={`${fmt(result.marginPct)}% margin`} positive={result.profitPerHa >= 0} />
              <Stat label="Loss probability" value={`${fmt(mc.lossProbability * 100)}%`} delta={`failure: ${fmt(mc.failureProbability * 100)}%`} positive={mc.lossProbability < 0.2} />
              <Stat label="P10 yield" value={`${fmt(mc.p10, 2)} t/ha`} delta="bad season" />
              <Stat label="P90 yield" value={`${fmt(mc.p90, 2)} t/ha`} delta="good season" positive />
            </div>

            <div className="rounded-2xl bg-warm-gradient text-primary-foreground px-5 py-3.5 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm font-medium shadow-glow">
              <span>Farm total {area} ha</span>
              <span className="opacity-70">·</span>
              <span>Revenue {region.currency}{fmt(result.totalRevenue)}</span>
              <span className="opacity-70">·</span>
              <span>Profit {region.currency}{fmt(result.totalProfit)}</span>
            </div>

            <div className="rounded-3xl bg-card border border-border/70 shadow-card p-6">
              <Tabs value={tab} onValueChange={v => setTab(v as Tab)}>
                <TabsList className="bg-secondary rounded-full p-1">
                  <TabsTrigger value="growth" className="rounded-full data-[state=active]:bg-card data-[state=active]:text-forest">Growth</TabsTrigger>
                  <TabsTrigger value="costs"  className="rounded-full data-[state=active]:bg-card data-[state=active]:text-forest">Costs</TabsTrigger>
                  <TabsTrigger value="risk"   className="rounded-full data-[state=active]:bg-card data-[state=active]:text-forest">Risk</TabsTrigger>
                </TabsList>

                <TabsContent value="growth" className="mt-6 space-y-8">
                  <ChartBlock title="Stress & canopy cover" subtitle="Daily limitation factors (1.0 = optimal). Biomass is driven by their product.">
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={stressData}>
                        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${Math.round(v * 100)}%`} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="Temp"   stroke="hsl(var(--amber))"  strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Water"  stroke="hsl(210 70% 50%)"  strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="N"      stroke="hsl(var(--forest))" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Canopy" stroke="hsl(140 50% 40%)"  strokeWidth={2.5} dot={false} strokeDasharray="4 3" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartBlock>
                  <ChartBlock title="Daily rainfall & mean temperature">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={weatherData}>
                        <defs>
                          <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(210 70% 55%)" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="hsl(210 70% 55%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis yAxisId="r" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis yAxisId="t" orientation="right" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area yAxisId="r" type="monotone" dataKey="rain" stroke="hsl(210 70% 50%)" fill="url(#rainGrad)" strokeWidth={1.5} />
                        <Line yAxisId="t" type="monotone" dataKey="temp" stroke="hsl(var(--amber))" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartBlock>
                </TabsContent>

                <TabsContent value="costs" className="mt-6">
                  <ChartBlock title="Cost breakdown" subtitle={`Per hectare in ${region.currency}. Total ${region.currency}${fmt(result.costPerHa)} / ha.`}>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={costData}>
                        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${region.currency}${fmt(v)}`} />
                        <Bar dataKey="value" fill="hsl(var(--amber))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartBlock>
                </TabsContent>

                <TabsContent value="risk" className="mt-6">
                  <ChartBlock title="Yield distribution" subtitle={`200 Monte Carlo trials with perturbed weather. Mean ${fmt(mc.meanYield, 2)} t/ha · P10 ${fmt(mc.p10, 2)} · P90 ${fmt(mc.p90, 2)}.`}>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={mc.histogram}>
                        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="bin" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `${v}t`} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="count" fill="hsl(var(--harvest))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartBlock>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "var(--shadow-card)",
};

const Field = ({ label, value, children }: { label: string; value: string; children: React.ReactNode }) => (
  <div>
    <div className="flex items-baseline justify-between">
      <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="text-xs text-forest font-medium">{value}</div>
    </div>
    {children}
  </div>
);

const SliderField = ({ label, suffix, value, onChange, min, max, step = 1 }: { label: string; suffix: string; value: number; onChange: (n: number) => void; min: number; max: number; step?: number }) => (
  <Field label={label} value={`${value} ${suffix}`}>
    <Slider value={[value]} min={min} max={max} step={step} onValueChange={v => onChange(v[0])} className="mt-3" />
  </Field>
);

const Stat = ({ label, value, delta, positive }: { label: string; value: string; delta: string; positive?: boolean }) => (
  <div className="rounded-2xl bg-card border border-border/70 p-5 shadow-card">
    <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
    <div className="mt-2 font-serif text-3xl text-forest leading-none">{value}</div>
    <div className={`mt-2 text-xs ${positive === undefined ? "text-muted-foreground" : positive ? "text-amber" : "text-destructive"}`}>{delta}</div>
  </div>
);

const ChartBlock = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <div>
    <h3 className="font-serif text-xl text-forest">{title}</h3>
    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    <div className="mt-4">{children}</div>
  </div>
);
