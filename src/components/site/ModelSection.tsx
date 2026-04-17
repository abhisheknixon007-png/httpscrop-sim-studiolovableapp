const steps = [
  { n: "01", title: "Weather & radiation", body: "Pulls daily temperature, rainfall, and solar radiation patterns calibrated against NASA POWER climatology for the selected region." },
  { n: "02", title: "SIMPLE growth", body: "A daily biomass model multiplies intercepted radiation by use efficiency, then applies temperature, water, and nitrogen stress factors." },
  { n: "03", title: "Economics", body: "Per-hectare costs scale with fertilizer, irrigation, and mechanization. Revenue uses regional reference prices to compute net profit and margin." },
  { n: "04", title: "Monte Carlo", body: "200 trials perturb seasonal rainfall and temperature to estimate the probability of yield failure and economic loss for your strategy." },
];

export const ModelSection = () => (
  <section id="model" className="relative py-28 bg-cream">
    <div className="container">
      <div className="max-w-2xl">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber">The model</div>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl text-forest tracking-tight text-balance">
          Open agronomy science, <em className="italic font-normal text-amber">made interactive</em>.
        </h2>
        <p className="mt-5 text-lg text-forest-soft leading-relaxed">
          Four open layers feed each other in real time so you can ask "what if I cut fertilizer
          by 20%?" and watch yield, cost, profit, and risk move together.
        </p>
      </div>
      <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map(s => (
          <div key={s.n} className="relative rounded-2xl bg-card border border-border/70 p-7 shadow-card">
            <div className="font-mono text-xs text-amber tracking-widest">{s.n}</div>
            <div className="mt-4 font-serif text-2xl text-forest">{s.title}</div>
            <p className="mt-3 text-sm text-forest-soft/90 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
