/**
 * tvm.js — Time Value of Money, NPV, IRR, and Cash Flow calculations
 * References: Hawawini Chapter 2; Bodie Chapter 5.
 */

/**
 * Present Value of a single future cash flow
 */
export function presentValue(fv, rate, periods) {
  if (periods === 0) return fv;
  return fv / Math.pow(1 + rate, periods);
}

/**
 * Future Value of a single present cash flow
 */
export function futureValue(pv, rate, periods) {
  if (periods === 0) return pv;
  return pv * Math.pow(1 + rate, periods);
}

/**
 * Ordinary Annuity Present Value
 */
export function annuityPV(pmt, rate, periods) {
  if (periods <= 0) return 0;
  if (Math.abs(rate) < 1e-9) return pmt * periods;
  return pmt * (1 - Math.pow(1 + rate, -periods)) / rate;
}

/**
 * Growing Annuity Present Value (first payment C1 at end of period 1)
 */
export function growingAnnuityPV(c1, rate, growth, periods) {
  if (periods <= 0) return 0;
  if (Math.abs(rate - growth) < 1e-9) {
    return periods * c1 / (1 + rate);
  }
  return (c1 / (rate - growth)) * (1 - Math.pow((1 + growth) / (1 + rate), periods));
}

/**
 * Net Present Value of a cash flow stream: [CF_0, CF_1, ..., CF_n]
 * @param {number} rate Discount rate (annual decimal e.g. 0.10)
 * @param {number[]} cashFlows Array of cash flows starting at t=0
 */
export function npv(rate, cashFlows) {
  if (!Array.isArray(cashFlows) || cashFlows.length === 0) return 0;
  return cashFlows.reduce((acc, cf, t) => {
    return acc + cf / Math.pow(1 + rate, t);
  }, 0);
}

/**
 * Internal Rate of Return (IRR)
 * Uses Newton-Raphson with bisection fallback.
 * @param {number[]} cashFlows Array of cash flows [CF_0, CF_1, ...]
 * @param {number} [guess=0.10] Initial rate guess
 * @returns {number|null} IRR as a decimal, or null if no solution found
 */
export function irr(cashFlows, guess = 0.10) {
  if (!Array.isArray(cashFlows) || cashFlows.length < 2) return null;

  // Check if there is at least one sign change
  let hasPos = false;
  let hasNeg = false;
  for (const cf of cashFlows) {
    if (cf > 0) hasPos = true;
    if (cf < 0) hasNeg = true;
    if (hasPos && hasNeg) break;
  }
  if (!hasPos || !hasNeg) return null;

  // Newton-Raphson
  let rate = guess;
  const maxIterations = 50;
  const tolerance = 1e-7;

  for (let i = 0; i < maxIterations; i++) {
    if (rate <= -0.999) rate = -0.99;

    let fVal = 0;
    let fPrime = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      const denom = Math.pow(1 + rate, t);
      fVal += cashFlows[t] / denom;
      if (t > 0) {
        fPrime -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
      }
    }

    if (Math.abs(fVal) < tolerance) {
      return rate;
    }

    if (Math.abs(fPrime) < 1e-12) {
      break; // Fallback to bisection
    }

    const nextRate = rate - fVal / fPrime;
    if (Math.abs(nextRate - rate) < tolerance) {
      return nextRate;
    }

    if (nextRate < -0.95 || nextRate > 10.0) {
      break; // Out of reasonable bounds, fallback to bisection
    }

    rate = nextRate;
  }

  // Bisection fallback on [-0.90, 5.0]
  let low = -0.90;
  let high = 5.0;
  let npvLow = npv(low, cashFlows);
  let npvHigh = npv(high, cashFlows);

  if (npvLow * npvHigh > 0) {
    // Try wider range [0, 10]
    low = 0;
    high = 10.0;
    npvLow = npv(low, cashFlows);
    npvHigh = npv(high, cashFlows);
    if (npvLow * npvHigh > 0) return null;
  }

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const npvMid = npv(mid, cashFlows);

    if (Math.abs(npvMid) < tolerance || (high - low) / 2 < tolerance) {
      return mid;
    }

    if (npvLow * npvMid < 0) {
      high = mid;
      npvHigh = npvMid;
    } else {
      low = mid;
      npvLow = npvMid;
    }
  }

  return (low + high) / 2;
}

/**
 * Generate full period-by-period discounted cash flow stream
 * @param {number[]} baseCashFlows Array of cash flows starting at t=0
 * @param {number} rate Discount rate (decimal)
 * @param {number} [growth=0] Growth rate applied to cash flows for t >= 2 relative to t=1
 */
export function discountedCashFlows(baseCashFlows, rate, growth = 0) {
  if (!Array.isArray(baseCashFlows)) return [];

  let cumNominal = 0;
  let cumPv = 0;

  return baseCashFlows.map((baseCf, t) => {
    let cf = baseCf;
    if (t > 1 && growth !== 0) {
      // Apply growth compounding after period 1
      cf = baseCashFlows[1] * Math.pow(1 + growth, t - 1);
    }

    const discountFactor = 1 / Math.pow(1 + rate, t);
    const pv = cf * discountFactor;
    cumNominal += cf;
    cumPv += pv;

    return {
      period: t,
      cf,
      discountFactor,
      pv,
      cumNominal,
      cumPv,
    };
  });
}

/**
 * Calculate undiscounted and discounted payback periods
 * @param {number[]} cashFlows Cash flows starting with initial investment at t=0
 * @param {number} [rate=0] Discount rate (if > 0, returns discounted payback)
 * @returns {number|null} Payback in periods/years, or null if not recovered
 */
export function paybackPeriod(cashFlows, rate = 0) {
  if (!Array.isArray(cashFlows) || cashFlows.length < 2 || cashFlows[0] >= 0) return null;

  let cum = cashFlows[0];

  for (let t = 1; t < cashFlows.length; t++) {
    const cf = rate > 0 ? cashFlows[t] / Math.pow(1 + rate, t) : cashFlows[t];
    const prevCum = cum;
    cum += cf;

    if (cum >= 0) {
      // Linear interpolation within period
      const fractionNeeded = Math.abs(prevCum) / cf;
      return (t - 1) + fractionNeeded;
    }
  }

  return null;
}
