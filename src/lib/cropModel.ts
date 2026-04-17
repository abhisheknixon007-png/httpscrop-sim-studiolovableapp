// Lightweight SIMPLE-style crop yield + economics + Monte Carlo model.
// Inspired by Zhao et al. 2019 SIMPLE crop model patterns. Heuristic, not validated.

export type RegionKey =
  | "hyderabad" | "ludhiana" | "pune" | "jaipur" | "lucknow"
  | "bhopal" | "bengaluru" | "kolkata" | "patna" | "ahmedabad" | "guwahati"
  | "iowa" | "nairobi";
export type CropKey = "rice" | "wheat" | "maize" | "soybean" | "sorghum";

export interface Region {
  key: RegionKey;
  label: string;
  avgTemp: number; // °C mean during season
  avgRain: number; // mm season total
  radiation: number; // MJ/m2/day mean
  seasonDays: number;
  costPerHa: number; // baseline USD/ha
  currency: string;
}

export interface Crop {
  key: CropKey;
  label: string;
  emoji: string;
  // SIMPLE-ish parameters
  rue: number; // radiation use efficiency g/MJ
  hi: number; // harvest index
  tBase: number;
  tOpt: number;
  tHeat: number;
  waterReq: number; // mm needed for full season
  refYield: number; // t/ha reference
  pricePerTon: number; // USD/t
}

export const REGIONS: Region[] = [
  { key: "hyderabad", label: "Hyderabad, Telangana", avgTemp: 27, avgRain: 800,  radiation: 19, seasonDays: 130, costPerHa: 514, currency: "$" },
  { key: "ludhiana",  label: "Ludhiana, Punjab",     avgTemp: 24, avgRain: 700,  radiation: 20, seasonDays: 140, costPerHa: 560, currency: "$" },
  { key: "pune",      label: "Pune, Maharashtra",    avgTemp: 25, avgRain: 720,  radiation: 20, seasonDays: 130, costPerHa: 500, currency: "$" },
  { key: "jaipur",    label: "Jaipur, Rajasthan",    avgTemp: 26, avgRain: 550,  radiation: 21, seasonDays: 120, costPerHa: 470, currency: "$" },
  { key: "lucknow",   label: "Lucknow, Uttar Pradesh", avgTemp: 26, avgRain: 900, radiation: 19, seasonDays: 135, costPerHa: 520, currency: "$" },
  { key: "bhopal",    label: "Bhopal, Madhya Pradesh", avgTemp: 25, avgRain: 1100, radiation: 19, seasonDays: 130, costPerHa: 490, currency: "$" },
  { key: "bengaluru", label: "Bengaluru, Karnataka", avgTemp: 23, avgRain: 970,  radiation: 20, seasonDays: 130, costPerHa: 530, currency: "$" },
  { key: "kolkata",   label: "Kolkata, West Bengal", avgTemp: 27, avgRain: 1700, radiation: 18, seasonDays: 130, costPerHa: 510, currency: "$" },
  { key: "patna",     label: "Patna, Bihar",         avgTemp: 26, avgRain: 1100, radiation: 18, seasonDays: 130, costPerHa: 460, currency: "$" },
  { key: "ahmedabad", label: "Ahmedabad, Gujarat",   avgTemp: 27, avgRain: 800,  radiation: 21, seasonDays: 125, costPerHa: 510, currency: "$" },
  { key: "guwahati",  label: "Guwahati, Assam",      avgTemp: 24, avgRain: 1700, radiation: 17, seasonDays: 135, costPerHa: 440, currency: "$" },
  { key: "iowa",      label: "Des Moines, Iowa",     avgTemp: 22, avgRain: 620,  radiation: 21, seasonDays: 140, costPerHa: 880, currency: "$" },
  { key: "nairobi",   label: "Nairobi, Kenya",       avgTemp: 20, avgRain: 700,  radiation: 20, seasonDays: 120, costPerHa: 320, currency: "$" },
];

export const CROPS: Crop[] = [
  { key: "rice",    label: "Rice",    emoji: "🌾", rue: 2.2, hi: 0.45, tBase: 10, tOpt: 28, tHeat: 36, waterReq: 1100, refYield: 6.0, pricePerTon: 380 },
  { key: "wheat",   label: "Wheat",   emoji: "🌾", rue: 2.7, hi: 0.42, tBase: 4,  tOpt: 22, tHeat: 32, waterReq: 550,  refYield: 4.5, pricePerTon: 260 },
  { key: "maize",   label: "Maize",   emoji: "🌽", rue: 3.5, hi: 0.50, tBase: 8,  tOpt: 26, tHeat: 35, waterReq: 650,  refYield: 9.0, pricePerTon: 220 },
  { key: "soybean", label: "Soybean", emoji: "🫘", rue: 2.4, hi: 0.40, tBase: 8,  tOpt: 25, tHeat: 33, waterReq: 600,  refYield: 3.2, pricePerTon: 480 },
  { key: "sorghum", label: "Sorghum", emoji: "🌾", rue: 3.0, hi: 0.40, tBase: 10, tOpt: 28, tHeat: 38, waterReq: 500,  refYield: 4.0, pricePerTon: 240 },
];

export interface SimInputs {
  region: Region;
  crop: Crop;
  fertilizer: number; // 0-150 (% of recommended N)
  irrigation: number; // mm/day supplemental
  mechanization: number; // 0-100 %
  area: number; // ha
  // optional weather override (multipliers)
  rainMultiplier?: number;
  tempDelta?: number;
}

export interface DayPoint {
  day: number;
  rain: number;
  temp: number;
  tempStress: number;
  waterStress: number;
  nStress: number;
  canopy: number;
  biomass: number;
}

export interface SimResult {
  daily: DayPoint[];
  yieldTHa: number;
  refYield: number;
  yieldDeltaPct: number;
  revenuePerHa: number;
  costPerHa: number;
  profitPerHa: number;
  marginPct: number;
  totalRevenue: number;
  totalProfit: number;
}

// deterministic PRNG so charts don't reshuffle on every keystroke
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v: number, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, v)); }

export function runSim(inp: SimInputs, seed = 42): SimResult {
  const { region, crop, fertilizer, irrigation, area } = inp;
  const days = region.seasonDays;
  const rand = mulberry32(seed);
  const tempDelta = inp.tempDelta ?? 0;
  const rainMul = inp.rainMultiplier ?? 1;

  // Distribute seasonal rainfall across days (lognormal-ish)
  const rainTotalTarget = region.avgRain * rainMul;
  const rawRain: number[] = [];
  let rawSum = 0;
  for (let d = 0; d < days; d++) {
    const wet = rand() < 0.32 ? Math.pow(rand(), 1.6) * 30 : 0;
    rawRain.push(wet);
    rawSum += wet;
  }
  const scale = rawSum > 0 ? rainTotalTarget / rawSum : 0;
  const rain = rawRain.map(r => r * scale);

  const daily: DayPoint[] = [];
  let biomass = 0;
  let cumWater = 0;
  const totalWaterAvail = rainTotalTarget + irrigation * days;
  const waterRatio = clamp(totalWaterAvail / crop.waterReq, 0, 1.15);
  const nRatio = clamp(fertilizer / 100, 0.2, 1.15);

  for (let d = 0; d < days; d++) {
    // bell-shaped daily temp around region mean
    const seasonal = Math.sin((d / days) * Math.PI) * 3;
    const noise = (rand() - 0.5) * 4;
    const temp = region.avgTemp + tempDelta + seasonal + noise;

    const tempStress = temp <= crop.tBase ? 0
      : temp <= crop.tOpt ? (temp - crop.tBase) / (crop.tOpt - crop.tBase)
      : temp <= crop.tHeat ? 1 - 0.6 * ((temp - crop.tOpt) / (crop.tHeat - crop.tOpt))
      : 0.15;

    cumWater += rain[d] + irrigation;
    const expected = (crop.waterReq * (d + 1)) / days;
    const waterStress = clamp(cumWater / Math.max(expected, 1));

    const nStress = clamp(0.5 + 0.5 * nRatio);

    // canopy follows logistic curve modulated by stress
    const phase = (d / days);
    const baseCanopy = 1 / (1 + Math.exp(-10 * (phase - 0.35)));
    const senesce = phase > 0.75 ? 1 - (phase - 0.75) * 2.2 : 1;
    const canopy = clamp(baseCanopy * senesce * (0.6 + 0.4 * Math.min(tempStress, waterStress, nStress)));

    const par = region.radiation * 0.5 * canopy; // intercepted PAR proxy
    const dailyBiomass = par * crop.rue * tempStress * waterStress * nStress; // g/m2
    biomass += dailyBiomass;

    daily.push({ day: d + 1, rain: +rain[d].toFixed(2), temp: +temp.toFixed(1), tempStress: +tempStress.toFixed(3), waterStress: +waterStress.toFixed(3), nStress: +nStress.toFixed(3), canopy: +canopy.toFixed(3), biomass: +biomass.toFixed(1) });
  }

  // biomass g/m2 -> t/ha = /100; yield = biomass * HI
  const rawYield = (biomass / 100) * crop.hi;
  // gentle calibration to reference yield under nominal conditions
  const calib = crop.refYield / ((region.radiation * 0.5 * 0.6 * crop.rue * 0.85 * days / 100) * crop.hi);
  const yieldTHa = Math.max(0, rawYield * calib);

  const revenuePerHa = yieldTHa * crop.pricePerTon;
  const mechFactor = 0.7 + 0.6 * (inp.mechanization / 100); // 0.7..1.3
  const costPerHa = region.costPerHa * (0.6 + 0.4 * nRatio) * mechFactor + irrigation * 1.2 * days;
  const profitPerHa = revenuePerHa - costPerHa;
  const marginPct = revenuePerHa > 0 ? (profitPerHa / revenuePerHa) * 100 : 0;

  return {
    daily,
    yieldTHa,
    refYield: crop.refYield,
    yieldDeltaPct: ((yieldTHa - crop.refYield) / crop.refYield) * 100,
    revenuePerHa,
    costPerHa,
    profitPerHa,
    marginPct,
    totalRevenue: revenuePerHa * area,
    totalProfit: profitPerHa * area,
  };
}

export interface MonteCarloResult {
  trials: number;
  meanYield: number;
  p10: number;
  p90: number;
  lossProbability: number; // P(profit < 0)
  failureProbability: number; // P(yield < 50% reference)
  histogram: { bin: number; count: number }[];
}

export function monteCarlo(inp: SimInputs, trials = 200): MonteCarloResult {
  const yields: number[] = [];
  const profits: number[] = [];
  for (let i = 0; i < trials; i++) {
    const rainMul = 0.55 + Math.random() * 0.9; // 0.55..1.45
    const tempDelta = (Math.random() - 0.5) * 6; // ±3°C
    const r = runSim({ ...inp, rainMultiplier: rainMul, tempDelta }, 1000 + i);
    yields.push(r.yieldTHa);
    profits.push(r.profitPerHa);
  }
  yields.sort((a, b) => a - b);
  const p = (q: number) => yields[Math.min(yields.length - 1, Math.floor(q * yields.length))];
  const lossProbability = profits.filter(p => p < 0).length / trials;
  const failureProbability = yields.filter(y => y < inp.crop.refYield * 0.5).length / trials;
  const meanYield = yields.reduce((a, b) => a + b, 0) / trials;

  const max = Math.max(...yields, 1);
  const bins = 12;
  const histogram = Array.from({ length: bins }, (_, i) => ({ bin: +((i + 0.5) * (max / bins)).toFixed(1), count: 0 }));
  yields.forEach(y => {
    const idx = Math.min(bins - 1, Math.floor((y / max) * bins));
    histogram[idx].count++;
  });
  return { trials, meanYield, p10: p(0.1), p90: p(0.9), lossProbability, failureProbability, histogram };
}
