/**
 * js/analyze/consulting-workbench.js
 * Workbench 5: Standalone Project ROI & Management Consulting Studio
 *
 * Completely decoupled from public 10-K tickers so users can model real work projects,
 * departmental initiatives, software implementations, and consulting engagements:
 * - Supports $, $K (Thousands), or $M (Millions) unit scaling
 * - Direct numeric inputs + sliders + custom year-by-year cash flow overrides
 * - Pre-Tax (0% tax) or After-Tax corporate capital budgeting
 * - Save/Load multiple work projects in localStorage + Export to Excel (CSV) & JSON
 */

import {
  fmtPct,
  fmtMult,
  conceptPill,
  highlightNegativeTableCells
} from './state.js';

const STORAGE_KEY = 'ef_saved_work_projects_v1';

/**
 * Standalone Work Project Templates (Default values in $K — Thousands, or adaptable to any unit)
 */
export const CONSULTING_TEMPLATES = {
  digital: {
    id: 'digital',
    name: 'AI & Workflow Automation Project',
    department: 'Operations & IT',
    unit: 'K', // $K (Thousands)
    summary: 'Automating manual back-office / operations workflows with AI & cloud tooling to reduce labor hours and error rates.',
    upfrontCapex: 250,         // $250K implementation / build cost
    consultingFee: 60,         // $60K external advisory / integration fee
    yr1Benefit: 165,           // $165K Year-1 gross savings / productivity lift
    benefitGrowth: 0.15,       // 15% annual ramp as adoption expands
    ongoingOpex: 35,           // $35K/yr software licensing & maintenance
    horizonYears: 5,
    hurdleRate: 0.10,          // 10.0% hurdle rate
    taxRate: 0.0,              // 0% (Pre-tax operational business case by default; user can set 21% for after-tax)
    baseRev: 12000,
    baseCogs: 6500,
    baseSga: 3100,
    priceUpliftPct: 0.015,
    volumeGrowthPct: 0.025,
    cogsSavingsPct: 0.025,
    sgaSavingsPct: 0.080,
    evMultiple: 10.0
  },
  pricing: {
    id: 'pricing',
    name: 'Commercial Pricing & Margin Turnaround',
    department: 'Commercial / Sales',
    unit: 'K',
    summary: 'Discount governance, price-pack architecture, and vendor contract renegotiation with rapid <12 month payback.',
    upfrontCapex: 80,
    consultingFee: 45,
    yr1Benefit: 210,
    benefitGrowth: 0.08,
    ongoingOpex: 15,
    horizonYears: 5,
    hurdleRate: 0.10,
    taxRate: 0.0,
    baseRev: 15000,
    baseCogs: 8500,
    baseSga: 3500,
    priceUpliftPct: 0.035,
    volumeGrowthPct: 0.010,
    cogsSavingsPct: 0.035,
    sgaSavingsPct: 0.030,
    evMultiple: 10.0
  },
  automation: {
    id: 'automation',
    name: 'Equipment / Facility CapEx & Lean Supply Chain',
    department: 'Manufacturing & Supply Chain',
    unit: 'M', // $M (Millions)
    summary: 'Capital equipment upgrade, warehouse automation, and inventory reduction unlocking unit COGS savings.',
    upfrontCapex: 4.5,
    consultingFee: 0.5,
    yr1Benefit: 1.9,
    benefitGrowth: 0.12,
    ongoingOpex: 0.35,
    horizonYears: 6,
    hurdleRate: 0.095,
    taxRate: 0.21,
    baseRev: 120,
    baseCogs: 75,
    baseSga: 22,
    priceUpliftPct: 0.005,
    volumeGrowthPct: 0.020,
    cogsSavingsPct: 0.060,
    sgaSavingsPct: 0.025,
    evMultiple: 11.0
  },
  market: {
    id: 'market',
    name: 'New Product / Service Line Launch (GTM)',
    department: 'Product & Strategy',
    unit: 'K',
    summary: 'Go-to-market launch investment, sales enablement, and customer acquisition ramp for a new product tier.',
    upfrontCapex: 320,
    consultingFee: 80,
    yr1Benefit: 180,
    benefitGrowth: 0.25,
    ongoingOpex: 55,
    horizonYears: 5,
    hurdleRate: 0.12,
    taxRate: 0.0,
    baseRev: 10000,
    baseCogs: 4500,
    baseSga: 3200,
    priceUpliftPct: 0.020,
    volumeGrowthPct: 0.055,
    cogsSavingsPct: 0.010,
    sgaSavingsPct: 0.020,
    evMultiple: 12.0
  },
  custom: {
    id: 'custom',
    name: 'Custom Work Project (Blank Baseline)',
    department: 'General Management',
    unit: 'K',
    summary: 'Clean slate project model—enter your own upfront cost, annual savings, and operational assumptions.',
    upfrontCapex: 100,
    consultingFee: 0,
    yr1Benefit: 50,
    benefitGrowth: 0.10,
    ongoingOpex: 10,
    horizonYears: 5,
    hurdleRate: 0.10,
    taxRate: 0.0,
    baseRev: 5000,
    baseCogs: 2800,
    baseSga: 1200,
    priceUpliftPct: 0.02,
    volumeGrowthPct: 0.02,
    cogsSavingsPct: 0.03,
    sgaSavingsPct: 0.05,
    evMultiple: 8.0
  }
};

/**
 * Return dollar multiplier for a given project unit ('$' | 'H' | 'K' | 'M')
 */
export function getUnitMultiplier(unit = 'K') {
  if (unit === '$') return 1;
  if (unit === 'H') return 100;
  if (unit === 'M') return 1e6;
  return 1e3; // Default 'K'
}

/**
 * Format a scaled value as full exact dollars (e.g. 450 in 'K' -> '$450,000')
 */
export function fmtExactDollars(val, unit = 'K') {
  if (val === null || val === undefined || Number.isNaN(val)) return '—';
  const exact = val * getUnitMultiplier(unit);
  const sign = exact < 0 ? '-' : '';
  return `${sign}$${Math.round(Math.abs(exact)).toLocaleString()}`;
}

/**
 * Format currency dynamically according to project unit ('$' | 'H' | 'K' | 'M')
 */
export function fmtProjectMoney(val, unit = 'K') {
  if (val === null || val === undefined || Number.isNaN(val)) return '—';
  const sign = val < 0 ? '-' : '';
  const abs = Math.abs(val);
  if (unit === '$') {
    return `${sign}$${Math.round(abs).toLocaleString()}`;
  }
  if (unit === 'H') {
    return `${sign}$${Math.round(abs * 100).toLocaleString()}`;
  }
  if (unit === 'K') {
    if (abs >= 10000) return `${sign}$${Math.round(abs).toLocaleString()}K`;
    if (abs >= 100) return `${sign}$${abs.toFixed(0)}K`;
    return `${sign}$${abs.toFixed(1)}K`;
  }
  // unit === 'M'
  if (abs >= 100) return `${sign}$${abs.toFixed(0)}M`;
  if (abs >= 10) return `${sign}$${abs.toFixed(1)}M`;
  return `${sign}$${abs.toFixed(2)}M`;
}

/**
 * Solve Internal Rate of Return (IRR) via bisection + Newton-Raphson fallback
 */
export function solveIRR(cashFlows) {
  if (!Array.isArray(cashFlows) || cashFlows.length < 2) return 0;
  const hasPos = cashFlows.some(c => c > 0);
  const hasNeg = cashFlows.some(c => c < 0);
  if (!hasPos || !hasNeg) return 0;

  let low = -0.90;
  let high = 5.0;
  const npvAt = (r) => cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + r, t), 0);

  let fLow = npvAt(low);
  let fHigh = npvAt(high);
  if (fLow * fHigh > 0) {
    let r = 0.12;
    for (let i = 0; i < 60; i++) {
      let f = 0;
      let df = 0;
      for (let t = 0; t < cashFlows.length; t++) {
        f += cashFlows[t] / Math.pow(1 + r, t);
        if (t > 0) df -= (t * cashFlows[t]) / Math.pow(1 + r, t + 1);
      }
      if (Math.abs(df) < 1e-9) break;
      const next = Math.max(-0.9, Math.min(5.0, r - f / df));
      if (Math.abs(next - r) < 1e-6) return next;
      r = next;
    }
    return r;
  }

  for (let iter = 0; iter < 80; iter++) {
    const mid = (low + high) / 2;
    const fMid = npvAt(mid);
    if (Math.abs(fMid) < 1e-6) return mid;
    if (fLow * fMid <= 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }
  return (low + high) / 2;
}

/**
 * 1. Standalone Capital Budgeting & Project Business Case Engine (NPV, IRR, MIRR, ROI, Payback, J-Curve)
 * Accepts either standalone project parameters OR an optional company object for backward compatibility in tests.
 */
export function computeConsultingBusinessCase(projectOrCompany = {}, overrides = {}) {
  const merged = { ...(projectOrCompany || {}), ...(overrides || {}) };
  const templateKey = merged.template || 'digital';
  const tpl = CONSULTING_TEMPLATES[templateKey] || CONSULTING_TEMPLATES.digital;

  const horizonUnit = ['weeks', 'months', 'years'].includes(merged.horizonUnit)
    ? merged.horizonUnit
    : (tpl.horizonUnit || 'years');
  const periodsPerYear = horizonUnit === 'weeks' ? 52 : horizonUnit === 'months' ? 12 : 1;
  const periodName = horizonUnit === 'weeks' ? 'Week' : horizonUnit === 'months' ? 'Month' : 'Year';
  const periodShort = horizonUnit === 'weeks' ? 'Wk' : horizonUnit === 'months' ? 'Mo' : 'Yr';
  const periodPlural = horizonUnit === 'weeks' ? 'wks' : horizonUnit === 'months' ? 'mos' : 'yrs';
  const maxPeriods = horizonUnit === 'weeks' ? 52 : horizonUnit === 'months' ? 36 : 15;

  const upfrontCapex = Math.max(0, Number(merged.upfrontCapex ?? tpl.upfrontCapex));
  const consultingFee = Math.max(0, Number(merged.consultingFee ?? tpl.consultingFee));
  const yr1Benefit = Math.max(0, Number(merged.yr1Benefit ?? tpl.yr1Benefit));
  const benefitGrowth = Number(merged.benefitGrowth ?? tpl.benefitGrowth);
  const ongoingOpex = Math.max(0, Number(merged.ongoingOpex ?? tpl.ongoingOpex));
  const horizonYears = Math.max(1, Math.min(maxPeriods, Math.round(Number(merged.horizonYears ?? tpl.horizonYears ?? 5))));
  const hurdleRate = Math.max(0.01, Math.min(0.40, Number(merged.hurdleRate ?? tpl.hurdleRate)));
  const taxRate = Math.max(0, Math.min(0.45, Number(merged.taxRate ?? tpl.taxRate)));
  const customYearlyBenefits = Array.isArray(merged.customYearlyBenefits) ? merged.customYearlyBenefits : null;
  const customYearlyOpex = Array.isArray(merged.customYearlyOpex) ? merged.customYearlyOpex : null;

  // Effective periodic discount rate & OpEx escalation rate per period (week, month, or year)
  const periodicHurdleRate = Math.pow(1 + hurdleRate, 1 / periodsPerYear) - 1;
  const periodicOpexEscalation = Math.pow(1 + 0.03, 1 / periodsPerYear) - 1;

  // Period 0 initial outlay: CapEx + after-tax consulting/setup fee
  const afterTaxFeeOutlay = consultingFee * (1 - taxRate);
  const totalInitialOutlay = Math.max(0.001, upfrontCapex + afterTaxFeeOutlay);
  const grossInitialSpend = upfrontCapex + consultingFee;

  const annualDepreciation = upfrontCapex / horizonYears;
  const schedule = [];
  const cashFlows = [-totalInitialOutlay];

  let cumUndiscounted = -totalInitialOutlay;
  let cumDiscounted = -totalInitialOutlay;
  let simplePaybackYears = null;
  let discountedPaybackYears = null;

  schedule.push({
    year: 0,
    capexAndFee: -grossInitialSpend,
    grossBenefit: 0,
    ongoingOpex: 0,
    depreciation: 0,
    ebitImpact: -consultingFee,
    nopat: -afterTaxFeeOutlay,
    taxShield: consultingFee * taxRate,
    fcf: -totalInitialOutlay,
    pvFcf: -totalInitialOutlay,
    cumUndiscounted,
    cumDiscounted
  });

  let totalGrossBenefits = 0;
  let totalOngoingOpex = 0;
  let totalNetCashInflows = 0;
  let pvInflows = 0;
  let fvPositiveFlows = 0;

  for (let t = 1; t <= horizonYears; t++) {
    const defaultBen = yr1Benefit * Math.pow(1 + benefitGrowth, t - 1);
    const defaultOp = ongoingOpex * Math.pow(1 + periodicOpexEscalation, t - 1);
    const grossBenefit = customYearlyBenefits && customYearlyBenefits[t - 1] !== undefined && customYearlyBenefits[t - 1] !== null
      ? Number(customYearlyBenefits[t - 1])
      : defaultBen;
    const opEx = customYearlyOpex && customYearlyOpex[t - 1] !== undefined && customYearlyOpex[t - 1] !== null
      ? Number(customYearlyOpex[t - 1])
      : defaultOp;

    const ebitdaImpact = grossBenefit - opEx;
    const ebitImpact = ebitdaImpact - annualDepreciation;
    const taxExpense = taxRate > 0 ? Math.max(0, ebitImpact * taxRate) : 0;
    const nopat = ebitImpact - taxExpense;
    const fcf = nopat + annualDepreciation;
    const taxShield = annualDepreciation * taxRate;
    const pvFcf = fcf / Math.pow(1 + periodicHurdleRate, t);

    const prevUndisc = cumUndiscounted;
    const prevDisc = cumDiscounted;
    cumUndiscounted += fcf;
    cumDiscounted += pvFcf;

    if (simplePaybackYears === null && cumUndiscounted >= 0 && fcf > 0) {
      simplePaybackYears = (t - 1) + Math.abs(prevUndisc) / fcf;
    }
    if (discountedPaybackYears === null && cumDiscounted >= 0 && pvFcf > 0) {
      discountedPaybackYears = (t - 1) + Math.abs(prevDisc) / pvFcf;
    }

    totalGrossBenefits += grossBenefit;
    totalOngoingOpex += opEx;
    totalNetCashInflows += fcf;
    pvInflows += pvFcf;
    if (fcf > 0) {
      fvPositiveFlows += fcf * Math.pow(1 + periodicHurdleRate, horizonYears - t);
    }
    cashFlows.push(fcf);

    schedule.push({
      year: t,
      capexAndFee: 0,
      grossBenefit,
      ongoingOpex: opEx,
      depreciation: annualDepreciation,
      ebitImpact,
      nopat,
      taxShield,
      fcf,
      pvFcf,
      cumUndiscounted,
      cumDiscounted
    });
  }

  const npv = pvInflows - totalInitialOutlay;
  const periodicIrr = solveIRR(cashFlows);
  const periodicMirr = totalInitialOutlay > 0 && fvPositiveFlows > 0
    ? Math.pow(fvPositiveFlows / totalInitialOutlay, 1 / horizonYears) - 1
    : 0;
  const irr = periodsPerYear === 1
    ? periodicIrr
    : Math.min(9.99, Math.pow(1 + Math.max(-0.99, periodicIrr), periodsPerYear) - 1);
  const mirr = periodsPerYear === 1
    ? periodicMirr
    : Math.min(9.99, Math.pow(1 + Math.max(-0.99, periodicMirr), periodsPerYear) - 1);
  const profitabilityIndex = totalInitialOutlay > 0 ? pvInflows / totalInitialOutlay : 0;

  const netProfit = totalNetCashInflows - totalInitialOutlay;
  const simpleRoiPct = totalInitialOutlay > 0 ? netProfit / totalInitialOutlay : 0;
  const totalHorizonInYears = Math.max(0.05, horizonYears / periodsPerYear);
  const annualizedRoiPct = totalInitialOutlay > 0 && totalNetCashInflows > 0
    ? Math.min(9.99, Math.pow(totalNetCashInflows / totalInitialOutlay, 1 / totalHorizonInYears) - 1)
    : 0;

  const feeValueMultiple = consultingFee > 0 ? pvInflows / consultingFee : (pvInflows / totalInitialOutlay);

  return {
    templateKey,
    template: tpl,
    horizonUnit,
    periodsPerYear,
    periodName,
    periodShort,
    periodPlural,
    periodicHurdleRate,
    periodicIrr,
    periodicMirr,
    upfrontCapex,
    consultingFee,
    grossInitialSpend,
    totalInitialOutlay,
    yr1Benefit,
    benefitGrowth,
    ongoingOpex,
    horizonYears,
    hurdleRate,
    taxRate,
    npv,
    irr,
    mirr,
    profitabilityIndex,
    simpleRoiPct,
    annualizedRoiPct,
    simplePaybackYears,
    discountedPaybackYears,
    pvInflows,
    totalNetCashInflows,
    totalGrossBenefits,
    totalOngoingOpex,
    feeValueMultiple,
    schedule,
    cashFlows,
    verdict: npv > 0 ? 'APPROVE — VALUE CREATING' : 'REWORK / REJECT — BELOW HURDLE'
  };
}

/**
 * 2. Standalone EBITDA Bridge Waterfall & Value Driver Tree Engine
 */
export function computeEbitdaBridge(projectOrCompany = {}, overrides = {}) {
  const merged = { ...(projectOrCompany || {}), ...(overrides || {}) };
  const templateKey = merged.template || 'digital';
  const tpl = CONSULTING_TEMPLATES[templateKey] || CONSULTING_TEMPLATES.digital;

  const baseRev = Math.max(10, Number(merged.baseRev ?? tpl.baseRev));
  const baseCogs = Math.max(0, Number(merged.baseCogs ?? tpl.baseCogs));
  const baseSga = Math.max(0, Number(merged.baseSga ?? tpl.baseSga));
  const baseEbitda = Math.max(1, Number(merged.baseEbitda ?? (baseRev - baseCogs - baseSga)));
  const baseMargin = baseEbitda / baseRev;

  const priceUpliftPct = Number(merged.priceUpliftPct ?? tpl.priceUpliftPct);
  const volumeGrowthPct = Number(merged.volumeGrowthPct ?? tpl.volumeGrowthPct);
  const cogsSavingsPct = Number(merged.cogsSavingsPct ?? tpl.cogsSavingsPct);
  const sgaSavingsPct = Number(merged.sgaSavingsPct ?? tpl.sgaSavingsPct);
  const runRateProgramOpex = Number(merged.runRateProgramOpex ?? merged.ongoingOpex ?? tpl.ongoingOpex);
  const evMultiple = Number(merged.evMultiple ?? tpl.evMultiple ?? 10.0);

  const pricingEbitdaLift = baseRev * priceUpliftPct;
  const grossMarginRatio = Math.max(0.10, (baseRev - baseCogs) / baseRev);
  const volumeRevLift = baseRev * volumeGrowthPct;
  const volumeEbitdaLift = volumeRevLift * grossMarginRatio;
  const cogsEbitdaLift = baseCogs * cogsSavingsPct;
  const sgaEbitdaLift = baseSga * sgaSavingsPct;

  const totalGrossLift = pricingEbitdaLift + volumeEbitdaLift + cogsEbitdaLift + sgaEbitdaLift;
  const netEbitdaLift = totalGrossLift - runRateProgramOpex;
  const targetEbitda = baseEbitda + netEbitdaLift;
  const targetRev = baseRev + pricingEbitdaLift + volumeRevLift;
  const targetMargin = targetRev > 0 ? targetEbitda / targetRev : 0;
  const marginExpansionBps = (targetMargin - baseMargin) * 10000;
  const impliedEvCreation = netEbitdaLift * evMultiple;

  const steps = [
    { label: 'Baseline EBITDA', value: baseEbitda, type: 'base' },
    { label: '+ Price Realization', value: pricingEbitdaLift, type: 'pos' },
    { label: '+ Volume / Mix', value: volumeEbitdaLift, type: 'pos' },
    { label: '+ COGS / Direct Savings', value: cogsEbitdaLift, type: 'pos' },
    { label: '+ SG&A / Labor Savings', value: sgaEbitdaLift, type: 'pos' },
    { label: '− Run-Rate OpEx', value: -runRateProgramOpex, type: 'neg' },
    { label: 'Target Run-Rate EBITDA', value: targetEbitda, type: 'total' }
  ];

  return {
    baseRev,
    baseCogs,
    baseSga,
    baseEbitda,
    baseMargin,
    priceUpliftPct,
    volumeGrowthPct,
    cogsSavingsPct,
    sgaSavingsPct,
    runRateProgramOpex,
    evMultiple,
    pricingEbitdaLift,
    volumeRevLift,
    volumeEbitdaLift,
    cogsEbitdaLift,
    sgaEbitdaLift,
    totalGrossLift,
    netEbitdaLift,
    targetRev,
    targetEbitda,
    targetMargin,
    marginExpansionBps,
    impliedEvCreation,
    steps
  };
}

/**
 * 3. Break-Even, Pricing Power & Customer Unit Economics Simulator (CVP, Price Elasticity, LTV/CAC)
 */
export function computePricingAndUnitEconomics(projectOrCompany = {}, overrides = {}) {
  const merged = { ...(projectOrCompany || {}), ...(overrides || {}) };

  const unitScale = getUnitMultiplier(merged.unit || 'K');
  const unitPrice = Math.max(1, Number(merged.unitPrice ?? 250));
  const unitVarCost = Math.max(0, Number(merged.unitVarCost ?? 100));
  const fixedCosts = Math.max(1, Number(merged.fixedCosts ?? 450));
  const fixedCostsDollars = fixedCosts * unitScale;

  const unitContribution = Math.max(0.01, unitPrice - unitVarCost);
  const contributionMarginPct = unitPrice > 0 ? unitContribution / unitPrice : 0;
  const breakEvenUnits = unitContribution > 0 ? fixedCostsDollars / unitContribution : 0;
  const breakEvenRevenue = contributionMarginPct > 0 ? fixedCosts / contributionMarginPct : 0;

  const currentUnits = Math.max(1, Number(merged.currentUnits ?? Math.round(breakEvenUnits * 1.5)));
  const proposedPriceChangePct = Number(merged.proposedPriceChangePct ?? 0.05);

  const currentRevenue = (currentUnits * unitPrice) / unitScale;
  const currentTotalContribution = (currentUnits * unitContribution) / unitScale;
  const currentEbitda = currentTotalContribution - fixedCosts;
  const safetyMarginPct = currentRevenue > 0 ? (currentRevenue - breakEvenRevenue) / currentRevenue : 0;
  const operatingLeverageDOL = currentEbitda > 0 ? currentTotalContribution / currentEbitda : 1;

  const denom = contributionMarginPct + proposedPriceChangePct;
  const maxVolumeLossForPriceHike = denom > 0 ? -proposedPriceChangePct / denom : 0;
  const newUnitPrice = unitPrice * (1 + proposedPriceChangePct);
  const newUnitContribution = Math.max(0.01, newUnitPrice - unitVarCost);
  const newBreakEvenUnits = fixedCostsDollars / newUnitContribution;

  const priceSteps = [-0.05, -0.025, 0, 0.025, 0.05, 0.075, 0.10];
  const volumeSteps = [-0.15, -0.10, -0.05, 0, 0.05, 0.10];
  const priceVolumeMatrix = volumeSteps.map(vChg => ({
    volumeChg: vChg,
    cells: priceSteps.map(pChg => {
      const pNew = unitPrice * (1 + pChg);
      const qNew = currentUnits * (1 + vChg);
      const ebitdaNew = (qNew * (pNew - unitVarCost)) / unitScale - fixedCosts;
      const ebitdaDelta = ebitdaNew - currentEbitda;
      return { pChg, vChg, ebitdaNew, ebitdaDelta };
    })
  }));

  const arpuAnnual = Math.max(100, Number(merged.arpuAnnual ?? 24000));
  const customerGrossMargin = Math.max(0.10, Math.min(0.95, Number(merged.customerGrossMargin ?? 0.72)));
  const annualChurnRate = Math.max(0.01, Math.min(0.60, Number(merged.annualChurnRate ?? 0.10)));
  const cac = Math.max(100, Number(merged.cac ?? 32000));
  const discountRate = Math.max(0.02, Math.min(0.30, Number(merged.discountRate ?? 0.10)));

  const annualGrossProfitPerCust = arpuAnnual * customerGrossMargin;
  const effectiveDecay = Math.max(0.02, annualChurnRate + discountRate);
  const ltv = annualGrossProfitPerCust / effectiveDecay;
  const undiscountedLtv = annualGrossProfitPerCust / Math.max(0.01, annualChurnRate);
  const ltvToCac = cac > 0 ? ltv / cac : 0;
  const cacPaybackMonths = annualGrossProfitPerCust > 0 ? (cac / annualGrossProfitPerCust) * 12 : 0;
  const avgCustomerLifetimeYears = 1 / Math.max(0.01, annualChurnRate);

  return {
    unitScale,
    unitPrice,
    unitVarCost,
    fixedCosts,
    fixedCostsDollars,
    currentUnits,
    proposedPriceChangePct,
    unitContribution,
    contributionMarginPct,
    breakEvenUnits,
    newBreakEvenUnits,
    breakEvenRevenue,
    currentRevenue,
    currentEbitda,
    safetyMarginPct,
    operatingLeverageDOL,
    maxVolumeLossForPriceHike,
    newUnitPrice,
    newUnitContribution,
    priceSteps,
    volumeSteps,
    priceVolumeMatrix,
    arpuAnnual,
    customerGrossMargin,
    annualChurnRate,
    cac,
    discountRate,
    annualGrossProfitPerCust,
    ltv,
    undiscountedLtv,
    ltvToCac,
    cacPaybackMonths,
    avgCustomerLifetimeYears
  };
}

/**
 * 4. Tornado Sensitivity & Consulting Fee / Value-Share Structurer
 */
export function computeConsultingScenarios(projectOrCompany = {}, overrides = {}) {
  const merged = { ...(projectOrCompany || {}), ...(overrides || {}) };
  const baseCase = computeConsultingBusinessCase(projectOrCompany, overrides);

  const benefitShockPct = Math.max(0.05, Math.min(0.80, Number(merged.benefitShockPct ?? 0.25)));
  const capexShockPct = Math.max(0.05, Math.min(0.80, Number(merged.capexShockPct ?? 0.25)));
  const hurdleShockBps = Math.max(25, Math.min(600, Number(merged.hurdleShockBps ?? 250)));
  const gainSharePct = Math.max(0.02, Math.min(0.50, Number(merged.gainSharePct ?? 0.15)));
  const hurdleDelta = hurdleShockBps / 10000;

  const bearCase = computeConsultingBusinessCase(projectOrCompany, {
    ...overrides,
    upfrontCapex: baseCase.upfrontCapex * (1 + capexShockPct),
    yr1Benefit: baseCase.yr1Benefit * (1 - benefitShockPct),
    benefitGrowth: Math.max(0, baseCase.benefitGrowth - 0.06),
    ongoingOpex: baseCase.ongoingOpex * 1.20,
    hurdleRate: baseCase.hurdleRate + hurdleDelta
  });

  const bullCase = computeConsultingBusinessCase(projectOrCompany, {
    ...overrides,
    upfrontCapex: baseCase.upfrontCapex * Math.max(0.3, 1 - capexShockPct * 0.5),
    yr1Benefit: baseCase.yr1Benefit * (1 + benefitShockPct),
    benefitGrowth: baseCase.benefitGrowth + 0.05,
    ongoingOpex: baseCase.ongoingOpex * 0.90,
    hurdleRate: Math.max(0.02, baseCase.hurdleRate - hurdleDelta * 0.5)
  });

  const drivers = [
    {
      name: `${baseCase.periodName} 1 Benefit (±${Math.round(benefitShockPct * 100)}%)`,
      lowCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, yr1Benefit: baseCase.yr1Benefit * (1 - benefitShockPct) }).npv,
      highCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, yr1Benefit: baseCase.yr1Benefit * (1 + benefitShockPct) }).npv
    },
    {
      name: `Upfront Project Outlay (±${Math.round(capexShockPct * 100)}%)`,
      lowCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, upfrontCapex: baseCase.upfrontCapex * (1 + capexShockPct) }).npv,
      highCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, upfrontCapex: baseCase.upfrontCapex * (1 - capexShockPct) }).npv
    },
    {
      name: 'Benefit Ramp Rate (±6%)',
      lowCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, benefitGrowth: Math.max(0, baseCase.benefitGrowth - 0.06) }).npv,
      highCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, benefitGrowth: baseCase.benefitGrowth + 0.06 }).npv
    },
    {
      name: `Hurdle Rate (±${Math.round(hurdleShockBps)} bps)`,
      lowCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, hurdleRate: baseCase.hurdleRate + hurdleDelta }).npv,
      highCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, hurdleRate: Math.max(0.02, baseCase.hurdleRate - hurdleDelta) }).npv
    },
    {
      name: 'Ongoing Run-Rate OpEx (±30%)',
      lowCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, ongoingOpex: baseCase.ongoingOpex * 1.30 }).npv,
      highCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, ongoingOpex: baseCase.ongoingOpex * 0.70 }).npv
    }
  ].map(d => ({
    ...d,
    spread: Math.abs(d.highCase - d.lowCase)
  })).sort((a, b) => b.spread - a.spread);

  const baseFee = Math.max(1, baseCase.consultingFee || baseCase.upfrontCapex * 0.15);
  const yr1NetBenefit = Math.max(1, baseCase.yr1Benefit - baseCase.ongoingOpex);

  const feeModels = [
    {
      model: 'Fixed-Fee Arrangement',
      structure: '100% Fixed Price upon Milestone Delivery',
      totalFee: baseFee,
      clientNetNpv: baseCase.npv,
      clientRoiPct: baseCase.simpleRoiPct,
      feeMultiple: baseCase.pvInflows / baseFee,
      riskSharing: 'Low (Organization bears adoption risk)'
    },
    {
      model: 'Time & Materials (FTE Burn)',
      structure: `Contractor Rate Card (+${Math.round(capexShockPct * 60)}% scope buffer)`,
      totalFee: baseFee * (1 + capexShockPct * 0.6),
      clientNetNpv: baseCase.npv - (baseFee * (capexShockPct * 0.6) * (1 - baseCase.taxRate)),
      clientRoiPct: (baseCase.totalNetCashInflows - (baseCase.totalInitialOutlay + baseFee * (capexShockPct * 0.6) * (1 - baseCase.taxRate))) /
        (baseCase.totalInitialOutlay + baseFee * (capexShockPct * 0.6) * (1 - baseCase.taxRate)),
      feeMultiple: baseCase.pvInflows / (baseFee * (1 + capexShockPct * 0.6)),
      riskSharing: 'Low (Organization bears schedule overrun risk)'
    },
    {
      model: 'Value-Share / Gain-Share Hybrid',
      structure: `50% Base Retainer + ${Math.round(gainSharePct * 100)}% of Verified ${baseCase.periodName}-1 Savings`,
      totalFee: baseFee * 0.50 + yr1NetBenefit * gainSharePct,
      clientNetNpv: baseCase.npv - ((baseFee * 0.50 + yr1NetBenefit * gainSharePct - baseFee) * (1 - baseCase.taxRate)),
      clientRoiPct: (baseCase.totalNetCashInflows - (baseCase.upfrontCapex + (baseFee * 0.50 + yr1NetBenefit * gainSharePct) * (1 - baseCase.taxRate))) /
        Math.max(1, baseCase.upfrontCapex + (baseFee * 0.50 + yr1NetBenefit * gainSharePct) * (1 - baseCase.taxRate)),
      feeMultiple: baseCase.pvInflows / Math.max(0.1, baseFee * 0.50 + yr1NetBenefit * gainSharePct),
      riskSharing: 'High (Vendor fee tied to realized savings)'
    }
  ];

  return {
    benefitShockPct,
    capexShockPct,
    hurdleShockBps,
    gainSharePct,
    baseCase,
    bearCase,
    bullCase,
    drivers,
    feeModels
  };
}

/**
 * 5. Bottom-Up FTE Labor Cost & Operational Time-Savings Estimator
 * Converts headcount, hourly rates, build weeks, and weekly hours saved into Tool 1 Upfront CapEx & Period 1 Benefits.
 */
export function computeFteLaborEstimator(params = {}) {
  const unit = params.unit || 'K';
  const unitMult = getUnitMultiplier(unit);
  const horizonUnit = ['weeks', 'months', 'years'].includes(params.horizonUnit) ? params.horizonUnit : 'years';
  const periodsPerYear = horizonUnit === 'weeks' ? 52 : horizonUnit === 'months' ? 12 : 1;

  const buildFtes = Math.max(0.5, Number(params.buildFtes ?? 4));
  const buildHourlyRate = Math.max(15, Number(params.buildHourlyRate ?? 95));
  const buildWeeks = Math.max(1, Number(params.buildWeeks ?? 16));
  const buildHoursPerWeek = Math.max(5, Math.min(80, Number(params.buildHoursPerWeek ?? 40)));
  const hardwareSoftwareCapex = Math.max(0, Number(params.hardwareSoftwareCapex ?? 60));

  const impactedEmployees = Math.max(1, Number(params.impactedEmployees ?? 45));
  const hoursSavedPerWeek = Math.max(0.25, Number(params.hoursSavedPerWeek ?? 3.5));
  const employeeHourlyRate = Math.max(15, Number(params.employeeHourlyRate ?? 60));
  const retiredSpendPerPeriod = Math.max(0, Number(params.retiredSpendPerPeriod ?? 40));

  const totalBuildHours = buildFtes * buildWeeks * buildHoursPerWeek;
  const buildLaborDollars = totalBuildHours * buildHourlyRate;
  const hardwareSoftwareDollars = hardwareSoftwareCapex * unitMult;
  const totalUpfrontDollars = buildLaborDollars + hardwareSoftwareDollars;
  const impliedUpfrontCapex = Number((totalUpfrontDollars / unitMult).toFixed(2));

  const weeklyHoursSavedTotal = impactedEmployees * hoursSavedPerWeek;
  const fteEquivalentSaved = weeklyHoursSavedTotal / 40;
  const annualHoursSaved = weeklyHoursSavedTotal * 52;
  const annualLaborSavingsDollars = annualHoursSaved * employeeHourlyRate;
  const periodLaborSavingsDollars = annualLaborSavingsDollars / periodsPerYear;
  const retiredSpendDollars = retiredSpendPerPeriod * unitMult;
  const totalPeriod1BenefitDollars = periodLaborSavingsDollars + retiredSpendDollars;
  const impliedPeriod1Benefit = Number((totalPeriod1BenefitDollars / unitMult).toFixed(2));

  return {
    unit,
    horizonUnit,
    periodsPerYear,
    buildFtes,
    buildHourlyRate,
    buildWeeks,
    buildHoursPerWeek,
    hardwareSoftwareCapex,
    impactedEmployees,
    hoursSavedPerWeek,
    employeeHourlyRate,
    retiredSpendPerPeriod,
    totalBuildHours,
    buildLaborDollars,
    hardwareSoftwareDollars,
    totalUpfrontDollars,
    impliedUpfrontCapex,
    weeklyHoursSavedTotal,
    fteEquivalentSaved,
    annualHoursSaved,
    annualLaborSavingsDollars,
    periodLaborSavingsDollars,
    totalPeriod1BenefitDollars,
    impliedPeriod1Benefit
  };
}

/**
 * 6. Build vs. Buy / Option A vs. Option B vs. Lean MVP TCO & ROI Comparator
 */
export function computeBuildVsBuyComparison(projectOrCompany = {}, overrides = {}) {
  const merged = { ...(projectOrCompany || {}), ...(overrides || {}) };
  const optionA = computeConsultingBusinessCase(merged);

  const buyUpfrontCapex = Math.max(0, Number(merged.buyUpfrontCapex ?? Number((optionA.upfrontCapex * 0.30).toFixed(2))));
  const buyConsultingFee = Math.max(0, Number(merged.buyConsultingFee ?? Number((optionA.consultingFee * 0.50).toFixed(2))));
  const buyYr1Benefit = Math.max(0, Number(merged.buyYr1Benefit ?? Number((optionA.yr1Benefit * 0.95).toFixed(2))));
  const buyOngoingOpex = Math.max(0, Number(merged.buyOngoingOpex ?? Number((optionA.ongoingOpex * 2.20).toFixed(2))));

  const optionB = computeConsultingBusinessCase(merged, {
    upfrontCapex: buyUpfrontCapex,
    consultingFee: buyConsultingFee,
    yr1Benefit: buyYr1Benefit,
    ongoingOpex: buyOngoingOpex,
    customYearlyBenefits: null
  });

  const optionC = computeConsultingBusinessCase(merged, {
    upfrontCapex: Number((optionA.upfrontCapex * 0.50).toFixed(2)),
    consultingFee: Number((optionA.consultingFee * 0.40).toFixed(2)),
    yr1Benefit: Number((optionA.yr1Benefit * 0.65).toFixed(2)),
    ongoingOpex: Number((optionA.ongoingOpex * 0.60).toFixed(2)),
    customYearlyBenefits: null
  });

  const enrichOption = (id, label, subtitle, bc) => {
    const tcoUndiscounted = bc.grossInitialSpend + bc.totalOngoingOpex;
    const pvOpex = bc.schedule.filter(s => s.year > 0).reduce(
      (acc, s) => acc + s.ongoingOpex / Math.pow(1 + bc.periodicHurdleRate, s.year),
      0
    );
    const pvTco = bc.totalInitialOutlay + pvOpex * (1 - bc.taxRate);
    return {
      id,
      label,
      subtitle,
      bc,
      tcoUndiscounted,
      pvTco
    };
  };

  const options = [
    enrichOption('A', 'Option A: Current Plan (In-House Build)', 'Higher upfront CapEx, lower recurring OpEx, full ownership', optionA),
    enrichOption('B', 'Option B: Vendor / SaaS Buy Alternative', 'Lower upfront CapEx, higher subscription OpEx, faster deployment', optionB),
    enrichOption('C', 'Option C: Lean MVP / Phase-1 Scope', '50% upfront budget, 65% core benefit capture, lowest capital at risk', optionC)
  ];

  const recommended = [...options].sort((x, y) => y.bc.npv - x.bc.npv)[0];

  return {
    buyUpfrontCapex,
    buyConsultingFee,
    buyYr1Benefit,
    buyOngoingOpex,
    options,
    optionA: options[0],
    optionB: options[1],
    optionC: options[2],
    recommended
  };
}

/**
 * 7. 1,000-Trial Monte Carlo Project Risk Simulator (Probability of NPV > 0, P10 / P50 / P90)
 */
export function computeProjectMonteCarlo(projectOrCompany = {}, overrides = {}) {
  const merged = { ...(projectOrCompany || {}), ...(overrides || {}) };
  const baseCase = computeConsultingBusinessCase(merged);
  const benefitShock = Math.max(0.05, Math.min(0.80, Number(merged.benefitShockPct ?? 0.25)));
  const capexShock = Math.max(0.05, Math.min(0.80, Number(merged.capexShockPct ?? 0.25)));
  const hurdleShockBps = Math.max(25, Math.min(600, Number(merged.hurdleShockBps ?? 250)));
  const hurdleSigma = (hurdleShockBps / 10000) * 0.65;

  const trials = 1000;
  let seed = 421337;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return (seed + 0.5) / 4294967296;
  };
  const randNormal = () => {
    const u1 = Math.max(1e-7, rand());
    const u2 = rand();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  };

  const npvs = [];
  let positiveCount = 0;

  for (let i = 0; i < trials; i++) {
    const zCapex = randNormal();
    const zBen = randNormal();
    const zGrowth = randNormal();
    const zOpex = randNormal();
    const zHurdle = randNormal();

    // Cost overruns are slightly right-skewed in real projects
    const simCapex = Math.max(0, baseCase.upfrontCapex * (1 + zCapex * (capexShock * 0.6) + capexShock * 0.08));
    const simBen = Math.max(0, baseCase.yr1Benefit * (1 + zBen * (benefitShock * 0.6)));
    const simGrowth = baseCase.benefitGrowth + zGrowth * (0.03 / Math.sqrt(baseCase.periodsPerYear));
    const simOpex = Math.max(0, baseCase.ongoingOpex * (1 + zOpex * 0.15));
    const simHurdle = Math.max(0.01, Math.min(0.40, baseCase.hurdleRate + zHurdle * hurdleSigma));

    const periodicR = Math.pow(1 + simHurdle, 1 / baseCase.periodsPerYear) - 1;
    const periodicOpexEsc = Math.pow(1 + 0.03, 1 / baseCase.periodsPerYear) - 1;
    const initialOutlay = simCapex + baseCase.consultingFee * (1 - baseCase.taxRate);
    const dep = simCapex / baseCase.horizonYears;

    let pvIn = 0;
    for (let t = 1; t <= baseCase.horizonYears; t++) {
      const ben = simBen * Math.pow(1 + simGrowth, t - 1);
      const opex = simOpex * Math.pow(1 + periodicOpexEsc, t - 1);
      const ebit = ben - opex - dep;
      const fcf = ebit * (1 - baseCase.taxRate) + dep;
      pvIn += fcf / Math.pow(1 + periodicR, t);
    }
    const trialNpv = pvIn - initialOutlay;
    npvs.push(trialNpv);
    if (trialNpv > 0) positiveCount++;
  }

  npvs.sort((a, b) => a - b);
  const meanNpv = npvs.reduce((a, b) => a + b, 0) / trials;
  const variance = npvs.reduce((a, v) => a + Math.pow(v - meanNpv, 2), 0) / trials;
  const stdDevNpv = Math.sqrt(variance);

  const p05Npv = npvs[Math.floor(trials * 0.05)];
  const p10Npv = npvs[Math.floor(trials * 0.10)];
  const p50Npv = npvs[Math.floor(trials * 0.50)];
  const p90Npv = npvs[Math.floor(trials * 0.90)];
  const probPositiveNpv = positiveCount / trials;

  const numBins = 18;
  const minNpv = npvs[0];
  const maxNpv = npvs[trials - 1];
  const span = Math.max(1, maxNpv - minNpv);
  const binWidth = span / numBins;

  const bins = Array.from({ length: numBins }, (_, idx) => {
    const lo = minNpv + idx * binWidth;
    const hi = lo + binWidth;
    const mid = (lo + hi) / 2;
    return { lo, hi, mid, count: 0, isPositive: mid >= 0 };
  });

  npvs.forEach(v => {
    const idx = Math.min(numBins - 1, Math.max(0, Math.floor((v - minNpv) / binWidth)));
    bins[idx].count++;
  });

  return {
    trials,
    probPositiveNpv,
    meanNpv,
    stdDevNpv,
    p05Npv,
    p10Npv,
    p50Npv,
    p90Npv,
    minNpv,
    maxNpv,
    bins
  };
}

/**
 * Draw J-Curve Cumulative Cash Flow Chart (Canvas 2D)
 */
function drawJCurveChart(canvas, bc, unit) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const W = rect.width || 620;
  const H = rect.height || 300;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 28, right: 24, bottom: 38, left: 72 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const pts = bc.schedule;
  const allVals = pts.flatMap(p => [p.cumUndiscounted, p.cumDiscounted, p.fcf]);
  const minVal = Math.min(...allVals, -bc.totalInitialOutlay * 1.15);
  const maxVal = Math.max(...allVals, bc.totalInitialOutlay * 0.5);
  const span = Math.max(1, maxVal - minVal);

  const xAt = (idx) => pad.left + (idx / Math.max(1, pts.length - 1)) * cw;
  const yAt = (val) => pad.top + ((maxVal - val) / span) * ch;
  const zeroY = yAt(0);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const v = minVal + (span * i) / 4;
    const y = yAt(v);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '600 10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(fmtProjectMoney(v, unit), pad.left - 8, y + 3);
  }

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(pad.left, zeroY);
  ctx.lineTo(W - pad.right, zeroY);
  ctx.stroke();
  ctx.setLineDash([]);

  const barW = Math.max(4, Math.min(34, (cw / pts.length) * 0.42));
  const pShort = bc.periodShort || 'Yr';
  const tickStride = pts.length > 26 ? 4 : pts.length > 13 ? 2 : 1;
  pts.forEach((p, idx) => {
    const x = xAt(idx) - barW / 2;
    const y0 = zeroY;
    const y1 = yAt(p.fcf);
    ctx.fillStyle = p.fcf >= 0 ? 'rgba(59, 130, 246, 0.22)' : 'rgba(220, 38, 38, 0.25)';
    ctx.fillRect(x, Math.min(y0, y1), barW, Math.abs(y1 - y0));

    if (idx % tickStride === 0 || idx === pts.length - 1) {
      ctx.fillStyle = '#334155';
      ctx.font = '600 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${pShort} ${p.year}`, xAt(idx), H - 12);
    }
  });

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(xAt(idx), yAt(p.cumUndiscounted));
    else ctx.lineTo(xAt(idx), yAt(p.cumUndiscounted));
  });
  ctx.stroke();

  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  pts.forEach((p, idx) => {
    if (idx === 0) ctx.moveTo(xAt(idx), yAt(p.cumDiscounted));
    else ctx.lineTo(xAt(idx), yAt(p.cumDiscounted));
  });
  ctx.stroke();

  pts.forEach((p, idx) => {
    const cx = xAt(idx);
    const cy = yAt(p.cumDiscounted);
    ctx.fillStyle = p.cumDiscounted >= 0 ? '#16a34a' : '#dc2626';
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Draw EBITDA Bridge Waterfall Chart (Canvas 2D)
 */
function drawWaterfallChart(canvas, bridge, unit) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const W = rect.width || 620;
  const H = rect.height || 300;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 30, right: 20, bottom: 48, left: 72 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  let running = 0;
  const bars = bridge.steps.map(s => {
    if (s.type === 'base' || s.type === 'total') {
      running = s.value;
      return { ...s, start: 0, end: s.value };
    }
    const start = running;
    const end = running + s.value;
    running = end;
    return { ...s, start, end };
  });

  const maxVal = Math.max(...bars.map(b => Math.max(b.start, b.end))) * 1.15;
  const yAt = (v) => pad.top + ((maxVal - v) / Math.max(1, maxVal)) * ch;

  ctx.strokeStyle = '#e2e8f0';
  for (let i = 0; i <= 4; i++) {
    const v = (maxVal * i) / 4;
    const y = yAt(v);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '600 10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(fmtProjectMoney(v, unit), pad.left - 8, y + 3);
  }

  const slotW = cw / bars.length;
  const barW = Math.min(48, slotW * 0.58);

  bars.forEach((b, idx) => {
    const cx = pad.left + slotW * idx + slotW / 2;
    const x = cx - barW / 2;
    const yTop = yAt(Math.max(b.start, b.end));
    const yBot = yAt(Math.min(b.start, b.end));
    const h = Math.max(3, yBot - yTop);

    ctx.fillStyle = b.type === 'base'
      ? '#334155'
      : b.type === 'total'
      ? '#1d4ed8'
      : b.type === 'pos'
      ? '#16a34a'
      : '#dc2626';
    ctx.fillRect(x, yTop, barW, h);

    ctx.fillStyle = b.type === 'neg' ? '#dc2626' : '#0f172a';
    ctx.font = '700 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    const prefix = b.type === 'pos' ? '+' : '';
    ctx.fillText(`${prefix}${fmtProjectMoney(b.value, unit)}`, cx, yTop - 6);

    ctx.fillStyle = '#334155';
    ctx.font = '600 10px Inter, sans-serif';
    const shortLbl = b.label.replace(/^[+−]\s*/, '');
    ctx.fillText(shortLbl.slice(0, 14), cx, H - 18);
  });
}

/**
 * Draw Tornado Sensitivity Chart (Canvas 2D)
 */
function drawTornadoChart(canvas, scen, unit) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const W = rect.width || 620;
  const H = rect.height || 260;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 24, right: 72, bottom: 28, left: 215 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const baseNpv = scen.baseCase.npv;
  const allVals = scen.drivers.flatMap(d => [d.lowCase, d.highCase, baseNpv]);
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const span = Math.max(1, (maxVal - minVal) * 1.2);
  const loBound = minVal - span * 0.08;

  const xAt = (v) => pad.left + ((v - loBound) / span) * cw;
  const baseX = xAt(baseNpv);

  const rowH = ch / Math.max(1, scen.drivers.length);
  scen.drivers.forEach((d, i) => {
    const cy = pad.top + rowH * i + rowH / 2;
    const barH = Math.min(22, rowH * 0.58);
    const xLow = xAt(d.lowCase);
    const xHigh = xAt(d.highCase);

    ctx.fillStyle = 'rgba(220, 38, 38, 0.78)';
    ctx.fillRect(Math.min(xLow, baseX), cy - barH / 2, Math.abs(baseX - xLow), barH);

    ctx.fillStyle = 'rgba(22, 163, 74, 0.78)';
    ctx.fillRect(Math.min(xHigh, baseX), cy - barH / 2, Math.abs(xHigh - baseX), barH);

    ctx.fillStyle = '#1e293b';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(d.name, pad.left - 10, cy + 4);

    ctx.fillStyle = '#475569';
    ctx.font = '600 10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Δ ${fmtProjectMoney(d.spread, unit)}`, Math.max(xLow, xHigh) + 6, cy + 3);
  });

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(baseX, pad.top - 6);
  ctx.lineTo(baseX, H - pad.bottom + 4);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 10px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`Base NPV: ${fmtProjectMoney(baseNpv, unit)}`, baseX, 14);
}

/**
 * Draw Cost-Volume-Profit (CVP) Break-Even & Price Change Chart (Canvas 2D)
 */
function drawCvpBreakEvenChart(canvas, unitEcon, unit) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const W = rect.width || 560;
  const H = rect.height || 245;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 28, right: 24, bottom: 38, left: 68 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const beQ = Math.max(1, unitEcon.breakEvenUnits);
  const newBeQ = Math.max(1, unitEcon.newBreakEvenUnits || beQ);
  const maxQ = Math.max(beQ, newBeQ) * 1.9;
  const unitScale = unitEcon.unitScale || 1000;

  const revAt = (q, p) => (q * p) / unitScale;
  const costAt = (q) => unitEcon.fixedCosts + (q * unitEcon.unitVarCost) / unitScale;

  const maxY = Math.max(
    revAt(maxQ, unitEcon.unitPrice),
    revAt(maxQ, unitEcon.newUnitPrice),
    costAt(maxQ)
  ) * 1.08;

  const xAt = (q) => pad.left + (q / Math.max(1, maxQ)) * cw;
  const yAt = (v) => pad.top + ((maxY - v) / Math.max(1, maxY)) * ch;

  // Grid lines & Y-axis labels
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const val = (maxY * i) / 4;
    const y = yAt(val);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '600 10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(fmtProjectMoney(val, unit), pad.left - 8, y + 3);
  }

  // X-axis volume ticks
  for (let i = 0; i <= 4; i++) {
    const qVal = Math.round((maxQ * i) / 4);
    const x = xAt(qVal);
    ctx.fillStyle = '#475569';
    ctx.font = '600 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${qVal.toLocaleString()} u`, x, H - 12);
  }

  const beX = xAt(beQ);
  const beY = yAt(revAt(beQ, unitEcon.unitPrice));

  // Loss Zone shading (0 to Break-Even)
  ctx.fillStyle = 'rgba(220, 38, 38, 0.08)';
  ctx.beginPath();
  ctx.moveTo(xAt(0), yAt(0));
  ctx.lineTo(xAt(0), yAt(costAt(0)));
  ctx.lineTo(beX, beY);
  ctx.closePath();
  ctx.fill();

  // Profit Zone shading (Break-Even to maxQ)
  ctx.fillStyle = 'rgba(22, 163, 74, 0.09)';
  ctx.beginPath();
  ctx.moveTo(beX, beY);
  ctx.lineTo(xAt(maxQ), yAt(revAt(maxQ, unitEcon.unitPrice)));
  ctx.lineTo(xAt(maxQ), yAt(costAt(maxQ)));
  ctx.closePath();
  ctx.fill();

  // Fixed Cost dashed horizontal line
  ctx.strokeStyle = '#94a3b8';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pad.left, yAt(unitEcon.fixedCosts));
  ctx.lineTo(W - pad.right, yAt(unitEcon.fixedCosts));
  ctx.stroke();
  ctx.setLineDash([]);

  // Total Cost Line (Fixed + Variable)
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2.25;
  ctx.beginPath();
  ctx.moveTo(xAt(0), yAt(costAt(0)));
  ctx.lineTo(xAt(maxQ), yAt(costAt(maxQ)));
  ctx.stroke();

  // Baseline Revenue Line
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(xAt(0), yAt(0));
  ctx.lineTo(xAt(maxQ), yAt(revAt(maxQ, unitEcon.unitPrice)));
  ctx.stroke();

  // Proposed Price Revenue Line (dashed green)
  if (Math.abs(unitEcon.proposedPriceChangePct) > 0.0001) {
    ctx.strokeStyle = '#16a34a';
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 2.25;
    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(0));
    ctx.lineTo(xAt(maxQ), yAt(revAt(maxQ, unitEcon.newUnitPrice)));
    ctx.stroke();
    ctx.setLineDash([]);

    const newBeX = xAt(newBeQ);
    const newBeY = yAt(revAt(newBeQ, unitEcon.newUnitPrice));
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(newBeX, newBeY, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Break-Even Point Marker & Label
  ctx.fillStyle = '#1d4ed8';
  ctx.beginPath();
  ctx.arc(beX, beY, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 10px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`BE: ${Math.ceil(beQ).toLocaleString()} units (${fmtProjectMoney(unitEcon.breakEvenRevenue, unit)})`, Math.min(W - 195, beX + 8), Math.max(pad.top + 12, beY - 8));
}

/**
 * Draw Customer Cohort Cumulative Cash Flow & CAC Payback Curve (Canvas 2D)
 */
function drawLtvCacCurveChart(canvas, unitEcon) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const W = rect.width || 560;
  const H = rect.height || 245;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 28, right: 24, bottom: 38, left: 68 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const months = 60; // 5-year customer cohort view
  const monthlyGp = unitEcon.annualGrossProfitPerCust / 12;
  const monthlySurvival = Math.pow(1 - unitEcon.annualChurnRate, 1 / 12);
  const monthlyDiscount = Math.pow(1 + unitEcon.discountRate, 1 / 12) - 1;

  const pts = [];
  let cumUndisc = -unitEcon.cac;
  let cumDisc = -unitEcon.cac;
  pts.push({ m: 0, cumUndisc, cumDisc });

  for (let m = 1; m <= months; m++) {
    const retention = Math.pow(monthlySurvival, m - 1);
    const cf = monthlyGp * retention;
    cumUndisc += cf;
    cumDisc += cf / Math.pow(1 + monthlyDiscount, m);
    pts.push({ m, cumUndisc, cumDisc });
  }

  const allVals = pts.flatMap(p => [p.cumUndisc, p.cumDisc, 0]);
  const minVal = Math.min(...allVals) * 1.12;
  const maxVal = Math.max(...allVals, unitEcon.cac * 0.5) * 1.12;
  const span = Math.max(1, maxVal - minVal);

  const xAt = (m) => pad.left + (m / months) * cw;
  const yAt = (v) => pad.top + ((maxVal - v) / span) * ch;
  const zeroY = yAt(0);

  // Grid & Y labels
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const val = minVal + (span * i) / 4;
    const y = yAt(val);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '600 10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    const absV = Math.abs(val);
    const lbl = absV >= 1000 ? `${val < 0 ? '-' : ''}$${(absV / 1000).toFixed(0)}K` : `$${val.toFixed(0)}`;
    ctx.fillText(lbl, pad.left - 8, y + 3);
  }

  // Zero Break-Even Line
  ctx.strokeStyle = '#64748b';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(pad.left, zeroY);
  ctx.lineTo(W - pad.right, zeroY);
  ctx.stroke();
  ctx.setLineDash([]);

  // X-axis month labels
  [0, 12, 24, 36, 48, 60].forEach(m => {
    ctx.fillStyle = '#475569';
    ctx.font = '600 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Mo ${m}`, xAt(m), H - 12);
  });

  // Undiscounted Cumulative CF (Slate)
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach((p, i) => {
    if (i === 0) ctx.moveTo(xAt(p.m), yAt(p.cumUndisc));
    else ctx.lineTo(xAt(p.m), yAt(p.cumUndisc));
  });
  ctx.stroke();

  // Discounted Cumulative LTV Curve (Green/Red)
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 2.75;
  ctx.beginPath();
  pts.forEach((p, i) => {
    if (i === 0) ctx.moveTo(xAt(p.m), yAt(p.cumDisc));
    else ctx.lineTo(xAt(p.m), yAt(p.cumDisc));
  });
  ctx.stroke();

  // Mark CAC Payback Crossover if within 60 months
  if (unitEcon.cacPaybackMonths > 0 && unitEcon.cacPaybackMonths <= months) {
    const pbX = xAt(unitEcon.cacPaybackMonths);
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.arc(pbX, zeroY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Payback: ${unitEcon.cacPaybackMonths.toFixed(1)} mos`, Math.min(W - 140, pbX + 7), zeroY - 8);
  }
}

/**
 * Draw Build vs. Buy / Option A vs. B vs. C Cumulative NPV Trajectories (Canvas 2D)
 */
function drawBuildVsBuyChart(canvas, bvb, unit) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const W = rect.width || 560;
  const H = rect.height || 245;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 28, right: 24, bottom: 38, left: 68 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const schedA = bvb.optionA.bc.schedule;
  const schedB = bvb.optionB.bc.schedule;
  const schedC = bvb.optionC.bc.schedule;
  const n = schedA.length;

  const allVals = [
    ...schedA.map(s => s.cumDiscounted),
    ...schedB.map(s => s.cumDiscounted),
    ...schedC.map(s => s.cumDiscounted),
    0
  ];
  const minVal = Math.min(...allVals) * 1.15;
  const maxVal = Math.max(...allVals, 10) * 1.15;
  const span = Math.max(1, maxVal - minVal);

  const xAt = (idx) => pad.left + (idx / Math.max(1, n - 1)) * cw;
  const yAt = (v) => pad.top + ((maxVal - v) / span) * ch;
  const zeroY = yAt(0);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const val = minVal + (span * i) / 4;
    const y = yAt(val);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '600 10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(fmtProjectMoney(val, unit), pad.left - 8, y + 3);
  }

  ctx.strokeStyle = '#64748b';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(pad.left, zeroY);
  ctx.lineTo(W - pad.right, zeroY);
  ctx.stroke();
  ctx.setLineDash([]);

  const pShort = bvb.optionA.bc.periodShort || 'Yr';
  const tickStride = n > 13 ? Math.ceil((n - 1) / 8) : 1;
  schedA.forEach((p, idx) => {
    if (idx === 0 || idx === n - 1 || idx % tickStride === 0) {
      ctx.fillStyle = '#475569';
      ctx.font = '600 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${pShort} ${p.year}`, xAt(idx), H - 12);
    }
  });

  const drawCurve = (sched, color, width, dashed = false) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dashed) ctx.setLineDash([5, 4]);
    ctx.beginPath();
    sched.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(xAt(idx), yAt(p.cumDiscounted));
      else ctx.lineTo(xAt(idx), yAt(p.cumDiscounted));
    });
    ctx.stroke();
    ctx.setLineDash([]);
  };

  drawCurve(schedC, '#d97706', 2, true); // Option C (Amber dashed)
  drawCurve(schedB, '#16a34a', 2.5, false); // Option B Buy (Green)
  drawCurve(schedA, '#2563eb', 2.75, false); // Option A Build (Blue)

  // Legend at top
  ctx.font = '700 10px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#2563eb';
  ctx.fillText(`● Opt A Build (${fmtProjectMoney(bvb.optionA.bc.npv, unit)})`, pad.left + 4, 15);
  ctx.fillStyle = '#16a34a';
  ctx.fillText(`● Opt B Buy SaaS (${fmtProjectMoney(bvb.optionB.bc.npv, unit)})`, pad.left + 175, 15);
  ctx.fillStyle = '#d97706';
  ctx.fillText(`● Opt C Lean MVP (${fmtProjectMoney(bvb.optionC.bc.npv, unit)})`, pad.left + 355, 15);
}

/**
 * Draw 1,000-Trial Monte Carlo NPV Probability Histogram (Canvas 2D)
 */
function drawMonteCarloChart(canvas, mc, unit) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const W = rect.width || 620;
  const H = rect.height || 245;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 28, right: 24, bottom: 38, left: 52 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;

  const maxCount = Math.max(1, ...mc.bins.map(b => b.count)) * 1.15;
  const slotW = cw / mc.bins.length;
  const barW = Math.max(4, slotW * 0.82);

  // Horizontal grid
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const cnt = Math.round((maxCount * i) / 4);
    const y = pad.top + ((maxCount - cnt) / maxCount) * ch;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '600 10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${cnt}`, pad.left - 6, y + 3);
  }

  mc.bins.forEach((b, idx) => {
    const cx = pad.left + slotW * idx + slotW / 2;
    const h = (b.count / maxCount) * ch;
    const y = pad.top + ch - h;
    ctx.fillStyle = b.isPositive ? 'rgba(22, 163, 74, 0.78)' : 'rgba(220, 38, 38, 0.78)';
    ctx.fillRect(cx - barW / 2, y, barW, Math.max(1, h));

    if (idx === 0 || idx === Math.floor(mc.bins.length / 2) || idx === mc.bins.length - 1) {
      ctx.fillStyle = '#475569';
      ctx.font = '600 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(fmtProjectMoney(b.mid, unit), cx, H - 12);
    }
  });

  // Zero NPV marker line if 0 is within range
  if (mc.minNpv < 0 && mc.maxNpv > 0) {
    const zeroX = pad.left + ((0 - mc.minNpv) / Math.max(1, mc.maxNpv - mc.minNpv)) * cw;
    ctx.strokeStyle = '#0f172a';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(zeroX, pad.top);
    ctx.lineTo(zeroX, H - pad.bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NPV = 0', zeroX, 15);
  }
}

function getSavedProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveProjectToStorage(proj) {
  try {
    const list = getSavedProjects().filter(p => p.projectName !== proj.projectName);
    list.unshift({ ...proj, savedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 15)));
  } catch {
    // ignore storage errors
  }
}

/**
 * Interactive Standalone Project ROI & Consulting Workbench Renderer
 */
export function renderConsultingWorkbench(root) {
  if (!root) return;

  let activeTab = 'business-case';
  const defTpl = CONSULTING_TEMPLATES.digital;

  const state = {
    template: 'digital',
    projectName: defTpl.name,
    department: defTpl.department,
    unit: defTpl.unit, // '$' | 'H' | 'K' | 'M'
    horizonUnit: 'years', // 'weeks' | 'months' | 'years'
    showExecMemo: false,
    upfrontCapex: defTpl.upfrontCapex,
    consultingFee: defTpl.consultingFee,
    yr1Benefit: defTpl.yr1Benefit,
    benefitGrowth: defTpl.benefitGrowth,
    ongoingOpex: defTpl.ongoingOpex,
    horizonYears: defTpl.horizonYears,
    hurdleRate: defTpl.hurdleRate,
    taxRate: defTpl.taxRate,
    customYearlyBenefits: null,
    // Bottom-Up FTE & Labor Estimator state
    buildFtes: 4,
    buildHourlyRate: 95,
    buildWeeks: 16,
    buildHoursPerWeek: 40,
    hardwareSoftwareCapex: 60,
    impactedEmployees: 45,
    hoursSavedPerWeek: 3.5,
    employeeHourlyRate: 60,
    retiredSpendPerPeriod: 40,
    // Build vs. Buy (Option B) overrides
    buyUpfrontCapex: 105,
    buyConsultingFee: 45,
    buyYr1Benefit: 230,
    buyOngoingOpex: 95,
    // Tool 2: EBITDA Bridge
    baseRev: defTpl.baseRev,
    baseCogs: defTpl.baseCogs,
    baseSga: defTpl.baseSga,
    priceUpliftPct: defTpl.priceUpliftPct,
    volumeGrowthPct: defTpl.volumeGrowthPct,
    cogsSavingsPct: defTpl.cogsSavingsPct,
    sgaSavingsPct: defTpl.sgaSavingsPct,
    evMultiple: defTpl.evMultiple,
    // Tool 3: Pricing & Unit Economics
    unitPrice: 250,
    unitVarCost: 100,
    fixedCosts: 450,
    proposedPriceChangePct: 0.05,
    arpuAnnual: 24000,
    annualChurnRate: 0.10,
    cac: 32000,
    // Tool 4: Stress-Test & Fee Structurer
    benefitShockPct: 0.25,
    capexShockPct: 0.25,
    hurdleShockBps: 250,
    gainSharePct: 0.15
  };

  const applyTemplate = (tplId) => {
    const t = CONSULTING_TEMPLATES[tplId] || CONSULTING_TEMPLATES.digital;
    state.template = t.id;
    state.projectName = t.name;
    state.department = t.department;
    state.unit = t.unit;
    state.horizonUnit = t.horizonUnit || 'years';
    state.upfrontCapex = t.upfrontCapex;
    state.consultingFee = t.consultingFee;
    state.yr1Benefit = t.yr1Benefit;
    state.benefitGrowth = t.benefitGrowth;
    state.ongoingOpex = t.ongoingOpex;
    state.buyUpfrontCapex = Number((t.upfrontCapex * 0.30).toFixed(2));
    state.buyConsultingFee = Number((t.consultingFee * 0.50).toFixed(2));
    state.buyYr1Benefit = Number((t.yr1Benefit * 0.95).toFixed(2));
    state.buyOngoingOpex = Number((t.ongoingOpex * 2.20).toFixed(2));
    state.horizonYears = t.horizonYears;
    state.hurdleRate = t.hurdleRate;
    state.taxRate = t.taxRate;
    state.customYearlyBenefits = null;
    state.baseRev = t.baseRev;
    state.baseCogs = t.baseCogs;
    state.baseSga = t.baseSga;
    state.priceUpliftPct = t.priceUpliftPct;
    state.volumeGrowthPct = t.volumeGrowthPct;
    state.cogsSavingsPct = t.cogsSavingsPct;
    state.sgaSavingsPct = t.sgaSavingsPct;
    state.evMultiple = t.evMultiple;
  };

  const switchHorizonUnit = (nextUnit) => {
    if (!['weeks', 'months', 'years'].includes(nextUnit) || nextUnit === state.horizonUnit) return;
    const oldPpy = state.horizonUnit === 'weeks' ? 52 : state.horizonUnit === 'months' ? 12 : 1;
    const newPpy = nextUnit === 'weeks' ? 52 : nextUnit === 'months' ? 12 : 1;
    const scale = oldPpy / newPpy;

    state.yr1Benefit = Number((state.yr1Benefit * scale).toFixed(2));
    state.ongoingOpex = Number((state.ongoingOpex * scale).toFixed(2));
    state.benefitGrowth = Number((Math.pow(1 + state.benefitGrowth, scale) - 1).toFixed(4));
    state.horizonYears = nextUnit === 'weeks' ? 12 : nextUnit === 'months' ? 12 : 5;
    state.horizonUnit = nextUnit;
    state.customYearlyBenefits = null;
  };

  const switchUnitScale = (nextUnit) => {
    if (!['$', 'H', 'K', 'M'].includes(nextUnit) || nextUnit === state.unit) return;
    const oldMult = getUnitMultiplier(state.unit);
    const newMult = getUnitMultiplier(nextUnit);
    const factor = oldMult / newMult;
    const roundVal = (v) => {
      const scaled = v * factor;
      return nextUnit === 'M' ? Number(scaled.toFixed(3)) : nextUnit === 'K' ? Number(scaled.toFixed(2)) : Math.round(scaled);
    };

    state.upfrontCapex = roundVal(state.upfrontCapex);
    state.consultingFee = roundVal(state.consultingFee);
    state.yr1Benefit = roundVal(state.yr1Benefit);
    state.ongoingOpex = roundVal(state.ongoingOpex);
    state.hardwareSoftwareCapex = roundVal(state.hardwareSoftwareCapex);
    state.retiredSpendPerPeriod = roundVal(state.retiredSpendPerPeriod);
    state.buyUpfrontCapex = roundVal(state.buyUpfrontCapex);
    state.buyConsultingFee = roundVal(state.buyConsultingFee);
    state.buyYr1Benefit = roundVal(state.buyYr1Benefit);
    state.buyOngoingOpex = roundVal(state.buyOngoingOpex);
    state.baseRev = roundVal(state.baseRev);
    state.baseCogs = roundVal(state.baseCogs);
    state.baseSga = roundVal(state.baseSga);
    state.fixedCosts = Math.max(1, roundVal(state.fixedCosts));
    if (Array.isArray(state.customYearlyBenefits)) {
      state.customYearlyBenefits = state.customYearlyBenefits.map(roundVal);
    }
    state.unit = nextUnit;
  };

  const updateView = () => {
    const unit = state.unit || 'K';
    const unitLabel = unit === '$'
      ? '$ (Exact Dollars)'
      : unit === 'H'
      ? '$100s (Hundreds)'
      : unit === 'K'
      ? '$K (Thousands)'
      : '$M (Millions)';
    const unitShort = unit === '$' ? '$' : unit === 'H' ? '$100s' : unit === 'K' ? '$K' : '$M';
    const fm = (v) => fmtProjectMoney(v, unit);
    const exactBadge = (v) => unit === '$'
      ? ''
      : `<span style="color:#16a34a; font-weight:700; font-size:0.71rem; margin-left:0.25rem;">(= ${fmtExactDollars(v, unit)})</span>`;

    const bc = computeConsultingBusinessCase(state);
    const bridge = computeEbitdaBridge(state);
    const unitEcon = computePricingAndUnitEconomics(state);
    const scen = computeConsultingScenarios(state);
    const fte = computeFteLaborEstimator(state);
    const bvb = computeBuildVsBuyComparison(state);
    const mc = computeProjectMonteCarlo(state);
    const savedList = getSavedProjects();

    const maxHorizon = bc.horizonUnit === 'weeks' ? 52 : bc.horizonUnit === 'months' ? 36 : 15;
    const periodicLabel = bc.horizonUnit === 'weeks' ? 'Weekly' : bc.horizonUnit === 'months' ? 'Monthly' : 'Annual';
    const maxFixedSlider = unit === '$' ? 2000000 : unit === 'H' ? 20000 : unit === 'M' ? 20 : 5000;
    const stepFixedSlider = unit === '$' ? 10000 : unit === 'H' ? 100 : unit === 'M' ? 0.1 : 10;

    root.innerHTML = `
      <!-- STANDALONE WORK PROJECT WORKSPACE BAR (COMPACT) -->
      <div class="analyze-target-bar" style="margin-bottom: 1.15rem; padding: 1rem 1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:0.75rem;">
          <div style="display:flex; gap:0.6rem; flex-wrap:wrap; align-items:center; flex:1;">
            <span class="analyze-ticker-badge" style="background:#1d4ed8;">WORK PROJECT</span>
            <input type="text" id="proj-name-input" class="analyze-input" value="${state.projectName}"
              placeholder="Project / Initiative Name"
              style="font-size:0.98rem; font-weight:800; color:#0f172a; min-width:220px; flex:1;" />
            <input type="text" id="proj-dept-input" class="analyze-input" value="${state.department}"
              placeholder="Department / Client"
              style="font-size:0.84rem; font-weight:600; width:165px;" />
            <select id="proj-unit-select" class="analyze-input" style="width:178px; font-weight:700; cursor:pointer;" title="Switch Monetary Value Marker ($1, $100s, $1,000s, $1,000,000s)">
              <option value="$" ${unit === '$' ? 'selected' : ''}>Scale: $ (Exact Dollars)</option>
              <option value="H" ${unit === 'H' ? 'selected' : ''}>Scale: $100s (Hundreds)</option>
              <option value="K" ${unit === 'K' ? 'selected' : ''}>Scale: $K (Thousands)</option>
              <option value="M" ${unit === 'M' ? 'selected' : ''}>Scale: $M (Millions)</option>
            </select>
            <select id="top-horizon-unit-select" class="analyze-input" style="width:155px; font-weight:700; cursor:pointer;" title="Switch Project Horizon Time Unit">
              <option value="years" ${bc.horizonUnit === 'years' ? 'selected' : ''}>Horizon: Years (${bc.horizonUnit === 'years' ? bc.horizonYears : 5} yrs)</option>
              <option value="months" ${bc.horizonUnit === 'months' ? 'selected' : ''}>Horizon: Months (${bc.horizonUnit === 'months' ? bc.horizonYears : 12} mos)</option>
              <option value="weeks" ${bc.horizonUnit === 'weeks' ? 'selected' : ''}>Horizon: Weeks (${bc.horizonUnit === 'weeks' ? bc.horizonYears : 12} wks)</option>
            </select>
          </div>
          <div style="display:flex; gap:0.45rem; flex-wrap:wrap;">
            ${savedList.length > 0 ? `
              <select id="load-saved-proj-select" class="analyze-input" style="font-size:0.78rem; padding:0.3rem 0.5rem; width:auto;">
                <option value="">📂 Load Saved Project (${savedList.length})...</option>
                ${savedList.map((p, idx) => `<option value="${idx}">${p.projectName} (${p.unit || 'K'})</option>`).join('')}
              </select>
            ` : ''}
            <button type="button" class="btn btn--primary btn--sm" id="toggle-exec-memo-btn" style="background:#1e3a8a; border-color:#1e3a8a;">
              📄 ${state.showExecMemo ? 'Hide Executive Memo' : 'Executive Memo / Print PDF'}
            </button>
            <button type="button" class="btn btn--secondary btn--sm" id="save-proj-btn">💾 Save</button>
            <button type="button" class="btn btn--secondary btn--sm" id="export-csv-btn">📊 CSV</button>
            <button type="button" class="btn btn--secondary btn--sm" id="export-json-btn">⬇ JSON</button>
          </div>
        </div>

        <div class="analyze-switcher" style="padding-top:0.65rem;">
          <div class="analyze-switcher__pills">
            <span class="analyze-switcher__label">Project Templates:</span>
            ${Object.values(CONSULTING_TEMPLATES).map(t => `
              <button type="button" class="analyze-snap-pill ${state.template === t.id ? 'analyze-snap-pill--active' : ''}"
                data-tpl-id="${t.id}" title="${t.summary}">
                ${t.name}
              </button>
            `).join('')}
          </div>
        </div>
        <div id="proj-save-status" style="font-size:0.78rem; color:#16a34a; font-weight:600; margin-top:0.35rem; display:none;"></div>
      </div>

      <!-- 1-PAGE PRINTABLE EXECUTIVE BUSINESS CASE MEMO -->
      <div class="exec-memo-card" style="display:${state.showExecMemo ? 'block' : 'none'};">
        <div class="exec-memo-header">
          <div>
            <div style="font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#1d4ed8;">
              Executive Investment Committee Memorandum · Capital &amp; ROI Decision Brief
            </div>
            <h2 style="font-size:1.35rem; font-weight:800; color:#0f172a; margin:0.2rem 0;">
              ${state.projectName} <span style="font-weight:500; color:#64748b; font-size:0.95rem;">(${state.department})</span>
            </h2>
            <div style="font-size:0.8rem; color:#475569;">
              Horizon: <strong>${bc.horizonYears} ${bc.periodName}s</strong> · Scale: <strong>${unitLabel}</strong> · Hurdle Rate: <strong>${fmtPct(bc.hurdleRate)}/yr</strong> (${fmtPct(bc.periodicHurdleRate)}/${bc.periodShort}) · Tax Rate: <strong>${fmtPct(bc.taxRate)}</strong>
            </div>
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center;" class="no-print">
            <span style="padding:0.35rem 0.75rem; border-radius:999px; font-size:0.78rem; font-weight:800; background:${bc.npv >= 0 ? '#dcfce7' : '#fee2e2'}; color:${bc.npv >= 0 ? '#15803d' : '#b91c1c'};">
              ${bc.verdict}
            </span>
            <button type="button" class="btn btn--primary btn--sm" id="print-exec-memo-btn">🖨️ Print / Save as PDF</button>
            <button type="button" class="btn btn--secondary btn--sm" id="close-exec-memo-btn">✕ Close</button>
          </div>
        </div>

        <div class="exec-memo-grid">
          <div class="exec-memo-box">
            <h4>1. Core Capital ROI Metrics</h4>
            <div style="font-size:0.82rem; line-height:1.6;">
              <div><strong>Net Present Value (NPV):</strong> <span style="font-weight:800; color:${bc.npv >= 0 ? '#16a34a' : '#dc2626'};">${fm(bc.npv)}</span> (${fmtExactDollars(bc.npv, unit)})</div>
              <div><strong>Annualized IRR / MIRR:</strong> <strong>${fmtPct(bc.irr)}</strong> / ${fmtPct(bc.mirr)}</div>
              <div><strong>Profitability Index (PI):</strong> <strong>${bc.profitabilityIndex.toFixed(2)}x</strong> · <strong>Net ROI:</strong> <strong>${fmtPct(bc.simpleRoiPct)}</strong></div>
              <div><strong>Payback Period:</strong> <strong>${bc.simplePaybackYears !== null ? `${bc.simplePaybackYears.toFixed(1)} ${bc.periodPlural}` : `>${bc.horizonYears} ${bc.periodPlural}`}</strong> (${bc.discountedPaybackYears !== null ? `${bc.discountedPaybackYears.toFixed(1)} ${bc.periodPlural} discounted` : 'unrecovered'})</div>
            </div>
          </div>

          <div class="exec-memo-box">
            <h4>2. Monte Carlo &amp; Stress-Test Confidence</h4>
            <div style="font-size:0.82rem; line-height:1.6;">
              <div><strong>Probability of Positive NPV:</strong> <span style="font-weight:800; color:${mc.probPositiveNpv >= 0.7 ? '#16a34a' : '#dc2626'};">${fmtPct(mc.probPositiveNpv)}</span> (${mc.trials.toLocaleString()} trials)</div>
              <div><strong>P10 / P50 / P90 NPV:</strong> ${fm(mc.p10Npv)} / <strong>${fm(mc.p50Npv)}</strong> / ${fm(mc.p90Npv)}</div>
              <div><strong>Bear / Bull Scenario NPV:</strong> ${fm(scen.bearCase.npv)} / ${fm(scen.bullCase.npv)}</div>
              <div><strong>Top Sensitivity Driver:</strong> ${scen.drivers[0]?.name || 'Benefit Capture'} (Δ ${fm(scen.drivers[0]?.spread || 0)})</div>
            </div>
          </div>

          <div class="exec-memo-box">
            <h4>3. Build vs. Buy &amp; FTE Capacity</h4>
            <div style="font-size:0.82rem; line-height:1.6;">
              <div><strong>Recommended Path:</strong> <strong>${bvb.recommended.label}</strong> (NPV: ${fm(bvb.recommended.bc.npv)})</div>
              <div><strong>Option A (Build) vs. B (Buy) TCO:</strong> ${fm(bvb.optionA.tcoUndiscounted)} vs. ${fm(bvb.optionB.tcoUndiscounted)}</div>
              <div><strong>FTE Capacity Unlocked:</strong> <strong>${fte.fteEquivalentSaved.toFixed(1)} FTEs</strong> (${Math.round(fte.annualHoursSaved).toLocaleString()} hrs/yr saved)</div>
              <div><strong>Run-Rate EBITDA Uplift:</strong> +${fm(bridge.netEbitdaLift)} (+${bridge.marginExpansionBps.toFixed(0)} bps)</div>
            </div>
          </div>
        </div>

        <div class="wb-table-wrap">
          <table class="wb-table">
            <thead>
              <tr>
                <th>Executive Cash Flow Summary (${unitShort})</th>
                ${bc.schedule.map(s => `<th>${bc.periodShort} ${s.year}</th>`).join('')}
                <th>Total / KPI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Upfront Outlay &amp; Setup</td>
                ${bc.schedule.map(s => `<td>${s.capexAndFee < 0 ? `(${fm(Math.abs(s.capexAndFee))})` : '—'}</td>`).join('')}
                <td>(${fm(bc.grossInitialSpend)})</td>
              </tr>
              <tr>
                <td>Gross Benefits</td>
                ${bc.schedule.map(s => `<td>${s.year === 0 ? '—' : fm(s.grossBenefit)}</td>`).join('')}
                <td>${fm(bc.totalGrossBenefits)}</td>
              </tr>
              <tr>
                <td>Ongoing OpEx</td>
                ${bc.schedule.map(s => `<td>${s.year === 0 ? '—' : `(${fm(s.ongoingOpex)})`}</td>`).join('')}
                <td>(${fm(bc.totalOngoingOpex)})</td>
              </tr>
              <tr class="wb-row-total">
                <td>Net Free Cash Flow (FCF)</td>
                ${bc.schedule.map(s => `<td>${fm(s.fcf)}</td>`).join('')}
                <td>${fm(bc.totalNetCashInflows - bc.totalInitialOutlay)}</td>
              </tr>
              <tr class="wb-row-total">
                <td>Cumulative Discounted NPV</td>
                ${bc.schedule.map(s => `<td>${fm(s.cumDiscounted)}</td>`).join('')}
                <td>${fm(bc.npv)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PROMINENT 4-CARD CONSULTING TOOL LAUNCHER (ABOVE KPI TILES) -->
      <div class="consulting-tool-section-label">
        <span>🛠️ Select Consulting &amp; ROI Analysis Tool (4 Interactive Modules)</span>
        <span style="color:#64748b; font-weight:600; text-transform:none;">Click any tool card below to switch view</span>
      </div>
      <div class="consulting-tool-grid" role="tablist">
        <button type="button" class="consulting-tool-card ${activeTab === 'business-case' ? 'active' : ''}" data-tab="business-case">
          <div>
            <div class="consulting-tool-card__top">
              <span class="consulting-tool-card__step">📊 Tool 1 · Capital ROI</span>
              <span class="consulting-tool-card__status">${activeTab === 'business-case' ? '● ACTIVE' : 'Open →'}</span>
            </div>
            <div class="consulting-tool-card__title" style="margin-top:0.35rem;">Project Business Case (NPV, IRR, MIRR &amp; ROI)</div>
            <div class="consulting-tool-card__desc">Cash flows (${bc.horizonYears} ${bc.periodPlural}), Payback &amp; J-Curve trajectory.</div>
          </div>
          <div class="consulting-tool-card__metric">
            <span>NPV: <strong style="color:${bc.npv >= 0 ? '#16a34a' : '#dc2626'};">${fm(bc.npv)}</strong></span>
            <span>IRR: <strong>${fmtPct(bc.irr)}</strong></span>
          </div>
        </button>

        <button type="button" class="consulting-tool-card ${activeTab === 'ebitda-bridge' ? 'active' : ''}" data-tab="ebitda-bridge">
          <div>
            <div class="consulting-tool-card__top">
              <span class="consulting-tool-card__step">📈 Tool 2 · Waterfall</span>
              <span class="consulting-tool-card__status">${activeTab === 'ebitda-bridge' ? '● ACTIVE' : 'Open →'}</span>
            </div>
            <div class="consulting-tool-card__title" style="margin-top:0.35rem;">Operational EBITDA Bridge &amp; Value Levers</div>
            <div class="consulting-tool-card__desc">Decompose profit lift across Price, Volume, COGS &amp; SG&amp;A.</div>
          </div>
          <div class="consulting-tool-card__metric">
            <span>Lift: <strong style="color:#16a34a;">+${fm(bridge.netEbitdaLift)}</strong></span>
            <span>+${bridge.marginExpansionBps.toFixed(0)} bps</span>
          </div>
        </button>

        <button type="button" class="consulting-tool-card ${activeTab === 'pricing-unit' ? 'active' : ''}" data-tab="pricing-unit">
          <div>
            <div class="consulting-tool-card__top">
              <span class="consulting-tool-card__step">⚖️ Tool 3 · Unit Econ</span>
              <span class="consulting-tool-card__status">${activeTab === 'pricing-unit' ? '● ACTIVE' : 'Open →'}</span>
            </div>
            <div class="consulting-tool-card__title" style="margin-top:0.35rem;">Break-Even, Pricing Power &amp; LTV/CAC</div>
            <div class="consulting-tool-card__desc">CVP break-even, price elasticity matrix &amp; cohort LTV/CAC.</div>
          </div>
          <div class="consulting-tool-card__metric">
            <span>BE: <strong>${Math.ceil(unitEcon.breakEvenUnits).toLocaleString()} u</strong></span>
            <span>LTV/CAC: <strong style="color:${unitEcon.ltvToCac >= 3 ? '#16a34a' : '#dc2626'};">${unitEcon.ltvToCac.toFixed(1)}x</strong></span>
          </div>
        </button>

        <button type="button" class="consulting-tool-card ${activeTab === 'scenarios-fees' ? 'active' : ''}" data-tab="scenarios-fees">
          <div>
            <div class="consulting-tool-card__top">
              <span class="consulting-tool-card__step">🌪️ Tool 4 · Stress Test</span>
              <span class="consulting-tool-card__status">${activeTab === 'scenarios-fees' ? '● ACTIVE' : 'Open →'}</span>
            </div>
            <div class="consulting-tool-card__title" style="margin-top:0.35rem;">Tornado Sensitivity &amp; Vendor Fee Structurer</div>
            <div class="consulting-tool-card__desc">Bear/Base/Bull stress test, Tornado chart &amp; Gain-Share fees.</div>
          </div>
          <div class="consulting-tool-card__metric">
            <span>Bear: <strong>${fm(scen.bearCase.npv)}</strong></span>
            <span>Bull: <strong style="color:#16a34a;">${fm(scen.bullCase.npv)}</strong></span>
          </div>
        </button>
      </div>

      <!-- EXECUTIVE KPI SUMMARY STRIP -->
      <div class="wb-kpi-grid" style="margin-bottom: 1.25rem;">
        <div class="wb-kpi-card">
          <div class="wb-kpi-card__label">Project Net Present Value (NPV)</div>
          <div class="wb-kpi-card__val" style="color:${bc.npv >= 0 ? '#16a34a' : '#dc2626'};">${fm(bc.npv)}</div>
          <div class="wb-kpi-card__sub">${bc.verdict} (PI: ${bc.profitabilityIndex.toFixed(2)}x)</div>
        </div>
        <div class="wb-kpi-card">
          <div class="wb-kpi-card__label">Annualized IRR vs. MIRR</div>
          <div class="wb-kpi-card__val">${fmtPct(bc.irr)} <span style="font-size:0.85rem; color:#64748b;">/ ${fmtPct(bc.mirr)}</span></div>
          <div class="wb-kpi-card__sub">
            ${bc.periodsPerYear > 1
              ? `Periodic IRR: ${fmtPct(bc.periodicIrr)}/${bc.periodShort} · Hurdle: ${fmtPct(bc.hurdleRate)}/yr`
              : `Hurdle Rate: ${fmtPct(bc.hurdleRate)} (Spread: ${((bc.irr - bc.hurdleRate) * 100).toFixed(1)}%)`}
          </div>
        </div>
        <div class="wb-kpi-card">
          <div class="wb-kpi-card__label">Net Project ROI (${bc.horizonYears}-${bc.periodShort})</div>
          <div class="wb-kpi-card__val" style="color:${bc.simpleRoiPct >= 0 ? '#1d4ed8' : '#dc2626'};">${fmtPct(bc.simpleRoiPct)}</div>
          <div class="wb-kpi-card__sub">Annualized ROI: ${fmtPct(bc.annualizedRoiPct)} · Value Mult: ${bc.feeValueMultiple.toFixed(1)}x</div>
        </div>
        <div class="wb-kpi-card">
          <div class="wb-kpi-card__label">Payback Period (${bc.periodName}s)</div>
          <div class="wb-kpi-card__val">
            ${bc.simplePaybackYears !== null ? `${bc.simplePaybackYears.toFixed(1)} ${bc.periodPlural}` : `>${bc.horizonYears} ${bc.periodPlural}`}
          </div>
          <div class="wb-kpi-card__sub">
            Discounted Payback: ${bc.discountedPaybackYears !== null ? `${bc.discountedPaybackYears.toFixed(1)} ${bc.periodPlural}` : `>${bc.horizonYears} ${bc.periodPlural}`}
          </div>
        </div>
        <div class="wb-kpi-card">
          <div class="wb-kpi-card__label">Run-Rate EBITDA Uplift</div>
          <div class="wb-kpi-card__val" style="color:#16a34a;">+${fm(bridge.netEbitdaLift)}</div>
          <div class="wb-kpi-card__sub">+${bridge.marginExpansionBps.toFixed(0)} bps Margin · +${fm(bridge.impliedEvCreation)} Value</div>
        </div>
      </div>

      <!-- TAB 1: BUSINESS CASE BUILDER -->
      <div id="tab-business-case" class="wb-tab-pane" style="display:${activeTab === 'business-case' ? 'block' : 'none'};">
        <div class="wb-grid-2" style="margin-bottom: 1.25rem;">
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Project Investment &amp; Benefit Inputs (${unitLabel})</h3>
                <div class="wb-panel__subtitle">Model in Weeks, Months, or Years — switch Value Scale ($1, $100s, $K, $M) anytime</div>
              </div>
              ${conceptPill('npv', 'NPV & IRR')}
            </div>
            <div class="wb-panel__body">
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 0.85rem;">
                <div>
                  <label style="font-size:0.76rem; font-weight:700; color:#334155; display:block; margin-bottom:0.25rem;">
                    Upfront CapEx / Outlay (${unitShort}) ${exactBadge(bc.upfrontCapex)}
                  </label>
                  <input type="number" id="num-capex" class="analyze-input" style="width:100%; font-weight:700;" step="any" min="0" value="${bc.upfrontCapex}" />
                </div>
                <div>
                  <label style="font-size:0.76rem; font-weight:700; color:#334155; display:block; margin-bottom:0.25rem;">
                    Consulting / Setup Fee (${unitShort}) ${exactBadge(bc.consultingFee)}
                  </label>
                  <input type="number" id="num-fee" class="analyze-input" style="width:100%; font-weight:700;" step="any" min="0" value="${bc.consultingFee}" />
                </div>
                <div>
                  <label style="font-size:0.76rem; font-weight:700; color:#334155; display:block; margin-bottom:0.25rem;">
                    ${bc.periodName} 1 Gross Benefit (${unitShort}) ${exactBadge(bc.yr1Benefit)}
                  </label>
                  <input type="number" id="num-benefit" class="analyze-input" style="width:100%; font-weight:700;" step="any" min="0" value="${bc.yr1Benefit}" />
                </div>
                <div>
                  <label style="font-size:0.76rem; font-weight:700; color:#334155; display:block; margin-bottom:0.25rem;">
                    Benefit Growth / Ramp (% per ${bc.periodShort})
                  </label>
                  <input type="number" id="num-growth" class="analyze-input" style="width:100%; font-weight:700;" step="0.5" value="${(bc.benefitGrowth * 100).toFixed(1)}" />
                </div>
                <div>
                  <label style="font-size:0.76rem; font-weight:700; color:#334155; display:block; margin-bottom:0.25rem;">
                    Ongoing ${periodicLabel} OpEx (${unitShort}) ${exactBadge(bc.ongoingOpex)}
                  </label>
                  <input type="number" id="num-opex" class="analyze-input" style="width:100%; font-weight:700;" step="any" min="0" value="${bc.ongoingOpex}" />
                </div>
                <div>
                  <label style="font-size:0.76rem; font-weight:700; color:#334155; display:block; margin-bottom:0.25rem;">
                    Project Horizon (1–${maxHorizon} ${bc.periodName}s)
                  </label>
                  <div style="display:flex; gap:0.35rem; align-items:center;">
                    <input type="number" id="num-horizon" class="analyze-input" style="width:74px; font-weight:700;" step="1" min="1" max="${maxHorizon}" value="${bc.horizonYears}" />
                    <select id="sel-horizon-unit" class="analyze-input" style="flex:1; font-weight:700; cursor:pointer;">
                      <option value="years" ${bc.horizonUnit === 'years' ? 'selected' : ''}>Years</option>
                      <option value="months" ${bc.horizonUnit === 'months' ? 'selected' : ''}>Months</option>
                      <option value="weeks" ${bc.horizonUnit === 'weeks' ? 'selected' : ''}>Weeks</option>
                    </select>
                  </div>
                  <input type="range" id="sl-horizon" min="1" max="${maxHorizon}" step="1" value="${bc.horizonYears}" style="width:100%; margin-top:0.35rem;" />
                </div>
                <div>
                  <label style="font-size:0.76rem; font-weight:700; color:#334155; display:block; margin-bottom:0.25rem;">
                    Annual Hurdle / Discount Rate (%)
                  </label>
                  <input type="number" id="num-hurdle" class="analyze-input" style="width:100%; font-weight:700;" step="0.5" min="1" max="35" value="${(bc.hurdleRate * 100).toFixed(1)}" />
                </div>
                <div>
                  <label style="font-size:0.76rem; font-weight:700; color:#334155; display:block; margin-bottom:0.25rem;">
                    Tax Rate (% · Use 0% for Pre-Tax)
                  </label>
                  <input type="number" id="num-tax" class="analyze-input" style="width:100%; font-weight:700;" step="1" min="0" max="40" value="${(bc.taxRate * 100).toFixed(0)}" />
                </div>
              </div>

              <!-- Optional Custom Period-by-Period Benefits Override -->
              <div style="margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid #e2e8f0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.45rem;">
                  <span style="font-size:0.76rem; font-weight:800; text-transform:uppercase; color:#475569;">
                    Custom ${bc.periodName}-by-${bc.periodName} Gross Benefit Override (${unit})
                  </span>
                  ${state.customYearlyBenefits ? `
                    <button type="button" id="reset-custom-yrs-btn" class="btn btn--secondary btn--sm" style="font-size:0.7rem; padding:0.15rem 0.5rem;">
                      Reset to ${fmtPct(bc.benefitGrowth)}/${bc.periodShort} Growth Formula
                    </button>
                  ` : `<span style="font-size:0.72rem; color:#64748b;">Edit any ${bc.periodName.toLowerCase()} below to override the ${fmtPct(bc.benefitGrowth)}/${bc.periodShort} ramp</span>`}
                </div>
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(68px, 1fr)); gap: 0.45rem; max-height: 155px; overflow-y: auto;">
                  ${bc.schedule.filter(s => s.year > 0).map(s => `
                    <div>
                      <label style="font-size:0.68rem; font-weight:700; color:#64748b; display:block;">${bc.periodShort} ${s.year}</label>
                      <input type="number" class="analyze-input custom-yr-ben-input" data-yr="${s.year}"
                        style="width:100%; padding:0.3rem 0.4rem; font-size:0.8rem;"
                        step="any" value="${Number(s.grossBenefit.toFixed(2))}" />
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Cumulative Cash Flow &amp; NPV "J-Curve" (${unitLabel})</h3>
                <div class="wb-panel__subtitle">Green = Discounted Cumulative NPV · Gray = Undiscounted · Bars = ${periodicLabel} FCF</div>
              </div>
              ${conceptPill('capital-budgeting', 'J-Curve & Payback')}
            </div>
            <div class="wb-panel__body">
              <canvas id="consulting-jcurve-canvas" style="width:100%; height:290px; display:block;"></canvas>
            </div>
          </div>
        </div>

        <div class="wb-panel">
          <div class="wb-panel__header">
            <div>
              <h3 class="wb-panel__title">Multi-${bc.periodName} Project Cash Flow &amp; ROI Schedule (${state.projectName})</h3>
              <div class="wb-panel__subtitle">All figures in ${unitLabel} · Horizon: ${bc.horizonYears} ${bc.periodName}s · Annual Hurdle: ${fmtPct(bc.hurdleRate)} (${fmtPct(bc.periodicHurdleRate)}/${bc.periodShort}) · Tax: ${fmtPct(bc.taxRate)}</div>
            </div>
            ${conceptPill('irr', 'IRR vs. MIRR')}
          </div>
          <div class="wb-table-wrap">
            <table class="wb-table">
              <thead>
                <tr>
                  <th>Business Case Line Item</th>
                  <th>Concept</th>
                  ${bc.schedule.map(s => `<th>${bc.periodName} ${s.year}</th>`).join('')}
                  <th>Total / KPI</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Upfront Project Outlay + Setup Fee</td>
                  <td>${conceptPill('capital-budgeting', 'Outlay')}</td>
                  ${bc.schedule.map(s => `<td>${s.capexAndFee < 0 ? `(${fm(Math.abs(s.capexAndFee))})` : '—'}</td>`).join('')}
                  <td>(${fm(bc.grossInitialSpend)})</td>
                </tr>
                <tr>
                  <td>Gross Project Benefits (Savings + Revenue Uplift)</td>
                  <td>${conceptPill('fcf', 'Inflows')}</td>
                  ${bc.schedule.map(s => `<td>${s.year === 0 ? '—' : fm(s.grossBenefit)}</td>`).join('')}
                  <td>${fm(bc.totalGrossBenefits)}</td>
                </tr>
                <tr>
                  <td>Ongoing ${periodicLabel} OpEx &amp; Licensing</td>
                  <td>${conceptPill('reformulated-is', 'OpEx')}</td>
                  ${bc.schedule.map(s => `<td>${s.year === 0 ? '—' : `(${fm(s.ongoingOpex)})`}</td>`).join('')}
                  <td>(${fm(bc.totalOngoingOpex)})</td>
                </tr>
                ${bc.taxRate > 0 ? `
                <tr>
                  <td>Depreciation &amp; Fee Tax Shield (${fmtPct(bc.taxRate)})</td>
                  <td>${conceptPill('deferred-tax', 'Tax Shield')}</td>
                  ${bc.schedule.map(s => `<td>${fm(s.taxShield)}</td>`).join('')}
                  <td>${fm(bc.schedule.reduce((a, b) => a + b.taxShield, 0))}</td>
                </tr>
                ` : ''}
                <tr class="wb-row-total">
                  <td>Net Incremental Cash Flow (FCF)</td>
                  <td>${conceptPill('fcf', 'Project FCF')}</td>
                  ${bc.schedule.map(s => `<td>${fm(s.fcf)}</td>`).join('')}
                  <td>${fm(bc.totalNetCashInflows - bc.totalInitialOutlay)}</td>
                </tr>
                <tr>
                  <td>Present Value of FCF (Discounted @ ${fmtPct(bc.periodicHurdleRate)}/${bc.periodShort})</td>
                  <td>${conceptPill('npv', 'PV(FCF)')}</td>
                  ${bc.schedule.map(s => `<td>${fm(s.pvFcf)}</td>`).join('')}
                  <td>${fm(bc.npv)}</td>
                </tr>
                <tr>
                  <td>Cumulative Undiscounted Cash Flow</td>
                  <td>${conceptPill('capital-budgeting', 'Payback')}</td>
                  ${bc.schedule.map(s => `<td>${fm(s.cumUndiscounted)}</td>`).join('')}
                  <td>${bc.simplePaybackYears !== null ? `${bc.simplePaybackYears.toFixed(1)} ${bc.periodPlural}` : '—'}</td>
                </tr>
                <tr class="wb-row-total">
                  <td>Cumulative Discounted NPV (J-Curve)</td>
                  <td>${conceptPill('npv', 'Cum. NPV')}</td>
                  ${bc.schedule.map(s => `<td>${fm(s.cumDiscounted)}</td>`).join('')}
                  <td>${fm(bc.npv)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- NEW IN TOOL 1: BOTTOM-UP FTE LABOR ESTIMATOR & BUILD VS. BUY COMPARATOR -->
        <div class="wb-grid-2" style="margin-top: 1.25rem;">
          <!-- Bottom-Up FTE & Time-Savings Estimator -->
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Bottom-Up FTE Labor Cost &amp; Time-Savings Estimator</h3>
                <div class="wb-panel__subtitle">Estimate build outlay from team headcount &amp; hours, and benefits from employee hours saved</div>
              </div>
              <button type="button" class="btn btn--primary btn--sm" id="apply-fte-btn" title="Push calculated Upfront Outlay & Period 1 Benefit into Tool 1">
                ⚡ Push to Business Case
              </button>
            </div>
            <div class="wb-panel__body">
              <div style="font-size:0.74rem; font-weight:800; text-transform:uppercase; color:#1e3a8a; margin-bottom:0.45rem;">
                A. Project Build Team &amp; CapEx Outlay
              </div>
              <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:0.65rem; margin-bottom:0.85rem;">
                <div>
                  <label style="font-size:0.73rem; font-weight:700; color:#334155; display:block; margin-bottom:0.2rem;">Build Team Headcount (FTEs)</label>
                  <input type="number" id="num-fte-build" class="analyze-input" style="width:100%; font-weight:700;" step="0.5" min="0.5" value="${fte.buildFtes}" />
                </div>
                <div>
                  <label style="font-size:0.73rem; font-weight:700; color:#334155; display:block; margin-bottom:0.2rem;">Blended Build Rate ($/hr)</label>
                  <input type="number" id="num-fte-build-rate" class="analyze-input" style="width:100%; font-weight:700;" step="5" min="15" value="${fte.buildHourlyRate}" />
                </div>
                <div>
                  <label style="font-size:0.73rem; font-weight:700; color:#334155; display:block; margin-bottom:0.2rem;">Build Duration (Weeks @ ${fte.buildHoursPerWeek}h/wk)</label>
                  <input type="number" id="num-fte-build-wks" class="analyze-input" style="width:100%; font-weight:700;" step="1" min="1" value="${fte.buildWeeks}" />
                </div>
                <div>
                  <label style="font-size:0.73rem; font-weight:700; color:#334155; display:block; margin-bottom:0.2rem;">Hardware / Software CapEx (${unitShort})</label>
                  <input type="number" id="num-fte-hw-capex" class="analyze-input" style="width:100%; font-weight:700;" step="any" min="0" value="${fte.hardwareSoftwareCapex}" />
                </div>
              </div>

              <div style="font-size:0.74rem; font-weight:800; text-transform:uppercase; color:#15803d; margin-bottom:0.45rem;">
                B. Operational Time-Savings &amp; Legacy Cost Retirement
              </div>
              <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:0.65rem; margin-bottom:0.85rem;">
                <div>
                  <label style="font-size:0.73rem; font-weight:700; color:#334155; display:block; margin-bottom:0.2rem;">Impacted Employees (Headcount)</label>
                  <input type="number" id="num-fte-impacted" class="analyze-input" style="width:100%; font-weight:700;" step="1" min="1" value="${fte.impactedEmployees}" />
                </div>
                <div>
                  <label style="font-size:0.73rem; font-weight:700; color:#334155; display:block; margin-bottom:0.2rem;">Hours Saved / Employee / Week</label>
                  <input type="number" id="num-fte-hrs-saved" class="analyze-input" style="width:100%; font-weight:700;" step="0.5" min="0.25" value="${fte.hoursSavedPerWeek}" />
                </div>
                <div>
                  <label style="font-size:0.73rem; font-weight:700; color:#334155; display:block; margin-bottom:0.2rem;">Employee Hourly Cost ($/hr)</label>
                  <input type="number" id="num-fte-emp-rate" class="analyze-input" style="width:100%; font-weight:700;" step="5" min="15" value="${fte.employeeHourlyRate}" />
                </div>
                <div>
                  <label style="font-size:0.73rem; font-weight:700; color:#334155; display:block; margin-bottom:0.2rem;">Legacy Spend Retired / ${bc.periodShort} (${unitShort})</label>
                  <input type="number" id="num-fte-retired" class="analyze-input" style="width:100%; font-weight:700;" step="any" min="0" value="${fte.retiredSpendPerPeriod}" />
                </div>
              </div>

              <div style="padding:0.8rem; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; font-size:0.82rem; line-height:1.55;">
                <div><strong>Implied Build Outlay:</strong> $${Math.round(fte.buildLaborDollars).toLocaleString()} labor (${fte.totalBuildHours.toLocaleString()} hrs) + $${Math.round(fte.hardwareSoftwareDollars).toLocaleString()} tech = <strong style="color:#1e3a8a;">${fm(fte.impliedUpfrontCapex)}</strong></div>
                <div><strong>Capacity Unlocked:</strong> <strong>${fte.fteEquivalentSaved.toFixed(1)} FTEs</strong> (${Math.round(fte.annualHoursSaved).toLocaleString()} hrs/yr saved @ $${fte.employeeHourlyRate}/hr = $${Math.round(fte.annualLaborSavingsDollars).toLocaleString()}/yr)</div>
                <div><strong>Implied ${bc.periodName} 1 Gross Benefit:</strong> <strong style="color:#16a34a;">${fm(fte.impliedPeriod1Benefit)} / ${bc.periodShort}</strong> ($${Math.round(fte.totalPeriod1BenefitDollars).toLocaleString()})</div>
              </div>
            </div>
          </div>

          <!-- Build vs. Buy / Option A vs. Option B Comparator -->
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Build vs. Buy / Option A vs. Option B Comparator</h3>
                <div class="wb-panel__subtitle">Compare In-House Build (Option A) against SaaS Vendor Buy (Option B) &amp; Lean MVP (Option C)</div>
              </div>
              <button type="button" class="btn btn--secondary btn--sm" id="adopt-opt-b-btn" title="Copy Option B (Vendor Buy) numbers into Active Business Case">
                ⚡ Adopt Option B
              </button>
            </div>
            <div class="wb-panel__body">
              <div style="font-size:0.73rem; font-weight:800; text-transform:uppercase; color:#475569; margin-bottom:0.4rem;">
                Configure Option B (Vendor / SaaS Buy Alternative in ${unitShort})
              </div>
              <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:0.5rem; margin-bottom:0.75rem;">
                <div>
                  <label style="font-size:0.69rem; font-weight:700; color:#334155; display:block;">Upfront (${unitShort})</label>
                  <input type="number" id="num-buy-capex" class="analyze-input" style="width:100%; padding:0.3rem 0.4rem; font-weight:700;" step="any" min="0" value="${bvb.buyUpfrontCapex}" />
                </div>
                <div>
                  <label style="font-size:0.69rem; font-weight:700; color:#334155; display:block;">Setup Fee (${unitShort})</label>
                  <input type="number" id="num-buy-fee" class="analyze-input" style="width:100%; padding:0.3rem 0.4rem; font-weight:700;" step="any" min="0" value="${bvb.buyConsultingFee}" />
                </div>
                <div>
                  <label style="font-size:0.69rem; font-weight:700; color:#334155; display:block;">${bc.periodShort} 1 Benefit (${unitShort})</label>
                  <input type="number" id="num-buy-benefit" class="analyze-input" style="width:100%; padding:0.3rem 0.4rem; font-weight:700;" step="any" min="0" value="${bvb.buyYr1Benefit}" />
                </div>
                <div>
                  <label style="font-size:0.69rem; font-weight:700; color:#334155; display:block;">SaaS OpEx/${bc.periodShort}</label>
                  <input type="number" id="num-buy-opex" class="analyze-input" style="width:100%; padding:0.3rem 0.4rem; font-weight:700;" step="any" min="0" value="${bvb.buyOngoingOpex}" />
                </div>
              </div>

              <canvas id="consulting-bvb-canvas" style="width:100%; height:195px; display:block; margin-bottom:0.65rem;"></canvas>

              <div class="wb-table-wrap">
                <table class="wb-table" style="font-size:0.76rem;">
                  <thead>
                    <tr>
                      <th>Strategic Option</th>
                      <th>Upfront</th>
                      <th>${bc.horizonYears}-${bc.periodShort} TCO</th>
                      <th>NPV (${unitShort})</th>
                      <th>IRR</th>
                      <th>Payback</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${bvb.options.map(opt => `
                      <tr class="${opt.id === bvb.recommended.id ? 'wb-row-total' : ''}">
                        <td><strong>${opt.label}</strong> ${opt.id === bvb.recommended.id ? '🏆' : ''}</td>
                        <td>${fm(opt.bc.grossInitialSpend)}</td>
                        <td>${fm(opt.tcoUndiscounted)}</td>
                        <td>${fm(opt.bc.npv)}</td>
                        <td>${fmtPct(opt.bc.irr)}</td>
                        <td>${opt.bc.simplePaybackYears !== null ? `${opt.bc.simplePaybackYears.toFixed(1)} ${bc.periodPlural}` : `>${bc.horizonYears}`}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: EBITDA BRIDGE WATERFALL & VALUE DRIVER TREE -->
      <div id="tab-ebitda-bridge" class="wb-tab-pane" style="display:${activeTab === 'ebitda-bridge' ? 'block' : 'none'};">
        <div class="wb-grid-2" style="margin-bottom: 1.25rem;">
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Department / Business Unit Baseline &amp; Levers (${unitLabel})</h3>
                <div class="wb-panel__subtitle">Enter your business unit's baseline P&amp;L and target improvement levers</div>
              </div>
              ${conceptPill('dupont', 'Value Drivers')}
            </div>
            <div class="wb-panel__body">
              <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:0.65rem; margin-bottom:1rem;">
                <div>
                  <label style="font-size:0.74rem; font-weight:700; color:#334155; display:block; margin-bottom:0.2rem;">Baseline Revenue (${unitShort}) ${exactBadge(bridge.baseRev)}</label>
                  <input type="number" id="num-base-rev" class="analyze-input" style="width:100%; font-weight:700;" step="any" value="${bridge.baseRev}" />
                </div>
                <div>
                  <label style="font-size:0.74rem; font-weight:700; color:#334155; display:block; margin-bottom:0.2rem;">Baseline COGS (${unitShort}) ${exactBadge(bridge.baseCogs)}</label>
                  <input type="number" id="num-base-cogs" class="analyze-input" style="width:100%; font-weight:700;" step="any" value="${bridge.baseCogs}" />
                </div>
                <div>
                  <label style="font-size:0.74rem; font-weight:700; color:#334155; display:block; margin-bottom:0.2rem;">Baseline SG&amp;A (${unitShort}) ${exactBadge(bridge.baseSga)}</label>
                  <input type="number" id="num-base-sga" class="analyze-input" style="width:100%; font-weight:700;" step="any" value="${bridge.baseSga}" />
                </div>
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>1. Price Realization Uplift (% of Revenue)</label>
                  <span class="wb-slider-num-wrap">
                    <span class="wb-slider-val">+${fm(bridge.pricingEbitdaLift)}</span>
                    <input type="number" id="num-price-lift" class="wb-slider-num" step="0.25" min="0" max="50" value="${(bridge.priceUpliftPct * 100).toFixed(2)}" title="Enter Price Uplift %" />
                    <span style="font-size:0.75rem; font-weight:700; color:#64748b;">%</span>
                  </span>
                </div>
                <input type="range" id="sl-price-lift" min="0" max="0.10" step="0.0025" value="${bridge.priceUpliftPct}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>2. Volume / Throughput Expansion (% of Revenue)</label>
                  <span class="wb-slider-num-wrap">
                    <span class="wb-slider-val">+${fm(bridge.volumeEbitdaLift)}</span>
                    <input type="number" id="num-vol-lift" class="wb-slider-num" step="0.5" min="0" max="100" value="${(bridge.volumeGrowthPct * 100).toFixed(1)}" title="Enter Volume Expansion %" />
                    <span style="font-size:0.75rem; font-weight:700; color:#64748b;">%</span>
                  </span>
                </div>
                <input type="range" id="sl-vol-lift" min="0" max="0.15" step="0.005" value="${bridge.volumeGrowthPct}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>3. Procurement &amp; Direct COGS Savings (% of COGS)</label>
                  <span class="wb-slider-num-wrap">
                    <span class="wb-slider-val">+${fm(bridge.cogsEbitdaLift)}</span>
                    <input type="number" id="num-cogs-save" class="wb-slider-num" step="0.5" min="0" max="50" value="${(bridge.cogsSavingsPct * 100).toFixed(1)}" title="Enter COGS Savings %" />
                    <span style="font-size:0.75rem; font-weight:700; color:#64748b;">%</span>
                  </span>
                </div>
                <input type="range" id="sl-cogs-save" min="0" max="0.15" step="0.005" value="${bridge.cogsSavingsPct}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>4. SG&amp;A &amp; Labor Productivity (% of SG&amp;A)</label>
                  <span class="wb-slider-num-wrap">
                    <span class="wb-slider-val">+${fm(bridge.sgaEbitdaLift)}</span>
                    <input type="number" id="num-sga-save" class="wb-slider-num" step="0.5" min="0" max="60" value="${(bridge.sgaSavingsPct * 100).toFixed(1)}" title="Enter SG&A Savings %" />
                    <span style="font-size:0.75rem; font-weight:700; color:#64748b;">%</span>
                  </span>
                </div>
                <input type="range" id="sl-sga-save" min="0" max="0.25" step="0.005" value="${bridge.sgaSavingsPct}" />
              </div>
            </div>
          </div>

          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Executive EBITDA Waterfall Bridge (${unitLabel})</h3>
                <div class="wb-panel__subtitle">Baseline ${fm(bridge.baseEbitda)} &rarr; Target Run-Rate ${fm(bridge.targetEbitda)} (+${bridge.marginExpansionBps.toFixed(0)} bps)</div>
              </div>
              ${conceptPill('multiples', 'Value Creation')}
            </div>
            <div class="wb-panel__body">
              <canvas id="consulting-waterfall-canvas" style="width:100%; height:290px; display:block;"></canvas>
            </div>
          </div>
        </div>

        <div class="wb-panel">
          <div class="wb-panel__header">
            <div>
              <h3 class="wb-panel__title">Value Driver Tree &amp; Capitalized Value Summary (${unitLabel})</h3>
              <div class="wb-panel__subtitle">Shows how each operational lever contributes to run-rate EBITDA and enterprise value</div>
            </div>
          </div>
          <div class="wb-table-wrap">
            <table class="wb-table">
              <thead>
                <tr>
                  <th>Value Creation Lever</th>
                  <th>Baseline Metric</th>
                  <th>Target Lever</th>
                  <th>Run-Rate EBITDA Impact</th>
                  <th>Capitalized Value (${fmtMult(bridge.evMultiple)})</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Commercial Pricing Realization (100% Flow-Through)</td>
                  <td>${fm(bridge.baseRev)} Revenue</td>
                  <td>+${fmtPct(bridge.priceUpliftPct)} Price Realization</td>
                  <td>+${fm(bridge.pricingEbitdaLift)}</td>
                  <td>+${fm(bridge.pricingEbitdaLift * bridge.evMultiple)}</td>
                </tr>
                <tr>
                  <td>Volume &amp; Service Throughput Growth</td>
                  <td>${fm(bridge.baseRev)} Revenue</td>
                  <td>+${fmtPct(bridge.volumeGrowthPct)} Volume Growth</td>
                  <td>+${fm(bridge.volumeEbitdaLift)}</td>
                  <td>+${fm(bridge.volumeEbitdaLift * bridge.evMultiple)}</td>
                </tr>
                <tr>
                  <td>Vendor Procurement &amp; Direct Cost Savings</td>
                  <td>${fm(bridge.baseCogs)} Direct COGS</td>
                  <td>−${fmtPct(bridge.cogsSavingsPct)} Unit Cost Reduction</td>
                  <td>+${fm(bridge.cogsEbitdaLift)}</td>
                  <td>+${fm(bridge.cogsEbitdaLift * bridge.evMultiple)}</td>
                </tr>
                <tr>
                  <td>SG&amp;A Automation &amp; Labor Productivity</td>
                  <td>${fm(bridge.baseSga)} SG&amp;A / Labor</td>
                  <td>−${fmtPct(bridge.sgaSavingsPct)} Overhead Reduction</td>
                  <td>+${fm(bridge.sgaEbitdaLift)}</td>
                  <td>+${fm(bridge.sgaEbitdaLift * bridge.evMultiple)}</td>
                </tr>
                <tr>
                  <td>Ongoing Program &amp; Software Run-Rate OpEx</td>
                  <td>—</td>
                  <td>Recurring Support Cost</td>
                  <td>(${fm(bridge.runRateProgramOpex)})</td>
                  <td>(${fm(bridge.runRateProgramOpex * bridge.evMultiple)})</td>
                </tr>
                <tr class="wb-row-total">
                  <td>Net Pro-Forma Run-Rate Uplift</td>
                  <td>${fm(bridge.baseEbitda)} (${fmtPct(bridge.baseMargin)})</td>
                  <td>+${bridge.marginExpansionBps.toFixed(0)} bps Margin Lift</td>
                  <td>+${fm(bridge.netEbitdaLift)}</td>
                  <td>+${fm(bridge.impliedEvCreation)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 3: BREAK-EVEN, PRICING POWER & UNIT ECONOMICS -->
      <div id="tab-pricing-unit" class="wb-tab-pane" style="display:${activeTab === 'pricing-unit' ? 'block' : 'none'};">
        <div class="wb-grid-2" style="margin-bottom: 1.25rem;">
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Cost-Volume-Profit (CVP) &amp; Pricing Elasticity Break-Even</h3>
                <div class="wb-panel__subtitle">Use sliders or type exact figures in the boxes on the right</div>
              </div>
              ${conceptPill('operating-leverage', 'CVP & DOL')}
            </div>
            <div class="wb-panel__body">
              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Average Unit / Contract Price ($)</label>
                  <span class="wb-slider-num-wrap">
                    <span style="font-size:0.75rem; font-weight:700; color:#64748b;">$</span>
                    <input type="number" id="num-unit-price" class="wb-slider-num" step="any" min="1" value="${unitEcon.unitPrice}" />
                  </span>
                </div>
                <input type="range" id="sl-unit-price" min="20" max="2000" step="10" value="${unitEcon.unitPrice}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Variable Cost per Unit ($)</label>
                  <span class="wb-slider-num-wrap">
                    <span class="wb-slider-val">CM: $${unitEcon.unitContribution.toFixed(0)}/u (${fmtPct(unitEcon.contributionMarginPct)})</span>
                    <span style="font-size:0.75rem; font-weight:700; color:#64748b;">$</span>
                    <input type="number" id="num-unit-vc" class="wb-slider-num" step="any" min="0" value="${unitEcon.unitVarCost}" />
                  </span>
                </div>
                <input type="range" id="sl-unit-vc" min="5" max="${Math.max(15, unitEcon.unitPrice - 5)}" step="5" value="${unitEcon.unitVarCost}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Fixed Operating Costs ${exactBadge(unitEcon.fixedCosts)}</label>
                  <span class="wb-slider-num-wrap">
                    <input type="number" id="num-fixed-costs" class="wb-slider-num" step="any" min="1" value="${unitEcon.fixedCosts}" />
                    <select id="sel-fixed-unit" class="analyze-input" style="padding:0.2rem 0.35rem; font-size:0.75rem; font-weight:700; width:auto; cursor:pointer;" title="Switch Monetary Scale">
                      <option value="$" ${unit === '$' ? 'selected' : ''}>$ (Exact)</option>
                      <option value="H" ${unit === 'H' ? 'selected' : ''}>$100s</option>
                      <option value="K" ${unit === 'K' ? 'selected' : ''}>$K (1,000s)</option>
                      <option value="M" ${unit === 'M' ? 'selected' : ''}>$M (Millions)</option>
                    </select>
                  </span>
                </div>
                <input type="range" id="sl-fixed-costs" min="${stepFixedSlider}" max="${maxFixedSlider}" step="${stepFixedSlider}" value="${unitEcon.fixedCosts}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Proposed Price Increase (%)</label>
                  <span class="wb-slider-num-wrap">
                    <span class="wb-slider-val">&rarr; $${unitEcon.newUnitPrice.toFixed(2)}</span>
                    <input type="number" id="num-price-chg" class="wb-slider-num" step="0.5" min="-50" max="100" value="${(unitEcon.proposedPriceChangePct * 100).toFixed(1)}" />
                    <span style="font-size:0.75rem; font-weight:700; color:#64748b;">%</span>
                  </span>
                </div>
                <input type="range" id="sl-price-chg" min="0.01" max="0.20" step="0.005" value="${unitEcon.proposedPriceChangePct}" />
              </div>

              <div style="margin-top:0.9rem; padding:0.85rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; font-size:0.84rem; line-height:1.55;">
                <div><strong>Contribution Margin:</strong> $${unitEcon.unitContribution.toFixed(2)}/unit (${fmtPct(unitEcon.contributionMarginPct)}) · <strong>Operating Leverage (DOL):</strong> ${unitEcon.operatingLeverageDOL.toFixed(2)}x</div>
                <div style="margin-top:0.2rem; color:#0f172a;">
                  <strong>Break-Even Formula:</strong> $${Math.round(unitEcon.fixedCostsDollars).toLocaleString()} Fixed Costs &divide; $${unitEcon.unitContribution.toFixed(2)}/unit = <strong>${Math.ceil(unitEcon.breakEvenUnits).toLocaleString()} units</strong> (${fm(unitEcon.breakEvenRevenue)} Revenue)
                </div>
                <div style="margin-top:0.35rem; color:#1d4ed8; font-weight:700;">
                  💡 Indifference Threshold: With a +${fmtPct(unitEcon.proposedPriceChangePct)} price increase (new CM $${unitEcon.newUnitContribution.toFixed(2)}/u, new BE ${Math.ceil(unitEcon.newBreakEvenUnits).toLocaleString()} units), you can lose up to ${fmtPct(Math.abs(unitEcon.maxVolumeLossForPriceHike))} of volume and still remain profit-neutral.
                </div>
              </div>
            </div>
          </div>

          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Customer Unit Economics (LTV / CAC &amp; Payback)</h3>
                <div class="wb-panel__subtitle">Use sliders or type exact cohort figures in the boxes on the right</div>
              </div>
              ${conceptPill('capital-budgeting', 'Unit Economics')}
            </div>
            <div class="wb-panel__body">
              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Annual Revenue per Customer (ARPU / ACV)</label>
                  <span class="wb-slider-num-wrap">
                    <span style="font-size:0.75rem; font-weight:700; color:#64748b;">$</span>
                    <input type="number" id="num-arpu" class="wb-slider-num" style="width:96px !important;" step="500" min="100" value="${unitEcon.arpuAnnual}" />
                  </span>
                </div>
                <input type="range" id="sl-arpu" min="1000" max="100000" step="1000" value="${unitEcon.arpuAnnual}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Customer Acquisition Cost (CAC)</label>
                  <span class="wb-slider-num-wrap">
                    <span style="font-size:0.75rem; font-weight:700; color:#64748b;">$</span>
                    <input type="number" id="num-cac" class="wb-slider-num" style="width:96px !important;" step="500" min="100" value="${unitEcon.cac}" />
                  </span>
                </div>
                <input type="range" id="sl-cac" min="1000" max="100000" step="1000" value="${unitEcon.cac}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Annual Customer Churn Rate (%)</label>
                  <span class="wb-slider-num-wrap">
                    <span class="wb-slider-val">Life: ${unitEcon.avgCustomerLifetimeYears.toFixed(1)} yrs</span>
                    <input type="number" id="num-churn" class="wb-slider-num" step="0.5" min="1" max="80" value="${(unitEcon.annualChurnRate * 100).toFixed(1)}" />
                    <span style="font-size:0.75rem; font-weight:700; color:#64748b;">%</span>
                  </span>
                </div>
                <input type="range" id="sl-churn" min="0.02" max="0.35" step="0.01" value="${unitEcon.annualChurnRate}" />
              </div>

              <div style="margin-top:0.9rem; padding:0.85rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; font-size:0.84rem; line-height:1.5;">
                <div><strong>Discounted Customer LTV:</strong> $${Math.round(unitEcon.ltv).toLocaleString()} · <strong>Undiscounted LTV:</strong> $${Math.round(unitEcon.undiscountedLtv).toLocaleString()}</div>
                <div><strong>LTV / CAC Ratio:</strong> <span style="font-weight:800; color:${unitEcon.ltvToCac >= 3 ? '#16a34a' : '#dc2626'};">${unitEcon.ltvToCac.toFixed(2)}x</span> (Target Benchmark: &ge;3.0x)</div>
                <div><strong>CAC Payback Period:</strong> <span style="font-weight:700;">${unitEcon.cacPaybackMonths.toFixed(1)} months</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- NEW: Tool 3 Interactive Charts Row -->
        <div class="wb-grid-2" style="margin-bottom: 1.25rem;">
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">CVP Break-Even &amp; Price Elasticity Chart (${unitLabel})</h3>
                <div class="wb-panel__subtitle">Total Cost (Red) vs. Current Revenue (Blue) &amp; Proposed Price Revenue (Dashed Green)</div>
              </div>
            </div>
            <div class="wb-panel__body">
              <canvas id="consulting-cvp-canvas" style="width:100%; height:245px; display:block;"></canvas>
            </div>
          </div>

          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Customer Cohort Cumulative Cash Flow &amp; CAC Payback</h3>
                <div class="wb-panel__subtitle">60-month cumulative gross margin trajectory starting from −$${unitEcon.cac.toLocaleString()} CAC</div>
              </div>
            </div>
            <div class="wb-panel__body">
              <canvas id="consulting-ltv-canvas" style="width:100%; height:245px; display:block;"></canvas>
            </div>
          </div>
        </div>

        <div class="wb-panel">
          <div class="wb-panel__header">
            <div>
              <h3 class="wb-panel__title">Price vs. Volume Trade-Off Matrix (Incremental Profit Impact)</h3>
              <div class="wb-panel__subtitle">Net operating profit change across combinations of Price Change (columns) and Volume Change (rows)</div>
            </div>
          </div>
          <div class="wb-table-wrap">
            <table class="wb-table">
              <thead>
                <tr>
                  <th>Volume Δ \\ Price Δ</th>
                  ${unitEcon.priceSteps.map(p => `<th>${p >= 0 ? '+' : ''}${(p * 100).toFixed(1)}% Price</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${unitEcon.priceVolumeMatrix.map(row => `
                  <tr>
                    <td style="font-weight:700;">${row.volumeChg >= 0 ? '+' : ''}${(row.volumeChg * 100).toFixed(0)}% Volume</td>
                    ${row.cells.map(c => `<td>${fm(c.ebitdaDelta)}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 4: TORNADO SENSITIVITY & CONSULTING FEE STRUCTURER -->
      <div id="tab-scenarios-fees" class="wb-tab-pane" style="display:${activeTab === 'scenarios-fees' ? 'block' : 'none'};">
        <!-- Interactive Stress-Test & Fee Structuring Controls -->
        <div class="wb-panel" style="margin-bottom: 1.25rem;">
          <div class="wb-panel__header">
            <div>
              <h3 class="wb-panel__title">Interactive Stress-Test &amp; Vendor Fee Controls</h3>
              <div class="wb-panel__subtitle">Adjust downside/upside shock severity and vendor gain-share % to test your Tool 1 project assumptions</div>
            </div>
          </div>
          <div class="wb-panel__body">
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem;">
              <div class="wb-slider-group" style="margin-bottom:0;">
                <div class="wb-slider-Row">
                  <label>${bc.periodName} 1 Benefit Swing (±%)</label>
                  <span class="wb-slider-num-wrap">
                    <input type="number" id="num-ben-shock" class="wb-slider-num" step="1" min="5" max="80" value="${Math.round(scen.benefitShockPct * 100)}" />
                    <span style="font-size:0.75rem; font-weight:700; color:#64748b;">%</span>
                  </span>
                </div>
                <input type="range" id="sl-ben-shock" min="0.05" max="0.60" step="0.05" value="${scen.benefitShockPct}" />
              </div>

              <div class="wb-slider-group" style="margin-bottom:0;">
                <div class="wb-slider-Row">
                  <label>Upfront Cost Overrun Shock (±%)</label>
                  <span class="wb-slider-num-wrap">
                    <input type="number" id="num-capex-shock" class="wb-slider-num" step="1" min="5" max="80" value="${Math.round(scen.capexShockPct * 100)}" />
                    <span style="font-size:0.75rem; font-weight:700; color:#64748b;">%</span>
                  </span>
                </div>
                <input type="range" id="sl-capex-shock" min="0.05" max="0.60" step="0.05" value="${scen.capexShockPct}" />
              </div>

              <div class="wb-slider-group" style="margin-bottom:0;">
                <div class="wb-slider-Row">
                  <label>Hurdle Rate Shock (±bps)</label>
                  <span class="wb-slider-num-wrap">
                    <input type="number" id="num-hurdle-shock" class="wb-slider-num" step="25" min="25" max="600" value="${Math.round(scen.hurdleShockBps)}" />
                    <span style="font-size:0.75rem; font-weight:700; color:#64748b;">bps</span>
                  </span>
                </div>
                <input type="range" id="sl-hurdle-shock" min="50" max="500" step="25" value="${scen.hurdleShockBps}" />
              </div>

              <div class="wb-slider-group" style="margin-bottom:0;">
                <div class="wb-slider-Row">
                  <label>Gain-Share (% of ${bc.periodShort} 1 Savings)</label>
                  <span class="wb-slider-num-wrap">
                    <input type="number" id="num-gain-share" class="wb-slider-num" step="1" min="2" max="50" value="${Math.round(scen.gainSharePct * 100)}" />
                    <span style="font-size:0.75rem; font-weight:700; color:#64748b;">%</span>
                  </span>
                </div>
                <input type="range" id="sl-gain-share" min="0.05" max="0.40" step="0.01" value="${scen.gainSharePct}" />
              </div>
            </div>
          </div>
        </div>

        <div class="wb-grid-2" style="margin-bottom: 1.25rem;">
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">NPV Tornado Sensitivity Chart (${unitLabel})</h3>
                <div class="wb-panel__subtitle">Ranked impact of parameter swings around Base NPV (${fm(scen.baseCase.npv)})</div>
              </div>
              ${conceptPill('monte-carlo', 'Sensitivity')}
            </div>
            <div class="wb-panel__body">
              <canvas id="consulting-tornado-canvas" style="width:100%; height:260px; display:block;"></canvas>
            </div>
          </div>

          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">Bear / Base / Bull Project Scenario Matrix</h3>
                <div class="wb-panel__subtitle">Stress-testing implementation delays, cost overruns (+${Math.round(scen.capexShockPct * 100)}%), and benefit adoption (±${Math.round(scen.benefitShockPct * 100)}%)</div>
              </div>
            </div>
            <div class="wb-table-wrap">
              <table class="wb-table">
                <thead>
                  <tr>
                    <th>Scenario</th>
                    <th>Initial Outlay</th>
                    <th>NPV (${unit})</th>
                    <th>IRR</th>
                    <th>MIRR</th>
                    <th>Net ROI %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Bear Case (+${Math.round(scen.capexShockPct * 100)}% Cost / −${Math.round(scen.benefitShockPct * 100)}% Benefit)</strong></td>
                    <td>${fm(scen.bearCase.totalInitialOutlay)}</td>
                    <td>${fm(scen.bearCase.npv)}</td>
                    <td>${fmtPct(scen.bearCase.irr)}</td>
                    <td>${fmtPct(scen.bearCase.mirr)}</td>
                    <td>${fmtPct(scen.bearCase.simpleRoiPct)}</td>
                  </tr>
                  <tr class="wb-row-total">
                    <td><strong>Base Case (Project Plan)</strong></td>
                    <td>${fm(scen.baseCase.totalInitialOutlay)}</td>
                    <td>${fm(scen.baseCase.npv)}</td>
                    <td>${fmtPct(scen.baseCase.irr)}</td>
                    <td>${fmtPct(scen.baseCase.mirr)}</td>
                    <td>${fmtPct(scen.baseCase.simpleRoiPct)}</td>
                  </tr>
                  <tr>
                    <td><strong>Bull Case (+${Math.round(scen.benefitShockPct * 100)}% Benefit Capture)</strong></td>
                    <td>${fm(scen.bullCase.totalInitialOutlay)}</td>
                    <td>${fm(scen.bullCase.npv)}</td>
                    <td>${fmtPct(scen.bullCase.irr)}</td>
                    <td>${fmtPct(scen.bullCase.mirr)}</td>
                    <td>${fmtPct(scen.bullCase.simpleRoiPct)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="wb-panel" style="margin-bottom:20px;">
          <div class="wb-panel__header">
            <div>
              <h3 class="wb-panel__title">🎲 1,000-Trial Monte Carlo Project Risk Simulation (${unitLabel})</h3>
              <div class="wb-panel__subtitle">Simulates 1,000 random project paths varying CapEx (±${Math.round(scen.capexShockPct * 100)}%), Benefits (±${Math.round(scen.benefitShockPct * 100)}%), and Hurdle Rate (±${scen.hurdleShockBps} bps)</div>
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
              <span class="wb-badge" style="background:${mc.probPositiveNpv >= 0.75 ? 'rgba(52,211,153,0.16)' : 'rgba(248,113,113,0.16)'};color:${mc.probPositiveNpv >= 0.75 ? '#34d399' : '#f87171'};padding:6px 12px;border-radius:6px;font-weight:700;">
                Pr(NPV &gt; 0): ${(mc.probPositiveNpv * 100).toFixed(1)}%
              </span>
              <span style="font-size:0.78rem;color:var(--text-secondary);">P10 (Downside): <strong class="${mc.p10Npv < 0 ? 'num-neg' : 'num-pos'}">${fm(mc.p10Npv)}</strong></span>
              <span style="font-size:0.78rem;color:var(--text-secondary);">P50 (Median): <strong class="${mc.p50Npv < 0 ? 'num-neg' : 'num-pos'}">${fm(mc.p50Npv)}</strong></span>
              <span style="font-size:0.78rem;color:var(--text-secondary);">P90 (Upside): <strong class="${mc.p90Npv < 0 ? 'num-neg' : 'num-pos'}">${fm(mc.p90Npv)}</strong></span>
            </div>
          </div>
          <div class="wb-canvas-wrap">
            <canvas id="consulting-mc-canvas" class="wb-canvas" style="height:260px;"></canvas>
          </div>
        </div>

        <div class="wb-panel">
          <div class="wb-panel__header">
            <div>
              <h3 class="wb-panel__title">Vendor / Consulting Fee &amp; Value-Share Structurer (${unitLabel})</h3>
              <div class="wb-panel__subtitle">Compare Fixed-Fee, Time &amp; Materials, and Value-Based Gain-Share contract models</div>
            </div>
          </div>
          <div class="wb-table-wrap">
            <table class="wb-table">
              <thead>
                <tr>
                  <th>Contract Fee Model</th>
                  <th>Commercial Structure</th>
                  <th>Total Fee (${unit})</th>
                  <th>Net Project NPV</th>
                  <th>Net Project ROI</th>
                  <th>Value / Fee Multiple</th>
                  <th>Risk Alignment</th>
                </tr>
              </thead>
              <tbody>
                ${scen.feeModels.map(m => `
                  <tr>
                    <td><strong>${m.model}</strong></td>
                    <td>${m.structure}</td>
                    <td>${fm(m.totalFee)}</td>
                    <td>${fm(m.clientNetNpv)}</td>
                    <td>${fmtPct(m.clientRoiPct)}</td>
                    <td>${m.feeMultiple.toFixed(1)}x</td>
                    <td>${m.riskSharing}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Highlight negative numbers & parenthesized outflows in red
    highlightNegativeTableCells(root);

    // Draw Canvas charts for visible tab
    requestAnimationFrame(() => {
      if (activeTab === 'business-case') {
        drawJCurveChart(root.querySelector('#consulting-jcurve-canvas'), bc, unit);
        drawBuildVsBuyChart(root.querySelector('#consulting-bvb-canvas'), bvb, unit);
      } else if (activeTab === 'ebitda-bridge') {
        drawWaterfallChart(root.querySelector('#consulting-waterfall-canvas'), bridge, unit);
      } else if (activeTab === 'pricing-unit') {
        drawCvpBreakEvenChart(root.querySelector('#consulting-cvp-canvas'), unitEcon, unit);
        drawLtvCacCurveChart(root.querySelector('#consulting-ltv-canvas'), unitEcon);
      } else if (activeTab === 'scenarios-fees') {
        drawTornadoChart(root.querySelector('#consulting-tornado-canvas'), scen, unit);
        drawMonteCarloChart(root.querySelector('#consulting-mc-canvas'), mc, unit);
      }
    });

    // Wire Executive Business Case Memo Toggle & Print
    const toggleMemoBtn = root.querySelector('#toggle-exec-memo-btn');
    if (toggleMemoBtn) {
      toggleMemoBtn.addEventListener('click', () => {
        state.showExecMemo = !state.showExecMemo;
        updateView();
      });
    }
    const closeMemoBtn = root.querySelector('#close-exec-memo-btn');
    if (closeMemoBtn) {
      closeMemoBtn.addEventListener('click', () => {
        state.showExecMemo = false;
        updateView();
      });
    }
    const printMemoBtn = root.querySelector('#print-exec-memo-btn');
    if (printMemoBtn) {
      printMemoBtn.addEventListener('click', () => {
        if (typeof window !== 'undefined' && typeof window.print === 'function') {
          window.print();
        }
      });
    }

    // Wire Bottom-Up FTE Estimator Push Button
    const applyFteBtn = root.querySelector('#apply-fte-btn');
    if (applyFteBtn) {
      applyFteBtn.addEventListener('click', () => {
        state.upfrontCapex = Math.round(fte.impliedUpfrontCapex * 100) / 100;
        state.yr1Benefit = Math.round(fte.impliedPeriod1Benefit * 100) / 100;
        state.customYearlyBenefits = null;
        updateView();
      });
    }

    // Wire Adopt Option B Button
    const adoptOptBBtn = root.querySelector('#adopt-opt-b-btn');
    if (adoptOptBBtn) {
      adoptOptBBtn.addEventListener('click', () => {
        state.upfrontCapex = state.buyUpfrontCapex;
        state.consultingFee = state.buyConsultingFee;
        state.yr1Benefit = state.buyYr1Benefit;
        state.ongoingOpex = state.buyOngoingOpex;
        state.customYearlyBenefits = null;
        updateView();
      });
    }

    // Wire Project Identity & Unit Controls
    const nameInput = root.querySelector('#proj-name-input');
    if (nameInput) {
      nameInput.addEventListener('change', () => {
        state.projectName = nameInput.value.trim() || 'Custom Work Project';
        updateView();
      });
    }
    const deptInput = root.querySelector('#proj-dept-input');
    if (deptInput) {
      deptInput.addEventListener('change', () => {
        state.department = deptInput.value.trim() || 'Internal';
        updateView();
      });
    }
    root.querySelectorAll('#proj-unit-select, #sel-fixed-unit').forEach(sel => {
      sel.addEventListener('change', () => {
        switchUnitScale(sel.value);
        updateView();
      });
    });

    // Wire Horizon Unit Selectors (Top Bar & Tool 1 Control)
    root.querySelectorAll('#top-horizon-unit-select, #sel-horizon-unit').forEach(sel => {
      sel.addEventListener('change', () => {
        switchHorizonUnit(sel.value);
        updateView();
      });
    });

    // Wire Save / Load / Export CSV / Export JSON
    const saveBtn = root.querySelector('#save-proj-btn');
    const statusEl = root.querySelector('#proj-save-status');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        saveProjectToStorage(state);
        updateView();
        const msgEl = root.querySelector('#proj-save-status');
        if (msgEl) {
          msgEl.textContent = `✓ Saved "${state.projectName}" to browser workspace.`;
          msgEl.style.display = 'block';
        }
      });
    }

    const loadSelect = root.querySelector('#load-saved-proj-select');
    if (loadSelect) {
      loadSelect.addEventListener('change', () => {
        const idx = parseInt(loadSelect.value, 10);
        const list = getSavedProjects();
        if (!Number.isNaN(idx) && list[idx]) {
          Object.assign(state, list[idx]);
          updateView();
        }
      });
    }

    const exportCsvBtn = root.querySelector('#export-csv-btn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const headers = ['Line Item', ...bc.schedule.map(s => `${bc.periodName} ${s.year}`), 'Total / KPI'];
        const rows = [
          ['Project Name', state.projectName],
          ['Department', state.department],
          ['Unit Scale', unitLabel, 'Horizon Unit', bc.horizonUnit],
          ['NPV', bc.npv.toFixed(2), 'Annualized IRR', (bc.irr * 100).toFixed(2) + '%', 'Annualized MIRR', (bc.mirr * 100).toFixed(2) + '%', 'ROI', (bc.simpleRoiPct * 100).toFixed(2) + '%'],
          [],
          headers,
          ['Upfront Outlay & Fee', ...bc.schedule.map(s => s.capexAndFee.toFixed(2)), (-bc.grossInitialSpend).toFixed(2)],
          ['Gross Benefits', ...bc.schedule.map(s => s.grossBenefit.toFixed(2)), bc.totalGrossBenefits.toFixed(2)],
          ['Ongoing OpEx', ...bc.schedule.map(s => (-s.ongoingOpex).toFixed(2)), (-bc.totalOngoingOpex).toFixed(2)],
          ['Net Cash Flow (FCF)', ...bc.schedule.map(s => s.fcf.toFixed(2)), (bc.totalNetCashInflows - bc.totalInitialOutlay).toFixed(2)],
          ['Present Value of FCF', ...bc.schedule.map(s => s.pvFcf.toFixed(2)), bc.npv.toFixed(2)],
          ['Cumulative Undiscounted CF', ...bc.schedule.map(s => s.cumUndiscounted.toFixed(2)), bc.simplePaybackYears !== null ? `${bc.simplePaybackYears.toFixed(2)} ${bc.periodPlural}` : ''],
          ['Cumulative Discounted NPV', ...bc.schedule.map(s => s.cumDiscounted.toFixed(2)), bc.npv.toFixed(2)]
        ];
        const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${state.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-business-case.csv`;
        a.click();
      });
    }

    const exportJsonBtn = root.querySelector('#export-json-btn');
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify({ project: state, results: bc }, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${state.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-project.json`;
        a.click();
      });
    }

    // Wire Preset Template Buttons
    root.querySelectorAll('[data-tpl-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        applyTemplate(btn.dataset.tplId);
        updateView();
      });
    });

    // Wire Tool Card & Tab Switching
    root.querySelectorAll('.consulting-tool-card, .wb-tab').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        activeTab = tabBtn.dataset.tab;
        updateView();
      });
    });

    // Wire Direct Numeric Inputs
    const bindNum = (id, key, isPct = false) => {
      const el = root.querySelector(id);
      if (!el) return;
      el.addEventListener('change', () => {
        const v = parseFloat(el.value);
        if (!Number.isNaN(v)) {
          state[key] = isPct ? v / 100 : v;
          if (key === 'yr1Benefit' || key === 'benefitGrowth' || key === 'horizonYears') {
            state.customYearlyBenefits = null;
          }
          updateView();
        }
      });
    };

    bindNum('#num-capex', 'upfrontCapex');
    bindNum('#num-fee', 'consultingFee');
    bindNum('#num-benefit', 'yr1Benefit');
    bindNum('#num-growth', 'benefitGrowth', true);
    bindNum('#num-opex', 'ongoingOpex');
    bindNum('#num-horizon', 'horizonYears');
    bindNum('#num-hurdle', 'hurdleRate', true);
    bindNum('#num-tax', 'taxRate', true);
    bindNum('#num-fte-build', 'buildFtes');
    bindNum('#num-fte-build-rate', 'buildHourlyRate');
    bindNum('#num-fte-build-wks', 'buildWeeks');
    bindNum('#num-fte-hw-capex', 'hardwareSoftwareCapex');
    bindNum('#num-fte-impacted', 'impactedEmployees');
    bindNum('#num-fte-hrs-saved', 'hoursSavedPerWeek');
    bindNum('#num-fte-emp-rate', 'employeeHourlyRate');
    bindNum('#num-fte-retired', 'retiredSpendPerPeriod');
    bindNum('#num-buy-capex', 'buyUpfrontCapex');
    bindNum('#num-buy-fee', 'buyConsultingFee');
    bindNum('#num-buy-benefit', 'buyYr1Benefit');
    bindNum('#num-buy-opex', 'buyOngoingOpex');
    bindNum('#num-base-rev', 'baseRev');
    bindNum('#num-base-cogs', 'baseCogs');
    bindNum('#num-base-sga', 'baseSga');
    bindNum('#num-price-lift', 'priceUpliftPct', true);
    bindNum('#num-vol-lift', 'volumeGrowthPct', true);
    bindNum('#num-cogs-save', 'cogsSavingsPct', true);
    bindNum('#num-sga-save', 'sgaSavingsPct', true);
    bindNum('#num-unit-price', 'unitPrice');
    bindNum('#num-unit-vc', 'unitVarCost');
    bindNum('#num-fixed-costs', 'fixedCosts');
    bindNum('#num-price-chg', 'proposedPriceChangePct', true);
    bindNum('#num-arpu', 'arpuAnnual');
    bindNum('#num-cac', 'cac');
    bindNum('#num-churn', 'annualChurnRate', true);
    bindNum('#num-ben-shock', 'benefitShockPct', true);
    bindNum('#num-capex-shock', 'capexShockPct', true);
    bindNum('#num-hurdle-shock', 'hurdleShockBps');
    bindNum('#num-gain-share', 'gainSharePct', true);

    // Wire Custom Year-by-Year Benefit Inputs
    root.querySelectorAll('.custom-yr-ben-input').forEach(inp => {
      inp.addEventListener('change', () => {
        const currentArr = bc.schedule.filter(s => s.year > 0).map(s => s.grossBenefit);
        const yrIdx = parseInt(inp.dataset.yr, 10) - 1;
        const val = parseFloat(inp.value);
        if (!Number.isNaN(val) && yrIdx >= 0 && yrIdx < currentArr.length) {
          currentArr[yrIdx] = val;
          state.customYearlyBenefits = currentArr;
          updateView();
        }
      });
    });

    const resetYrsBtn = root.querySelector('#reset-custom-yrs-btn');
    if (resetYrsBtn) {
      resetYrsBtn.addEventListener('click', () => {
        state.customYearlyBenefits = null;
        updateView();
      });
    }

    // Wire Sliders for Tabs 1, 2, 3 & 4
    const bindSlider = (id, key) => {
      const el = root.querySelector(id);
      if (!el) return;
      el.addEventListener('change', () => {
        state[key] = parseFloat(el.value);
        if (key === 'horizonYears') {
          state.customYearlyBenefits = null;
        }
        updateView();
      });
    };

    bindSlider('#sl-horizon', 'horizonYears');
    bindSlider('#sl-price-lift', 'priceUpliftPct');
    bindSlider('#sl-vol-lift', 'volumeGrowthPct');
    bindSlider('#sl-cogs-save', 'cogsSavingsPct');
    bindSlider('#sl-sga-save', 'sgaSavingsPct');
    bindSlider('#sl-unit-price', 'unitPrice');
    bindSlider('#sl-unit-vc', 'unitVarCost');
    bindSlider('#sl-fixed-costs', 'fixedCosts');
    bindSlider('#sl-price-chg', 'proposedPriceChangePct');
    bindSlider('#sl-arpu', 'arpuAnnual');
    bindSlider('#sl-cac', 'cac');
    bindSlider('#sl-churn', 'annualChurnRate');
    bindSlider('#sl-ben-shock', 'benefitShockPct');
    bindSlider('#sl-capex-shock', 'capexShockPct');
    bindSlider('#sl-hurdle-shock', 'hurdleShockBps');
    bindSlider('#sl-gain-share', 'gainSharePct');
  };

  updateView();
}

// Auto-mount standalone Project ROI & Consulting Studio (No 10-K Company Banner)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('wb-consulting-root');
    if (root) {
      renderConsultingWorkbench(root);
    }
  });
}
