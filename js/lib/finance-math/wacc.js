/**
 * wacc.js — Cost of Capital, CAPM, and Weighted Average Cost of Capital
 * References: Hawawini Chapter 11 & 12; Bodie Chapter 9.
 */

/**
 * CAPM Expected Return / Cost of Equity
 */
export function costOfEquityCAPM(rf, beta, rm) {
  const marketRiskPremium = rm - rf;
  return rf + beta * marketRiskPremium;
}

/**
 * Weighted Average Cost of Capital (WACC)
 * @param {number} equityVal Market value of equity (E)
 * @param {number} debtVal Market value of debt (D)
 * @param {number} costOfEquity Cost of equity (r_e, decimal e.g. 0.10)
 * @param {number} costOfDebt Pre-tax cost of debt (r_d, decimal e.g. 0.05)
 * @param {number} taxRate Corporate marginal tax rate (t, decimal e.g. 0.25)
 */
export function wacc(equityVal, debtVal, costOfEquity, costOfDebt, taxRate) {
  const totalVal = equityVal + debtVal;
  if (totalVal <= 0) return 0;

  const weightE = equityVal / totalVal;
  const weightD = debtVal / totalVal;
  const afterTaxCostOfDebt = costOfDebt * (1 - taxRate);

  return weightE * costOfEquity + weightD * afterTaxCostOfDebt;
}

/**
 * Annual Interest Tax Shield
 */
export function annualTaxShield(debtVal, costOfDebt, taxRate) {
  return debtVal * costOfDebt * taxRate;
}
