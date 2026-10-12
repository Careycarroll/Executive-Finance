/**
 * yield-curve.js — Term Structure, Forward Rates, Parallel Shifts, and Twists
 * Reference: Bodie, Investments, Chapter 15 (The Term Structure of Interest Rates).
 */

/**
 * Calculate discrete forward rate between t1 and t2 given spot rates s1 and s2
 */
export function calcForwardRate(spot1, t1, spot2, t2) {
  if (t2 <= t1) return spot1;
  const growth1 = Math.pow(1 + spot1, t1);
  const growth2 = Math.pow(1 + spot2, t2);
  const ratio = growth2 / growth1;
  return Math.pow(ratio, 1 / (t2 - t1)) - 1;
}

/**
 * Generate full forward rate curve from spot curve points
 * @param {number[]} tenors Array of tenors in years (e.g. [1, 2, 3, 5, 10, 30])
 * @param {number[]} spotRates Corresponding spot rates (e.g. [0.04, 0.045, ...])
 * @returns {Array<{ t1: number, t2: number, tenorLabel: string, forwardRate: number }>}
 */
export function generateForwardCurve(tenors, spotRates) {
  if (!Array.isArray(tenors) || tenors.length < 2) return [];

  const forwardCurve = [];
  for (let i = 0; i < tenors.length - 1; i++) {
    const t1 = tenors[i];
    const t2 = tenors[i + 1];
    const s1 = spotRates[i];
    const s2 = spotRates[i + 1];
    const fRate = calcForwardRate(s1, t1, s2, t2);

    forwardCurve.push({
      t1,
      t2,
      tenorLabel: `${t1}Y-${t2}Y`,
      forwardRate: fRate,
    });
  }

  return forwardCurve;
}

/**
 * Transform yield curve by applying parallel shift and twist
 * @param {number[]} tenors Array of tenors
 * @param {number[]} baseRates Base spot rates
 * @param {number} [shiftBps=0] Parallel shift in basis points (1 bp = 0.0001)
 * @param {number} [twistBps=0] Twist slope in basis points (positive = steepening, negative = flattening)
 * @param {number} [pivotTenor=5] Pivot tenor for twist rotation in years
 */
export function transformYieldCurve(tenors, baseRates, shiftBps = 0, twistBps = 0, pivotTenor = 5) {
  const shift = shiftBps / 10000;
  const twist = twistBps / 10000;
  const minT = tenors[0];
  const maxT = tenors[tenors.length - 1];
  const span = Math.max(1, maxT - minT);

  return baseRates.map((r, i) => {
    const t = tenors[i];
    const rotationFactor = (t - pivotTenor) / span;
    const shiftedRate = r + shift + twist * rotationFactor;
    return Math.max(0.0001, shiftedRate); // floored slightly above zero
  });
}
