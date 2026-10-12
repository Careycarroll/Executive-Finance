/**
 * multiples.js — Comparable Company Multiples & Relative Valuation Math
 * References:
 * - Easton, McAnally, Sommers & Zhang: Financial Statement Analysis & Valuation (Module 14)
 * - Lundholm & Sloan: Equity Valuation and Analysis (Ch. 11)
 * - Baker & Ruback (1999) / Liu, Nissim & Thomas (2002): Harmonic mean properties for relative valuation
 */

/**
 * Calculate the arithmetic mean of an array of numbers.
 * @param {number[]} values
 * @returns {number}
 */
export function arithmeticMean(values) {
  if (!values || values.length === 0) return 0;
  const valid = values.filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v));
  if (valid.length === 0) return 0;
  return valid.reduce((sum, v) => sum + v, 0) / valid.length;
}

/**
 * Calculate the harmonic mean of an array of positive numbers.
 * H = n / sum(1 / x_i)
 * Per Easton/Lundholm, harmonic mean mitigates upward bias in price-to-fundamental ratios.
 * @param {number[]} values
 * @returns {number}
 */
export function harmonicMean(values) {
  if (!values || values.length === 0) return 0;
  const valid = values.filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v) && v > 0);
  if (valid.length === 0) return 0;
  const sumInv = valid.reduce((sum, v) => sum + (1 / v), 0);
  return sumInv === 0 ? 0 : valid.length / sumInv;
}

/**
 * Calculate the median of an array of numbers.
 * @param {number[]} values
 * @returns {number}
 */
export function median(values) {
  if (!values || values.length === 0) return 0;
  const valid = values.filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v)).slice().sort((a, b) => a - b);
  if (valid.length === 0) return 0;
  const mid = Math.floor(valid.length / 2);
  return valid.length % 2 !== 0
    ? valid[mid]
    : (valid[mid - 1] + valid[mid]) / 2;
}

/**
 * Compute statistical summary for a multiple metric across peers.
 * @param {number[]} values
 * @returns {{ count: number, min: number, max: number, arithmeticMean: number, harmonicMean: number, median: number }}
 */
export function compSummaryStats(values) {
  const valid = (values || []).filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v) && v > 0);
  if (valid.length === 0) {
    return { count: 0, min: 0, max: 0, arithmeticMean: 0, harmonicMean: 0, median: 0 };
  }
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  return {
    count: valid.length,
    min,
    max,
    arithmeticMean: arithmeticMean(valid),
    harmonicMean: harmonicMean(valid),
    median: median(valid),
  };
}

/**
 * Compute implied Enterprise Value and Equity Value for a single multiple.
 * @param {Object} params
 * @param {string} params.metricKey - e.g. 'ev_ebitda', 'pe', 'pb', 'ev_sales'
 * @param {number} params.multipleValue - The multiple ratio (e.g. 10.5x)
 * @param {Object} params.target - Target financials { ebitda, earnings, book_value, sales, net_debt }
 * @param {number} [params.netDebt=0]
 * @returns {{ impliedEV: number, impliedEquity: number, multipleValue: number, metricKey: string }}
 */
export function impliedValuationForMetric({
  metricKey,
  multipleValue,
  target = {},
  netDebt = 0,
}) {
  const debt = typeof target.net_debt === 'number' ? target.net_debt : netDebt;
  let impliedEV = 0;
  let impliedEquity = 0;

  if (metricKey === 'ev_ebitda') {
    const ebitda = target.ebitda || 0;
    impliedEV = ebitda * multipleValue;
    impliedEquity = impliedEV - debt;
  } else if (metricKey === 'ev_sales') {
    const sales = target.sales || 0;
    impliedEV = sales * multipleValue;
    impliedEquity = impliedEV - debt;
  } else if (metricKey === 'pe' || metricKey === 'p_e') {
    const earnings = target.earnings || target.net_income || 0;
    impliedEquity = earnings * multipleValue;
    impliedEV = impliedEquity + debt;
  } else if (metricKey === 'pb' || metricKey === 'p_b') {
    const bookValue = target.book_value || target.equity || 0;
    impliedEquity = bookValue * multipleValue;
    impliedEV = impliedEquity + debt;
  } else {
    // Generic fallback: assumes equity multiple
    const base = target[metricKey] || 0;
    impliedEquity = base * multipleValue;
    impliedEV = impliedEquity + debt;
  }

  return {
    metricKey,
    multipleValue,
    impliedEV: Math.max(0, impliedEV),
    impliedEquity: Math.max(0, impliedEquity),
  };
}

/**
 * Compute full valuation ranges and weighted blended target valuation.
 * @param {Object} params
 * @param {Object} params.target - Target financials
 * @param {Array<Object>} params.comps - Array of comp objects, e.g. [{ name, ev_ebitda, pe, pb }]
 * @param {Object} [params.weights] - Weight for each multiple (e.g. { ev_ebitda: 0.5, pe: 0.3, pb: 0.2 })
 * @param {string} [params.meanType='harmonic'] - 'harmonic' | 'arithmetic' | 'median'
 * @param {number} [params.netDebt=0]
 * @returns {Object} Comprehensive valuation summary with ranges and blended values
 */
export function computeValuationRanges({
  target = {},
  comps = [],
  weights = { ev_ebitda: 0.5, pe: 0.3, pb: 0.2 },
  meanType = 'harmonic',
  netDebt = 0,
}) {
  const debt = typeof target.net_debt === 'number' ? target.net_debt : netDebt;
  const metrics = ['ev_ebitda', 'pe', 'pb'];

  // Discover any additional metric keys present in comps or weights
  const discoveredKeys = new Set(metrics);
  comps.forEach(comp => {
    Object.keys(comp).forEach(k => {
      if (k !== 'name' && k !== 'id' && typeof comp[k] === 'number') {
        discoveredKeys.add(k);
      }
    });
  });
  Object.keys(weights).forEach(k => discoveredKeys.add(k));

  const metricResults = {};
  let totalWeight = 0;
  let blendedEquityLow = 0;
  let blendedEquityMid = 0;
  let blendedEquityHigh = 0;
  let blendedEVLow = 0;
  let blendedEVMid = 0;
  let blendedEVHigh = 0;

  for (const metric of discoveredKeys) {
    const values = comps.map(c => c[metric]).filter(v => typeof v === 'number' && !isNaN(v) && v > 0);
    const stats = compSummaryStats(values);

    let chosenMultiple = stats.harmonicMean;
    if (meanType === 'arithmetic') chosenMultiple = stats.arithmeticMean;
    else if (meanType === 'median') chosenMultiple = stats.median;

    const lowVal = impliedValuationForMetric({ metricKey: metric, multipleValue: stats.min, target, netDebt: debt });
    const midVal = impliedValuationForMetric({ metricKey: metric, multipleValue: chosenMultiple, target, netDebt: debt });
    const highVal = impliedValuationForMetric({ metricKey: metric, multipleValue: stats.max, target, netDebt: debt });

    const weight = weights[metric] || 0;

    metricResults[metric] = {
      metricKey: metric,
      stats,
      chosenMultiple,
      weight,
      low: lowVal,
      mid: midVal,
      high: highVal,
    };

    if (weight > 0 && stats.count > 0) {
      totalWeight += weight;
      blendedEquityLow += lowVal.impliedEquity * weight;
      blendedEquityMid += midVal.impliedEquity * weight;
      blendedEquityHigh += highVal.impliedEquity * weight;
      blendedEVLow += lowVal.impliedEV * weight;
      blendedEVMid += midVal.impliedEV * weight;
      blendedEVHigh += highVal.impliedEV * weight;
    }
  }

  // Normalize by total active weight
  if (totalWeight > 0) {
    blendedEquityLow /= totalWeight;
    blendedEquityMid /= totalWeight;
    blendedEquityHigh /= totalWeight;
    blendedEVLow /= totalWeight;
    blendedEVMid /= totalWeight;
    blendedEVHigh /= totalWeight;
  }

  const shares = target.shares || target.shares_outstanding || 0;
  const impliedSharePrice = shares > 0 ? blendedEquityMid / shares : null;

  return {
    metrics: metricResults,
    meanType,
    totalWeight,
    blended: {
      equity: {
        low: blendedEquityLow,
        mid: blendedEquityMid,
        high: blendedEquityHigh,
      },
      ev: {
        low: blendedEVLow,
        mid: blendedEVMid,
        high: blendedEVHigh,
      },
      impliedSharePrice,
    },
  };
}

