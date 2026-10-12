/**
 * fsa.js — Penman Reformulated Financial Statement Analysis and ROE Decomposition
 * Reference: Penman, Financial Statement Analysis and Security Valuation, Ch. 8 & 11.
 */

/**
 * Reformulate Balance Sheet items into Operating and Financing categories
 * @param {Object} input
 * @param {number} input.operatingAssets Operating Assets (OA)
 * @param {number} input.operatingLiabilities Operating Liabilities (OL)
 * @param {number} input.financialLiabilities Financial Obligations / Debt (FO)
 * @param {number} [input.financialAssets=0] Financial Assets / Excess Cash (FA)
 * @returns {Object} Reformulated balance sheet metrics
 */
export function reformulateBalanceSheet({
  operatingAssets = 0,
  operatingLiabilities = 0,
  financialLiabilities = 0,
  financialAssets = 0,
}) {
  const noa = operatingAssets - operatingLiabilities; // Net Operating Assets
  const nfo = financialLiabilities - financialAssets; // Net Financial Obligations
  const cse = noa - nfo; // Common Shareholders' Equity

  return {
    operatingAssets,
    operatingLiabilities,
    financialAssets,
    financialLiabilities,
    noa,
    nfo,
    cse,
  };
}

/**
 * Reformulate Income Statement items into Operating (NOPAT) and Financing (NFE)
 * @param {Object} input
 * @param {number} input.operatingIncome Operating income after tax / NOPAT (OI)
 * @param {number} input.netFinancialExpense Net financial expense after tax (NFE)
 * @returns {Object} Reformulated income statement metrics
 */
export function reformulateIncomeStatement({
  operatingIncome = 0,
  netFinancialExpense = 0,
}) {
  const comprehensiveIncome = operatingIncome - netFinancialExpense;

  return {
    operatingIncome,
    netFinancialExpense,
    comprehensiveIncome,
  };
}

/**
 * Perform Penman ROE Decomposition:
 * ROE = RNOA + [FLEV * (RNOA - NBC)]
 *
 * @param {Object} input
 * @param {number} input.noa Net Operating Assets
 * @param {number} input.nfo Net Financial Obligations
 * @param {number} input.cse Common Shareholders' Equity
 * @param {number} input.operatingIncome NOPAT / OI
 * @param {number} input.netFinancialExpense NFE
 * @returns {Object} Decomposition components and ratios
 */
export function penmanROEDecomposition({
  noa,
  nfo,
  cse,
  operatingIncome,
  netFinancialExpense,
}) {
  const rnoa = noa !== 0 ? operatingIncome / noa : 0;
  const nbc = nfo !== 0 ? netFinancialExpense / nfo : 0;
  const spread = rnoa - nbc;
  const flev = cse !== 0 ? nfo / cse : 0;
  const leverageEffect = flev * spread;
  const roe = rnoa + leverageEffect;

  return {
    rnoa,
    nbc,
    spread,
    flev,
    leverageEffect,
    roe,
    isLeverageFavorable: spread > 0,
  };
}

/**
 * Traditional DuPont 3-way Decomposition
 * ROE = Profit Margin * Asset Turnover * Financial Leverage Multiplier
 */
export function dupont3Way({ netIncome, sales, totalAssets, equity }) {
  const profitMargin = sales !== 0 ? netIncome / sales : 0;
  const assetTurnover = totalAssets !== 0 ? sales / totalAssets : 0;
  const equityMultiplier = equity !== 0 ? totalAssets / equity : 0;
  const roe = profitMargin * assetTurnover * equityMultiplier;

  return {
    profitMargin,
    assetTurnover,
    equityMultiplier,
    roe,
  };
}
