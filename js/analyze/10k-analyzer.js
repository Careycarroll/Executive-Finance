/**
 * js/analyze/10k-analyzer.js
 * Workbench 1: 10-K & Penman Financial Statement Analyzer
 *
 * Implements:
 * 1. Multi-year (5Y) Reported Financial Statements & CAGR calculation
 * 2. Penman Reformulated Balance Sheet (OA, OL, NOA, FA, FO, NFO, CSE) & Income Statement (NOPAT/OI, NFE, Tax Shield)
 * 3. Dual ROE Decomposition:
 *    - Penman: ROE = RNOA + FLEV * (RNOA - NBC), with RNOA = OPM * NOAT
 *    - Hawawini & Viallet 5-Factor DuPont:EBIT/Sales * Sales/Assets * EBT/EBIT * NI/EBT * Assets/Equity
 * 4. Working Capital & Cash Conversion Cycle (DSO, DIO, DPO, CCC, WCR/Sales)
 * 5. Sloan Accrual Ratio & Cash Conversion Diagnostics
 * 6. Automated Executive Red Flags & 0-100 Financial Health Scorecard
 */

import {
  getActiveCompany,
  fmtMoney,
  fmtSharePrice,
  fmtPct,
  fmtMult,
  conceptPill,
  highlightNegativeTableCells
} from './state.js';
import { mountTargetBanner } from './hub.js';

/**
 * Compute compound annual growth rate (CAGR) between oldest and newest positive values
 */
export function calcCAGR(oldestVal, newestVal, periods) {
  if (!oldestVal || !newestVal || periods <= 0 || oldestVal <= 0 || newestVal <= 0) {
    return null;
  }
  return Math.pow(newestVal / oldestVal, 1 / periods) - 1;
}

/**
 * Pure computation engine for 10-K & Penman FSA analysis.
 * Exported for unit testing and reuse across workbenches.
 *
 * @param {object} company - Normalized company snapshot
 * @param {object} [opts] - Optional overrides (e.g. operatingCashPctSales = 0.015)
 */
export function normalizeCompanyAnnual(company) {
  if (!company) return [];
  if (company.profile) {
    company.price = company.price ?? company.profile.price;
    company.beta = company.beta ?? company.profile.beta;
    company.marketCap = company.marketCap ?? company.profile.marketCap;
    company.sharesOut = company.sharesOut ?? company.profile.sharesOutstanding;
  }
  if (Array.isArray(company?.financials?.annual) && company.financials.annual.length > 0) {
    return company.financials.annual.slice(0, 5).map(item => ({
      ...item,
      investingCashFlow: item.investingCashFlow ?? 0,
      financingCashFlow: item.financingCashFlow ?? 0,
      debtIssued: item.debtIssued ?? 0,
      debtRepaid: item.debtRepaid ?? 0
    }));
  }
  const incs = company.incomeStatements || [];
  const bss = company.balanceSheets || [];
  const cfs = company.cashFlows || [];
  const len = Math.min(5, Math.max(incs.length, bss.length, cfs.length));
  const merged = [];
  for (let i = 0; i < len; i++) {
    const inc = incs[i] || {};
    const bs = bss[i] || {};
    const cf = cfs[i] || {};
    merged.push({
      year: inc.fy || bs.fy || cf.fy || inc.year || (2024 - i),
      revenue: inc.revenue ?? 0,
      cogs: inc.costOfRevenue ?? inc.cogs ?? 0,
      grossProfit: inc.grossProfit,
      rd: inc.researchAndDevelopment ?? inc.rd ?? 0,
      sga: inc.sellingGeneralAndAdmin ?? inc.sga ?? 0,
      operatingIncome: inc.operatingIncome ?? inc.ebit ?? 0,
      depreciation: inc.depreciation ?? cf.depreciation ?? 0,
      interestExpense: inc.interestExpense ?? 0,
      pretaxIncome: inc.ebt ?? inc.pretaxIncome,
      taxExpense: inc.taxExpense ?? 0,
      netIncome: inc.netIncome ?? 0,
      epsDiluted: inc.epsDiluted ?? 0,
      sharesDiluted: inc.sharesDiluted ?? bs.sharesOutstanding ?? company.sharesOut ?? 1000,
      sbc: cf.stockBasedCompensation ?? inc.sbc ?? 0,
      cash: bs.cash ?? 0,
      shortTermInvestments: bs.shortTermInvestments ?? 0,
      accountsReceivable: bs.accountsReceivable ?? 0,
      inventory: bs.inventory ?? 0,
      currentAssets: bs.currentAssets ?? 0,
      ppeNet: bs.propertyPlantEquipment ?? bs.ppeNet ?? 0,
      goodwill: bs.goodwill ?? 0,
      intangibles: bs.intangibleAssets ?? bs.intangibles ?? 0,
      totalAssets: bs.totalAssets ?? 1,
      accountsPayable: bs.accountsPayable ?? 0,
      shortTermDebt: bs.shortTermDebt ?? 0,
      currentLiabilities: bs.currentLiabilities ?? 0,
      longTermDebt: bs.longTermDebt ?? 0,
      totalLiabilities: bs.totalLiabilities ?? 0,
      stockholdersEquity: bs.totalEquity ?? bs.stockholdersEquity,
      operatingCashFlow: cf.operatingCashFlow ?? 0,
      investingCashFlow: cf.investingCashFlow ?? 0,
      financingCashFlow: cf.financingCashFlow ?? 0,
      capex: cf.capitalExpenditures ?? cf.capex ?? 0,
      freeCashFlow: cf.freeCashFlow,
      dividendsPaid: cf.dividendsPaid ?? 0,
      shareRepurchases: cf.shareBuybacks ?? cf.shareRepurchases ?? 0,
      debtIssued: cf.debtIssued ?? 0,
      debtRepaid: cf.debtRepaid ?? 0
    });
  }
  company.financials = { annual: merged };
  return merged;
}

export function compute10KAnalysis(company, opts = {}) {
  const opCashPctSales = opts.operatingCashPctSales ?? 0.015;
  const rawAnnual = normalizeCompanyAnnual(company);
  // Chronological order (oldest -> newest) for multi-year table display
  const yearsAsc = [...rawAnnual].reverse();
  const numYears = yearsAsc.length;
  const periods = Math.max(1, numYears - 1);

  const byYear = [];
  for (let idx = 0; idx < yearsAsc.length; idx++) {
    const y = yearsAsc[idx];
    const prev = idx > 0 ? byYear[idx - 1] : null;

    const rev = y.revenue || 0;
    const cogs = y.cogs || Math.max(0, rev - (y.grossProfit || 0));
    const gp = y.grossProfit ?? (rev - cogs);
    const rd = y.rd || 0;
    const sga = y.sga || 0;
    const ebit = y.operatingIncome || 0;
    const da = y.depreciation || 0;
    const ebitda = ebit + da;
    const intExp = Math.max(0, y.interestExpense || 0);
    const ebt = y.pretaxIncome ?? (ebit - intExp);
    const taxExp = y.taxExpense || 0;
    const ni = y.netIncome || 0;
    const sbc = y.sbc || 0;

    // Effective tax rate (clamped between 5% and 40%, default 21%)
    const effectiveTaxRate = ebt > 0 && taxExp >= 0
      ? Math.min(0.40, Math.max(0.05, taxExp / ebt))
      : 0.21;

    // Balance sheet items
    const cash = y.cash || 0;
    const shortTermInvestments = y.shortTermInvestments || 0;
    const totalCash = cash + shortTermInvestments;
    const ar = y.accountsReceivable || 0;
    const inv = y.inventory || 0;
    const ca = y.currentAssets || (totalCash + ar + inv);
    const ppe = y.ppeNet || 0;
    const gwIntang = (y.goodwill || 0) + (y.intangibles || 0);
    const ta = y.totalAssets || 1;
    const ap = y.accountsPayable || 0;
    const std = y.shortTermDebt || 0;
    const cl = y.currentLiabilities || (ap + std);
    const ltd = y.longTermDebt || 0;
    const tl = y.totalLiabilities || (cl + ltd);
    const cse = y.stockholdersEquity ?? (ta - tl);

    // Working Capital changes & cash flow construction (Indirect Method)
    const deltaAR = prev ? (ar - prev.ar) : 0;
    const deltaInv = prev ? (inv - prev.inv) : 0;
    const deltaAP = prev ? (ap - prev.ap) : 0;
    // Working capital cash effect: increase in assets drains cash (-), increase in payables provides cash (+)
    const wcCashFlow = (-deltaAR) + (-deltaInv) + deltaAP;

    // Indirect Constructed Operating Cash Flow: Net Income + Non-Cash D&A + Non-Cash SBC + WC Cash Effect
    const constructedOcf = ni + da + sbc + wcCashFlow;

    // Operating Cash Flow (Reported vs. Constructed Fallback)
    const rawOcf = y.operatingCashFlow;
    const hasReportedOcf = rawOcf !== undefined && rawOcf !== null && rawOcf !== 0;
    const ocf = hasReportedOcf ? rawOcf : constructedOcf;
    const isOcfConstructed = !hasReportedOcf;
    const otherOcfAdjustments = hasReportedOcf ? (rawOcf - constructedOcf) : 0;

    // CapEx & Investing Cash Flow (Reported vs. Constructed Fallback)
    const rawCapex = Math.abs(y.capex || 0);
    const constructedCapex = prev ? Math.max(0, (ppe - prev.ppe) + da) : rawCapex;
    const capex = rawCapex > 0 ? rawCapex : constructedCapex;
    const isCapexConstructed = rawCapex === 0 && constructedCapex > 0;
    const fcf = y.freeCashFlow ?? (ocf - capex);

    // Investing Cash Flow (CFI)
    const rawIcf = y.investingCashFlow;
    const hasReportedIcf = rawIcf !== undefined && rawIcf !== null && rawIcf !== 0;
    const icf = hasReportedIcf ? rawIcf : -capex;
    const otherInvestingCashFlow = hasReportedIcf ? (rawIcf - (-capex)) : 0;

    // Financing Cash Flow (CFF)
    const divs = Math.abs(y.dividendsPaid || 0);
    const buybacks = Math.abs(y.shareRepurchases || 0);
    const deltaDebt = prev ? ((std + ltd) - (prev.std + prev.ltd)) : 0;
    const debtIssued = y.debtIssued || (deltaDebt > 0 ? deltaDebt : 0);
    const debtRepaid = y.debtRepaid || (deltaDebt < 0 ? Math.abs(deltaDebt) : 0);
    const netDebtIssued = debtIssued - debtRepaid;

    const rawFinCf = y.financingCashFlow;
    const hasReportedFinCf = rawFinCf !== undefined && rawFinCf !== null && rawFinCf !== 0;
    const finCf = hasReportedFinCf ? rawFinCf : (-divs - buybacks + netDebtIssued);
    const otherFinancingCashFlow = hasReportedFinCf ? (rawFinCf - (-divs - buybacks + netDebtIssued)) : 0;

    // Cash Reconciliation
    const deltaCashFromCF = ocf + icf + finCf;
    const beginningCash = prev ? prev.totalCash : (totalCash - deltaCashFromCF);
    const endingCash = totalCash;
    const netCashChange = totalCash - beginningCash;

    // Penman Reformulation:
    // Operating cash = min(totalCash, opCashPctSales * revenue)
    const operatingCash = Math.min(totalCash, Math.max(0, rev * opCashPctSales));
    const FA = Math.max(0, totalCash - operatingCash); // Financial Assets (excess cash & marketable securities)
    const OA = Math.max(1, ta - FA);                   // Operating Assets
    const FO = std + ltd;                              // Financial Obligations (total debt)
    const OL = Math.max(0, tl - FO);                   // Operating Liabilities (non-interest-bearing)
    const NOA = OA - OL;                               // Net Operating Assets
    const NFO = FO - FA;                               // Net Financial Obligations (Net Debt)

    // Penman Reformulated Income Statement:
    // Tax shield on interest = Interest * statutory/effective tax rate
    const taxShield = intExp * effectiveTaxRate;
    const NOPAT = ebit * (1 - effectiveTaxRate);       // Operating Income after tax (OI)
    const NFE = NOPAT - ni;                            // Net Financial Expense after tax (reconciles OI - NFE = NI)

    // Penman ratios (use positive denominator protection)
    const noaDenom = Math.abs(NOA) > 10 ? NOA : Math.max(100, OA * 0.25);
    const cseDenom = Math.abs(cse) > 10 ? cse : 100;
    const OPM = rev > 0 ? NOPAT / rev : 0;             // Operating Profit Margin after tax
    const NOAT = noaDenom > 0 ? rev / noaDenom : 0;    // Net Operating Asset Turnover
    const RNOA = noaDenom !== 0 ? NOPAT / noaDenom : 0;
    const FLEV = cse > 0 ? NFO / cseDenom : 0;
    const NBC = Math.abs(NFO) > 25 ? NFE / NFO : (FO > 0 ? (intExp * (1 - effectiveTaxRate)) / FO : 0.04);
    const SPREAD = RNOA - NBC;
    const ROE = cse > 0 ? ni / cseDenom : (ni / Math.max(100, ta * 0.15));
    const levGain = FLEV * SPREAD;

    // Penman Free Cash Flow: OI - delta NOA
    const deltaNOA = prev ? (NOA - prev.NOA) : 0;
    const penmanFCF = prev ? (NOPAT - deltaNOA) : fcf;

    // Hawawini & Viallet 5-Factor DuPont:
    const ebitMargin = rev > 0 ? ebit / rev : 0;
    const assetTurnover = ta > 0 ? rev / ta : 0;
    const interestBurden = ebit !== 0 ? ebt / ebit : 1;
    const taxBurden = ebt !== 0 ? ni / ebt : (1 - effectiveTaxRate);
    const equityMultiplier = cse > 0 ? ta / cse : 0;

    // Working Capital & Cash Conversion Cycle:
    const dso = rev > 0 ? (ar / rev) * 365 : 0;
    const dio = cogs > 0 ? (inv / cogs) * 365 : 0;
    const dpo = cogs > 0 ? (ap / cogs) * 365 : 0;
    const ccc = dso + dio - dpo;
    const wcr = ar + inv - ap; // Working Capital Requirement (Hawawini Ch. 4)
    const wcrToSales = rev > 0 ? wcr / rev : 0;
    const nlc = totalCash - std; // Net Liquid Balance (NLB = Cash - Short-term debt, verify WCR + NLB = NWC)


    // Profitability & Quality Ratios:
    const grossMargin = rev > 0 ? gp / rev : 0;
    const ebitdaMargin = rev > 0 ? ebitda / rev : 0;
    const ebtMargin = rev > 0 ? ebt / rev : 0;
    const netMargin = rev > 0 ? ni / rev : 0;
    const ocfMargin = rev > 0 ? ocf / rev : 0;
    const fcfMargin = rev > 0 ? fcf / rev : 0;
    const nopatMargin = rev > 0 ? NOPAT / rev : 0;
    const ocfToNi = ni > 0 ? ocf / ni : (ocf > 0 ? 1.5 : 0);
    const sbcPctRev = rev > 0 ? sbc / rev : 0;
    const sbcAdjustedOpMargin = rev > 0 ? (ebit - sbc) / rev : 0;

    // Sloan Accrual Quality:
    // Total Accruals = Net Income - Operating Cash Flow
    const totalAccruals = ni - ocf;
    const sloanAccrualRatio = OA > 0 ? totalAccruals / OA : 0;
    const goodwillPctAssets = ta > 0 ? gwIntang / ta : 0;

    // Capital Returns & Economic Moat:
    const investedCapital = NOA > 10 ? NOA : Math.max(100, (FO + cse - FA));
    const roic = investedCapital > 10 ? NOPAT / investedCapital : 0;
    const capitalEmployed = (ta - cl) > 10 ? (ta - cl) : Math.max(100, cse + ltd);
    const roce = capitalEmployed > 10 ? ebit / capitalEmployed : 0;
    const roe = cse > 10 ? ni / cse : ROE;
    const roa = ta > 0 ? ni / ta : 0;
    const neutralRoa = ta > 0 ? NOPAT / ta : 0; // Neutral / Unlevered ROA
    const cashRoa = ta > 0 ? ocf / ta : 0; // Cash ROA
    const croic = investedCapital > 10 ? fcf / investedCapital : 0;
    const fixedAssetTurnover = ppe > 0 ? rev / ppe : (rev > 0 ? 5.0 : 0);

    // Turnover & Operating Cycle Frequencies:
    const arTurnover = ar > 0 ? rev / ar : (dso > 0 ? 365 / dso : 0);
    const invTurnover = inv > 0 ? cogs / inv : (dio > 0 ? 365 / dio : 0);
    const apTurnover = ap > 0 ? cogs / ap : (dpo > 0 ? 365 / dpo : 0);
    const workingCapitalTurnover = Math.abs(wcr) > 10 ? rev / wcr : (rev > 0 ? 10 : 0);
    const operatingCycle = dso + dio; // Gross Operating Cycle (days)

    // Liquidity & Short-Term Solvency:
    const currentRatio = cl > 0 ? ca / cl : 0;
    const quickRatio = cl > 0 ? (totalCash + ar) / cl : 0;
    const cashRatio = cl > 0 ? totalCash / cl : 0;
    const ocfToCurrentLiabilities = cl > 0 ? ocf / cl : 0;
    const nwc = ca - cl;
    const nwcToTotalAssets = ta > 0 ? nwc / ta : 0;
    const cashOpEx = Math.max(1, (cogs + sga + rd) - da);
    const dailyCashOpEx = cashOpEx / 365;
    const defensiveInterval = dailyCashOpEx > 0 ? Math.min(999, (totalCash + ar) / dailyCashOpEx) : 365;

    // Fulghieri Strategic Liquidity Framework (Managerial Balance Sheet):
    const ltFinancing = cse + ltd;
    const netFixedAssets = ppe + gwIntang;
    const nlf = ltFinancing - netFixedAssets; // Net Long-Term Financing
    const nsf = std - totalCash; // Net Short-Term Financing (ST Debt - Cash)
    const liquidityRatio = Math.abs(wcr) > 10 ? nlf / wcr : (nlf >= 0 ? 1.5 : -1.0); // LR = NLF / WCR
    const fulghieriStrategy = wcr <= 0
      ? 'Supplier-Funded Float (Negative WCR)'
      : liquidityRatio > 1.05
        ? 'Conservative Strategy (Excess LT Cushion)'
        : liquidityRatio >= 0.95
          ? 'Matching Strategy (Maturity Alignment)'
          : 'Aggressive Strategy (ST Debt Funding WC)';

    // Capital Allocation, Reinvestment & Payouts:
    const capexToDa = da > 0 ? capex / da : (capex > 0 ? 1.5 : 0);
    const capexIntensity = rev > 0 ? capex / rev : 0;
    const deltaWcr = prev ? (wcr - prev.wcr) : 0;
    const reinvestmentNet = (capex - da) + deltaWcr;
    const reinvestmentRate = Math.abs(NOPAT) > 10 ? Math.min(3.0, Math.max(-2.0, reinvestmentNet / NOPAT)) : 0;
    const shareholderPayouts = divs + buybacks;
    const fcfPayoutRatio = fcf > 10 ? shareholderPayouts / fcf : (shareholderPayouts > 0 ? 2.0 : 0);
    const dividendPayoutRatio = ni > 10 ? divs / ni : 0;

    // Solvency, Leverage & Coverage:
    const debtToEquity = cse > 0 ? FO / cse : (FO > 0 ? 9.99 : 0);
    const debtToCapital = (FO + cse) > 0 ? Math.min(1.0, Math.max(0, FO / (FO + cse))) : (FO > 0 ? 1.0 : 0);
    const debtToAssets = ta > 0 ? FO / ta : 0;
    const financialLeverage = cse > 0 ? tl / cse : (tl > 0 ? 9.99 : 0);
    const netDebtToEbitda = ebitda > 0 ? NFO / ebitda : 0;
    const interestCoverage = intExp > 0 ? ebit / intExp : (ebit > 0 ? 50 : 0);
    const ebitdaInterestCoverage = intExp > 0 ? ebitda / intExp : (ebitda > 0 ? 50 : 0);
    const cashInterestCoverage = intExp > 0 ? (ocf + intExp) / intExp : (ocf > 0 ? 50 : 0);
    const ocfToDebt = FO > 0 ? ocf / FO : (FO === 0 && ocf > 0 ? 5.0 : 0);

    // Operating Leverage & Specialized Benchmarks:
    const rdIntensity = rev > 0 ? rd / rev : 0;
    const sgaIntensity = rev > 0 ? sga / rev : 0;
    const revGrowth = prev && prev.rev > 0 ? (rev - prev.rev) / prev.rev : 0;
    const ruleOf40 = revGrowth + fcfMargin;
    const gmroi = inv > 0 ? gp / inv : (gp > 0 ? 10.0 : 0);

    byYear.push({
      year: y.year,
      // Reported IS
      rev, cogs, gp, rd, sga, ebit, da, ebitda, intExp, ebt, taxExp, ni, sbc,
      epsDiluted: y.epsDiluted || (y.sharesDiluted ? ni / y.sharesDiluted : 0),
      sharesDiluted: y.sharesDiluted || 1,
      effectiveTaxRate,
      // Reported BS
      cash, shortTermInvestments, totalCash, ar, inv, ca, ppe, gwIntang, ta, ap, std, cl, ltd, tl, cse,
      // Cash Flow Statement (Full 3-Section + P&L Bridge)
      ocf, rawOcf, isOcfConstructed, constructedOcf, otherOcfAdjustments,
      deltaAR, deltaInv, deltaAP, wcCashFlow,
      capex, rawCapex, isCapexConstructed, constructedCapex,
      fcf,
      icf, rawIcf, otherInvestingCashFlow,
      divs, buybacks,
      debtIssued, debtRepaid, netDebtIssued,
      finCf, rawFinCf, otherFinancingCashFlow,
      deltaCashFromCF, beginningCash, endingCash, netCashChange,
      // Penman Reformulated
      operatingCash, FA, OA, FO, OL, NOA, NFO,
      taxShield, NOPAT, NFE,
      OPM, NOAT, RNOA, FLEV, NBC, SPREAD, ROE, levGain,
      deltaNOA, penmanFCF,
      // DuPont 5-Factor
      ebitMargin, assetTurnover, interestBurden, taxBurden, equityMultiplier,
      // Working Capital & CCC
      dso, dio, dpo, ccc, wcr, wcrToSales, nlc,
      // Ratios
      currentRatio, quickRatio, cashRatio, ocfToCurrentLiabilities, nwc, nwcToTotalAssets, defensiveInterval,
      ltFinancing, netFixedAssets, nlf, nsf, liquidityRatio, fulghieriStrategy,
      debtToEquity, debtToCapital, debtToAssets, financialLeverage, netDebtToEbitda, interestCoverage, ebitdaInterestCoverage, cashInterestCoverage, ocfToDebt,
      grossMargin, ebitdaMargin, ebtMargin, netMargin, ocfMargin, fcfMargin, nopatMargin, ocfToNi,
      roa, neutralRoa, cashRoa, roe,
      sbcPctRev, sbcAdjustedOpMargin,
      totalAccruals, sloanAccrualRatio, goodwillPctAssets,
      investedCapital, roic, capitalEmployed, roce, croic, fixedAssetTurnover,
      arTurnover, invTurnover, apTurnover, workingCapitalTurnover, operatingCycle,
      capexToDa, capexIntensity, deltaWcr, reinvestmentRate, shareholderPayouts, fcfPayoutRatio, dividendPayoutRatio,
      rdIntensity, sgaIntensity, revGrowth, ruleOf40, gmroi
    });
  }

  const oldest = byYear[0] || {};
  const latest = byYear[byYear.length - 1] || {};
  const prev = byYear.length >= 2 ? byYear[byYear.length - 2] : latest;

  // CAGRs across the 5-year window
  const cagrs = {
    rev: calcCAGR(oldest.rev, latest.rev, periods),
    gp: calcCAGR(oldest.gp, latest.gp, periods),
    ebit: calcCAGR(oldest.ebit, latest.ebit, periods),
    ni: calcCAGR(oldest.ni, latest.ni, periods),
    ocf: calcCAGR(oldest.ocf, latest.ocf, periods),
    capex: calcCAGR(oldest.capex, latest.capex, periods),
    fcf: calcCAGR(oldest.fcf, latest.fcf, periods),
    ta: calcCAGR(oldest.ta, latest.ta, periods),
    NOA: calcCAGR(oldest.NOA, latest.NOA, periods)
  };

  // Automated Executive Red Flags & Diagnostic Engine
  const flags = [];
  let healthPoints = 0;
  let maxPoints = 0;

  // 1. Operating Profitability (RNOA vs WACC hurdle ~9%)
  maxPoints += 20;
  if (latest.RNOA >= 0.18) {
    healthPoints += 20;
    flags.push({
      severity: 'positive',
      title: `High Operating Return on Net Operating Assets (RNOA = ${(latest.RNOA * 100).toFixed(1)}%)`,
      detail: `Core operations generate ${(latest.RNOA * 100).toFixed(1)}% after-tax return on net operating capital—well above typical cost of capital (~8–10%), indicating durable economic moat and positive Economic Value Added (EVA).`,
      concept: 'roe-decomposition'
    });
  } else if (latest.RNOA >= 0.09) {
    healthPoints += 14;
    flags.push({
      severity: 'positive',
      title: `Solid Operating Return (RNOA = ${(latest.RNOA * 100).toFixed(1)}%)`,
      detail: `Operating return clears standard cost-of-capital hurdles, driven by ${(latest.OPM * 100).toFixed(1)}% NOPAT margin and ${latest.NOAT.toFixed(2)}x NOA turnover.`,
      concept: 'roe-decomposition'
    });
  } else {
    healthPoints += 5;
    flags.push({
      severity: 'warning',
      title: `Compressed Operating Return (RNOA = ${(latest.RNOA * 100).toFixed(1)}%)`,
      detail: `RNOA is near or below typical WACC hurdles. Growth in NOA without margin expansion risks destroying shareholder value.`,
      concept: 'residual-income'
    });
  }

  // 2. Earnings Quality & Sloan Accrual Anomaly
  maxPoints += 20;
  if (latest.sloanAccrualRatio > 0.05 || (latest.ni > 0 && latest.ocf < latest.ni * 0.75)) {
    healthPoints += 6;
    flags.push({
      severity: 'danger',
      title: `Elevated Accounting Accruals (Sloan Ratio = ${(latest.sloanAccrualRatio * 100).toFixed(1)}%, OCF/NI = ${latest.ocfToNi.toFixed(2)}x)`,
      detail: `GAAP Net Income exceeds Operating Cash Flow or relies heavily on non-cash working capital accruals. Under Sloan's (1996) accrual anomaly, high-accrual firms experience lower future earnings persistence.`,
      concept: 'accrual-quality'
    });
  } else {
    healthPoints += 20;
    flags.push({
      severity: 'positive',
      title: `High Cash Earnings Quality (Sloan Accrual Ratio = ${(latest.sloanAccrualRatio * 100).toFixed(1)}%)`,
      detail: `Operating Cash Flow (${fmtMoney(latest.ocf)}) strongly backs reported Net Income (${fmtMoney(latest.ni)}), signaling conservative revenue recognition and strong cash conversion.`,
      concept: 'accrual-quality'
    });
  }

  // 3. Stock-Based Compensation (SBC) Dilution Check
  maxPoints += 15;
  if (latest.sbcPctRev > 0.08) {
    healthPoints += 4;
    flags.push({
      severity: 'danger',
      title: `Heavy Stock-Based Compensation Dilution (SBC = ${(latest.sbcPctRev * 100).toFixed(1)}% of Revenue)`,
      detail: `SBC (${fmtMoney(latest.sbc)}) consumes ${(latest.sbc / Math.max(1, latest.ocf) * 100).toFixed(0)}% of Operating Cash Flow. Treating SBC as a real economic expense reduces Operating Margin to ${(latest.sbcAdjustedOpMargin * 100).toFixed(1)}%.`,
      concept: 'stock-comp'
    });
  } else if (latest.sbcPctRev > 0.04) {
    healthPoints += 10;
    flags.push({
      severity: 'warning',
      title: `Moderate Stock-Based Compensation (${(latest.sbcPctRev * 100).toFixed(1)}% of Revenue)`,
      detail: `Equity compensation (${fmtMoney(latest.sbc)}) represents a meaningful recurring claim on equity value; ensure DCF models deduct SBC rather than adding it back unadjusted.`,
      concept: 'stock-comp'
    });
  } else {
    healthPoints += 15;
  }

  // 4. Solvency, Interest Coverage & Financial Leverage
  maxPoints += 20;
  if (latest.interestCoverage < 3.0 || latest.netDebtToEbitda > 3.5) {
    healthPoints += 7;
    flags.push({
      severity: 'danger',
      title: `Elevated Leverage / Tight Coverage (Net Debt/EBITDA = ${latest.netDebtToEbitda.toFixed(2)}x, EBIT/Int = ${latest.interestCoverage.toFixed(1)}x)`,
      detail: `Net Financial Obligations (${fmtMoney(latest.NFO)}) create significant fixed financial burden. Rising refinancing rates could compress Net Income via higher NFE.`,
      concept: 'capital-structure'
    });
  } else if (latest.NFO <= 0) {
    healthPoints += 20;
    flags.push({
      severity: 'positive',
      title: `Net Cash Fortress (NFO = ${fmtMoney(latest.NFO)})`,
      detail: `Financial Assets (${fmtMoney(latest.FA)}) exceed total debt (${fmtMoney(latest.FO)}), giving the firm negative Net Financial Obligations and strategic flexibility.`,
      concept: 'reformulated-bs'
    });
  } else {
    healthPoints += 16;
    flags.push({
      severity: 'positive',
      title: `Prudent Debt Coverage (EBIT / Interest = ${latest.interestCoverage.toFixed(1)}x, Net Debt / EBITDA = ${latest.netDebtToEbitda.toFixed(2)}x)`,
      detail: `Positive operating spread (RNOA - NBC = ${(latest.SPREAD * 100).toFixed(1)}%) allows financial leverage to accretively amplify ROE.`,
      concept: 'tax-shield'
    });
  }

  // 5. Working Capital & Cash Conversion Cycle Efficiency
  maxPoints += 15;
  const arGrowth = prev.ar > 0 ? (latest.ar - prev.ar) / prev.ar : 0;
  const revGrowth = prev.rev > 0 ? (latest.rev - prev.rev) / prev.rev : 0;
  if (arGrowth - revGrowth > 0.08) {
    healthPoints += 6;
    flags.push({
      severity: 'warning',
      title: `Receivables Growing Faster Than Revenue (+${(arGrowth * 100).toFixed(1)}% vs +${(revGrowth * 100).toFixed(1)}%)`,
      detail: `DSO expanded to ${latest.dso.toFixed(1)} days. When Accounts Receivable outpaces revenue growth, inspect 10-K footnotes for extended customer credit terms or channel stuffing.`,
      concept: 'revenue-recognition'
    });
  } else if (latest.ccc <= 15) {
    healthPoints += 15;
    flags.push({
      severity: 'positive',
      title: `Negative / Ultra-Fast Cash Conversion Cycle (CCC = ${latest.ccc.toFixed(1)} days)`,
      detail: `Supplier trade credit (DPO = ${latest.dpo.toFixed(0)}d) finances working capital (DSO = ${latest.dso.toFixed(0)}d, DIO = ${latest.dio.toFixed(0)}d), keeping WCR/Sales at ${(latest.wcrToSales * 100).toFixed(1)}%.`,
      concept: 'working-capital'
    });
  } else {
    healthPoints += 12;
  }

  // 6. Goodwill & Intangible Asset Bloat
  maxPoints += 10;
  if (latest.goodwillPctAssets > 0.30) {
    healthPoints += 4;
    flags.push({
      severity: 'warning',
      title: `High Acquisition Goodwill & Intangibles (${(latest.goodwillPctAssets * 100).toFixed(1)}% of Total Assets)`,
      detail: `Goodwill & intangibles (${fmtMoney(latest.gwIntang)}) inflate Operating Assets (OA), depressing NOAT and creating impairment risk if acquired units underperform.`,
      concept: 'ma-mechanics'
    });
  } else {
    healthPoints += 10;
  }

  const healthScore = Math.round((healthPoints / maxPoints) * 100);
  const grade =
    healthScore >= 90 ? 'A+' :
    healthScore >= 82 ? 'A' :
    healthScore >= 75 ? 'B+' :
    healthScore >= 68 ? 'B' :
    healthScore >= 58 ? 'C+' : 'C';

  return {
    company,
    opCashPctSales,
    yearsAsc,
    byYear,
    latest,
    prev,
    oldest,
    cagrs,
    flags,
    healthScore,
    grade
  };
}

/**
 * Render the 10-K & Penman FSA Analyzer UI
 */
export function render10KAnalyzer(company, opCashPct = 0.015, initialTab = 'statements') {
  const root = document.getElementById('wb-10k-root');
  if (!root) return;

  const model = compute10KAnalysis(company, { operatingCashPctSales: opCashPct });
  const { byYear, latest, cagrs, flags, healthScore, grade } = model;

  const scoreColor = healthScore >= 80 ? '#16a34a' : healthScore >= 65 ? '#d97706' : '#dc2626';

  const fmtCagrCell = (c) => {
    if (c === null || c === undefined || Number.isNaN(c)) return `<td class="wb-td-cagr">—</td>`;
    const cls = c >= 0 ? 'pos' : 'neg';
    return `<td class="wb-td-cagr ${cls}">${c >= 0 ? '+' : ''}${(c * 100).toFixed(1)}%</td>`;
  };

  const fmtDeltaPct = (v1, v2) => {
    if (v1 === null || v1 === undefined || v2 === null || v2 === undefined || Number.isNaN(v1) || Number.isNaN(v2)) return '—';
    const diff = (v2 - v1) * 100;
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
  };

  const fmtDeltaMult = (v1, v2) => {
    if (v1 === null || v1 === undefined || v2 === null || v2 === undefined || Number.isNaN(v1) || Number.isNaN(v2)) return '—';
    const diff = v2 - v1;
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}x`;
  };

  const fmtDeltaDays = (v1, v2) => {
    if (v1 === null || v1 === undefined || v2 === null || v2 === undefined || Number.isNaN(v1) || Number.isNaN(v2)) return '—';
    const diff = v2 - v1;
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}d`;
  };

  root.innerHTML = `
    <!-- Top Executive KPI Strip -->
    <div class="wb-kpi-grid">
      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>Financial Health Score</span>
          ${conceptPill('cash-flow-analysis', 'FSA')}
        </div>
        <div class="wb-kpi-card__value" style="color: ${scoreColor};">${healthScore}/100 (${grade})</div>
        <div class="wb-kpi-card__sub">${flags.filter(f => f.severity === 'positive').length} strengths · ${flags.filter(f => f.severity !== 'positive').length} watch items</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>GAAP Revenue &amp; Margin (${latest.year})</span>
          ${conceptPill('revenue-recognition', 'Revenue')}
        </div>
        <div class="wb-kpi-card__value">${fmtMoney(latest.rev)}</div>
        <div class="wb-kpi-card__sub">Net Margin ${fmtPct(latest.netMargin)} · 5Y Rev CAGR ${cagrs.rev ? fmtPct(cagrs.rev) : '—'}</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>Free Cash Flow (${latest.year})</span>
          ${conceptPill('fcf', 'FCF')}
        </div>
        <div class="wb-kpi-card__value">${fmtMoney(latest.fcf)}</div>
        <div class="wb-kpi-card__sub">FCF Margin ${fmtPct(latest.fcfMargin)} · OCF/NI ${latest.ocfToNi.toFixed(2)}x</div>
      </div>

      <div class="wb-kpi-card">
        <div class="wb-kpi-card__label">
          <span>Sloan Accruals &amp; RNOA</span>
          ${conceptPill('accrual-quality', 'Accruals')}
        </div>
        <div class="wb-kpi-card__value" style="color: ${latest.sloanAccrualRatio > 0.05 ? '#dc2626' : '#16a34a'};">${fmtPct(latest.sloanAccrualRatio)}</div>
        <div class="wb-kpi-card__sub">Penman RNOA ${fmtPct(latest.RNOA)} · Total Accruals ${fmtMoney(latest.totalAccruals)}</div>
      </div>
    </div>

    <!-- Sub-Navigation Tabs: Default to Traditional 10-K Format, Penman as Optional -->
    <div class="wb-tabs" role="tablist">
      <button class="wb-tab ${initialTab === 'statements' ? 'active' : ''}" data-tab="statements">1. 5-Year Reported 10-K Statements &amp; CAGR</button>
      <button class="wb-tab ${initialTab === 'penman' ? 'active' : ''}" data-tab="penman">2. Penman Reformulation &amp; ROE (Optional)</button>
      <button class="wb-tab ${initialTab === 'ratios' ? 'active' : ''}" data-tab="ratios">3. Executive Ratio Suite &amp; Working Capital</button>
      <button class="wb-tab ${initialTab === 'diagnostics' ? 'active' : ''}" data-tab="diagnostics">4. Red Flags &amp; Earnings Quality (${flags.length})</button>
    </div>

    <!-- TAB 2: PENMAN REFORMULATION & DUAL ROE DECOMPOSITION (OPTIONAL) -->
    <div id="tab-penman" class="wb-tab-pane" style="${initialTab === 'penman' ? '' : 'display:none;'}">
      <div class="wb-grid-2">
        <!-- Penman ROE Bridge Card -->
        <div class="wb-panel">
          <div class="wb-panel__header">
            <div>
              <h3 class="wb-panel__title">Penman Operating vs. Financing ROE Decomposition (${latest.year})</h3>
              <div class="wb-panel__subtitle">ROE = RNOA + FLEV × (RNOA − NBC) &nbsp;·&nbsp; Separates core operating return from debt leverage</div>
            </div>
            ${conceptPill('roe-decomposition', 'Penman ROE')}
          </div>
          <div class="wb-panel__body">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 1rem; padding: 0.75rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem;">
              <label for="op-cash-slider" style="font-size: 0.78rem; font-weight: 700; color: #334155;">
                Operating Cash Assumption (% of Revenue): <span id="op-cash-val" style="color: #1e40af; font-family: var(--font-mono);">${(opCashPct * 100).toFixed(1)}%</span>
              </label>
              <input id="op-cash-slider" type="range" min="0" max="0.10" step="0.005" value="${opCashPct}" style="width: 180px;" />
            </div>

            <div class="wb-formula-breakdown" style="margin-top: 0;">
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">Operating Margin (OPM)</div>
                <div class="wb-formula-box__val">${fmtPct(latest.OPM)}</div>
                <div style="font-size:0.68rem; color:#64748b;">NOPAT / Sales</div>
              </div>
              <div class="wb-formula-op">×</div>
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">NOA Turnover (NOAT)</div>
                <div class="wb-formula-box__val">${latest.NOAT.toFixed(2)}x</div>
                <div style="font-size:0.68rem; color:#64748b;">Sales / NOA</div>
              </div>
              <div class="wb-formula-op">=</div>
              <div class="wb-formula-box" style="border-color:#93c5fd; background:#eff6ff;">
                <div class="wb-formula-box__label">Operating Return (RNOA)</div>
                <div class="wb-formula-box__val" style="color:#1e40af;">${fmtPct(latest.RNOA)}</div>
                <div style="font-size:0.68rem; color:#1e40af;">NOPAT / NOA</div>
              </div>
            </div>

            <div class="wb-formula-breakdown" style="margin-top: 0.75rem;">
              <div class="wb-formula-box" style="border-color:#93c5fd; background:#eff6ff;">
                <div class="wb-formula-box__label">RNOA</div>
                <div class="wb-formula-box__val" style="color:#1e40af;">${fmtPct(latest.RNOA)}</div>
              </div>
              <div class="wb-formula-op">+</div>
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">FLEV (NFO/CSE)</div>
                <div class="wb-formula-box__val">${latest.FLEV.toFixed(2)}x</div>
              </div>
              <div class="wb-formula-op">×</div>
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">SPREAD (RNOA − NBC)</div>
                <div class="wb-formula-box__val">${fmtPct(latest.SPREAD)}</div>
              </div>
              <div class="wb-formula-op">=</div>
              <div class="wb-formula-box" style="border-color:#86efac; background:#f0fdf4;">
                <div class="wb-formula-box__label">Return on Equity (ROE)</div>
                <div class="wb-formula-box__val" style="color:#15803d;">${fmtPct(latest.ROE)}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hawawini & Viallet 5-Factor DuPont Card -->
        <div class="wb-panel">
          <div class="wb-panel__header">
            <div>
              <h3 class="wb-panel__title">Hawawini &amp; Viallet 5-Factor DuPont Decomposition (${latest.year})</h3>
              <div class="wb-panel__subtitle">ROE = EBIT/Sales × Sales/Assets × EBT/EBIT × NI/EBT × Assets/Equity</div>
            </div>
            ${conceptPill('dupont', '5-Factor DuPont')}
          </div>
          <div class="wb-panel__body">
            <div class="wb-formula-breakdown" style="margin-top: 0;">
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">EBIT Margin</div>
                <div class="wb-formula-box__val">${fmtPct(latest.ebitMargin)}</div>
                <div style="font-size:0.68rem; color:#64748b;">EBIT / Sales</div>
              </div>
              <div class="wb-formula-op">×</div>
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">Asset Turnover</div>
                <div class="wb-formula-box__val">${latest.assetTurnover.toFixed(2)}x</div>
                <div style="font-size:0.68rem; color:#64748b;">Sales / Assets</div>
              </div>
              <div class="wb-formula-op">×</div>
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">Interest Burden</div>
                <div class="wb-formula-box__val">${fmtPct(latest.interestBurden)}</div>
                <div style="font-size:0.68rem; color:#64748b;">EBT / EBIT</div>
              </div>
              <div class="wb-formula-op">×</div>
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">Tax Burden</div>
                <div class="wb-formula-box__val">${fmtPct(latest.taxBurden)}</div>
                <div style="font-size:0.68rem; color:#64748b;">NI / EBT</div>
              </div>
              <div class="wb-formula-op">×</div>
              <div class="wb-formula-box">
                <div class="wb-formula-box__label">Equity Mult.</div>
                <div class="wb-formula-box__val">${latest.equityMultiplier.toFixed(2)}x</div>
                <div style="font-size:0.68rem; color:#64748b;">Assets / Equity</div>
              </div>
            </div>

            <div style="margin-top: 1rem; padding: 0.85rem 1rem; background: #f8fafc; border-radius: 0.5rem; border: 1px solid #e2e8f0; font-size: 0.8rem; color: #334155; line-height: 1.5;">
              <strong>Why Compare Penman vs. Traditional DuPont?</strong><br/>
              Traditional DuPont mixes excess cash into Total Assets (depressing Asset Turnover) and lumps non-interest-bearing trade payables (<code>AP</code>) with interest-bearing debt inside the Equity Multiplier. Penman's reformulation isolates <strong>Operating Assets (OA)</strong> and nets out free <strong>Operating Liabilities (OL)</strong> to reveal true operating productivity (<strong>RNOA = ${fmtPct(latest.RNOA)}</strong> vs. traditional ROA = <strong>${fmtPct(latest.roa)}</strong>).
            </div>
          </div>
        </div>
      </div>

      <!-- 5-Year Penman Reformulated Balance Sheet & Income Statement Table -->
      <div class="wb-panel">
        <div class="wb-panel__header">
          <div>
            <h3 class="wb-panel__title">5-Year Penman Reformulated Balance Sheet &amp; Income Statement ($ Millions)</h3>
            <div class="wb-panel__subtitle">Identity Check: NOA (OA − OL) − NFO (FO − FA) = Common Stockholders' Equity (CSE) &nbsp;|&nbsp; OI (NOPAT) − NFE = Net Income</div>
          </div>
          <div style="display:flex; gap:0.4rem;">
            ${conceptPill('reformulated-bs', 'Reformulated BS')}
            ${conceptPill('reformulated-is', 'Reformulated IS')}
          </div>
        </div>
        <div class="wb-table-wrap">
          <table class="wb-table">
            <thead>
              <tr>
                <th>Reformulated Line Item ($M)</th>
                <th>Concept</th>
                ${byYear.map(y => `<th>FY ${y.year}</th>`).join('')}
                <th>5Y CAGR</th>
              </tr>
            </thead>
            <tbody>
              <tr class="wb-row-section"><td colspan="${byYear.length + 3}">Reformulated Balance Sheet (NOA − NFO = CSE)</td></tr>
              <tr>
                <td>Operating Assets (OA = Total Assets − FA)</td>
                <td>${conceptPill('reformulated-bs', 'OA')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.OA)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.OA, latest.OA, byYear.length - 1))}
              </tr>
              <tr>
                <td>Less: Operating Liabilities (OL = Total Liab. − Debt)</td>
                <td>${conceptPill('reformulated-bs', 'OL')}</td>
                ${byYear.map(y => `<td>(${fmtMoney(y.OL)})</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.OL, latest.OL, byYear.length - 1))}
              </tr>
              <tr class="wb-row-total">
                <td>Net Operating Assets (NOA = OA − OL)</td>
                <td>${conceptPill('reformulated-bs', 'NOA')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.NOA)}</td>`).join('')}
                ${fmtCagrCell(cagrs.NOA)}
              </tr>
              <tr>
                <td>Financial Obligations (FO = Short + Long-Term Debt)</td>
                <td>${conceptPill('reformulated-bs', 'FO')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.FO)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.FO, latest.FO, byYear.length - 1))}
              </tr>
              <tr>
                <td>Less: Financial Assets (FA = Excess Cash &amp; ST Inv.)</td>
                <td>${conceptPill('reformulated-bs', 'FA')}</td>
                ${byYear.map(y => `<td>(${fmtMoney(y.FA)})</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.FA, latest.FA, byYear.length - 1))}
              </tr>
              <tr class="wb-row-total">
                <td>Net Financial Obligations (NFO = FO − FA)</td>
                <td>${conceptPill('reformulated-bs', 'NFO')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.NFO)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total">
                <td>Common Stockholders' Equity (CSE = NOA − NFO)</td>
                <td>${conceptPill('reformulated-bs', 'CSE')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.cse)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.cse, latest.cse, byYear.length - 1))}
              </tr>

              <tr class="wb-row-section"><td colspan="${byYear.length + 3}">Reformulated Income Statement &amp; Penman Ratios</td></tr>
              <tr>
                <td>Operating Income before Tax (EBIT)</td>
                <td>${conceptPill('reformulated-is', 'EBIT')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ebit)}</td>`).join('')}
                ${fmtCagrCell(cagrs.ebit)}
              </tr>
              <tr>
                <td>Effective Tax Rate (τ) &amp; Interest Tax Shield (Int × τ)</td>
                <td>${conceptPill('tax-shield', 'Tax Shield')}</td>
                ${byYear.map(y => `<td>${(y.effectiveTaxRate * 100).toFixed(1)}% / ${fmtMoney(y.taxShield)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total">
                <td>NOPAT / Operating Income After Tax (OI)</td>
                <td>${conceptPill('reformulated-is', 'NOPAT')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.NOPAT)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.NOPAT, latest.NOPAT, byYear.length - 1))}
              </tr>
              <tr>
                <td>Less: Net Financial Expense After Tax (NFE)</td>
                <td>${conceptPill('reformulated-is', 'NFE')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.NFE)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total">
                <td>Net Income to Common (NI = OI − NFE)</td>
                <td>${conceptPill('reformulated-is', 'NI')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ni)}</td>`).join('')}
                ${fmtCagrCell(cagrs.ni)}
              </tr>
              <tr>
                <td>Operating Profit Margin (OPM = OI / Sales)</td>
                <td>${conceptPill('roe-decomposition', 'OPM')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.OPM)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr>
                <td>Net Operating Asset Turnover (NOAT = Sales / NOA)</td>
                <td>${conceptPill('roe-decomposition', 'NOAT')}</td>
                ${byYear.map(y => `<td>${y.NOAT.toFixed(2)}x</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total">
                <td>Return on Net Operating Assets (RNOA = OPM × NOAT)</td>
                <td>${conceptPill('roe-decomposition', 'RNOA')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.RNOA)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr>
                <td>Financial Leverage (FLEV = NFO / CSE)</td>
                <td>${conceptPill('roe-decomposition', 'FLEV')}</td>
                ${byYear.map(y => `<td>${y.FLEV.toFixed(2)}x</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr>
                <td>Operating Spread (SPREAD = RNOA − NBC)</td>
                <td>${conceptPill('roe-decomposition', 'SPREAD')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.SPREAD)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total">
                <td>Return on Common Equity (ROE = RNOA + FLEV × SPREAD)</td>
                <td>${conceptPill('roe-decomposition', 'ROE')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.ROE)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 1: 5-YEAR REPORTED 10-K STATEMENTS & CASH FLOW ENGINE (DEFAULT ACTIVE) -->
    <div id="tab-statements" class="wb-tab-pane" style="${initialTab === 'statements' ? '' : 'display:none;'}">
      <div class="wb-panel">
        <div class="wb-panel__header">
          <div>
            <h3 class="wb-panel__title">5-Year Reported 10-K Financial Statements &amp; Cash Flow Engine ($ Millions)</h3>
            <div class="wb-panel__subtitle">Standardized GAAP Income Statement, Balance Sheet, and Full 3-Section Cash Flow Statement with Indirect P&amp;L Construction Bridge</div>
          </div>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
            ${conceptPill('cash-flow-analysis', '10-K Statements')}
            ${conceptPill('fcf', 'Cash Flow Engine')}
          </div>
        </div>

        <!-- Interactive Statement View Filter Pills -->
        <div class="wb-statement-filter" role="toolbar" aria-label="Statement View Filter">
          <button class="wb-statement-pill active" data-statement="all">📋 All Statements</button>
          <button class="wb-statement-pill" data-statement="income">📊 Income Statement</button>
          <button class="wb-statement-pill" data-statement="balance">🏛️ Balance Sheet</button>
          <button class="wb-statement-pill" data-statement="cashflow">💵 Cash Flow Statement</button>
          <button class="wb-statement-pill" data-statement="bridge">🧮 Constructed P&amp;L Cash Flow Bridge</button>
        </div>

        ${latest.isOcfConstructed ? `
          <div class="wb-cf-notice">
            <span>💡</span>
            <span><strong>Constructed Cash Flow Active:</strong> Operating and investing cash flows were dynamically synthesized from GAAP Net Income, Non-Cash D&amp;A, SBC, and Working Capital balance changes using the indirect method.</span>
          </div>
        ` : ''}

        <div class="wb-table-wrap">
          <table class="wb-table">
            <thead>
              <tr>
                <th>10-K Line Item ($ Millions)</th>
                <th>Concept</th>
                ${byYear.map(y => `<th>FY ${y.year}</th>`).join('')}
                <th>5Y CAGR</th>
              </tr>
            </thead>
            <tbody>
              <!-- I. INCOME STATEMENT -->
              <tr class="wb-row-section" data-section="income"><td colspan="${byYear.length + 3}">I. GAAP Income Statement (P&amp;L)</td></tr>
              <tr class="wb-row-total" data-section="income">
                <td>Revenue / Net Sales</td>
                <td>${conceptPill('revenue-recognition', 'Revenue')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.rev)}</td>`).join('')}
                ${fmtCagrCell(cagrs.rev)}
              </tr>
              <tr data-section="income">
                <td>Cost of Goods Sold (COGS)</td>
                <td>${conceptPill('reformulated-is', 'COGS')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.cogs)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.cogs, latest.cogs, byYear.length - 1))}
              </tr>
              <tr class="wb-row-total" data-section="income">
                <td>Gross Profit</td>
                <td>${conceptPill('reformulated-is', 'Gross Profit')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.gp)}</td>`).join('')}
                ${fmtCagrCell(cagrs.gp)}
              </tr>
              <tr data-section="income">
                <td>Research &amp; Development (R&amp;D)</td>
                <td>${conceptPill('reformulated-is', 'R&D')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.rd)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.rd, latest.rd, byYear.length - 1))}
              </tr>
              <tr data-section="income">
                <td>Selling, General &amp; Administrative (SG&amp;A)</td>
                <td>${conceptPill('reformulated-is', 'SG&A')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.sga)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.sga, latest.sga, byYear.length - 1))}
              </tr>
              <tr class="wb-row-total" data-section="income">
                <td>Operating Income (EBIT)</td>
                <td>${conceptPill('reformulated-is', 'EBIT')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ebit)}</td>`).join('')}
                ${fmtCagrCell(cagrs.ebit)}
              </tr>
              <tr data-section="income">
                <td>Depreciation &amp; Amortization (D&amp;A)</td>
                <td>${conceptPill('capital-budgeting', 'D&A')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.da)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.da, latest.da, byYear.length - 1))}
              </tr>
              <tr class="wb-row-total" data-section="income">
                <td>EBITDA (EBIT + D&amp;A)</td>
                <td>${conceptPill('multiples', 'EBITDA')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ebitda)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.ebitda, latest.ebitda, byYear.length - 1))}
              </tr>
              <tr data-section="income">
                <td>Interest Expense</td>
                <td>${conceptPill('cost-of-debt', 'Interest')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.intExp)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="income">
                <td>Income Tax Expense</td>
                <td>${conceptPill('deferred-tax-fsa', 'Taxes')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.taxExp)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total" data-section="income">
                <td>GAAP Net Income</td>
                <td>${conceptPill('reformulated-is', 'Net Income')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ni)}</td>`).join('')}
                ${fmtCagrCell(cagrs.ni)}
              </tr>
              <tr data-section="income">
                <td>Diluted Shares Outstanding (M)</td>
                <td>${conceptPill('multiples', 'Shares')}</td>
                ${byYear.map(y => `<td>${y.sharesDiluted ? y.sharesDiluted.toLocaleString() : '—'}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="income">
                <td>Diluted EPS ($/share)</td>
                <td>${conceptPill('multiples', 'EPS')}</td>
                ${byYear.map(y => `<td>${fmtSharePrice(y.epsDiluted)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.epsDiluted, latest.epsDiluted, byYear.length - 1))}
              </tr>

              <!-- II. BALANCE SHEET -->
              <tr class="wb-row-section" data-section="balance"><td colspan="${byYear.length + 3}">II. GAAP Balance Sheet</td></tr>
              <tr data-section="balance">
                <td>Cash &amp; Cash Equivalents</td>
                <td>${conceptPill('working-capital', 'Cash')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.cash)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.cash, latest.cash, byYear.length - 1))}
              </tr>
              <tr data-section="balance">
                <td>Short-Term Marketable Securities</td>
                <td>${conceptPill('working-capital', 'ST Inv.')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.shortTermInvestments)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total" data-section="balance">
                <td>Total Cash &amp; Liquid Investments</td>
                <td>${conceptPill('working-capital', 'Liquidity')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.totalCash)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.totalCash, latest.totalCash, byYear.length - 1))}
              </tr>
              <tr data-section="balance">
                <td>Accounts Receivable (AR)</td>
                <td>${conceptPill('working-capital', 'AR')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ar)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.ar, latest.ar, byYear.length - 1))}
              </tr>
              <tr data-section="balance">
                <td>Inventories</td>
                <td>${conceptPill('working-capital', 'Inventory')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.inv)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.inv, latest.inv, byYear.length - 1))}
              </tr>
              <tr data-section="balance">
                <td>Total Current Assets</td>
                <td>${conceptPill('working-capital', 'CA')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ca)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.ca, latest.ca, byYear.length - 1))}
              </tr>
              <tr data-section="balance">
                <td>Net Property, Plant &amp; Equipment (PP&amp;E)</td>
                <td>${conceptPill('capital-budgeting', 'PP&E')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ppe)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.ppe, latest.ppe, byYear.length - 1))}
              </tr>
              <tr data-section="balance">
                <td>Goodwill &amp; Intangible Assets</td>
                <td>${conceptPill('ma-mechanics', 'Goodwill')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.gwIntang)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total" data-section="balance">
                <td>Total Assets</td>
                <td>${conceptPill('reformulated-bs', 'Assets')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ta)}</td>`).join('')}
                ${fmtCagrCell(cagrs.ta)}
              </tr>
              <tr data-section="balance">
                <td>Accounts Payable (AP)</td>
                <td>${conceptPill('working-capital', 'AP')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ap)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.ap, latest.ap, byYear.length - 1))}
              </tr>
              <tr data-section="balance">
                <td>Short-Term Debt &amp; Current Portion of LT Debt</td>
                <td>${conceptPill('capital-structure', 'ST Debt')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.std)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="balance">
                <td>Total Current Liabilities</td>
                <td>${conceptPill('working-capital', 'CL')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.cl)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.cl, latest.cl, byYear.length - 1))}
              </tr>
              <tr data-section="balance">
                <td>Long-Term Debt</td>
                <td>${conceptPill('cost-of-debt', 'LT Debt')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ltd)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.ltd, latest.ltd, byYear.length - 1))}
              </tr>
              <tr class="wb-row-total" data-section="balance">
                <td>Total Debt (Short-Term + Long-Term)</td>
                <td>${conceptPill('capital-structure', 'Debt')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.FO)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.FO, latest.FO, byYear.length - 1))}
              </tr>
              <tr data-section="balance">
                <td>Total Liabilities</td>
                <td>${conceptPill('reformulated-bs', 'Liabilities')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.tl)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.tl, latest.tl, byYear.length - 1))}
              </tr>
              <tr class="wb-row-total" data-section="balance">
                <td>Stockholders' Equity</td>
                <td>${conceptPill('reformulated-bs', 'Equity')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.cse)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.cse, latest.cse, byYear.length - 1))}
              </tr>

              <!-- III. CASH FLOW STATEMENT (FULL GAAP 3-SECTION FORMAT) -->
              <tr class="wb-row-section" data-section="cashflow"><td colspan="${byYear.length + 3}">III. GAAP Statement of Cash Flows (3-Section Format)</td></tr>
              
              <tr class="wb-row-subhead" data-section="cashflow"><td colspan="${byYear.length + 3}">A. Operating Activities (Indirect Method)</td></tr>
              <tr data-section="cashflow">
                <td>Net Income</td>
                <td>${conceptPill('reformulated-is', 'Net Income')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ni)}</td>`).join('')}
                ${fmtCagrCell(cagrs.ni)}
              </tr>
              <tr data-section="cashflow">
                <td>Depreciation &amp; Amortization Add-Back</td>
                <td>${conceptPill('capital-budgeting', 'D&A')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.da)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.da, latest.da, byYear.length - 1))}
              </tr>
              <tr data-section="cashflow">
                <td>Stock-Based Compensation Add-Back</td>
                <td>${conceptPill('stock-comp', 'SBC')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.sbc)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.sbc, latest.sbc, byYear.length - 1))}
              </tr>
              <tr data-section="cashflow">
                <td>Change in Accounts Receivable (Increase / Decrease)</td>
                <td>${conceptPill('working-capital', 'ΔAR')}</td>
                ${byYear.map(y => `<td>${y.deltaAR > 0 ? `(${fmtMoney(y.deltaAR)})` : fmtMoney(-y.deltaAR)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="cashflow">
                <td>Change in Inventory (Increase / Decrease)</td>
                <td>${conceptPill('working-capital', 'ΔInv')}</td>
                ${byYear.map(y => `<td>${y.deltaInv > 0 ? `(${fmtMoney(y.deltaInv)})` : fmtMoney(-y.deltaInv)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="cashflow">
                <td>Change in Accounts Payable (Increase / Decrease)</td>
                <td>${conceptPill('working-capital', 'ΔAP')}</td>
                ${byYear.map(y => `<td>${y.deltaAP < 0 ? `(${fmtMoney(Math.abs(y.deltaAP))})` : fmtMoney(y.deltaAP)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="cashflow">
                <td>Other Operating Non-Cash &amp; Working Capital Adjustments</td>
                <td>${conceptPill('accrual-quality', 'Accruals')}</td>
                ${byYear.map(y => `<td>${y.otherOcfAdjustments < 0 ? `(${fmtMoney(Math.abs(y.otherOcfAdjustments))})` : fmtMoney(y.otherOcfAdjustments)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total" data-section="cashflow">
                <td>Net Cash Provided by Operating Activities (OCF)</td>
                <td>${conceptPill('cash-flow-analysis', 'OCF')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ocf)}</td>`).join('')}
                ${fmtCagrCell(cagrs.ocf)}
              </tr>

              <tr class="wb-row-subhead" data-section="cashflow"><td colspan="${byYear.length + 3}">B. Investing Activities</td></tr>
              <tr data-section="cashflow">
                <td>Capital Expenditures (Additions to PP&amp;E)</td>
                <td>${conceptPill('capital-budgeting', 'CapEx')}</td>
                ${byYear.map(y => `<td>(${fmtMoney(y.capex)})</td>`).join('')}
                ${fmtCagrCell(cagrs.capex)}
              </tr>
              <tr data-section="cashflow">
                <td>Other Investing Activities (Marketable Securities, M&amp;A)</td>
                <td>${conceptPill('capital-budgeting', 'Investing')}</td>
                ${byYear.map(y => `<td>${y.otherInvestingCashFlow < 0 ? `(${fmtMoney(Math.abs(y.otherInvestingCashFlow))})` : fmtMoney(y.otherInvestingCashFlow)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total" data-section="cashflow">
                <td>Net Cash Used in / Provided by Investing Activities (CFI)</td>
                <td>${conceptPill('cash-flow-analysis', 'CFI')}</td>
                ${byYear.map(y => `<td>${y.icf < 0 ? `(${fmtMoney(Math.abs(y.icf))})` : fmtMoney(y.icf)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>

              <tr class="wb-row-subhead" data-section="cashflow"><td colspan="${byYear.length + 3}">C. Financing Activities</td></tr>
              <tr data-section="cashflow">
                <td>Common Stock Dividends Paid</td>
                <td>${conceptPill('dividend-policy', 'Dividends')}</td>
                ${byYear.map(y => `<td>${y.divs > 0 ? `(${fmtMoney(y.divs)})` : '$0'}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="cashflow">
                <td>Repurchase of Common Stock (Share Buybacks)</td>
                <td>${conceptPill('dividend-policy', 'Buybacks')}</td>
                ${byYear.map(y => `<td>${y.buybacks > 0 ? `(${fmtMoney(y.buybacks)})` : '$0'}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="cashflow">
                <td>Proceeds from Debt Issuance / Borrowings</td>
                <td>${conceptPill('capital-structure', 'Borrowings')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.debtIssued)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="cashflow">
                <td>Principal Repayments of Debt</td>
                <td>${conceptPill('capital-structure', 'Debt Repaid')}</td>
                ${byYear.map(y => `<td>${y.debtRepaid > 0 ? `(${fmtMoney(y.debtRepaid)})` : '$0'}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="cashflow">
                <td>Other Financing Activities</td>
                <td>${conceptPill('capital-structure', 'Financing')}</td>
                ${byYear.map(y => `<td>${y.otherFinancingCashFlow < 0 ? `(${fmtMoney(Math.abs(y.otherFinancingCashFlow))})` : fmtMoney(y.otherFinancingCashFlow)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total" data-section="cashflow">
                <td>Net Cash Used in / Provided by Financing Activities (CFF)</td>
                <td>${conceptPill('cash-flow-analysis', 'CFF')}</td>
                ${byYear.map(y => `<td>${y.finCf < 0 ? `(${fmtMoney(Math.abs(y.finCf))})` : fmtMoney(y.finCf)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>

              <tr class="wb-row-subhead" data-section="cashflow"><td colspan="${byYear.length + 3}">D. Cash Reconciliation &amp; Free Cash Flow Summary</td></tr>
              <tr data-section="cashflow">
                <td>Net Increase / (Decrease) in Cash (CFO + CFI + CFF)</td>
                <td>${conceptPill('cash-flow-analysis', 'ΔCash')}</td>
                ${byYear.map(y => `<td>${y.deltaCashFromCF < 0 ? `(${fmtMoney(Math.abs(y.deltaCashFromCF))})` : fmtMoney(y.deltaCashFromCF)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="cashflow">
                <td>Cash &amp; Liquid Investments at Beginning of Year</td>
                <td>${conceptPill('working-capital', 'Beg. Cash')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.beginningCash)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total" data-section="cashflow">
                <td>Cash &amp; Liquid Investments at End of Year (BS Reconciled)</td>
                <td>${conceptPill('working-capital', 'End. Cash')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.endingCash)}</td>`).join('')}
                ${fmtCagrCell(calcCAGR(byYear[0]?.endingCash, latest.endingCash, byYear.length - 1))}
              </tr>
              <tr class="wb-row-total" data-section="cashflow" style="background:#eff6ff;">
                <td>Free Cash Flow (FCF = Operating Cash Flow − CapEx)</td>
                <td>${conceptPill('fcf', 'FCF')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.fcf)}</td>`).join('')}
                ${fmtCagrCell(cagrs.fcf)}
              </tr>
              <tr data-section="cashflow">
                <td>FCF Conversion Rate (% of Net Income)</td>
                <td>${conceptPill('fcf', 'FCF/NI')}</td>
                ${byYear.map(y => `<td>${y.ni > 0 ? fmtPct(y.fcf / y.ni) : '—'}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="cashflow">
                <td>Capital Returned to Shareholders (Dividends + Buybacks)</td>
                <td>${conceptPill('dividend-policy', 'Payouts')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.divs + y.buybacks)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>

              <!-- IV. P&L TO CASH FLOW INDIRECT CONSTRUCTION BRIDGE -->
              <tr class="wb-row-section" data-section="bridge"><td colspan="${byYear.length + 3}">IV. P&amp;L to Cash Flow Indirect Construction Bridge (Reconciliation)</td></tr>
              <tr data-section="bridge">
                <td>GAAP Net Income</td>
                <td>${conceptPill('reformulated-is', 'Net Income')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ni)}</td>`).join('')}
                ${fmtCagrCell(cagrs.ni)}
              </tr>
              <tr data-section="bridge">
                <td>(+) Non-Cash Depreciation &amp; Amortization (D&amp;A)</td>
                <td>${conceptPill('capital-budgeting', 'D&A')}</td>
                ${byYear.map(y => `<td>+${fmtMoney(y.da)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="bridge">
                <td>(+) Non-Cash Stock-Based Compensation (SBC)</td>
                <td>${conceptPill('stock-comp', 'SBC')}</td>
                ${byYear.map(y => `<td>+${fmtMoney(y.sbc)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="bridge">
                <td>(±) Accounts Receivable Cash Effect (−ΔAR)</td>
                <td>${conceptPill('working-capital', 'ΔAR')}</td>
                ${byYear.map(y => `<td>${y.deltaAR > 0 ? `(${fmtMoney(y.deltaAR)})` : `+${fmtMoney(-y.deltaAR)}`}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="bridge">
                <td>(±) Inventory Cash Effect (−ΔInv)</td>
                <td>${conceptPill('working-capital', 'ΔInv')}</td>
                ${byYear.map(y => `<td>${y.deltaInv > 0 ? `(${fmtMoney(y.deltaInv)})` : `+${fmtMoney(-y.deltaInv)}`}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="bridge">
                <td>(±) Accounts Payable Cash Effect (+ΔAP)</td>
                <td>${conceptPill('working-capital', 'ΔAP')}</td>
                ${byYear.map(y => `<td>${y.deltaAP < 0 ? `(${fmtMoney(Math.abs(y.deltaAP))})` : `+${fmtMoney(y.deltaAP)}`}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="bridge" style="background:#f8fafc;">
                <td>(±) Net Trade Working Capital Cash Effect (−ΔAR − ΔInv + ΔAP)</td>
                <td>${conceptPill('working-capital', 'ΔTrade WC')}</td>
                ${byYear.map(y => `<td>${y.wcCashFlow < 0 ? `(${fmtMoney(Math.abs(y.wcCashFlow))})` : `+${fmtMoney(y.wcCashFlow)}`}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total" data-section="bridge" style="background:#eff6ff;">
                <td>(=) Constructed Operating Cash Flow (from P&amp;L + Trade WC)</td>
                <td>${conceptPill('cash-flow-analysis', 'Constructed OCF')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.constructedOcf)}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr data-section="bridge">
                <td>(±) Other Operating Accruals &amp; Non-Cash Reconciling Items</td>
                <td>${conceptPill('accrual-quality', 'Accruals')}</td>
                ${byYear.map(y => `<td>${y.otherOcfAdjustments < 0 ? `(${fmtMoney(Math.abs(y.otherOcfAdjustments))})` : (y.otherOcfAdjustments > 0 ? `+${fmtMoney(y.otherOcfAdjustments)}` : '$0')}</td>`).join('')}
                <td class="wb-td-cagr">—</td>
              </tr>
              <tr class="wb-row-total" data-section="bridge">
                <td>(=) Reported GAAP Operating Cash Flow</td>
                <td>${conceptPill('cash-flow-analysis', 'Reported OCF')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.ocf)}</td>`).join('')}
                ${fmtCagrCell(cagrs.ocf)}
              </tr>
              <tr data-section="bridge">
                <td>(−) Capital Expenditures (CapEx)</td>
                <td>${conceptPill('capital-budgeting', 'CapEx')}</td>
                ${byYear.map(y => `<td>(${fmtMoney(y.capex)})</td>`).join('')}
                ${fmtCagrCell(cagrs.capex)}
              </tr>
              <tr class="wb-row-total" data-section="bridge" style="background:#f0fdf4;">
                <td>(=) Free Cash Flow (FCF = Operating Cash Flow − CapEx)</td>
                <td>${conceptPill('fcf', 'FCF')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.fcf)}</td>`).join('')}
                ${fmtCagrCell(cagrs.fcf)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: EXECUTIVE RATIO SUITE & WORKING CAPITAL -->
    <div id="tab-ratios" class="wb-tab-pane" style="display:none;">
      <div class="wb-panel">
        <div class="wb-panel__header">
          <div>
            <h3 class="wb-panel__title">5-Year Executive Financial Ratio Suite (${company.ticker})</h3>
            <div class="wb-panel__subtitle">Institutional 54-Ratio Diagnostic Matrix across Profitability, ROIC Moats, Fulghieri Strategic Liquidity, Capital Allocation, Solvency &amp; Accounting Quality</div>
          </div>
          ${conceptPill('working-capital', 'WCR & Ratios')}
        </div>

        <!-- Fulghieri Managerial Balance Sheet & Strategic Liquidity Diagnostic Card -->
        <div class="wb-panel__body" style="background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:1rem 1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
            <div>
              <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#2563eb;">Fulghieri Strategic Liquidity Framework (Managerial Balance Sheet)</div>
              <div style="font-size:0.82rem; font-weight:600; color:#0f172a;">Capital Structure Maturity Alignment: NLF − NSF ≡ WCR</div>
            </div>
            <div style="display:flex; gap:0.5rem; align-items:center;">
              <span class="wb-pill" style="background:${latest.wcr <= 0 ? '#eff6ff' : latest.liquidityRatio >= 1.05 ? '#f0fdf4' : latest.liquidityRatio >= 0.95 ? '#fefce8' : '#fef2f2'}; color:${latest.wcr <= 0 ? '#1e40af' : latest.liquidityRatio >= 1.05 ? '#15803d' : latest.liquidityRatio >= 0.95 ? '#a16207' : '#b91c1c'}; font-weight:700; border:1px solid currentColor;">
                ${latest.fulghieriStrategy}
              </span>
              ${conceptPill('working-capital', 'Managerial BS')}
            </div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem;">
            <div style="background:#ffffff; padding:0.75rem; border-radius:6px; border:1px solid #e2e8f0;">
              <div style="font-size:0.7rem; color:#64748b; font-weight:700;">Net Long-Term Financing (NLF)</div>
              <div style="font-size:1.05rem; font-weight:800; color:#0f172a; margin:0.2rem 0;">${fmtMoney(latest.nlf)}</div>
              <div style="font-size:0.68rem; color:#64748b;">(LT Debt + Equity) − Net Fixed Assets</div>
            </div>
            <div style="background:#ffffff; padding:0.75rem; border-radius:6px; border:1px solid #e2e8f0;">
              <div style="font-size:0.7rem; color:#64748b; font-weight:700;">Net Short-Term Financing (NSF)</div>
              <div style="font-size:1.05rem; font-weight:800; color:${latest.nsf > 0 ? '#b91c1c' : '#15803d'}; margin:0.2rem 0;">${latest.nsf > 0 ? '+' : ''}${fmtMoney(latest.nsf)}</div>
              <div style="font-size:0.68rem; color:#64748b;">Short-Term Debt − Total Liquid Cash</div>
            </div>
            <div style="background:#ffffff; padding:0.75rem; border-radius:6px; border:1px solid #e2e8f0;">
              <div style="font-size:0.7rem; color:#64748b; font-weight:700;">Working Capital Requirement (WCR)</div>
              <div style="font-size:1.05rem; font-weight:800; color:#0f172a; margin:0.2rem 0;">${fmtMoney(latest.wcr)}</div>
              <div style="font-size:0.68rem; color:#64748b;">AR + Inventory − Accounts Payable</div>
            </div>
            <div style="background:#ffffff; padding:0.75rem; border-radius:6px; border:1px solid #e2e8f0;">
              <div style="font-size:0.7rem; color:#64748b; font-weight:700;">Liquidity Ratio (LR = NLF / WCR)</div>
              <div style="font-size:1.05rem; font-weight:800; color:${latest.wcr <= 0 ? '#2563eb' : latest.liquidityRatio >= 1.0 ? '#15803d' : '#b91c1c'}; margin:0.2rem 0;">
                ${latest.wcr <= 0 ? 'Float (WCR ≤ 0)' : `${latest.liquidityRatio.toFixed(2)}x`}
              </div>
              <div style="font-size:0.68rem; color:#64748b;">Target &gt; 1.0x (Long-term funded WC)</div>
            </div>
          </div>
        </div>

        <!-- Categorized Filter Pills -->
        <div class="wb-ratio-filter">
          <span style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.04em; margin-right:0.25rem;">Filter Category:</span>
          <button type="button" class="wb-ratio-pill active" data-ratio-cat="all">📋 All Ratios (54)</button>
          <button type="button" class="wb-ratio-pill" data-ratio-cat="margins">📈 Margins &amp; Profitability (8)</button>
          <button type="button" class="wb-ratio-pill" data-ratio-cat="returns">💎 Capital Returns &amp; Moat (9)</button>
          <button type="button" class="wb-ratio-pill" data-ratio-cat="working-capital">⏱️ Working Capital &amp; CCC (11)</button>
          <button type="button" class="wb-ratio-pill" data-ratio-cat="allocation">🎯 Capital Allocation &amp; Payouts (5)</button>
          <button type="button" class="wb-ratio-pill" data-ratio-cat="solvency">🛡️ Solvency &amp; Coverage (16)</button>
          <button type="button" class="wb-ratio-pill" data-ratio-cat="quality">⚡ Operating Leverage &amp; Quality (5)</button>
        </div>

        <div class="wb-table-wrap">
          <table class="wb-table">
            <thead>
              <tr>
                <th style="min-width:320px;">Financial Metric / Ratio &amp; Institutional Interpretation</th>
                <th>Concept Link</th>
                ${byYear.map(y => `<th>FY ${y.year}</th>`).join('')}
                <th>5Y Delta</th>
              </tr>
            </thead>
            <tbody>
              <!-- Category 1: Margins & Profitability -->
              <tr class="wb-row-section" data-ratio-cat="margins"><td colspan="${byYear.length + 3}">I. Margins &amp; Core Profitability</td></tr>
              <tr data-ratio-cat="margins">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Gross Profit Margin (Gross Profit / Sales)</div>
                  <div class="wb-ratio-blurb">Evaluates core unit-level product pricing power and direct COGS efficiency before operating overhead.</div>
                </td>
                <td>${conceptPill('reformulated-is', 'Gross Margin')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.grossMargin)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].grossMargin, latest.grossMargin)}</td>
              </tr>
              <tr data-ratio-cat="margins">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">EBITDA Margin (EBITDA / Sales)</div>
                  <div class="wb-ratio-blurb">Cash operational profitability proxy assessing core earning power before non-cash depreciation and capital structure.</div>
                </td>
                <td>${conceptPill('dupont', 'EBITDA Margin')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.ebitdaMargin)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].ebitdaMargin, latest.ebitdaMargin)}</td>
              </tr>
              <tr data-ratio-cat="margins">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">GAAP Operating Margin (EBIT / Sales)</div>
                  <div class="wb-ratio-blurb">Core operating profitability assessing operating leverage before capital structure interest and taxes.</div>
                </td>
                <td>${conceptPill('dupont', 'EBIT Margin')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.ebitMargin)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].ebitMargin, latest.ebitMargin)}</td>
              </tr>
              <tr data-ratio-cat="margins">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">SBC-Adjusted Operating Margin ((EBIT − SBC) / Sales)</div>
                  <div class="wb-ratio-blurb">Forensic operating margin treating non-cash stock compensation as a real economic talent expense.</div>
                </td>
                <td>${conceptPill('stock-comp', 'SBC Burden')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.sbcAdjustedOpMargin)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].sbcAdjustedOpMargin, latest.sbcAdjustedOpMargin)}</td>
              </tr>
              <tr data-ratio-cat="margins">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Pre-Tax Margin (EBT / Sales)</div>
                  <div class="wb-ratio-blurb">Evaluates operational performance plus net debt interest financing impact prior to jurisdictional tax effects.</div>
                </td>
                <td>${conceptPill('dupont', 'EBT Margin')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.ebtMargin)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].ebtMargin, latest.ebtMargin)}</td>
              </tr>
              <tr data-ratio-cat="margins">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">GAAP Net Profit Margin (Net Income / Sales)</div>
                  <div class="wb-ratio-blurb">Bottom-line accounting margin retained for common stockholders after all operational, financing, and tax expenses.</div>
                </td>
                <td>${conceptPill('dupont', 'Net Margin')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.netMargin)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].netMargin, latest.netMargin)}</td>
              </tr>
              <tr data-ratio-cat="margins">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Operating Cash Flow Margin (OCF / Sales)</div>
                  <div class="wb-ratio-blurb">Direct operational cash generated per dollar of revenue before capital expenditures or asset disposals.</div>
                </td>
                <td>${conceptPill('cash-flow-analysis', 'OCF Margin')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.ocfMargin)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].ocfMargin, latest.ocfMargin)}</td>
              </tr>
              <tr data-ratio-cat="margins">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Free Cash Flow Margin (FCF / Sales)</div>
                  <div class="wb-ratio-blurb">Discretionary cash yield generated per dollar of sales after fully funding capital expenditures.</div>
                </td>
                <td>${conceptPill('fcf', 'FCF Margin')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.fcfMargin)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].fcfMargin, latest.fcfMargin)}</td>
              </tr>

              <!-- Category 2: Capital Returns & Moat -->
              <tr class="wb-row-section" data-ratio-cat="returns"><td colspan="${byYear.length + 3}">II. Capital Returns &amp; Economic Moat</td></tr>
              <tr data-ratio-cat="returns">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Return on Invested Capital (ROIC = NOPAT / Invested Capital)</div>
                  <div class="wb-ratio-blurb">The definitive measure of corporate economic moat; evaluates after-tax operating profit earned per dollar of net operating capital deployed.</div>
                </td>
                <td>${conceptPill('eva-mva', 'ROIC')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.roic)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].roic, latest.roic)}</td>
              </tr>
              <tr data-ratio-cat="returns">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Return on Capital Employed (ROCE = EBIT / (Total Assets − Current Liabilities))</div>
                  <div class="wb-ratio-blurb">Pre-tax operating efficiency metric assessing how effectively management deploys total long-term capital resources.</div>
                </td>
                <td>${conceptPill('dupont', 'ROCE')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.roce)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].roce, latest.roce)}</td>
              </tr>
              <tr data-ratio-cat="returns">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Return on Common Equity (ROE = Net Income / Stockholders' Equity)</div>
                  <div class="wb-ratio-blurb">Rate of accounting return earned on common shareholders' book equity investment.</div>
                </td>
                <td>${conceptPill('dupont', 'ROE')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.roe)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].roe, latest.roe)}</td>
              </tr>
              <tr data-ratio-cat="returns">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Return on Total Assets (ROA = Net Income / Total Assets)</div>
                  <div class="wb-ratio-blurb">Evaluates how efficiently enterprise management converts total balance sheet assets into net income.</div>
                </td>
                <td>${conceptPill('dupont', 'ROA')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.roa)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].roa, latest.roa)}</td>
              </tr>
              <tr data-ratio-cat="returns">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Neutral / Unlevered ROA (NOPAT / Total Assets)</div>
                  <div class="wb-ratio-blurb">Removes financial leverage penalty to evaluate pure operating return generated on all enterprise assets regardless of debt mix.</div>
                </td>
                <td>${conceptPill('dupont', 'Neutral ROA')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.neutralRoa)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].neutralRoa, latest.neutralRoa)}</td>
              </tr>
              <tr data-ratio-cat="returns">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Cash Return on Assets (Cash ROA = OCF / Total Assets)</div>
                  <div class="wb-ratio-blurb">Cash-based return assessing real operating cash flow generated per dollar of enterprise balance sheet assets.</div>
                </td>
                <td>${conceptPill('cash-flow-analysis', 'Cash ROA')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.cashRoa)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].cashRoa, latest.cashRoa)}</td>
              </tr>
              <tr data-ratio-cat="returns">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Cash Return on Invested Capital (CROIC = FCF / Invested Capital)</div>
                  <div class="wb-ratio-blurb">Cash-based equivalent of ROIC; assesses true unencumbered cash yield generated per dollar of invested capital.</div>
                </td>
                <td>${conceptPill('fcf', 'CROIC')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.croic)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].croic, latest.croic)}</td>
              </tr>
              <tr data-ratio-cat="returns">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Total Asset Turnover (Sales / Total Assets)</div>
                  <div class="wb-ratio-blurb">Measures capital velocity and efficiency in generating top-line sales from total balance sheet assets.</div>
                </td>
                <td>${conceptPill('dupont', 'Asset Turnover')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.assetTurnover, 2)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].assetTurnover, latest.assetTurnover)}</td>
              </tr>
              <tr data-ratio-cat="returns">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Fixed Asset Turnover (Sales / Net PP&amp;E)</div>
                  <div class="wb-ratio-blurb">Evaluates production efficiency and revenue productivity generated per dollar of fixed plant, property, and equipment.</div>
                </td>
                <td>${conceptPill('capital-budgeting', 'PP&E Turnover')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.fixedAssetTurnover, 2)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].fixedAssetTurnover, latest.fixedAssetTurnover)}</td>
              </tr>

              <!-- Category 3: Hawawini Working Capital & CCC -->
              <tr class="wb-row-section" data-ratio-cat="working-capital"><td colspan="${byYear.length + 3}">III. Hawawini Working Capital Requirement (WCR) &amp; Cash Conversion Cycle</td></tr>
              <tr data-ratio-cat="working-capital">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Working Capital Requirement (WCR = AR + Inventory − AP)</div>
                  <div class="wb-ratio-blurb">Hawawini operating capital requirement; quantifies capital locked in the core operating cycle before liquidity.</div>
                </td>
                <td>${conceptPill('working-capital', 'WCR')}</td>
                ${byYear.map(y => `<td>${fmtMoney(y.wcr)}</td>`).join('')}
                <td class="wb-td-cagr">${latest.wcr >= byYear[0].wcr ? '+' : ''}${fmtMoney(latest.wcr - byYear[0].wcr)}</td>
              </tr>
              <tr data-ratio-cat="working-capital">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">WCR Intensity (WCR / Sales)</div>
                  <div class="wb-ratio-blurb">Operating capital tied up per dollar of sales; lower or negative intensity indicates strong vendor leverage and asset-light operations.</div>
                </td>
                <td>${conceptPill('working-capital', 'WCR/Sales')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.wcrToSales)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].wcrToSales, latest.wcrToSales)}</td>
              </tr>
              <tr data-ratio-cat="working-capital">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Working Capital Turnover (Sales / WCR)</div>
                  <div class="wb-ratio-blurb">Top-line revenue generated per dollar of operating working capital deployed; negative values signify supplier float.</div>
                </td>
                <td>${conceptPill('working-capital', 'WC Turnover')}</td>
                ${byYear.map(y => `<td>${y.wcr > 0 ? fmtMult(y.workingCapitalTurnover, 1) : 'Float'}</td>`).join('')}
                <td class="wb-td-cagr">${latest.wcr > 0 && byYear[0].wcr > 0 ? fmtDeltaMult(byYear[0].workingCapitalTurnover, latest.workingCapitalTurnover) : '—'}</td>
              </tr>
              <tr data-ratio-cat="working-capital">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Gross Operating Cycle (DIO + DSO)</div>
                  <div class="wb-ratio-blurb">Total turnaround duration in days from purchasing raw inventory until final customer cash collection.</div>
                </td>
                <td>${conceptPill('working-capital', 'Operating Cycle')}</td>
                ${byYear.map(y => `<td>${y.operatingCycle.toFixed(1)}d</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaDays(byYear[0].operatingCycle, latest.operatingCycle)}</td>
              </tr>
              <tr data-ratio-cat="working-capital">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Days Sales Outstanding (DSO = (AR / Sales) × 365)</div>
                  <div class="wb-ratio-blurb">Average collection period; measures customer credit collection discipline and receivables velocity.</div>
                </td>
                <td>${conceptPill('working-capital', 'DSO')}</td>
                ${byYear.map(y => `<td>${y.dso.toFixed(1)}d</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaDays(byYear[0].dso, latest.dso)}</td>
              </tr>
              <tr data-ratio-cat="working-capital">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Accounts Receivable Turnover (Sales / AR)</div>
                  <div class="wb-ratio-blurb">Annual collection velocity measuring how many times trade receivables are collected into cash per year.</div>
                </td>
                <td>${conceptPill('working-capital', 'AR Turnover')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.arTurnover, 1)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].arTurnover, latest.arTurnover)}</td>
              </tr>
              <tr data-ratio-cat="working-capital">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Days Inventory Outstanding (DIO = (Inventory / COGS) × 365)</div>
                  <div class="wb-ratio-blurb">Average duration inventory sits in production or warehouse before converting to customer sales.</div>
                </td>
                <td>${conceptPill('working-capital', 'DIO')}</td>
                ${byYear.map(y => `<td>${y.dio.toFixed(1)}d</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaDays(byYear[0].dio, latest.dio)}</td>
              </tr>
              <tr data-ratio-cat="working-capital">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Inventory Turnover (COGS / Inventory)</div>
                  <div class="wb-ratio-blurb">Annual stock turnaround velocity measuring how many times physical inventory is sold and replaced per year.</div>
                </td>
                <td>${conceptPill('working-capital', 'Inv Turnover')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.invTurnover, 1)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].invTurnover, latest.invTurnover)}</td>
              </tr>
              <tr data-ratio-cat="working-capital">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Days Payable Outstanding (DPO = (AP / COGS) × 365)</div>
                  <div class="wb-ratio-blurb">Average payment terms negotiated with suppliers; evaluates working capital credit financing provided by vendors.</div>
                </td>
                <td>${conceptPill('working-capital', 'DPO')}</td>
                ${byYear.map(y => `<td>${y.dpo.toFixed(1)}d</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaDays(byYear[0].dpo, latest.dpo)}</td>
              </tr>
              <tr data-ratio-cat="working-capital">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Accounts Payable Turnover (COGS / AP)</div>
                  <div class="wb-ratio-blurb">Annual vendor payment frequency measuring trade debt turnaround to suppliers per year.</div>
                </td>
                <td>${conceptPill('working-capital', 'AP Turnover')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.apTurnover, 1)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].apTurnover, latest.apTurnover)}</td>
              </tr>
              <tr class="wb-row-total" data-ratio-cat="working-capital">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Cash Conversion Cycle (CCC = DSO + DIO − DPO)</div>
                  <div class="wb-ratio-blurb">Net cycle time from cash outflow for inventory to cash collection; negative cycles signify customer-funded float.</div>
                </td>
                <td>${conceptPill('working-capital', 'CCC')}</td>
                ${byYear.map(y => `<td>${y.ccc.toFixed(1)}d</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaDays(byYear[0].ccc, latest.ccc)}</td>
              </tr>

              <!-- Category 4: Capital Allocation, Reinvestment & Payouts -->
              <tr class="wb-row-section" data-ratio-cat="allocation"><td colspan="${byYear.length + 3}">IV. Capital Allocation, Reinvestment &amp; Shareholder Payouts</td></tr>
              <tr data-ratio-cat="allocation">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">CapEx-to-Depreciation Ratio (CapEx / D&amp;A)</div>
                  <div class="wb-ratio-blurb">Distinguishes growth reinvestment (&gt;1.0x) from maintenance depletion (&lt;1.0x) of productive physical assets.</div>
                </td>
                <td>${conceptPill('capital-budgeting', 'CapEx/D&A')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.capexToDa, 2)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].capexToDa, latest.capexToDa)}</td>
              </tr>
              <tr data-ratio-cat="allocation">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">CapEx Intensity (CapEx / Sales)</div>
                  <div class="wb-ratio-blurb">Measures ongoing capital expenditure commitment required to sustain and expand enterprise sales scale.</div>
                </td>
                <td>${conceptPill('capital-budgeting', 'CapEx Intensity')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.capexIntensity)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].capexIntensity, latest.capexIntensity)}</td>
              </tr>
              <tr data-ratio-cat="allocation">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Economic Reinvestment Rate ((CapEx − D&amp;A + ΔWCR) / NOPAT)</div>
                  <div class="wb-ratio-blurb">Percentage of after-tax operating earnings plowed back into net working capital and productive physical capacity.</div>
                </td>
                <td>${conceptPill('fcf', 'Reinvestment Rate')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.reinvestmentRate)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].reinvestmentRate, latest.reinvestmentRate)}</td>
              </tr>
              <tr data-ratio-cat="allocation">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Total Shareholder Payout Coverage ((Dividends + Buybacks) / FCF)</div>
                  <div class="wb-ratio-blurb">Tests whether shareholder cash returns are fully covered by organic free cash flow rather than incremental borrowing.</div>
                </td>
                <td>${conceptPill('dividend-policy', 'Payout Coverage')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.fcfPayoutRatio, 2)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].fcfPayoutRatio, latest.fcfPayoutRatio)}</td>
              </tr>
              <tr data-ratio-cat="allocation">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Dividend Payout Ratio (Dividends / Net Income)</div>
                  <div class="wb-ratio-blurb">Proportion of GAAP accounting net earnings distributed directly to shareholders as regular cash dividends.</div>
                </td>
                <td>${conceptPill('dividend-policy', 'Dividend Payout')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.dividendPayoutRatio)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].dividendPayoutRatio, latest.dividendPayoutRatio)}</td>
              </tr>

              <!-- Category 5: Solvency, Liquidity & Credit Headroom -->
              <tr class="wb-row-section" data-ratio-cat="solvency"><td colspan="${byYear.length + 3}">V. Solvency, Liquidity &amp; Credit Headroom</td></tr>
              <tr data-ratio-cat="solvency">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Current Ratio (Current Assets / Current Liabilities)</div>
                  <div class="wb-ratio-blurb">Baseline short-term liquidity buffer measuring short-term assets available to cover immediate commitments.</div>
                </td>
                <td>${conceptPill('working-capital', 'Liquidity')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.currentRatio, 2)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].currentRatio, latest.currentRatio)}</td>
              </tr>
              <tr data-ratio-cat="solvency">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Quick Ratio ((Cash + ST Inv. + AR) / Current Liabilities)</div>
                  <div class="wb-ratio-blurb">Acid-test liquidity excluding illiquid inventories that cannot be immediately liquidated to settle short-term liabilities.</div>
                </td>
                <td>${conceptPill('working-capital', 'Quick Ratio')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.quickRatio, 2)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].quickRatio, latest.quickRatio)}</td>
              </tr>
              <tr data-ratio-cat="solvency">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Cash Ratio ((Cash + ST Inv.) / Current Liabilities)</div>
                  <div class="wb-ratio-blurb">The strictest liquidity test assessing immediate coverage of current liabilities purely using cash and liquid securities.</div>
                </td>
                <td>${conceptPill('working-capital', 'Cash Ratio')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.cashRatio, 2)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].cashRatio, latest.cashRatio)}</td>
              </tr>
              <tr data-ratio-cat="solvency">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Defensive Interval Ratio (DIR in days)</div>
                  <div class="wb-ratio-blurb">Survival horizon measuring how many days liquid assets can support daily cash operating expenses with zero revenue inflows.</div>
                </td>
                <td>${conceptPill('working-capital', 'DIR')}</td>
                ${byYear.map(y => `<td>${y.defensiveInterval.toFixed(0)}d</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaDays(byYear[0].defensiveInterval, latest.defensiveInterval)}</td>
              </tr>
              <tr data-ratio-cat="solvency">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Operating Cash Flow Ratio (OCF / Current Liabilities)</div>
                  <div class="wb-ratio-blurb">Assesses whether annual cash flow from operations is sufficient to settle all current debt obligations coming due.</div>
                </td>
                <td>${conceptPill('cash-flow-analysis', 'OCF Ratio')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.ocfToCurrentLiabilities, 2)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].ocfToCurrentLiabilities, latest.ocfToCurrentLiabilities)}</td>
              </tr>
              <tr data-ratio-cat="solvency">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Net Working Capital to Assets ((CA − CL) / Total Assets)</div>
                  <div class="wb-ratio-blurb">Measures net liquid buffer scaled against overall enterprise asset base (core liquidity factor in Altman Z-Score).</div>
                </td>
                <td>${conceptPill('working-capital', 'NWC/Assets')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.nwcToTotalAssets)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].nwcToTotalAssets, latest.nwcToTotalAssets)}</td>
              </tr>
              <tr data-ratio-cat="solvency">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Total Debt-to-Equity (Total Debt / Stockholders' Equity)</div>
                  <div class="wb-ratio-blurb">Measures balance sheet financial leverage by comparing total funded debt obligations against shareholder equity cushion.</div>
                </td>
                <td>${conceptPill('capital-structure', 'Debt/Equity')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.debtToEquity, 2)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].debtToEquity, latest.debtToEquity)}</td>
              </tr>
              <tr data-ratio-cat="solvency">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Debt-to-Capital Ratio (Total Debt / (Total Debt + Stockholders' Equity))</div>
                  <div class="wb-ratio-blurb">Evaluates the proportion of total enterprise capital structure financed by fixed interest-bearing debt obligations.</div>
                </td>
                <td>${conceptPill('capital-structure', 'Debt/Capital')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.debtToCapital)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].debtToCapital, latest.debtToCapital)}</td>
              </tr>
              <tr data-ratio-cat="solvency">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Debt-to-Assets Ratio (Total Debt / Total Assets)</div>
                  <div class="wb-ratio-blurb">Direct solvency proportion measuring percentage of enterprise balance sheet assets funded by interest-bearing debt.</div>
                </td>
                <td>${conceptPill('capital-structure', 'Debt/Assets')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.debtToAssets)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].debtToAssets, latest.debtToAssets)}</td>
              </tr>
              <tr data-ratio-cat="solvency">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Financial Leverage Ratio (Total Liabilities / Stockholders' Equity)</div>
                  <div class="wb-ratio-blurb">Broad leverage metric evaluating total funded debt plus operational obligations relative to net equity cushion.</div>
                </td>
                <td>${conceptPill('capital-structure', 'Liab/Equity')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.financialLeverage, 2)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].financialLeverage, latest.financialLeverage)}</td>
              </tr>
              <tr data-ratio-cat="solvency">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Net Debt / EBITDA (Net Financial Obligations / EBITDA)</div>
                  <div class="wb-ratio-blurb">Primary institutional credit covenant leverage metric indicating years required to repay net debt from core cash earnings.</div>
                </td>
                <td>${conceptPill('capital-structure', 'Net Debt/EBITDA')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.netDebtToEbitda, 2)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].netDebtToEbitda, latest.netDebtToEbitda)}</td>
              </tr>
              <tr data-ratio-cat="solvency">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Interest Coverage Ratio (EBIT / Interest Expense)</div>
                  <div class="wb-ratio-blurb">Credit safety headroom testing how comfortably operating earnings service required fixed debt interest charges.</div>
                </td>
                <td>${conceptPill('credit-spreads', 'Coverage')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.interestCoverage, 1)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].interestCoverage, latest.interestCoverage)}</td>
              </tr>
              <tr data-ratio-cat="solvency">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">EBITDA Interest Coverage (EBITDA / Interest Expense)</div>
                  <div class="wb-ratio-blurb">Cash debt coverage neutralizing non-cash depreciation and amortization before mandatory interest payments.</div>
                </td>
                <td>${conceptPill('credit-spreads', 'EBITDA Coverage')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.ebitdaInterestCoverage, 1)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].ebitdaInterestCoverage, latest.ebitdaInterestCoverage)}</td>
              </tr>
              <tr data-ratio-cat="solvency">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Cash Interest Coverage ((OCF + Interest) / Interest Expense)</div>
                  <div class="wb-ratio-blurb">Stringent cash-basis coverage evaluating cash operating generation available to meet annual interest charges.</div>
                </td>
                <td>${conceptPill('cash-flow-analysis', 'Cash Coverage')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.cashInterestCoverage, 1)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].cashInterestCoverage, latest.cashInterestCoverage)}</td>
              </tr>
              <tr data-ratio-cat="solvency">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Operating Cash Flow Debt Coverage (OCF / Total Debt)</div>
                  <div class="wb-ratio-blurb">Evaluates enterprise debt service capability directly from actual operational cash flow generation.</div>
                </td>
                <td>${conceptPill('cash-flow-analysis', 'Cash Debt Coverage')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.ocfToDebt, 2)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].ocfToDebt, latest.ocfToDebt)}</td>
              </tr>
              <tr data-ratio-cat="solvency">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Fulghieri Liquidity Ratio (LR = NLF / WCR)</div>
                  <div class="wb-ratio-blurb">Strategic financing ratio: LR &gt; 1.0 indicates conservative long-term funding; LR &lt; 1.0 indicates aggressive short-term debt reliance.</div>
                </td>
                <td>${conceptPill('working-capital', 'Liquidity Ratio')}</td>
                ${byYear.map(y => `<td>${y.wcr <= 0 ? 'Float' : fmtMult(y.liquidityRatio, 2)}</td>`).join('')}
                <td class="wb-td-cagr">${latest.wcr > 0 && byYear[0].wcr > 0 ? fmtDeltaMult(byYear[0].liquidityRatio, latest.liquidityRatio) : '—'}</td>
              </tr>

              <!-- Category 6: Operating Leverage, Specialized Benchmarks & Quality -->
              <tr class="wb-row-section" data-ratio-cat="quality"><td colspan="${byYear.length + 3}">VI. Operating Leverage, Specialized Benchmarks &amp; Earnings Quality</td></tr>
              <tr data-ratio-cat="quality">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">R&amp;D Intensity (R&amp;D Expense / Sales)</div>
                  <div class="wb-ratio-blurb">Innovation reinvestment benchmark measuring commitment of top-line revenues to proprietary technology and IP creation.</div>
                </td>
                <td>${conceptPill('reformulated-is', 'R&D Intensity')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.rdIntensity)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].rdIntensity, latest.rdIntensity)}</td>
              </tr>
              <tr data-ratio-cat="quality">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">SG&amp;A Overhead Intensity (SG&amp;A Expense / Sales)</div>
                  <div class="wb-ratio-blurb">Assesses commercial go-to-market overhead, corporate governance costs, and administrative sales leverage efficiency.</div>
                </td>
                <td>${conceptPill('reformulated-is', 'SG&A Intensity')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.sgaIntensity)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].sgaIntensity, latest.sgaIntensity)}</td>
              </tr>
              <tr data-ratio-cat="quality">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Rule of 40 (YoY Revenue Growth % + FCF Margin %)</div>
                  <div class="wb-ratio-blurb">Gold standard growth-vs-profitability benchmark; aggregate scores exceeding 40% signify elite balance between scaling and cash generation.</div>
                </td>
                <td>${conceptPill('fcf', 'Rule of 40')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.ruleOf40)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].ruleOf40, latest.ruleOf40)}</td>
              </tr>
              <tr data-ratio-cat="quality">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Gross Margin Return on Inventory (GMROI = Gross Profit / Inventory)</div>
                  <div class="wb-ratio-blurb">Inventory productivity multiplier measuring gross margin dollars earned per dollar of inventory capital invested.</div>
                </td>
                <td>${conceptPill('working-capital', 'GMROI')}</td>
                ${byYear.map(y => `<td>${fmtMult(y.gmroi, 2)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaMult(byYear[0].gmroi, latest.gmroi)}</td>
              </tr>
              <tr class="wb-row-total" data-ratio-cat="quality">
                <td class="wb-ratio-cell">
                  <div class="wb-ratio-title">Sloan Accrual Quality Ratio ((Net Income − Operating Cash Flow) / Operating Assets)</div>
                  <div class="wb-ratio-blurb">Forensic accounting test detecting aggressive earnings quality when non-cash accruals outpace underlying cash generation.</div>
                </td>
                <td>${conceptPill('accrual-quality', 'Sloan Ratio')}</td>
                ${byYear.map(y => `<td>${fmtPct(y.sloanAccrualRatio)}</td>`).join('')}
                <td class="wb-td-cagr">${fmtDeltaPct(byYear[0].sloanAccrualRatio, latest.sloanAccrualRatio)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 4: AUTOMATED EXECUTIVE RED FLAGS & EARNINGS QUALITY -->
    <div id="tab-diagnostics" class="wb-tab-pane" style="display:none;">
      <div class="wb-panel">
        <div class="wb-panel__header">
          <div>
            <h3 class="wb-panel__title">Automated Executive Red Flags &amp; Accounting Quality Audit (${company.ticker})</h3>
            <div class="wb-panel__subtitle">Composite Health Score: ${healthScore}/100 (Grade ${grade}) — Evaluates Penman RNOA, Sloan Accruals, SBC Dilution, Coverage &amp; WCR</div>
          </div>
          ${conceptPill('accrual-quality', 'Forensic FSA')}
        </div>
        <div class="wb-panel__body">
          <div class="wb-flag-list">
            ${flags.map(f => `
              <div class="wb-flag wb-flag--${f.severity}">
                <div style="font-size: 1.25rem; line-height: 1;">
                  ${f.severity === 'positive' ? '✅' : f.severity === 'warning' ? '⚠️' : '🚨'}
                </div>
                <div style="flex: 1;">
                  <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
                    <div class="wb-flag__title">${f.title}</div>
                    ${conceptPill(f.concept, 'Review Concept')}
                  </div>
                  <div class="wb-flag__desc">${f.detail}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // Highlight negative numbers and parenthesized cash outflows in red across all tables
  highlightNegativeTableCells(root);

  // Wire Tab Switching
  const tabs = root.querySelectorAll('.wb-tab');
  const panes = {
    statements: root.querySelector('#tab-statements'),
    penman: root.querySelector('#tab-penman'),
    ratios: root.querySelector('#tab-ratios'),
    diagnostics: root.querySelector('#tab-diagnostics')
  };
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-tab');
      Object.entries(panes).forEach(([k, el]) => {
        if (el) el.style.display = k === target ? 'block' : 'none';
      });
    });
  });

  // Wire Statement View Filter Pills in Tab 1
  const filterPills = root.querySelectorAll('.wb-statement-pill');
  const statementRows = root.querySelectorAll('#tab-statements .wb-table tbody tr[data-section]');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const selected = pill.getAttribute('data-statement');
      statementRows.forEach(tr => {
        const sec = tr.getAttribute('data-section');
        if (selected === 'all' || sec === selected) {
          tr.style.display = '';
        } else {
          tr.style.display = 'none';
        }
      });
    });
  });

  // Wire Ratio Category Filter Pills in Tab 3
  const ratioPills = root.querySelectorAll('.wb-ratio-pill');
  const ratioRows = root.querySelectorAll('#tab-ratios .wb-table tbody tr[data-ratio-cat]');
  ratioPills.forEach(pill => {
    pill.addEventListener('click', () => {
      ratioPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const selected = pill.getAttribute('data-ratio-cat');
      ratioRows.forEach(tr => {
        const cat = tr.getAttribute('data-ratio-cat');
        if (selected === 'all' || cat === selected) {
          tr.style.display = '';
        } else {
          tr.style.display = 'none';
        }
      });
    });
  });

  // Wire Operating Cash % Slider (Preserves Penman Tab View)
  const slider = root.querySelector('#op-cash-slider');
  if (slider) {
    slider.addEventListener('change', (e) => {
      render10KAnalyzer(company, parseFloat(e.target.value), 'penman');
    });
    slider.addEventListener('input', (e) => {
      const label = root.querySelector('#op-cash-val');
      if (label) label.textContent = `${(parseFloat(e.target.value) * 100).toFixed(1)}%`;
    });
  }
}

if (typeof document !== 'undefined') {
  const init10K = () => {
    const bannerEl = document.getElementById('analyze-target-banner');
    const rootEl = document.getElementById('wb-10k-root');
    if (!rootEl) return;

    if (bannerEl) {
      mountTargetBanner(bannerEl, (company) => {
        render10KAnalyzer(company, 0.015, 'statements');
      });
    }
    render10KAnalyzer(getActiveCompany(), 0.015, 'statements');
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init10K);
  } else {
    init10K();
  }
}
