import { describe, it, expect } from 'vitest';
import { SNAPSHOTS, SNAPSHOT_LIST, getSnapshot } from '../js/analyze/snapshots.js';
import { parseSecJsonToSnapshot, parseUploadedIXBRLOrXML, resolveSECLinks } from '../js/analyze/sec-api.js';
import { compute10KAnalysis, calcCAGR } from '../js/analyze/10k-analyzer.js';
import { computeStockValuation } from '../js/analyze/stock-valuator.js';
import { computeMAAnalysis, computeLBOModel, computeCapExModel } from '../js/analyze/deal-workbench.js';
import { computePortfolioRisk, computeOptionOverlay, blackScholesFull } from '../js/analyze/risk-analyzer.js';
import {
  computeConsultingBusinessCase,
  computeEbitdaBridge,
  computePricingAndUnitEconomics,
  computeConsultingScenarios,
  computeFteLaborEstimator,
  computeBuildVsBuyComparison,
  computeProjectMonteCarlo
} from '../js/analyze/consulting-workbench.js';

describe('M7 Executive Analyze Suite & Workbenches', () => {
  describe('1. Pre-Loaded 10-K Snapshots & SEC EDGAR Parser', () => {
    it('provides 6 complete 5-year 10-K benchmark snapshots', () => {
      expect(SNAPSHOT_LIST.length).toBe(6);
      const tickers = SNAPSHOT_LIST.map(s => s.ticker);
      expect(tickers).toEqual(['AAPL', 'MSFT', 'COST', 'CAT', 'NEE', 'SAAS']);

      for (const snap of SNAPSHOT_LIST) {
        expect(snap.incomeStatements.length).toBeGreaterThanOrEqual(5);
        expect(snap.balanceSheets.length).toBeGreaterThanOrEqual(5);
        expect(snap.cashFlows.length).toBeGreaterThanOrEqual(5);
        expect(snap.profile.price).toBeGreaterThan(0);
        expect(snap.profile.marketCap).toBeGreaterThan(0);
      }
    });

    it('parses raw SEC EDGAR XBRL companyfacts JSON into a normalized snapshot', () => {
      const mockSecJson = {
        cik: '0000320193',
        entityName: 'Apple Inc.',
        facts: {
          'us-gaap': {
            Revenues: {
              units: {
                USD: [
                  { form: '10-K', fy: 2024, fp: 'FY', end: '2024-09-28', val: 391035000000 },
                  { form: '10-K', fy: 2023, fp: 'FY', end: '2023-09-30', val: 383285000000 }
                ]
              }
            },
            NetIncomeLoss: {
              units: {
                USD: [
                  { form: '10-K', fy: 2024, fp: 'FY', end: '2024-09-28', val: 93736000000 },
                  { form: '10-K', fy: 2023, fp: 'FY', end: '2023-09-30', val: 96995000000 }
                ]
              }
            },
            Assets: {
              units: {
                USD: [
                  { form: '10-K', fy: 2024, fp: 'FY', end: '2024-09-28', val: 364980000000 },
                  { form: '10-K', fy: 2023, fp: 'FY', end: '2023-09-30', val: 352583000000 }
                ]
              }
            },
            StockholdersEquity: {
              units: {
                USD: [
                  { form: '10-K', fy: 2024, fp: 'FY', end: '2024-09-28', val: 56950000000 },
                  { form: '10-K', fy: 2023, fp: 'FY', end: '2023-09-30', val: 62146000000 }
                ]
              }
            }
          }
        }
      };

      const parsed = parseSecJsonToSnapshot(mockSecJson, 'AAPL');
      expect(parsed.ticker).toBe('AAPL');
      expect(parsed.incomeStatements.length).toBe(2);
      expect(parsed.incomeStatements[0].revenue).toBeCloseTo(391035, 0);
      expect(parsed.incomeStatements[0].netIncome).toBeCloseTo(93736, 0);
    });

    it('resolves tickers, CIK numbers, and SEC EDGAR .htm viewer URLs to XBRL CompanyFacts JSON URLs', () => {
      const nvda = resolveSECLinks('nvda');
      expect(nvda.found).toBe(true);
      expect(nvda.cik).toBe('0001045810');
      expect(nvda.factsUrl).toBe('https://data.sec.gov/api/xbrl/companyfacts/CIK0001045810.json');

      const iqvUrl = resolveSECLinks('https://www.sec.gov/ix?doc=/Archives/edgar/data/0001478242/000162828026008322/iqv-20251231.htm');
      expect(iqvUrl.found).toBe(true);
      expect(iqvUrl.cik).toBe('0001478242');
      expect(iqvUrl.ticker).toBe('IQV');
      expect(iqvUrl.factsUrl).toBe('https://data.sec.gov/api/xbrl/companyfacts/CIK0001478242.json');

      const cikDirect = resolveSECLinks('320193');
      expect(cikDirect.found).toBe(true);
      expect(cikDirect.cik).toBe('0000320193');
      expect(cikDirect.factsUrl).toBe('https://data.sec.gov/api/xbrl/companyfacts/CIK0000320193.json');

      const unknown = resolveSECLinks('ZZZZ');
      expect(unknown.found).toBe(false);
      expect(unknown.edgarSearchUrl).toBe('https://www.sec.gov/edgar/searchedgar/companysearch');
    });

    it('parses an uploaded SEC Inline XBRL (.htm) 10-K filing directly into a company snapshot', () => {
      const sampleIxbrl = `
        <html><body>
          <ix:header>
            <ix:resources>
              <xbrli:context id="c-fy25">
                <xbrli:period>
                  <xbrli:startDate>2025-01-01</xbrli:startDate>
                  <xbrli:endDate>2025-12-31</xbrli:endDate>
                </xbrli:period>
              </xbrli:context>
              <xbrli:context id="c-bs25">
                <xbrli:period>
                  <xbrli:instant>2025-12-31</xbrli:instant>
                </xbrli:period>
              </xbrli:context>
            </ix:resources>
          </ix:header>
          <ix:nonNumeric name="dei:EntityRegistrantName">IQVIA HOLDINGS INC.</ix:nonNumeric>
          <ix:nonNumeric name="dei:TradingSymbol">IQV</ix:nonNumeric>
          <ix:nonNumeric name="dei:EntityCentralIndexKey">0001478242</ix:nonNumeric>
          <ix:nonFraction name="us-gaap:Revenues" contextRef="c-fy25" scale="6">15,405</ix:nonFraction>
          <ix:nonFraction name="us-gaap:OperatingIncomeLoss" contextRef="c-fy25" scale="6">2,180</ix:nonFraction>
          <ix:nonFraction name="us-gaap:NetIncomeLoss" contextRef="c-fy25" scale="6">1,375</ix:nonFraction>
          <ix:nonFraction name="us-gaap:Assets" contextRef="c-bs25" scale="6">26,850</ix:nonFraction>
          <ix:nonFraction name="us-gaap:StockholdersEquity" contextRef="c-bs25" scale="6">6,120</ix:nonFraction>
        </body></html>
      `;
      const snap = parseUploadedIXBRLOrXML(sampleIxbrl, 'iqv-20251231.htm');
      expect(snap.ticker).toBe('IQV');
      expect(snap.name).toBe('IQVIA HOLDINGS INC.');
      expect(snap.incomeStatements[0].revenue).toBeCloseTo(15405, 0);
      expect(snap.incomeStatements[0].netIncome).toBeCloseTo(1375, 0);
      expect(snap.balanceSheets[0].totalAssets).toBeCloseTo(26850, 0);
    });
  });

  describe('2. Workbench 1: 10-K & Penman FSA Analyzer', () => {
    it('satisfies Penman Reformulated Balance Sheet & Income Statement identities across all 6 snapshots', () => {
      for (const company of SNAPSHOT_LIST) {
        const res = compute10KAnalysis(company);
        expect(res.byYear.length).toBe(5);
        expect(res.healthScore).toBeGreaterThanOrEqual(0);
        expect(res.healthScore).toBeLessThanOrEqual(100);
        expect(res.flags.length).toBeGreaterThan(0);

        for (const yr of res.byYear) {
          // Identity 1: OA - OL = NOA
          expect(yr.OA - yr.OL).toBeCloseTo(yr.NOA, 2);
          // Identity 2: FO - FA = NFO
          expect(yr.FO - yr.FA).toBeCloseTo(yr.NFO, 2);
          // Identity 3: NOA - NFO = CSE (Common Stockholders' Equity)
          expect(yr.NOA - yr.NFO).toBeCloseTo(yr.cse, 1);
          // Identity 4: NOPAT (OI) - NFE = Net Income
          expect(yr.NOPAT - yr.NFE).toBeCloseTo(yr.ni, 2);
          // Identity 5: RNOA = OPM * NOAT (when NOA > 10)
          if (yr.NOA > 10) {
            expect(yr.OPM * yr.NOAT).toBeCloseTo(yr.RNOA, 4);
          }
        }
      }
    });

    it('flags high SBC dilution and accrual warnings on high-SBC SaaS snapshot', () => {
      const saas = getSnapshot('SAAS');
      const res = compute10KAnalysis(saas);
      expect(res.latest.sbcPctRev).toBeGreaterThan(0.15);
      const hasSbcDanger = res.flags.some(f => f.concept === 'stock-comp' && f.severity === 'danger');
      expect(hasSbcDanger).toBe(true);
    });

    it('computes 3-section cash flow statement and reconciles indirect P&L-to-OCF bridge across all benchmark snapshots', () => {
      for (const company of SNAPSHOT_LIST) {
        const res = compute10KAnalysis(company);
        for (const yr of res.byYear) {
          // Free cash flow identity: FCF = OCF - CapEx
          expect(yr.fcf).toBeCloseTo(yr.ocf - yr.capex, 2);
          // Reconciliation identity: Constructed OCF + Other Non-Cash Adjustments === Reported OCF
          expect(yr.constructedOcf + yr.otherOcfAdjustments).toBeCloseTo(yr.ocf, 2);
          // Working capital cash effect identity: wcCashFlow = -ΔAR - ΔInv + ΔAP
          expect(yr.wcCashFlow).toBeCloseTo(-yr.deltaAR - yr.deltaInv + yr.deltaAP, 2);
          // 3-section cash change identity
          expect(yr.deltaCashFromCF).toBeCloseTo(yr.ocf + yr.icf + yr.finCf, 2);
        }
      }
    });

    it('dynamically constructs operating, investing, and free cash flows from P&L and Balance Sheet when raw cash flows are absent', () => {
      const msft = getSnapshot('MSFT');
      // Create clone without cash flow statement
      const msftNoCf = {
        ...msft,
        incomeStatements: msft.incomeStatements,
        balanceSheets: msft.balanceSheets,
        cashFlows: []
      };
      delete msftNoCf.financials;

      const res = compute10KAnalysis(msftNoCf);
      expect(res.byYear.length).toBe(5);

      for (let i = 0; i < res.byYear.length; i++) {
        const yr = res.byYear[i];
        expect(yr.isOcfConstructed).toBe(true);
        expect(yr.ocf).toBeGreaterThan(0);
        expect(yr.ocf).toBeCloseTo(yr.constructedOcf, 2);
        expect(yr.fcf).toBeCloseTo(yr.ocf - yr.capex, 2);
        if (i > 0) {
          expect(yr.isCapexConstructed).toBe(true);
          expect(yr.capex).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('3. Workbench 2: Multi-Method Stock & Valuation Triangulator', () => {
    it('computes WACC, 2-Stage DCF, 5x5 sensitivity matrix, Reverse DCF, and reconciles DCF EV with Penman ReOI EV', () => {
      for (const company of SNAPSHOT_LIST) {
        const val = computeStockValuation(company);
        expect(val.waccInputs.wacc).toBeGreaterThan(0.04);
        expect(val.waccInputs.wacc).toBeLessThan(0.18);
        expect(val.dcf.sharePriceGGM).toBeGreaterThan(0);
        expect(val.compositeTargetPrice).toBeGreaterThan(0);
        expect(val.sensitivityMatrix.length).toBe(5);
        expect(val.sensitivityMatrix[0].cells.length).toBe(5);

        // Clean-Surplus Equivalence: 2-Stage FCFF DCF Enterprise Value === Penman ReOI Enterprise Value
        expect(val.reoi.dcfReOIReconciliationDiff).toBeLessThan(0.01);
        expect(val.reoi.sharePriceReOI).toBeCloseTo(val.dcf.sharePriceGGM, 2);
      }
    });
  });

  describe('4. Workbench 3: Executive Deal & Capital Allocation Workbench', () => {
    it('computes M&A EPS accretion/dilution, break-even synergies, and Section 338(h)(10) 15-year tax shield PV', () => {
      const msft = getSnapshot('MSFT');
      const maWith338 = computeMAAnalysis(msft, { elect338h10: true, offerPremiumPct: 0.25 });
      const maNo338 = computeMAAnalysis(msft, { elect338h10: false, offerPremiumPct: 0.25 });

      expect(maWith338.offerEquityValue).toBeGreaterThan(maWith338.tgt.mktCap);
      expect(maWith338.pvTaxShield338).toBeGreaterThan(0);
      expect(maNo338.pvTaxShield338).toBe(0);
      expect(maWith338.proFormaEpsCash).toBeGreaterThan(maNo338.proFormaEpsCash);
    });

    it('computes 5-year LBO debt sweep, value creation attribution, and 2-and-20 GP/LP waterfall', () => {
      const cat = getSnapshot('CAT');
      const lbo = computeLBOModel(cat, { entryMult: 10.5, debtToEbitda: 5.0, exitMult: 11.5 });

      expect(lbo.schedule.length).toBe(5);
      expect(lbo.endingDebt).toBeLessThan(lbo.initialDebt);
      expect(lbo.grossMOIC).toBeGreaterThan(1.0);
      expect(lbo.grossIRR).toBeGreaterThan(lbo.waterfall.netLpIRR);
      expect(lbo.waterfall.gpCarriedInterest).toBeGreaterThan(0);
    });

    it('computes CapEx NPV, IRR, MIRR, annual EVA, and Black-Scholes Real Option value', () => {
      const aapl = getSnapshot('AAPL');
      const capex = computeCapExModel(aapl);

      expect(capex.schedule.length).toBe(5);
      expect(capex.realOptionExpandValue).toBeGreaterThan(0);
      expect(capex.expandedStrategicNPV).toBeCloseTo(capex.staticNPV + capex.realOptionExpandValue, 2);
    });
  });

  describe('5. Workbench 4: Portfolio & Derivative Risk Lab', () => {
    it('computes multi-asset portfolio volatility, Euler risk contributions summing to 100%, and VaR/CVaR hierarchy', () => {
      const aapl = getSnapshot('AAPL');
      const risk = computePortfolioRisk(aapl, { horizonDays: 10 });

      expect(risk.portVol).toBeLessThan(risk.weightedAvgVol);
      expect(risk.diversificationBenefit).toBeGreaterThan(0);

      // Euler risk shares sum to 1.0 (100%)
      const sumRiskShares = risk.assets.reduce((acc, a) => acc + a.riskSharePct, 0);
      expect(sumRiskShares).toBeCloseTo(1.0, 4);

      // Tail risk hierarchy: CVaR_99 > VaR_99 > VaR_95 > 0
      expect(risk.var95Dollar).toBeGreaterThan(0);
      expect(risk.var99Dollar).toBeGreaterThan(risk.var95Dollar);
      expect(risk.cvar99Dollar).toBeGreaterThan(risk.var99Dollar);
    });

    it('prices Black-Scholes option overlays and reduces downside crash losses via Collar and Protective Put', () => {
      const aapl = getSnapshot('AAPL');
      const collar = computeOptionOverlay(aapl, { strategy: 'collar', putOtmPct: 0.10, callOtmPct: 0.10 });
      const protPut = computeOptionOverlay(aapl, { strategy: 'protective-put', putOtmPct: 0.10 });

      expect(collar.netDeltaPerShare).toBeGreaterThan(0);
      expect(collar.netDeltaPerShare).toBeLessThan(1.0);
      // At a -25% market crash, both Collar and Protective Put lose much less than -25%
      expect(collar.crashPoint.hedgedPnlPct).toBeGreaterThan(-0.15);
      expect(protPut.crashPoint.hedgedPnlPct).toBeGreaterThan(-0.15);
    });
  });

  describe('6. Workbench 5: Management Consulting & Business Case Studio', () => {
    it('computes project NPV, IRR, MIRR, ROI, Profitability Index, and Payback across consulting templates', () => {
      const aapl = getSnapshot('AAPL');
      const bc = computeConsultingBusinessCase(aapl, { template: 'digital' });

      expect(bc.schedule.length).toBe(6); // Years 0..5
      expect(bc.npv).toBeGreaterThan(0);
      expect(bc.irr).toBeGreaterThan(bc.hurdleRate);
      expect(bc.mirr).toBeGreaterThan(bc.hurdleRate);
      expect(bc.profitabilityIndex).toBeGreaterThan(1.0);
      expect(bc.simpleRoiPct).toBeGreaterThan(0);
      expect(bc.simplePaybackYears).toBeGreaterThan(0);
      expect(bc.simplePaybackYears).toBeLessThan(5);
      expect(bc.horizonUnit).toBe('years');
      expect(bc.periodsPerYear).toBe(1);

      // Monthly project horizon (12 months)
      const bcMonthly = computeConsultingBusinessCase(null, {
        upfrontCapex: 120,
        consultingFee: 30,
        yr1Benefit: 25,
        ongoingOpex: 3,
        horizonYears: 12,
        horizonUnit: 'months',
        hurdleRate: 0.12
      });
      expect(bcMonthly.horizonUnit).toBe('months');
      expect(bcMonthly.periodsPerYear).toBe(12);
      expect(bcMonthly.schedule.length).toBe(13); // Months 0..12
      expect(bcMonthly.npv).toBeGreaterThan(0);
      expect(bcMonthly.periodicIrr).toBeGreaterThan(bcMonthly.periodicHurdleRate);
      expect(bcMonthly.irr).toBeGreaterThan(bcMonthly.periodicIrr);

      // Weekly project horizon (16 weeks)
      const bcWeekly = computeConsultingBusinessCase(null, {
        upfrontCapex: 50,
        consultingFee: 10,
        yr1Benefit: 6,
        ongoingOpex: 0.5,
        horizonYears: 16,
        horizonUnit: 'weeks',
        hurdleRate: 0.10
      });
      expect(bcWeekly.horizonUnit).toBe('weeks');
      expect(bcWeekly.periodsPerYear).toBe(52);
      expect(bcWeekly.schedule.length).toBe(17); // Weeks 0..16
      expect(bcWeekly.npv).toBeGreaterThan(0);
      expect(bcWeekly.simplePaybackYears).toBeLessThan(16);
    });

    it('decomposes EBITDA Bridge waterfall steps and computes CVP price elasticity & LTV/CAC unit economics', () => {
      const msft = getSnapshot('MSFT');
      const bridge = computeEbitdaBridge(msft, { template: 'pricing' });
      expect(bridge.steps.length).toBe(7);
      expect(bridge.targetEbitda).toBeCloseTo(bridge.baseEbitda + bridge.netEbitdaLift, 2);
      expect(bridge.impliedEvCreation).toBeGreaterThan(0);

      const unitEcon = computePricingAndUnitEconomics(msft, {
        unit: 'K',
        unitPrice: 250,
        unitVarCost: 100,
        fixedCosts: 450,
        proposedPriceChangePct: 0.05
      });
      // Contribution margin = (250 - 100)/250 = 60% ($150/unit). Fixed costs = $450K ($450,000) -> Break-Even = 3,000 units
      expect(unitEcon.contributionMarginPct).toBeCloseTo(0.60, 4);
      expect(unitEcon.breakEvenUnits).toBeCloseTo(3000, 2);
      expect(unitEcon.maxVolumeLossForPriceHike).toBeCloseTo(-0.05 / 0.65, 4);
      expect(unitEcon.ltvToCac).toBeGreaterThan(2.0);

      // Hundreds ($100s) scale: 4,500 * $100 = $450,000 -> Break-Even = 3,000 units
      const unitEconHundreds = computePricingAndUnitEconomics(null, {
        unit: 'H',
        unitPrice: 250,
        unitVarCost: 100,
        fixedCosts: 4500
      });
      expect(unitEconHundreds.breakEvenUnits).toBeCloseTo(3000, 2);

      const scen = computeConsultingScenarios(msft, { template: 'digital' });
      expect(scen.bullCase.npv).toBeGreaterThan(scen.baseCase.npv);
      expect(scen.baseCase.npv).toBeGreaterThan(scen.bearCase.npv);
      expect(scen.drivers.length).toBe(5);
      expect(scen.feeModels.length).toBe(3);
    });

    it('computes Bottom-Up FTE Labor Estimator, Build vs. Buy Comparator, and 1,000-Trial Monte Carlo Risk Histogram', () => {
      // 1. Bottom-Up FTE Estimator in $K scale
      const fte = computeFteLaborEstimator({
        unit: 'K',
        horizonUnit: 'years',
        buildFtes: 3,
        buildHourlyRate: 95,
        buildWeeks: 16,
        hardwareSoftwareCapex: 50,
        impactedEmployees: 45,
        hoursSavedPerWeek: 3.5,
        employeeHourlyRate: 55,
        retiredSpendPerPeriod: 35
      });
      // Build labor: 3 * 40 * 16 * 95 = $182,400 ($182.4K) + $50K = $232.4K
      expect(fte.buildLaborDollars).toBeCloseTo(182400, 2);
      expect(fte.impliedUpfrontCapex).toBeCloseTo(232.4, 2);
      expect(fte.fteEquivalentSaved).toBeCloseTo((45 * 3.5) / 40, 4);
      expect(fte.impliedPeriod1Benefit).toBeGreaterThan(400);

      // 2. Build vs. Buy / Option A vs. Option B vs. Lean MVP Comparator
      const bvb = computeBuildVsBuyComparison({
        unit: 'K',
        horizonUnit: 'years',
        horizonYears: 5,
        upfrontCapex: 350,
        consultingFee: 75,
        yr1Benefit: 280,
        benefitGrowth: 0.10,
        ongoingOpex: 45,
        buyUpfrontCapex: 80,
        buyConsultingFee: 40,
        buyYr1Benefit: 250,
        buyOngoingOpex: 95,
        hurdleRate: 0.10,
        taxRate: 0.21
      });
      expect(bvb.options.length).toBe(3);
      expect(bvb.recommended).toBeDefined();
      expect(bvb.recommended.bc.npv).toBeGreaterThanOrEqual(bvb.optionA.bc.npv);
      expect(bvb.recommended.bc.npv).toBeGreaterThanOrEqual(bvb.optionB.bc.npv);

      // 3. 1,000-Trial Monte Carlo Simulation (deterministic seed)
      const mc = computeProjectMonteCarlo({
        upfrontCapex: 350,
        consultingFee: 75,
        yr1Benefit: 280,
        benefitGrowth: 0.10,
        ongoingOpex: 45,
        horizonYears: 5,
        horizonUnit: 'years',
        hurdleRate: 0.10,
        taxRate: 0.21,
        benefitShockPct: 0.25,
        capexShockPct: 0.25,
        hurdleShockBps: 200
      });
      expect(mc.trials).toBe(1000);
      expect(mc.bins.length).toBe(18);
      expect(mc.p90Npv).toBeGreaterThan(mc.p50Npv);
      expect(mc.p50Npv).toBeGreaterThan(mc.p10Npv);
      expect(mc.probPositiveNpv).toBeGreaterThan(0.5);
    });
  });
});
