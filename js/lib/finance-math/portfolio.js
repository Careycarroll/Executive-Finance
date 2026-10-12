/**
 * portfolio.js — Modern Portfolio Theory (Markowitz Frontier, Minimum Variance, CAL)
 * Reference: Bodie, Investments, Chapters 6, 7, & 8.
 */

/**
 * Expected return of a 2-asset portfolio
 */
export function calcPortfolioReturn(wA, rA, rB) {
  return wA * rA + (1 - wA) * rB;
}

/**
 * Volatility (standard deviation) of a 2-asset portfolio
 */
export function calcPortfolioVol(wA, volA, volB, corr) {
  const wB = 1 - wA;
  const varP = wA * wA * volA * volA + wB * wB * volB * volB + 2 * wA * wB * volA * volB * corr;
  return Math.sqrt(Math.max(0, varP));
}

/**
 * Sharpe Ratio
 */
export function calcSharpe(expReturn, vol, riskFree = 0.03) {
  if (vol <= 0) return 0;
  return (expReturn - riskFree) / vol;
}

/**
 * Minimum Variance Portfolio (MVP) weight for Asset A
 */
export function calcMVPWeight(volA, volB, corr) {
  const varA = volA * volA;
  const varB = volB * volB;
  const covAB = volA * volB * corr;

  const denom = varA + varB - 2 * covAB;
  if (Math.abs(denom) < 1e-9) return 0.5;

  return (varB - covAB) / denom;
}

/**
 * Optimal Tangency Portfolio (Max Sharpe Ratio) weight for Asset A
 */
export function calcTangencyWeight(rA, volA, rB, volB, corr, riskFree = 0.03) {
  const eA = rA - riskFree;
  const eB = rB - riskFree;
  const varA = volA * volA;
  const varB = volB * volB;
  const covAB = volA * volB * corr;

  const num = eA * varB - eB * covAB;
  const denom = eA * varB + eB * varA - (eA + eB) * covAB;

  if (Math.abs(denom) < 1e-9) return 0.5;

  const wA = num / denom;
  return Math.max(-0.5, Math.min(1.5, wA)); // bounded within reasonable borrowing range
}

/**
 * Generate full Efficient Frontier curve points
 */
export function generateFrontierPoints(rA, volA, rB, volB, corr, numPoints = 80) {
  const points = [];
  const minW = -0.3;
  const maxW = 1.3;
  const step = (maxW - minW) / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    const wA = minW + i * step;
    const expReturn = calcPortfolioReturn(wA, rA, rB);
    const vol = calcPortfolioVol(wA, volA, volB, corr);
    points.push({ wA, wB: 1 - wA, expReturn, vol });
  }

  // Sort by volatility ascending
  points.sort((a, b) => a.vol - b.vol);

  const mvp = points[0]; // lowest vol point
  // Efficient branch: points with return >= MVP return
  const efficient = points.filter(p => p.expReturn >= mvp.expReturn);
  const inefficient = points.filter(p => p.expReturn < mvp.expReturn);

  return {
    allPoints: points,
    efficient,
    inefficient,
    mvp,
  };
}

/**
 * Calculate the average pairwise correlation across off-diagonal pairs in an N×N matrix.
 * @param {number[][]} matrix
 * @returns {number}
 */
export function calcAverageCorrelation(matrix) {
  if (!matrix || matrix.length <= 1) return 1.0;
  const n = matrix.length;
  let sum = 0;
  let count = 0;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const val = matrix[i] && typeof matrix[i][j] === 'number' ? matrix[i][j] : 0;
      sum += val;
      count++;
    }
  }

  return count > 0 ? sum / count : 1.0;
}

/**
 * Calculate equal-weighted portfolio volatility and Diversification Ratio (DR).
 * Reference: Bodie Investments Ch. 7 & Choueifaty & Coignard (2008).
 * Diversification Ratio = (weighted average asset vol) / (portfolio vol)
 * @param {number[][]} matrix - N×N correlation matrix
 * @param {number[]} [vols] - Asset volatilities (defaults to uniform 0.20)
 * @returns {{ portVol: number, avgVol: number, divRatio: number, avgCorr: number, divBenefitPct: number }}
 */
export function calcPortfolioDiversification(matrix, vols = null) {
  const n = matrix.length;
  if (n === 0) {
    return { portVol: 0, avgVol: 0, divRatio: 1, avgCorr: 1, divBenefitPct: 0 };
  }

  const assetVols = Array.isArray(vols) && vols.length === n
    ? vols
    : Array(n).fill(0.20);

  const w = 1 / n;
  let variance = 0;
  let weightedVolSum = 0;

  for (let i = 0; i < n; i++) {
    weightedVolSum += w * assetVols[i];
    for (let j = 0; j < n; j++) {
      const corr = matrix[i]?.[j] ?? (i === j ? 1 : 0);
      variance += w * w * assetVols[i] * assetVols[j] * corr;
    }
  }

  const portVol = Math.sqrt(Math.max(0, variance));
  const divRatio = portVol > 1e-9 ? weightedVolSum / portVol : 1.0;
  const avgCorr = calcAverageCorrelation(matrix);
  // Diversification benefit %: relative variance reduction compared to perfect correlation
  const divBenefitPct = Math.max(0, (1 - avgCorr) * 100);

  return {
    portVol,
    avgVol: weightedVolSum,
    divRatio,
    avgCorr,
    divBenefitPct,
  };
}
