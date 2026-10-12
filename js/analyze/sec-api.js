/**
 * sec-api.js — SEC EDGAR 10-K / 10-Q XBRL Financial Statement Parser & Fetcher
 *
 * Ported from Careycarroll/financial-calculator with enhancements:
 * - Parses raw SEC EDGAR XBRL CompanyFacts JSON into normalized 5-year statements
 * - Supports live fetch via local CORS proxy (http://localhost:3001/?url=)
 * - Supports direct browser drag-and-drop of SEC CIK##########.json files
 * - Caches parsed facts in IndexedDB with a 7-day TTL
 * - Normalizes dollar values to $ Millions to match benchmark snapshots
 */

const SEC_BASE_URL = 'https://data.sec.gov';
const SEC_WWW_URL = 'https://www.sec.gov';
const CORS_PROXY = 'http://localhost:3001/?url=';
const SEC_FACTS_DB_NAME = 'execfin_sec_facts_cache';
const SEC_FACTS_DB_VERSION = 1;
const SEC_FACTS_STORE = 'company_facts';
const SEC_CACHE_EXPIRY_DAYS = 7;

// Built-in S&P 500 Ticker -> CIK lookup so common tickers work without fetching 12MB tickers JSON
const BUILTIN_TICKERS = {
  AAPL: { cik: 320193, name: 'Apple Inc.' },
  MSFT: { cik: 789019, name: 'Microsoft Corporation' },
  NVDA: { cik: 1045810, name: 'NVIDIA Corporation' },
  AMZN: { cik: 1018724, name: 'Amazon.com, Inc.' },
  GOOGL: { cik: 1652044, name: 'Alphabet Inc.' },
  GOOG: { cik: 1652044, name: 'Alphabet Inc.' },
  META: { cik: 1326801, name: 'Meta Platforms, Inc.' },
  BRK: { cik: 1067983, name: 'Berkshire Hathaway Inc.' },
  TSLA: { cik: 1318605, name: 'Tesla, Inc.' },
  LLY: { cik: 59478, name: 'Eli Lilly and Company' },
  AVGO: { cik: 1730168, name: 'Broadcom Inc.' },
  JPM: { cik: 19617, name: 'JPMorgan Chase & Co.' },
  V: { cik: 1403161, name: 'Visa Inc.' },
  WMT: { cik: 104169, name: 'Walmart Inc.' },
  XOM: { cik: 34088, name: 'Exxon Mobil Corporation' },
  MA: { cik: 1141391, name: 'Mastercard Incorporated' },
  UNH: { cik: 731766, name: 'UnitedHealth Group Incorporated' },
  COST: { cik: 909832, name: 'Costco Wholesale Corporation' },
  PG: { cik: 80424, name: 'The Procter & Gamble Company' },
  JNJ: { cik: 200406, name: 'Johnson & Johnson' },
  HD: { cik: 354950, name: 'The Home Depot, Inc.' },
  ORCL: { cik: 1341439, name: 'Oracle Corporation' },
  ABBV: { cik: 1551152, name: 'AbbVie Inc.' },
  BAC: { cik: 70858, name: 'Bank of America Corporation' },
  KO: { cik: 21344, name: 'The Coca-Cola Company' },
  CRM: { cik: 1108524, name: 'Salesforce, Inc.' },
  CVX: { cik: 93410, name: 'Chevron Corporation' },
  NFLX: { cik: 1065280, name: 'Netflix, Inc.' },
  AMD: { cik: 2488, name: 'Advanced Micro Devices, Inc.' },
  PEP: { cik: 77476, name: 'PepsiCo, Inc.' },
  TMO: { cik: 97745, name: 'Thermo Fisher Scientific Inc.' },
  LIN: { cik: 1707925, name: 'Linde plc' },
  MCD: { cik: 63908, name: "McDonald's Corporation" },
  DIS: { cik: 1744489, name: 'The Walt Disney Company' },
  CSCO: { cik: 858877, name: 'Cisco Systems, Inc.' },
  ABT: { cik: 1800, name: 'Abbott Laboratories' },
  INTU: { cik: 896878, name: 'Intuit Inc.' },
  CAT: { cik: 18230, name: 'Caterpillar Inc.' },
  GE: { cik: 40545, name: 'GE Aerospace' },
  IBM: { cik: 51143, name: 'International Business Machines Corp.' },
  NEE: { cik: 753308, name: 'NextEra Energy, Inc.' },
  IQV: { cik: 1478242, name: 'IQVIA Holdings Inc.' },
  DHR: { cik: 313616, name: 'Danaher Corporation' },
  ISRG: { cik: 1035267, name: 'Intuitive Surgical, Inc.' },
  SYK: { cik: 310764, name: 'Stryker Corporation' },
  BSX: { cik: 885725, name: 'Boston Scientific Corporation' },
  MDT: { cik: 1613103, name: 'Medtronic plc' },
  PFE: { cik: 78003, name: 'Pfizer Inc.' },
  MRK: { cik: 310158, name: 'Merck & Co., Inc.' },
  AMGN: { cik: 318154, name: 'Amgen Inc.' },
  GILD: { cik: 882095, name: 'Gilead Sciences, Inc.' },
  VRTX: { cik: 875320, name: 'Vertex Pharmaceuticals Incorporated' },
  REGN: { cik: 872589, name: 'Regeneron Pharmaceuticals, Inc.' },
  BMY: { cik: 14272, name: 'Bristol-Myers Squibb Company' },
  CVS: { cik: 64803, name: 'CVS Health Corporation' },
  CI: { cik: 1739940, name: 'The Cigna Group' },
  ELV: { cik: 1156039, name: 'Elevance Health, Inc.' },
  MCK: { cik: 927653, name: 'McKesson Corporation' },
  GS: { cik: 886982, name: 'The Goldman Sachs Group, Inc.' },
  MS: { cik: 895421, name: 'Morgan Stanley' },
  BLK: { cik: 1364742, name: 'BlackRock, Inc.' },
  C: { cik: 831001, name: 'Citigroup Inc.' },
  WFC: { cik: 72971, name: 'Wells Fargo & Company' },
  AXP: { cik: 4962, name: 'American Express Company' },
  SPGI: { cik: 64040, name: 'S&P Global Inc.' },
  SCHW: { cik: 316709, name: 'The Charles Schwab Corporation' },
  NOW: { cik: 1373715, name: 'ServiceNow, Inc.' },
  ADBE: { cik: 796343, name: 'Adobe Inc.' },
  PANW: { cik: 1327567, name: 'Palo Alto Networks, Inc.' },
  CRWD: { cik: 1730168, name: 'CrowdStrike Holdings, Inc.' },
  SNPS: { cik: 883241, name: 'Synopsys, Inc.' },
  CDNS: { cik: 813672, name: 'Cadence Design Systems, Inc.' },
  INTC: { cik: 50863, name: 'Intel Corporation' },
  QCOM: { cik: 804328, name: 'QUALCOMM Incorporated' },
  TXN: { cik: 97476, name: 'Texas Instruments Incorporated' },
  AMAT: { cik: 6951, name: 'Applied Materials, Inc.' },
  LRCX: { cik: 707549, name: 'Lam Research Corporation' },
  MU: { cik: 723125, name: 'Micron Technology, Inc.' },
  PLTR: { cik: 1321655, name: 'Palantir Technologies Inc.' },
  UBER: { cik: 1543151, name: 'Uber Technologies, Inc.' },
  BKNG: { cik: 1075531, name: 'Booking Holdings Inc.' },
  SBUX: { cik: 829224, name: 'Starbucks Corporation' },
  NKE: { cik: 320187, name: 'NIKE, Inc.' },
  TJX: { cik: 109198, name: 'The TJX Companies, Inc.' },
  LOW: { cik: 60667, name: "Lowe's Companies, Inc." },
  TGT: { cik: 27419, name: 'Target Corporation' },
  CMG: { cik: 1058090, name: 'Chipotle Mexican Grill, Inc.' },
  DE: { cik: 315189, name: 'Deere & Company' },
  HON: { cik: 773840, name: 'Honeywell International Inc.' },
  UNP: { cik: 100885, name: 'Union Pacific Corporation' },
  UPS: { cik: 1090727, name: 'United Parcel Service, Inc.' },
  RTX: { cik: 101829, name: 'RTX Corporation' },
  LMT: { cik: 936468, name: 'Lockheed Martin Corporation' },
  BA: { cik: 12927, name: 'The Boeing Company' },
  ETN: { cik: 1551182, name: 'Eaton Corporation plc' },
  COP: { cik: 1163165, name: 'ConocoPhillips' },
  SLB: { cik: 87347, name: 'Schlumberger Limited' },
  VZ: { cik: 732712, name: 'Verizon Communications Inc.' },
  T: { cik: 732717, name: 'AT&T Inc.' },
  TMUS: { cik: 1283699, name: 'T-Mobile US, Inc.' }
};

const CONCEPT_MAP = {
  // Income Statement
  revenue: [
    'Revenues',
    'RevenueFromContractWithCustomerExcludingAssessedTax',
    'RevenueFromContractWithCustomerIncludingAssessedTax',
    'SalesRevenueNet',
    'SalesRevenueGoodsNet',
    'SalesRevenueServicesNet',
    'RevenueNet',
    'TotalRevenuesAndOtherIncome'
  ],
  costOfRevenue: [
    'CostOfRevenue',
    'CostOfGoodsAndServicesSold',
    'CostOfGoodsSold',
    'CostOfGoodsAndServiceExcludingDepreciationDepletionAndAmortization'
  ],
  grossProfit: ['GrossProfit'],
  researchAndDevelopment: [
    'ResearchAndDevelopmentExpense',
    'ResearchAndDevelopmentExpenseExcludingAcquiredInProcessCost'
  ],
  sellingGeneralAndAdmin: [
    'SellingGeneralAndAdministrativeExpense',
    'SellingAndMarketingExpense',
    'GeneralAndAdministrativeExpense'
  ],
  operatingIncome: [
    'OperatingIncomeLoss',
    'IncomeLossFromContinuingOperations'
  ],
  interestExpense: [
    'InterestExpense',
    'InterestExpenseDebt',
    'InterestPaid',
    'InterestIncomeExpenseNet'
  ],
  taxExpense: [
    'IncomeTaxExpenseBenefit',
    'IncomeTaxesPaid',
    'IncomeTaxExpenseBenefitContinuingOperations'
  ],
  ebt: [
    'IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest',
    'IncomeLossFromContinuingOperationsBeforeIncomeTaxes',
    'IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments'
  ],
  netIncome: [
    'NetIncomeLoss',
    'ProfitLoss',
    'NetIncomeLossAvailableToCommonStockholdersBasic'
  ],
  epsBasic: ['EarningsPerShareBasic'],
  epsDiluted: ['EarningsPerShareDiluted'],
  sharesBasic: [
    'WeightedAverageNumberOfSharesOutstandingBasic',
    'CommonStockSharesOutstanding'
  ],
  sharesDiluted: ['WeightedAverageNumberOfDilutedSharesOutstanding'],
  depreciation: [
    'DepreciationDepletionAndAmortization',
    'DepreciationAndAmortization',
    'Depreciation',
    'DepreciationAmortizationAndAccretionNet'
  ],

  // Balance Sheet
  totalAssets: ['Assets'],
  currentAssets: ['AssetsCurrent'],
  cash: [
    'CashAndCashEquivalentsAtCarryingValue',
    'CashCashEquivalentsAndShortTermInvestments',
    'Cash'
  ],
  shortTermInvestments: [
    'ShortTermInvestments',
    'AvailableForSaleSecuritiesCurrent',
    'MarketableSecuritiesCurrent'
  ],
  accountsReceivable: [
    'AccountsReceivableNetCurrent',
    'AccountsReceivableNet',
    'ReceivablesNetCurrent'
  ],
  inventory: [
    'InventoryNet',
    'InventoryFinishedGoods'
  ],
  propertyPlantEquipment: [
    'PropertyPlantAndEquipmentNet',
    'PropertyPlantAndEquipmentAndFinanceLeaseRightOfUseAssetAfterAccumulatedDepreciationAndAmortization'
  ],
  goodwill: ['Goodwill'],
  intangibleAssets: [
    'IntangibleAssetsNetExcludingGoodwill',
    'IntangibleAssetsNetIncludingGoodwill',
    'FiniteLivedIntangibleAssetsNet'
  ],
  totalLiabilities: ['Liabilities'],
  currentLiabilities: ['LiabilitiesCurrent'],
  accountsPayable: [
    'AccountsPayableCurrent',
    'AccountsPayable',
    'AccountsPayableAndAccruedLiabilitiesCurrent'
  ],
  shortTermDebt: [
    'ShortTermBorrowings',
    'DebtCurrent',
    'LongTermDebtCurrent',
    'CommercialPaper'
  ],
  longTermDebt: [
    'LongTermDebtNoncurrent',
    'LongTermDebt',
    'LongTermDebtAndCapitalLeaseObligations'
  ],
  totalEquity: [
    'StockholdersEquity',
    'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'
  ],
  retainedEarnings: ['RetainedEarningsAccumulatedDeficit'],
  treasuryStock: ['TreasuryStockValue', 'TreasuryStockCommonValue'],
  sharesOutstanding: [
    'CommonStockSharesOutstanding',
    'EntityCommonStockSharesOutstanding'
  ],

  // Cash Flow Statement
  operatingCashFlow: [
    'NetCashProvidedByUsedInOperatingActivities',
    'NetCashProvidedByUsedInOperatingActivitiesContinuingOperations'
  ],
  investingCashFlow: [
    'NetCashProvidedByUsedInInvestingActivities',
    'NetCashProvidedByUsedInInvestingActivitiesContinuingOperations'
  ],
  financingCashFlow: [
    'NetCashProvidedByUsedInFinancingActivities',
    'NetCashProvidedByUsedInFinancingActivitiesContinuingOperations'
  ],
  capitalExpenditures: [
    'PaymentsToAcquirePropertyPlantAndEquipment',
    'PaymentsToAcquireProductiveAssets'
  ],
  dividendsPaid: [
    'PaymentsOfDividendsCommonStock',
    'PaymentsOfDividends',
    'PaymentsOfOrdinaryDividends'
  ],
  shareBuybacks: [
    'PaymentsForRepurchaseOfCommonStock',
    'PaymentsForRepurchaseOfEquity'
  ],
  debtIssued: [
    'ProceedsFromIssuanceOfLongTermDebt',
    'ProceedsFromIssuanceOfDebt'
  ],
  debtRepaid: [
    'RepaymentsOfLongTermDebt',
    'RepaymentsOfDebt'
  ]
};

function openFactsDB() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB unavailable'));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SEC_FACTS_DB_NAME, SEC_FACTS_DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(SEC_FACTS_STORE)) {
        db.createObjectStore(SEC_FACTS_STORE, { keyPath: 'cik' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getCachedFacts(cik) {
  try {
    const db = await openFactsDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SEC_FACTS_STORE, 'readonly');
      const store = tx.objectStore(SEC_FACTS_STORE);
      const req = store.get(cik);
      req.onsuccess = () => {
        const res = req.result;
        if (!res) return resolve(null);
        const age = Date.now() - res.timestamp;
        if (age > SEC_CACHE_EXPIRY_DAYS * 86400000) return resolve(null);
        resolve(res.data);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setCachedFacts(cik, data) {
  try {
    const db = await openFactsDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SEC_FACTS_STORE, 'readwrite');
      const store = tx.objectStore(SEC_FACTS_STORE);
      store.put({ cik, data, timestamp: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore cache errors
  }
}

function toMillions(val) {
  if (val === null || val === undefined || Number.isNaN(val)) return null;
  // Raw SEC XBRL USD numbers are in single dollars; convert to $ Millions
  if (Math.abs(val) >= 100000) return Math.round((val / 1e6) * 100) / 100;
  return val;
}

function extractConceptData(facts, conceptKey) {
  const tags = CONCEPT_MAP[conceptKey] || [];
  const gaap = facts?.facts?.['us-gaap'] || {};
  for (const tag of tags) {
    const concept = gaap[tag];
    if (!concept?.units) continue;
    const unitKey = concept.units.USD
      ? 'USD'
      : concept.units['USD/shares']
      ? 'USD/shares'
      : concept.units.shares
      ? 'shares'
      : Object.keys(concept.units)[0];
    if (unitKey && concept.units[unitKey]?.length > 0) {
      return concept.units[unitKey];
    }
  }
  return [];
}

function filterAnnualItems(raw, formType = '10-K') {
  return raw.filter(d => {
    const matchForm = formType === '10-Q'
      ? d.form === '10-Q' || d.form === '10-Q/A'
      : d.form === '10-K' || d.form === '10-K/A';
    if (!matchForm) return false;
    if (d.start && d.end && formType === '10-K') {
      const days = (new Date(d.end) - new Date(d.start)) / 86400000;
      return days >= 330 && days <= 380;
    }
    return true;
  });
}

export function buildFinancialStatements(facts, years = 5, formType = '10-K') {
  const revRaw = filterAnnualItems(extractConceptData(facts, 'revenue'), formType);
  const assetsRaw = extractConceptData(facts, 'totalAssets').filter(
    d => (d.form === '10-K' || d.form === '10-K/A') && !d.start
  );

  const periodSource = revRaw.length > 0 ? revRaw : assetsRaw;
  const byEnd = {};
  periodSource.forEach(d => {
    if (!byEnd[d.end] || new Date(d.filed) > new Date(byEnd[d.end].filed)) {
      byEnd[d.end] = d;
    }
  });

  const periods = Object.values(byEnd)
    .sort((a, b) => new Date(b.end) - new Date(a.end))
    .slice(0, years)
    .map(d => {
      const fy = d.fy || new Date(d.end).getFullYear();
      return {
        key: `FY${fy}`,
        fy,
        fp: d.fp || 'FY',
        end: d.end,
        filed: d.filed
      };
    });

  const maps = {};
  Object.keys(CONCEPT_MAP).forEach(key => {
    const raw = filterAnnualItems(extractConceptData(facts, key), formType);
    const mapByEnd = {};
    raw.forEach(d => {
      if (!mapByEnd[d.end] || new Date(d.filed) > new Date(mapByEnd[d.end].filed)) {
        mapByEnd[d.end] = d;
      }
    });
    maps[key] = mapByEnd;
  });

  const bsKeys = [
    'totalAssets', 'currentAssets', 'cash', 'shortTermInvestments',
    'accountsReceivable', 'inventory', 'propertyPlantEquipment',
    'goodwill', 'intangibleAssets', 'totalLiabilities', 'currentLiabilities',
    'accountsPayable', 'shortTermDebt', 'longTermDebt', 'totalEquity',
    'retainedEarnings', 'treasuryStock', 'sharesOutstanding'
  ];
  bsKeys.forEach(key => {
    const raw = extractConceptData(facts, key);
    let items = raw.filter(d => (d.form === '10-K' || d.form === '10-K/A') && !d.start);
    if (items.length === 0) items = raw.filter(d => d.form === '10-K' || d.form === '10-K/A');
    const mapByEnd = {};
    items.forEach(d => {
      if (!mapByEnd[d.end] || new Date(d.filed) > new Date(mapByEnd[d.end].filed)) {
        mapByEnd[d.end] = d;
      }
    });
    maps[key] = mapByEnd;
  });

  const val = (key, end, scale = true) => {
    const entry = maps[key]?.[end];
    if (!entry || entry.val === undefined || entry.val === null) return null;
    return scale ? toMillions(entry.val) : entry.val;
  };

  const incomeStatements = periods.map(p => {
    const revenue = val('revenue', p.end);
    const costOfRevenue = val('costOfRevenue', p.end);
    const grossProfit = val('grossProfit', p.end) ?? (revenue !== null && costOfRevenue !== null ? revenue - costOfRevenue : null);
    const rd = val('researchAndDevelopment', p.end) ?? 0;
    const sga = val('sellingGeneralAndAdmin', p.end) ?? 0;
    const operatingIncome = val('operatingIncome', p.end);
    const interestExpense = val('interestExpense', p.end) ?? 0;
    const taxExpense = val('taxExpense', p.end);
    const netIncome = val('netIncome', p.end);
    const da = val('depreciation', p.end) ?? 0;
    const ebt = val('ebt', p.end) ?? (netIncome !== null && taxExpense !== null ? netIncome + taxExpense : null);
    const ebit = operatingIncome ?? (ebt !== null ? ebt + Math.abs(interestExpense) : null);
    const ebitda = ebit !== null ? ebit + Math.abs(da) : null;

    return {
      period: p.key,
      fy: p.fy,
      fp: p.fp,
      end: p.end,
      filed: p.filed,
      revenue,
      costOfRevenue,
      grossProfit,
      researchAndDevelopment: rd,
      sellingGeneralAndAdmin: sga,
      operatingIncome: ebit,
      ebit,
      ebitda,
      interestExpense: Math.abs(interestExpense),
      ebt,
      taxExpense,
      netIncome,
      depreciation: Math.abs(da),
      epsBasic: val('epsBasic', p.end, false),
      epsDiluted: val('epsDiluted', p.end, false),
      sharesBasic: val('sharesBasic', p.end),
      sharesDiluted: val('sharesDiluted', p.end)
    };
  });

  const balanceSheets = periods.map(p => {
    const totalAssets = val('totalAssets', p.end);
    const currentAssets = val('currentAssets', p.end);
    const cashVal = val('cash', p.end) ?? 0;
    const shortTermInvestments = val('shortTermInvestments', p.end) ?? 0;
    const accountsReceivable = val('accountsReceivable', p.end) ?? 0;
    const inventoryVal = val('inventory', p.end) ?? 0;
    const ppe = val('propertyPlantEquipment', p.end) ?? 0;
    const goodwill = val('goodwill', p.end) ?? 0;
    const intangibles = val('intangibleAssets', p.end) ?? 0;
    const totalLiabilities = val('totalLiabilities', p.end);
    const currentLiabilities = val('currentLiabilities', p.end);
    const accountsPayable = val('accountsPayable', p.end) ?? 0;
    const shortTermDebt = val('shortTermDebt', p.end) ?? 0;
    const longTermDebt = val('longTermDebt', p.end) ?? 0;
    const totalEquity = val('totalEquity', p.end);
    const retainedEarnings = val('retainedEarnings', p.end) ?? 0;
    const treasuryStock = val('treasuryStock', p.end) ?? 0;
    const sharesOut = val('sharesOutstanding', p.end);

    const totalDebt = shortTermDebt + longTermDebt;
    const netDebt = totalDebt - (cashVal + shortTermInvestments);

    return {
      period: p.key,
      fy: p.fy,
      fp: p.fp,
      end: p.end,
      filed: p.filed,
      totalAssets,
      currentAssets,
      cash: cashVal,
      shortTermInvestments,
      accountsReceivable,
      inventory: inventoryVal,
      propertyPlantEquipment: ppe,
      goodwill,
      intangibleAssets: intangibles,
      totalLiabilities,
      currentLiabilities,
      accountsPayable,
      shortTermDebt,
      longTermDebt,
      totalDebt,
      netDebt,
      totalEquity,
      retainedEarnings,
      treasuryStock,
      sharesOutstanding: sharesOut
    };
  });

  const cashFlows = periods.map(p => {
    const operatingCF = val('operatingCashFlow', p.end);
    const investingCF = val('investingCashFlow', p.end);
    const financingCF = val('financingCashFlow', p.end);
    const capex = Math.abs(val('capitalExpenditures', p.end) ?? 0);
    const da = Math.abs(val('depreciation', p.end) ?? 0);
    const dividends = Math.abs(val('dividendsPaid', p.end) ?? 0);
    const buybacks = Math.abs(val('shareBuybacks', p.end) ?? 0);
    const debtIssued = val('debtIssued', p.end) ?? 0;
    const debtRepaid = Math.abs(val('debtRepaid', p.end) ?? 0);
    const freeCashFlow = operatingCF !== null ? operatingCF - capex : null;

    return {
      period: p.key,
      fy: p.fy,
      fp: p.fp,
      end: p.end,
      filed: p.filed,
      operatingCashFlow: operatingCF,
      investingCashFlow: investingCF,
      financingCashFlow: financingCF,
      capitalExpenditures: capex,
      freeCashFlow,
      depreciation: da,
      dividendsPaid: dividends,
      shareBuybacks: buybacks,
      debtIssued,
      debtRepaid
    };
  });

  return { incomeStatements, balanceSheets, cashFlows };
}

export function parseUploadedCompanyFacts(rawFacts, tickerOverride = '') {
  const statements = buildFinancialStatements(rawFacts, 5, '10-K');
  const latestInc = statements.incomeStatements[0] || {};
  const latestBs = statements.balanceSheets[0] || {};
  const shares = latestBs.sharesOutstanding || latestInc.sharesDiluted || 1000;
  const eps = latestInc.epsDiluted || (latestInc.netIncome && shares ? latestInc.netIncome / shares : 5);
  const estPrice = Math.max(10, Math.round(eps * 20 * 100) / 100);

  return {
    ticker: (tickerOverride || rawFacts.entityName?.slice(0, 4) || 'SEC').toUpperCase(),
    name: rawFacts.entityName || tickerOverride || 'SEC EDGAR Filing',
    cik: String(rawFacts.cik || '').padStart(10, '0'),
    sector: 'SEC EDGAR 10-K Filing',
    archetype: 'Uploaded SEC XBRL CompanyFacts',
    description: `Parsed from SEC EDGAR XBRL CompanyFacts (${statements.incomeStatements.length} annual periods).`,
    formType: '10-K',
    source: 'sec-edgar',
    profile: {
      price: estPrice,
      beta: 1.0,
      sharesOutstanding: shares,
      marketCap: Math.round(estPrice * shares),
      riskFreeRate: 0.042,
      equityRiskPremium: 0.05,
      peerMultiples: { pe: 22.0, evEbitda: 15.0, pb: 4.5, pfcf: 22.0 }
    },
    ...statements
  };
}

export async function fetchSECData(ticker, years = 5, formType = '10-K') {
  const sym = ticker.toUpperCase().trim();
  let company = BUILTIN_TICKERS[sym];

  if (!company) {
    const res = await fetch(`${CORS_PROXY}${SEC_WWW_URL}/files/company_tickers.json`);
    if (!res.ok) {
      throw new Error(`Could not reach local SEC proxy at ${CORS_PROXY}. Start "node proxy.js" or use a pre-loaded snapshot / upload a CIK.json file.`);
    }
    const data = await res.json();
    for (const entry of Object.values(data)) {
      if (entry.ticker.toUpperCase() === sym) {
        company = { cik: entry.cik_str, name: entry.title };
        break;
      }
    }
  }

  if (!company) {
    throw new Error(`Ticker "${sym}" not found in SEC EDGAR directory.`);
  }

  const paddedCIK = String(company.cik).padStart(10, '0');
  let facts = await getCachedFacts(paddedCIK);

  if (!facts) {
    const url = `${CORS_PROXY}${SEC_BASE_URL}/api/xbrl/companyfacts/CIK${paddedCIK}.json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SEC EDGAR fetch failed (HTTP ${response.status}). Ensure local proxy is running or upload CIK${paddedCIK}.json directly.`);
    }
    facts = await response.json();
    await setCachedFacts(paddedCIK, facts);
  }

  const parsed = parseUploadedCompanyFacts(facts, sym);
  parsed.name = company.name || parsed.name;
  parsed.years = years;
  parsed.formType = formType;
  return parsed;
}

export const parseSecJsonToSnapshot = parseUploadedCompanyFacts;
export { BUILTIN_TICKERS };

/**
 * Resolve a ticker, numeric CIK, or full SEC EDGAR URL (e.g. .../Archives/edgar/data/0001478242/...)
 * to direct SEC EDGAR XBRL CompanyFacts JSON & browse URLs.
 */
export function resolveSECLinks(query) {
  const raw = String(query || '').trim();
  if (!raw) {
    return {
      found: false,
      edgarSearchUrl: 'https://www.sec.gov/edgar/searchedgar/companysearch',
      tickersJsonUrl: 'https://www.sec.gov/files/company_tickers.json'
    };
  }

  const upper = raw.toUpperCase();

  // 1. Check if user pasted an SEC EDGAR URL (e.g. .../Archives/edgar/data/0001478242/... or ...?CIK=0001478242)
  const urlCikMatch =
    raw.match(/\/edgar\/data\/0*(\d{1,10})\b/i) ||
    raw.match(/[?&]CIK=0*(\d{1,10})\b/i) ||
    raw.match(/\bCIK0*(\d{1,10})\b/i);

  // 2. Or check if user entered a bare CIK number
  const bareCikMatch = upper.match(/^(?:CIK)?0*(\d{1,10})$/i);
  const matchedDigits = urlCikMatch?.[1] || bareCikMatch?.[1];

  if (matchedDigits) {
    const paddedCIK = matchedDigits.padStart(10, '0');
    const numericCik = Number(matchedDigits);
    const knownEntry = Object.entries(BUILTIN_TICKERS).find(([, v]) => v.cik === numericCik);
    const ticker = knownEntry ? knownEntry[0] : `CIK${paddedCIK}`;
    const name = knownEntry ? knownEntry[1].name : `CIK ${paddedCIK}`;
    return {
      found: true,
      cik: paddedCIK,
      ticker,
      name,
      factsUrl: `https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCIK}.json`,
      edgarBrowseUrl: `https://www.sec.gov/edgar/browse/?CIK=${paddedCIK}`,
      edgarSearchUrl: 'https://www.sec.gov/edgar/searchedgar/companysearch'
    };
  }

  // 3. Check built-in S&P 500 ticker directory
  const hit = BUILTIN_TICKERS[upper];
  if (hit) {
    const paddedCIK = String(hit.cik).padStart(10, '0');
    return {
      found: true,
      cik: paddedCIK,
      ticker: upper,
      name: hit.name,
      factsUrl: `https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCIK}.json`,
      edgarBrowseUrl: `https://www.sec.gov/edgar/browse/?CIK=${paddedCIK}`,
      edgarSearchUrl: 'https://www.sec.gov/edgar/searchedgar/companysearch'
    };
  }

  return {
    found: false,
    ticker: upper,
    edgarBrowseUrl: 'https://www.sec.gov/edgar/searchedgar/companysearch',
    edgarSearchUrl: 'https://www.sec.gov/edgar/searchedgar/companysearch',
    tickersJsonUrl: 'https://www.sec.gov/files/company_tickers.json'
  };
}

/**
 * Parse an uploaded SEC EDGAR Inline XBRL (.htm / .html) or XBRL Instance (.xml) 10-K filing
 * directly into a normalized company snapshot.
 */
export function parseUploadedIXBRLOrXML(content, fallbackTicker = 'SEC') {
  const text = String(content || '');

  const extractDei = (tag) => {
    const ixRe = new RegExp(`name=["'][^"']*:${tag}["'][^>]*>([\\s\\S]*?)<\\/ix:`, 'i');
    const xmlRe = new RegExp(`<(?:[a-zA-Z0-9_-]+:)?${tag}\\b[^>]*>([\\s\\S]*?)<\\/(?:[a-zA-Z0-9_-]+:)?${tag}>`, 'i');
    const m = text.match(ixRe) || text.match(xmlRe);
    return m ? m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
  };

  const entityName = extractDei('EntityRegistrantName') || fallbackTicker;
  const deiTicker = extractDei('TradingSymbol').toUpperCase();
  const deiCik = extractDei('EntityCentralIndexKey');
  const filePrefix = String(fallbackTicker || '')
    .replace(/\.(htm|html|xml)$/i, '')
    .split(/[-_]/)[0]
    .toUpperCase();
  const resolvedTicker = deiTicker || (filePrefix && filePrefix.length <= 5 ? filePrefix : 'SEC');

  // 1. Parse <context> blocks (skip dimensional segments so we only capture consolidated totals)
  const contexts = new Map();
  const ctxRe = /<(?:[a-zA-Z0-9_-]+:)?context\b[^>]*\bid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/(?:[a-zA-Z0-9_-]+:)?context>/gi;
  let ctxMatch;
  while ((ctxMatch = ctxRe.exec(text)) !== null) {
    const id = ctxMatch[1];
    const body = ctxMatch[2];
    if (/<(?:[a-zA-Z0-9_-]+:)?(?:segment|explicitMember|typedMember)\b/i.test(body)) {
      continue;
    }
    const startM = body.match(/<(?:[a-zA-Z0-9_-]+:)?startDate[^>]*>\s*(\d{4}-\d{2}-\d{2})/i);
    const endM = body.match(/<(?:[a-zA-Z0-9_-]+:)?endDate[^>]*>\s*(\d{4}-\d{2}-\d{2})/i);
    const instM = body.match(/<(?:[a-zA-Z0-9_-]+:)?instant[^>]*>\s*(\d{4}-\d{2}-\d{2})/i);

    if (startM && endM) {
      const days = (new Date(endM[1]) - new Date(startM[1])) / 86400000;
      if (days >= 330 && days <= 385) {
        contexts.set(id, {
          start: startM[1],
          end: endM[1],
          fy: Number(endM[1].slice(0, 4)),
          isDuration: true
        });
      }
    } else if (instM) {
      contexts.set(id, {
        end: instM[1],
        fy: Number(instM[1].slice(0, 4)),
        isDuration: false
      });
    }
  }

  const gaapFacts = {};
  const addFact = (conceptTag, ctx, val) => {
    if (!Number.isFinite(val)) return;
    if (!gaapFacts[conceptTag]) {
      gaapFacts[conceptTag] = { units: { USD: [] } };
    }
    gaapFacts[conceptTag].units.USD.push({
      form: '10-K',
      fp: 'FY',
      fy: ctx.fy,
      start: ctx.start,
      end: ctx.end,
      filed: ctx.end,
      val
    });
  };

  // 2A. Extract Inline XBRL (<ix:nonFraction ...>) facts
  const ixFactRe = /<ix:nonFraction\b([^>]*)>([\s\S]*?)<\/ix:nonFraction>/gi;
  let ixMatch;
  while ((ixMatch = ixFactRe.exec(text)) !== null) {
    const attrs = ixMatch[1];
    const inner = ixMatch[2];
    const nameM = attrs.match(/\bname=["']([^"']+)["']/i);
    const ctxM = attrs.match(/\bcontextRef=["']([^"']+)["']/i);
    if (!nameM || !ctxM) continue;
    const ctx = contexts.get(ctxM[1]);
    if (!ctx) continue;

    const conceptTag = nameM[1].split(':').pop();
    const scaleM = attrs.match(/\bscale=["'](-?\d+)["']/i);
    const scale = scaleM ? Number(scaleM[1]) : 0;
    const signM = attrs.match(/\bsign=["'](-|\+)["']/i);
    const isNeg = signM && signM[1] === '-';

    const cleanStr = inner
      .replace(/<[^>]+>/g, '')
      .replace(/[$,\s\u00A0]/g, '')
      .trim();
    if (!cleanStr || cleanStr === '-' || cleanStr === '—' || cleanStr === '–') {
      addFact(conceptTag, ctx, 0);
      continue;
    }
    const parenNeg = /^\(.*\)$/.test(cleanStr);
    const num = parseFloat(cleanStr.replace(/[()]/g, ''));
    if (Number.isNaN(num)) continue;
    let val = num * Math.pow(10, scale);
    if ((isNeg || parenNeg) && val > 0) val = -val;
    addFact(conceptTag, ctx, val);
  }

  // 2B. Extract standard XBRL Instance (<us-gaap:Concept ...>) facts if present
  const xmlFactRe = /<([a-zA-Z0-9_-]+):([A-Za-z0-9_]+)\b([^>]*\bcontextRef=["'][^"']+["'][^>]*)>([^<]+)<\/\1:\2>/g;
  let xmlMatch;
  while ((xmlMatch = xmlFactRe.exec(text)) !== null) {
    const prefix = xmlMatch[1].toLowerCase();
    if (prefix === 'ix' || prefix === 'xbrli') continue;
    const conceptTag = xmlMatch[2];
    const attrs = xmlMatch[3];
    const valStr = xmlMatch[4].replace(/[$,\s]/g, '').trim();
    const ctxM = attrs.match(/\bcontextRef=["']([^"']+)["']/i);
    if (!ctxM) continue;
    const ctx = contexts.get(ctxM[1]);
    if (!ctx) continue;
    const num = parseFloat(valStr);
    if (!Number.isNaN(num)) {
      addFact(conceptTag, ctx, num);
    }
  }

  const rawFacts = {
    cik: deiCik || '0000000000',
    entityName,
    facts: { 'us-gaap': gaapFacts }
  };

  const parsed = parseUploadedCompanyFacts(rawFacts, resolvedTicker);
  if (!parsed.incomeStatements?.length && !parsed.balanceSheets?.length) {
    const cikHint = deiCik ? ` (detected CIK ${deiCik.padStart(10, '0')})` : '';
    throw new Error(
      `No XBRL financial facts found in this file${cikHint}. Paste the SEC URL or CIK into "Get CIK.json" to download the full multi-year JSON, or in the SEC viewer choose Menu → Open XBRL Instance (.xml) / Open as HTML (.htm).`
    );
  }
  return parsed;
}


