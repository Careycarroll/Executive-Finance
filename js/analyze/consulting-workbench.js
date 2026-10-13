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
 * Format currency dynamically according to project unit ('$' | 'K' | 'M')
 */
export function fmtProjectMoney(val, unit = 'K') {
  if (val === null || val === undefined || Number.isNaN(val)) return '—';
  const sign = val < 0 ? '-' : '';
  const abs = Math.abs(val);
  if (unit === '$') {
    return `${sign}$${Math.round(abs).toLocaleString()}`;
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

  const unitPrice = Math.max(1, Number(merged.unitPrice ?? 250));
  const unitVarCost = Math.max(0, Number(merged.unitVarCost ?? 100));
  const fixedCosts = Math.max(1, Number(merged.fixedCosts ?? 450));
  const currentUnits = Math.max(1, Number(merged.currentUnits ?? Math.round((fixedCosts * 1.5) / Math.max(1, unitPrice - unitVarCost))));
  const proposedPriceChangePct = Number(merged.proposedPriceChangePct ?? 0.05);

  const unitContribution = Math.max(0.01, unitPrice - unitVarCost);
  const contributionMarginPct = unitPrice > 0 ? unitContribution / unitPrice : 0;
  const breakEvenUnits = unitContribution > 0 ? fixedCosts / unitContribution : 0;
  const breakEvenRevenue = contributionMarginPct > 0 ? fixedCosts / contributionMarginPct : 0;

  const currentRevenue = currentUnits * unitPrice;
  const currentTotalContribution = currentUnits * unitContribution;
  const currentEbitda = currentTotalContribution - fixedCosts;
  const safetyMarginPct = currentRevenue > 0 ? (currentRevenue - breakEvenRevenue) / currentRevenue : 0;
  const operatingLeverageDOL = currentEbitda > 0 ? currentTotalContribution / currentEbitda : 1;

  const denom = contributionMarginPct + proposedPriceChangePct;
  const maxVolumeLossForPriceHike = denom > 0 ? -proposedPriceChangePct / denom : 0;
  const newUnitPrice = unitPrice * (1 + proposedPriceChangePct);
  const newUnitContribution = newUnitPrice - unitVarCost;

  const priceSteps = [-0.05, -0.025, 0, 0.025, 0.05, 0.075, 0.10];
  const volumeSteps = [-0.15, -0.10, -0.05, 0, 0.05, 0.10];
  const priceVolumeMatrix = volumeSteps.map(vChg => ({
    volumeChg: vChg,
    cells: priceSteps.map(pChg => {
      const pNew = unitPrice * (1 + pChg);
      const qNew = currentUnits * (1 + vChg);
      const ebitdaNew = qNew * (pNew - unitVarCost) - fixedCosts;
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
    unitPrice,
    unitVarCost,
    fixedCosts,
    currentUnits,
    proposedPriceChangePct,
    unitContribution,
    contributionMarginPct,
    breakEvenUnits,
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
  const baseCase = computeConsultingBusinessCase(projectOrCompany, overrides);

  const bearCase = computeConsultingBusinessCase(projectOrCompany, {
    ...overrides,
    upfrontCapex: baseCase.upfrontCapex * 1.25,
    yr1Benefit: baseCase.yr1Benefit * 0.70,
    benefitGrowth: Math.max(0, baseCase.benefitGrowth - 0.06),
    ongoingOpex: baseCase.ongoingOpex * 1.20,
    hurdleRate: baseCase.hurdleRate + 0.015
  });

  const bullCase = computeConsultingBusinessCase(projectOrCompany, {
    ...overrides,
    upfrontCapex: baseCase.upfrontCapex * 0.90,
    yr1Benefit: baseCase.yr1Benefit * 1.25,
    benefitGrowth: baseCase.benefitGrowth + 0.05,
    ongoingOpex: baseCase.ongoingOpex * 0.90,
    hurdleRate: Math.max(0.04, baseCase.hurdleRate - 0.01)
  });

  const drivers = [
    {
      name: 'Annual Benefit Capture (±25%)',
      lowCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, yr1Benefit: baseCase.yr1Benefit * 0.75 }).npv,
      highCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, yr1Benefit: baseCase.yr1Benefit * 1.25 }).npv
    },
    {
      name: 'Upfront Project Outlay (±25%)',
      lowCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, upfrontCapex: baseCase.upfrontCapex * 1.25 }).npv,
      highCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, upfrontCapex: baseCase.upfrontCapex * 0.75 }).npv
    },
    {
      name: 'Benefit Ramp Rate (±6% / yr)',
      lowCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, benefitGrowth: Math.max(0, baseCase.benefitGrowth - 0.06) }).npv,
      highCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, benefitGrowth: baseCase.benefitGrowth + 0.06 }).npv
    },
    {
      name: 'Hurdle / Discount Rate (±250 bps)',
      lowCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, hurdleRate: baseCase.hurdleRate + 0.025 }).npv,
      highCase: computeConsultingBusinessCase(projectOrCompany, { ...overrides, hurdleRate: Math.max(0.03, baseCase.hurdleRate - 0.025) }).npv
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
      riskSharing: 'Low (Client bears adoption risk)'
    },
    {
      model: 'Time & Materials (FTE Burn)',
      structure: 'Weekly Contractor/Consultant Rate Card (+15% scope buffer)',
      totalFee: baseFee * 1.15,
      clientNetNpv: baseCase.npv - (baseFee * 0.15 * (1 - baseCase.taxRate)),
      clientRoiPct: (baseCase.totalNetCashInflows - (baseCase.totalInitialOutlay + baseFee * 0.15 * (1 - baseCase.taxRate))) /
        (baseCase.totalInitialOutlay + baseFee * 0.15 * (1 - baseCase.taxRate)),
      feeMultiple: baseCase.pvInflows / (baseFee * 1.15),
      riskSharing: 'Low (Client bears schedule & overrun risk)'
    },
    {
      model: 'Value-Share / Gain-Share Hybrid',
      structure: '50% Base Retainer + 15% of Verified Year-1 Savings',
      totalFee: baseFee * 0.50 + yr1NetBenefit * 0.15,
      clientNetNpv: baseCase.npv - ((baseFee * 0.50 + yr1NetBenefit * 0.15 - baseFee) * (1 - baseCase.taxRate)),
      clientRoiPct: (baseCase.totalNetCashInflows - (baseCase.upfrontCapex + (baseFee * 0.50 + yr1NetBenefit * 0.15) * (1 - baseCase.taxRate))) /
        Math.max(1, baseCase.upfrontCapex + (baseFee * 0.50 + yr1NetBenefit * 0.15) * (1 - baseCase.taxRate)),
      feeMultiple: baseCase.pvInflows / Math.max(0.1, baseFee * 0.50 + yr1NetBenefit * 0.15),
      riskSharing: 'High (Vendor fee tied to realized savings)'
    }
  ];

  return {
    baseCase,
    bearCase,
    bullCase,
    drivers,
    feeModels
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
    unit: defTpl.unit, // '$' | 'K' | 'M'
    horizonUnit: 'years', // 'weeks' | 'months' | 'years'
    upfrontCapex: defTpl.upfrontCapex,
    consultingFee: defTpl.consultingFee,
    yr1Benefit: defTpl.yr1Benefit,
    benefitGrowth: defTpl.benefitGrowth,
    ongoingOpex: defTpl.ongoingOpex,
    horizonYears: defTpl.horizonYears,
    hurdleRate: defTpl.hurdleRate,
    taxRate: defTpl.taxRate,
    customYearlyBenefits: null,
    baseRev: defTpl.baseRev,
    baseCogs: defTpl.baseCogs,
    baseSga: defTpl.baseSga,
    priceUpliftPct: defTpl.priceUpliftPct,
    volumeGrowthPct: defTpl.volumeGrowthPct,
    cogsSavingsPct: defTpl.cogsSavingsPct,
    sgaSavingsPct: defTpl.sgaSavingsPct,
    evMultiple: defTpl.evMultiple,
    unitPrice: 250,
    unitVarCost: 100,
    fixedCosts: 450,
    proposedPriceChangePct: 0.05,
    arpuAnnual: 24000,
    annualChurnRate: 0.10,
    cac: 32000
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

  const updateView = () => {
    const unit = state.unit || 'K';
    const unitLabel = unit === '$' ? '$' : unit === 'K' ? '$K (Thousands)' : '$M (Millions)';
    const fm = (v) => fmtProjectMoney(v, unit);

    const bc = computeConsultingBusinessCase(state);
    const bridge = computeEbitdaBridge(state);
    const unitEcon = computePricingAndUnitEconomics(state);
    const scen = computeConsultingScenarios(state);
    const savedList = getSavedProjects();

    const maxHorizon = bc.horizonUnit === 'weeks' ? 52 : bc.horizonUnit === 'months' ? 36 : 15;
    const periodicLabel = bc.horizonUnit === 'weeks' ? 'Weekly' : bc.horizonUnit === 'months' ? 'Monthly' : 'Annual';

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
            <select id="proj-unit-select" class="analyze-input" style="width:160px; font-weight:700; cursor:pointer;">
              <option value="K" ${unit === 'K' ? 'selected' : ''}>Unit: $K (Thousands)</option>
              <option value="M" ${unit === 'M' ? 'selected' : ''}>Unit: $M (Millions)</option>
              <option value="$" ${unit === '$' ? 'selected' : ''}>Unit: $ (Exact Dollars)</option>
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
            <button type="button" class="btn btn--secondary btn--sm" id="save-proj-btn">💾 Save Project</button>
            <button type="button" class="btn btn--secondary btn--sm" id="export-csv-btn">📊 Export Excel (CSV)</button>
            <button type="button" class="btn btn--secondary btn--sm" id="export-json-btn">⬇ Export JSON</button>
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
            <span>CM: <strong>${fmtPct(unitEcon.contributionMarginPct)}</strong></span>
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
                <div class="wb-panel__subtitle">Model in Weeks, Months, or Years — type exact numbers or adjust the horizon slider</div>
              </div>
              ${conceptPill('npv', 'NPV & IRR')}
            </div>
            <div class="wb-panel__body">
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 0.85rem;">
                <div>
                  <label style="font-size:0.76rem; font-weight:700; color:#334155; display:block; margin-bottom:0.25rem;">
                    Upfront CapEx / Build Outlay (${unit})
                  </label>
                  <input type="number" id="num-capex" class="analyze-input" style="width:100%; font-weight:700;" step="any" min="0" value="${bc.upfrontCapex}" />
                </div>
                <div>
                  <label style="font-size:0.76rem; font-weight:700; color:#334155; display:block; margin-bottom:0.25rem;">
                    Consulting / Setup Fee (${unit})
                  </label>
                  <input type="number" id="num-fee" class="analyze-input" style="width:100%; font-weight:700;" step="any" min="0" value="${bc.consultingFee}" />
                </div>
                <div>
                  <label style="font-size:0.76rem; font-weight:700; color:#334155; display:block; margin-bottom:0.25rem;">
                    ${bc.periodName} 1 Gross Savings / Benefit (${unit})
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
                    Ongoing ${periodicLabel} OpEx / License (${unit})
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
                  <label style="font-size:0.74rem; font-weight:700; color:#334155; display:block; margin-bottom:0.2rem;">Baseline Revenue (${unit})</label>
                  <input type="number" id="num-base-rev" class="analyze-input" style="width:100%; font-weight:700;" step="any" value="${bridge.baseRev}" />
                </div>
                <div>
                  <label style="font-size:0.74rem; font-weight:700; color:#334155; display:block; margin-bottom:0.2rem;">Baseline COGS (${unit})</label>
                  <input type="number" id="num-base-cogs" class="analyze-input" style="width:100%; font-weight:700;" step="any" value="${bridge.baseCogs}" />
                </div>
                <div>
                  <label style="font-size:0.74rem; font-weight:700; color:#334155; display:block; margin-bottom:0.2rem;">Baseline SG&amp;A (${unit})</label>
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
                    <span class="wb-slider-val">CM: ${fmtPct(unitEcon.contributionMarginPct)}</span>
                    <span style="font-size:0.75rem; font-weight:700; color:#64748b;">$</span>
                    <input type="number" id="num-unit-vc" class="wb-slider-num" step="any" min="0" value="${unitEcon.unitVarCost}" />
                  </span>
                </div>
                <input type="range" id="sl-unit-vc" min="5" max="${Math.max(15, unitEcon.unitPrice - 5)}" step="5" value="${unitEcon.unitVarCost}" />
              </div>

              <div class="wb-slider-group">
                <div class="wb-slider-Row">
                  <label>Fixed Operating Costs (${unit})</label>
                  <span class="wb-slider-num-wrap">
                    <input type="number" id="num-fixed-costs" class="wb-slider-num" step="any" min="1" value="${unitEcon.fixedCosts}" />
                  </span>
                </div>
                <input type="range" id="sl-fixed-costs" min="10" max="5000" step="10" value="${unitEcon.fixedCosts}" />
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

              <div style="margin-top:0.9rem; padding:0.85rem; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; font-size:0.84rem; line-height:1.5;">
                <div><strong>Contribution Margin:</strong> $${unitEcon.unitContribution.toFixed(2)}/unit (${fmtPct(unitEcon.contributionMarginPct)}) · <strong>Operating Leverage (DOL):</strong> ${unitEcon.operatingLeverageDOL.toFixed(2)}x</div>
                <div><strong>Break-Even Units:</strong> ${Math.ceil(unitEcon.breakEvenUnits).toLocaleString()} units · <strong>Margin of Safety:</strong> ${fmtPct(unitEcon.safetyMarginPct)}</div>
                <div style="margin-top:0.35rem; color:#1d4ed8; font-weight:700;">
                  💡 Indifference Threshold: With a +${fmtPct(unitEcon.proposedPriceChangePct)} price increase, you can lose up to ${fmtPct(Math.abs(unitEcon.maxVolumeLossForPriceHike))} of volume and still remain profit-neutral.
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
        <div class="wb-grid-2" style="margin-bottom: 1.25rem;">
          <div class="wb-panel">
            <div class="wb-panel__header">
              <div>
                <h3 class="wb-panel__title">NPV Tornado Sensitivity Chart (${unitLabel})</h3>
                <div class="wb-panel__subtitle">Ranked impact of ±25% swings in key project assumptions around Base NPV (${fm(scen.baseCase.npv)})</div>
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
                <div class="wb-panel__subtitle">Stress-testing implementation delays, cost overruns, and benefit adoption</div>
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
                    <td><strong>Bear Case (Delay + 25% Overrun)</strong></td>
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
                    <td><strong>Bull Case (Accelerated Capture)</strong></td>
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
      } else if (activeTab === 'ebitda-bridge') {
        drawWaterfallChart(root.querySelector('#consulting-waterfall-canvas'), bridge, unit);
      } else if (activeTab === 'scenarios-fees') {
        drawTornadoChart(root.querySelector('#consulting-tornado-canvas'), scen, unit);
      }
    });

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
    const unitSelect = root.querySelector('#proj-unit-select');
    if (unitSelect) {
      unitSelect.addEventListener('change', () => {
        state.unit = unitSelect.value;
        updateView();
      });
    }

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

    // Wire Sliders for Tabs 1, 2 & 3
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
