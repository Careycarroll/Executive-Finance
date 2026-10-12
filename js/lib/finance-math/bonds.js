/**
 * bonds.js — Bond pricing, Macaulay duration, modified duration, and convexity
 * References: Bodie Chapter 14 & 16; Hawawini Chapter 10.
 */

/**
 * Price a fixed-rate bond
 * @param {number} face Face / par value (e.g. 1000)
 * @param {number} couponRate Annual coupon rate (decimal e.g. 0.06)
 * @param {number} ytm Annual Yield to Maturity (decimal e.g. 0.08)
 * @param {number} years Years to maturity (e.g. 10)
 * @param {number} [freq=2] Coupon payments per year (1 for annual, 2 for semiannual)
 * @returns {number} Present value / price of the bond
 */
export function bondPrice(face, couponRate, ytm, years, freq = 2) {
  const n = Math.round(years * freq);
  if (n <= 0) return face;

  const r = ytm / freq;
  const c = (face * couponRate) / freq;

  if (Math.abs(r) < 1e-9) {
    return c * n + face;
  }

  const pvCoupons = c * (1 - Math.pow(1 + r, -n)) / r;
  const pvFace = face / Math.pow(1 + r, n);

  return pvCoupons + pvFace;
}

/**
 * Macaulay Duration in years
 */
export function macaulayDuration(face, couponRate, ytm, years, freq = 2) {
  const n = Math.round(years * freq);
  if (n <= 0) return 0;

  const r = ytm / freq;
  const c = (face * couponRate) / freq;
  const price = bondPrice(face, couponRate, ytm, years, freq);

  if (price <= 0) return 0;

  let weightedPeriods = 0;
  for (let t = 1; t <= n; t++) {
    const cashFlow = (t === n) ? (c + face) : c;
    const pv = cashFlow / Math.pow(1 + r, t);
    weightedPeriods += t * pv;
  }

  const durationPeriods = weightedPeriods / price;
  return durationPeriods / freq;
}

/**
 * Modified Duration
 * Can be called as:
 *   modifiedDuration(macD, ytm, freq)
 * or:
 *   modifiedDuration(face, couponRate, ytm, years, freq)
 */
export function modifiedDuration(arg1, arg2, arg3 = 1, arg4, arg5 = 2) {
  if (arg4 !== undefined) {
    // Called with full bond parameters (face, couponRate, ytm, years, freq)
    const macD = macaulayDuration(arg1, arg2, arg3, arg4, arg5);
    return macD / (1 + arg3 / arg5);
  }
  // Called with (macD, ytm, freq)
  const macD = arg1;
  const ytm = arg2;
  const freq = arg3 || 1;
  return macD / (1 + ytm / freq);
}

/**
 * Bond Convexity (annualized)
 */
export function bondConvexity(face, couponRate, ytm, years, freq = 2) {
  const n = Math.round(years * freq);
  if (n <= 0) return 0;

  const r = ytm / freq;
  const c = (face * couponRate) / freq;
  const price = bondPrice(face, couponRate, ytm, years, freq);

  if (price <= 0) return 0;

  let sum = 0;
  for (let t = 1; t <= n; t++) {
    const cashFlow = (t === n) ? (c + face) : c;
    const pv = cashFlow / Math.pow(1 + r, t);
    sum += t * (t + 1) * pv;
  }

  const convexityPeriods = sum / (price * Math.pow(1 + r, 2));
  return convexityPeriods / (freq * freq);
}

/**
 * Approximate percentage price change using Duration and Convexity
 * @param {number} modD Modified duration
 * @param {number} convexity Annualized convexity
 * @param {number} deltaYtm Change in YTM (e.g. +0.01 for +100 bps)
 * @returns {number} Percentage change in price (decimal e.g. -0.075 for -7.5%)
 */
export function priceChangeApprox(modD, convexity, deltaYtm) {
  return -modD * deltaYtm + 0.5 * convexity * Math.pow(deltaYtm, 2);
}
