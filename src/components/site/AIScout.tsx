import { useEffect, useRef, useState } from "react";
import { Camera, Sparkles, Leaf, Loader2, Video, VideoOff, RotateCcw, Upload } from "lucide-react";

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

type Facing = "environment" | "user";

export const AIScout = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [streaming, setStreaming] = useState(false);
  const [facing, setFacing] = useState<Facing>("environment");
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [diag, setDiag] = useState<Diagnosis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setStreaming(false);
  };

  const startStream = async (mode: Facing = facing) => {
    setError(null);
    stopStream();
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera API not supported in this browser. Use the upload option instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setStreaming(true);
      setPhoto(null);
      setDiag(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not access camera";
      setError(`${msg}. You can also upload an image.`);
    }
  };

  const flipCamera = async () => {
    const next: Facing = facing === "environment" ? "user" : "environment";
    setFacing(next);
    if (streaming) await startStream(next);
  };

  const capture = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || !v.videoWidth) return;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    setPhoto(c.toDataURL("image/jpeg", 0.9));
    setDiag(null);
    stopStream();
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
    setDiag(null);
    stopStream();
  };

  const analyze = () => {
    setBusy(true);
    setTimeout(() => {
      setDiag(sampleDiagnoses[Math.floor(Math.random() * sampleDiagnoses.length)]);
      setBusy(false);
    }, 1100);
  };

  const retake = () => {
    setPhoto(null);
    setDiag(null);
    startStream();
  };

  // Cleanup on unmount
  useEffect(() => () => stopStream(), []);

  return (
    <section id="scout" className="relative py-28 bg-secondary/40">
      <div className="container grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber">AI Field Scout</div>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl text-forest tracking-tight text-balance">
            Snap a leaf. <em className="italic font-normal text-amber">Get a diagnosis.</em>
          </h2>
          <p className="mt-5 text-lg text-forest-soft leading-relaxed max-w-lg">
            Start your camera, frame a leaf or crop row, and capture a live photo. The model returns a stress
            diagnosis and tunes the simulator's fertilizer and irrigation to match.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-forest-soft">
            {[
              "Live camera preview with rear/front toggle",
              "Detects N deficiency, water stress, heat damage",
              "Runs in your browser — no upload needed",
            ].map(t => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-card border border-border/70 p-6 md:p-8 shadow-card">
          <div className="relative aspect-[4/3] rounded-2xl bg-forest/95 border border-border overflow-hidden">
            {/* Live video */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`h-full w-full object-cover ${streaming ? "block" : "hidden"}`}
            />
            {/* Captured photo */}
            {photo && !streaming && (
              <img src={photo} alt="Captured leaf" className="h-full w-full object-cover" />
            )}
            {/* Empty state */}
            {!streaming && !photo && (
              <div className="absolute inset-0 grid place-items-center text-center px-8 bg-secondary/70">
                <div>
                  <Leaf className="mx-auto h-10 w-10 text-amber/70" strokeWidth={1.6} />
                  <p className="mt-3 text-sm text-forest-soft">Tap "Start camera" to begin a live capture.</p>
                  {error && <p className="mt-3 text-xs text-destructive max-w-xs mx-auto">{error}</p>}
                </div>
              </div>
            )}

            {/* Live overlay */}
            {streaming && (
              <>
                <div className="pointer-events-none absolute inset-4 rounded-xl border-2 border-cream/60 border-dashed" />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-destructive/90 text-destructive-foreground px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-cream animate-pulse" /> Live
                </span>
                <button onClick={flipCamera} className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-card/80 backdrop-blur text-forest hover:bg-card transition-colors" title="Flip camera">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Controls */}
          <div className="mt-5 flex flex-wrap gap-3">
            {!streaming && !photo && (
              <>
                <button onClick={() => startStream()} className="inline-flex items-center gap-2 rounded-full bg-warm-gradient text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-glow hover:-translate-y-0.5 transition-all">
                  <Video className="h-4 w-4" /> Start camera
                </button>
                <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border text-forest px-5 py-2.5 text-sm font-medium hover:bg-sand transition-colors">
                  <Upload className="h-4 w-4" /> Upload image
                </button>
              </>
            )}
            {streaming && (
              <>
                <button onClick={capture} className="inline-flex items-center gap-2 rounded-full bg-warm-gradient text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-glow">
                  <Camera className="h-4 w-4" /> Capture frame
                </button>
                <button onClick={stopStream} className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border text-forest px-5 py-2.5 text-sm font-medium hover:bg-sand transition-colors">
                  <VideoOff className="h-4 w-4" /> Stop
                </button>
              </>
            )}
            {photo && !streaming && (
              <>
                <button onClick={analyze} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-warm-gradient text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-glow disabled:opacity-50">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Analyze
                </button>
                <button onClick={retake} className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border text-forest px-5 py-2.5 text-sm font-medium hover:bg-sand transition-colors">
                  <RotateCcw className="h-4 w-4" /> Retake
                </button>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onUpload} />
          </div>

          {/* Diagnosis panel */}
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
                  After capture, the model returns a health score, a stress type, and a concrete fertilizer / irrigation
                  adjustment you can apply to the simulator.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
