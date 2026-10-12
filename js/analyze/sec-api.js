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

// Built-in top S&P 500 Ticker -> CIK lookup so common tickers work without fetching 12MB tickers JSON
const BUILTIN_TICKERS = {
  AAPL: { cik: 320193, name: 'Apple Inc.' },
  MSFT: { cik: 789019, name: 'Microsoft Corporation' },
  NVDA: { cik: 1045810, name: 'NVIDIA Corporation' },
  AMZN: { cik: 1018724, name: 'Amazon.com, Inc.' },
  GOOGL: { cik: 1652044, name: 'Alphabet Inc.' },
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
  NEE: { cik: 753308, name: 'NextEra Energy, Inc.' }
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
 * Resolve a ticker or numeric CIK to direct SEC EDGAR XBRL CompanyFacts JSON & browse URLs
 */
export function resolveSECLinks(query) {
  const raw = String(query || '').trim().toUpperCase();
  if (!raw) {
    return {
      found: false,
      edgarSearchUrl: 'https://www.sec.gov/edgar/searchedgar/companysearch',
      tickersJsonUrl: 'https://www.sec.gov/files/company_tickers.json'
    };
  }

  // Check if user entered CIK########## or digits
  const cikMatch = raw.match(/^(?:CIK)?0*(\d{1,10})$/i);
  if (cikMatch) {
    const paddedCIK = cikMatch[1].padStart(10, '0');
    return {
      found: true,
      cik: paddedCIK,
      ticker: `CIK${paddedCIK}`,
      name: `CIK ${paddedCIK}`,
      factsUrl: `https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCIK}.json`,
      edgarBrowseUrl: `https://www.sec.gov/edgar/browse/?CIK=${paddedCIK}`,
      edgarSearchUrl: 'https://www.sec.gov/edgar/searchedgar/companysearch'
    };
  }

  // Check built-in S&P 500 ticker directory
  const hit = BUILTIN_TICKERS[raw];
  if (hit) {
    const paddedCIK = String(hit.cik).padStart(10, '0');
    return {
      found: true,
      cik: paddedCIK,
      ticker: raw,
      name: hit.name,
      factsUrl: `https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCIK}.json`,
      edgarBrowseUrl: `https://www.sec.gov/edgar/browse/?CIK=${paddedCIK}`,
      edgarSearchUrl: 'https://www.sec.gov/edgar/searchedgar/companysearch'
    };
  }

  return {
    found: false,
    ticker: raw,
    edgarBrowseUrl: `https://www.sec.gov/edgar/searchedgar/companysearch`,
    edgarSearchUrl: 'https://www.sec.gov/edgar/searchedgar/companysearch',
    tickersJsonUrl: 'https://www.sec.gov/files/company_tickers.json'
  };
}

