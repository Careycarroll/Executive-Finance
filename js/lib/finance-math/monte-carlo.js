/**
 * monte-carlo.js — Geometric Brownian Motion (GBM) simulation, VaR, CVaR & Histogram Binning
 * Reference: Hull Chapter 21 (Monte Carlo) & 22 (VaR & Expected Shortfall).
 */

/**
 * Seedable PRNG (Mulberry32) for fast, reproducible simulations
 */
export function createRNG(seed = 123456789) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Box-Muller transform: generate standard normal variate N(0, 1)
 */
export function sampleStandardNormal(rng) {
  let u1 = rng();
  while (u1 <= 1e-15) u1 = rng(); // avoid log(0)
  const u2 = rng();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

/**
 * Run Geometric Brownian Motion simulation
 * @param {Object} params
 * @param {number} params.s0 Initial stock price
 * @param {number} params.drift Annual drift / expected return (mu)
 * @param {number} params.vol Annual volatility (sigma)
 * @param {number} params.horizon Horizon in years (T)
 * @param {number} [params.nPaths=10000] Number of simulation paths
 * @param {number} [params.seed=42] Random seed
 * @returns {Object} Simulation outcomes and statistics
 */
export function runGBMSimulation({
  s0 = 100,
  drift = 0.08,
  vol = 0.20,
  horizon = 1.0,
  nPaths = 5000,
  seed = 42,
}) {
  const rng = createRNG(seed);
  const driftTerm = (drift - 0.5 * vol * vol) * horizon;
  const volTerm = vol * Math.sqrt(horizon);

  const outcomes = new Float64Array(nPaths);
  let sum = 0;
  let sumSq = 0;

  for (let i = 0; i < nPaths; i++) {
    const z = sampleStandardNormal(rng);
    const st = s0 * Math.exp(driftTerm + volTerm * z);
    outcomes[i] = st;
    sum += st;
    sumSq += st * st;
  }

  // Sort for percentiles
  outcomes.sort();

  const mean = sum / nPaths;
  const variance = sumSq / nPaths - mean * mean;
  const stdDev = Math.sqrt(Math.max(0, variance));

  const p5Index = Math.floor(nPaths * 0.05);
  const p50Index = Math.floor(nPaths * 0.50);
  const p95Index = Math.floor(nPaths * 0.95);

  const p5 = outcomes[p5Index];
  const p50 = outcomes[p50Index];
  const p95 = outcomes[p95Index];

  // VaR (95% confidence): loss below initial capital s0
  const var95 = Math.max(0, s0 - p5);

  // CVaR / Expected Shortfall (average outcome in the worst 5% tail)
  let tailSum = 0;
  for (let i = 0; i < p5Index; i++) {
    tailSum += outcomes[i];
  }
  const expectedShortfallOutcome = p5Index > 0 ? tailSum / p5Index : p5;
  const cvar95 = Math.max(0, s0 - expectedShortfallOutcome);

  // Generate histogram bins
  const minVal = outcomes[0];
  const maxVal = outcomes[nPaths - 1];
  const numBins = 30;
  const binWidth = (maxVal - minVal) / numBins;
  const bins = [];

  for (let b = 0; b < numBins; b++) {
    const binMin = minVal + b * binWidth;
    const binMax = binMin + binWidth;
    bins.push({
      binMin,
      binMax,
      binMid: binMin + binWidth / 2,
      count: 0,
      frequency: 0,
      isTail: binMidIsTail(binMin, binMax, p5),
    });
  }

  for (let i = 0; i < nPaths; i++) {
    const val = outcomes[i];
    let bIndex = Math.floor((val - minVal) / binWidth);
    if (bIndex >= numBins) bIndex = numBins - 1;
    bins[bIndex].count++;
  }

  bins.forEach(b => {
    b.frequency = b.count / nPaths;
  });

  return {
    s0,
    mean,
    stdDev,
    p5,
    p50,
    p95,
    var95,
    cvar95,
    expectedShortfallOutcome,
    minVal,
    maxVal,
    bins,
    nPaths,
  };
}

function binMidIsTail(binMin, binMax, cutoff) {
  return (binMin + binMax) / 2 <= cutoff;
}

