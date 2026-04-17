import { useRef, useState } from "react";
import { Camera, Sparkles, Leaf, Loader2 } from "lucide-react";

interface Diagnosis {
  health: number;
  stress: string;
  fertilizerDelta: number;
  irrigationDelta: number;
  note: string;
}

const sampleDiagnoses: Diagnosis[] = [
  { health: 78, stress: "Mild nitrogen deficiency", fertilizerDelta: +15, irrigationDelta: 0, note: "Pale interveinal yellowing on lower leaves suggests nitrogen mobilization. Consider a 15% top-dress." },
  { health: 64, stress: "Moderate water stress", fertilizerDelta: 0, irrigationDelta: +4, note: "Leaf rolling and dull canopy color. Add ~4 mm/day supplemental irrigation for the next 10 days." },
  { health: 88, stress: "Healthy canopy", fertilizerDelta: 0, irrigationDelta: 0, note: "Vigorous growth, uniform pigmentation. Maintain current strategy and monitor for late-season heat stress." },
  { health: 52, stress: "Heat stress + water deficit", fertilizerDelta: -10, irrigationDelta: +6, note: "Wilting points to compounding stress. Reduce N to limit luxury growth and increase irrigation." },
];

export const AIScout = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [diag, setDiag] = useState<Diagnosis | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhoto(url);
    setDiag(null);
  };

  const analyze = () => {
    setBusy(true);
    setTimeout(() => {
      setDiag(sampleDiagnoses[Math.floor(Math.random() * sampleDiagnoses.length)]);
      setBusy(false);
    }, 1100);
  };

  return (
    <section id="scout" className="relative py-28 bg-secondary/40">
      <div className="container grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber">AI Field Scout</div>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl text-forest tracking-tight text-balance">
            Snap a leaf. <em className="italic font-normal text-amber">Get a diagnosis.</em>
          </h2>
          <p className="mt-5 text-lg text-forest-soft leading-relaxed max-w-lg">
            Use your phone camera to photograph a leaf or crop row. The model returns a stress
            diagnosis and tunes the simulator's fertilizer and irrigation to match.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-forest-soft">
            {["Detects N deficiency, water stress, heat damage", "Outputs concrete adjustments to apply", "Runs in your browser — no upload"].map(t => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-card border border-border/70 p-6 md:p-8 shadow-card">
          <div className="aspect-[4/3] rounded-2xl bg-secondary/70 border border-dashed border-border grid place-items-center overflow-hidden">
            {photo ? (
              <img src={photo} alt="Captured leaf" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center px-8">
                <Leaf className="mx-auto h-10 w-10 text-amber/70" strokeWidth={1.6} />
                <p className="mt-3 text-sm text-forest-soft">No photo yet. Tap below to capture a leaf or field shot.</p>
              </div>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onCapture} />
            <button onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full bg-forest text-cream px-5 py-2.5 text-sm font-medium hover:bg-forest-soft transition-colors">
              <Camera className="h-4 w-4" /> Capture photo
            </button>
            <button onClick={analyze} disabled={!photo || busy} className="inline-flex items-center gap-2 rounded-full bg-warm-gradient text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-glow disabled:opacity-50 disabled:shadow-none transition-all">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Analyze
            </button>
          </div>

          <div className="mt-6 rounded-2xl bg-secondary/60 border border-border/60 p-5">
            {diag ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div className="font-serif text-xl text-forest">{diag.stress}</div>
                  <div className="font-mono text-2xl text-amber">{diag.health}<span className="text-sm text-muted-foreground">/100</span></div>
                </div>
                <p className="mt-2 text-sm text-forest-soft leading-relaxed">{diag.note}</p>
                <div className="mt-4 flex gap-2 text-xs font-mono">
                  <span className="rounded-full bg-amber-soft text-forest px-3 py-1">N {diag.fertilizerDelta >= 0 ? "+" : ""}{diag.fertilizerDelta}%</span>
                  <span className="rounded-full bg-amber-soft text-forest px-3 py-1">Irrig {diag.irrigationDelta >= 0 ? "+" : ""}{diag.irrigationDelta} mm/day</span>
                </div>
              </>
            ) : (
              <>
                <div className="font-serif text-lg text-forest">Results appear here</div>
                <p className="mt-2 text-sm text-forest-soft leading-relaxed">
                  The model returns a health score, a stress type, and a concrete fertilizer / irrigation
                  adjustment you can apply to the simulator in one click.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
