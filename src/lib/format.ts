/** Greenprint · display formatting helpers (safe on server and client). */

export function formatCo2(grams: number): string {
  const g = Math.abs(grams);
  if (g >= 1000) return `${(grams / 1000).toFixed(2)} kg`;
  if (g >= 1) return `${grams.toFixed(2)} g`;
  if (g >= 0.001) return `${(grams * 1000).toFixed(1)} mg`;
  if (g > 0) return `${(grams * 1e6).toFixed(0)} µg`;
  return "0 g";
}

/** For animated counters: split a CO2 value into a number + unit + decimals. */
export function co2Display(grams: number): { value: number; unit: string; decimals: number } {
  const g = Math.abs(grams);
  if (g >= 1000) return { value: grams / 1000, unit: "kg", decimals: 2 };
  if (g >= 1) return { value: grams, unit: "g", decimals: 2 };
  if (g >= 0.001) return { value: grams * 1000, unit: "mg", decimals: 1 };
  return { value: grams * 1e6, unit: "µg", decimals: 0 };
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return "0 ms";
  if (ms < 1) return `${(ms * 1000).toFixed(0)} µs`;
  if (ms < 1000) return `${ms < 10 ? ms.toFixed(2) : Math.round(ms)} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)} s`;
  const m = s / 60;
  if (m < 60) return `${m.toFixed(1)} min`;
  const h = m / 60;
  if (h < 48) return `${h.toFixed(1)} h`;
  return `${(h / 24).toFixed(1)} days`;
}

export function formatEnergy(joules: number): string {
  if (joules < 0.001) return `${(joules * 1000).toFixed(2)} mJ`;
  if (joules < 1000) return `${joules.toFixed(2)} J`;
  if (joules < 3_600_000) return `${(joules / 1000).toFixed(2)} kJ`;
  return `${(joules / 3_600_000).toFixed(3)} kWh`;
}

export function formatOps(n: number): string {
  if (n < 1000) return `${Math.round(n)}`;
  const units: [string, number][] = [
    ["quadrillion", 1e15],
    ["T", 1e12],
    ["B", 1e9],
    ["M", 1e6],
    ["K", 1e3],
  ];
  for (const [suffix, value] of units) {
    if (n >= value) return `${(n / value).toFixed(1)}${suffix === "quadrillion" ? "+ " : ""}${suffix === "quadrillion" ? "" : suffix}`;
  }
  return `${Math.round(n)}`;
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString();
}
