/**
 * api-manager.js — Multi-Provider Stock API Key Manager & Live Data Fetcher
 *
 * Supports Financial Modeling Prep (FMP) and Alpha Vantage with 24-hour
 * IndexedDB caching and localStorage API key management.
 */

const KEYS_STORAGE_KEY = 'execfin_api_keys';
const STOCK_CACHE_DB = 'execfin_stock_data_cache';
const STOCK_CACHE_STORE = 'stock_data';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export function getApiKeys() {
  try {
    return JSON.parse(localStorage.getItem(KEYS_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveApiKey(provider, key) {
  const keys = getApiKeys();
  if (key && key.trim()) {
    keys[provider] = key.trim();
  } else {
    delete keys[provider];
  }
  localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(keys));
}

function openStockCacheDB() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB unavailable'));
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(STOCK_CACHE_DB, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STOCK_CACHE_STORE)) {
        db.createObjectStore(STOCK_CACHE_STORE, { keyPath: 'symbol' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getCachedStock(symbol) {
  try {
    const db = await openStockCacheDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STOCK_CACHE_STORE, 'readonly');
      const req = tx.objectStore(STOCK_CACHE_STORE).get(symbol);
      req.onsuccess = () => {
        const res = req.result;
        if (!res || Date.now() - res.timestamp > CACHE_TTL_MS) return resolve(null);
        resolve(res.data);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function setCachedStock(symbol, data) {
  try {
    const db = await openStockCacheDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STOCK_CACHE_STORE, 'readwrite');
      tx.objectStore(STOCK_CACHE_STORE).put({ symbol, data, timestamp: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

const m = (v) => (v === null || v === undefined || Number.isNaN(Number(v)) ? 0 : Math.round((Number(v) / 1e6) * 100) / 100);

export async function fetchStockData(ticker, preferredProvider = 'fmp') {
  const sym = ticker.toUpperCase().trim();
  const cached = await getCachedStock(sym);
  if (cached) return cached;

  const keys = getApiKeys();
  const fmpKey = keys.fmp;
  const avKey = keys.alphavantage;

  if (preferredProvider === 'fmp' && fmpKey) {
    const base = 'https://financialmodelingprep.com/api/v3';
    const [profRes, incRes, bsRes, cfRes] = await Promise.all([
      fetch(`${base}/profile/${sym}?apikey=${fmpKey}`),
      fetch(`${base}/income-statement/${sym}?limit=5&apikey=${fmpKey}`),
      fetch(`${base}/balance-sheet-statement/${sym}?limit=5&apikey=${fmpKey}`),
      fetch(`${base}/cash-flow-statement/${sym}?limit=5&apikey=${fmpKey}`)
    ]);

    const [profArr, incArr, bsArr, cfArr] = await Promise.all([
      profRes.json(), incRes.json(), bsRes.json(), cfRes.json()
    ]);

    if (!Array.isArray(profArr) || profArr.length === 0 || !Array.isArray(incArr) || incArr.length === 0) {
      throw new Error(`FMP returned no data for "${sym}". Check ticker symbol or API key quota.`);
    }

    const p = profArr[0];
    const shares = m(p.mktCap / (p.price || 1)) || m(incArr[0].weightedAverageShsOutDil) || 1000;

    const normalized = {
      ticker: sym,
      name: p.companyName || sym,
      cik: String(p.cik || '').padStart(10, '0'),
      sector: p.sector || 'Public Equity',
      archetype: p.industry || 'Live FMP API Data',
      description: p.description ? p.description.slice(0, 220) + '...' : `Live financial data fetched from Financial Modeling Prep.`,
      formType: '10-K',
      source: 'api-fmp',
      profile: {
        price: Number(p.price) || 100,
        beta: Number(p.beta) || 1.0,
        sharesOutstanding: shares,
        marketCap: m(p.mktCap),
        riskFreeRate: 0.042,
        equityRiskPremium: 0.05,
        peerMultiples: { pe: 22.0, evEbitda: 15.0, pb: 4.5, pfcf: 22.0 }
      },
      incomeStatements: incArr.map(i => {
        const fy = Number(i.calendarYear) || new Date(i.date).getFullYear();
        return {
          period: `FY${fy}`,
          fy,
          fp: 'FY',
          end: i.date,
          revenue: m(i.revenue),
          costOfRevenue: m(i.costOfRevenue),
          grossProfit: m(i.grossProfit),
          researchAndDevelopment: m(i.researchAndDevelopmentExpenses),
          sellingGeneralAndAdmin: m(i.sellingGeneralAndAdministrativeExpenses),
          operatingIncome: m(i.operatingIncome),
          ebit: m(i.operatingIncome),
          depreciation: m(i.depreciationAndAmortization),
          ebitda: m(i.ebitda),
          interestExpense: m(i.interestExpense),
          ebt: m(i.incomeBeforeTax),
          taxExpense: m(i.incomeTaxExpense),
          netIncome: m(i.netIncome),
          epsBasic: Number(i.eps) || 0,
          epsDiluted: Number(i.epsdiluted) || 0,
          sharesBasic: m(i.weightedAverageShsOut),
          sharesDiluted: m(i.weightedAverageShsOutDil)
        };
      }),
      balanceSheets: bsArr.map(b => {
        const fy = Number(b.calendarYear) || new Date(b.date).getFullYear();
        return {
          period: `FY${fy}`,
          fy,
          fp: 'FY',
          end: b.date,
          totalAssets: m(b.totalAssets),
          currentAssets: m(b.totalCurrentAssets),
          cash: m(b.cashAndCashEquivalents),
          shortTermInvestments: m(b.shortTermInvestments),
          accountsReceivable: m(b.netReceivables),
          inventory: m(b.inventory),
          propertyPlantEquipment: m(b.propertyPlantEquipmentNet),
          goodwill: m(b.goodwill),
          intangibleAssets: m(b.intangibleAssets),
          totalLiabilities: m(b.totalLiabilities),
          currentLiabilities: m(b.totalCurrentLiabilities),
          accountsPayable: m(b.accountPayables),
          shortTermDebt: m(b.shortTermDebt),
          longTermDebt: m(b.longTermDebt),
          totalDebt: m(b.totalDebt),
          netDebt: m(b.netDebt),
          totalEquity: m(b.totalStockholdersEquity),
          retainedEarnings: m(b.retainedEarnings),
          treasuryStock: Math.abs(m(b.commonStockRepurchased)),
          sharesOutstanding: shares
        };
      }),
      cashFlows: cfArr.map(c => {
        const fy = Number(c.calendarYear) || new Date(c.date).getFullYear();
        return {
          period: `FY${fy}`,
          fy,
          fp: 'FY',
          end: c.date,
          operatingCashFlow: m(c.operatingCashFlow),
          investingCashFlow: m(c.netCashUsedForInvestingActivites),
          financingCashFlow: m(c.netCashUsedProvidedByFinancingActivities),
          capitalExpenditures: Math.abs(m(c.capitalExpenditure)),
          freeCashFlow: m(c.freeCashFlow),
          depreciation: m(c.depreciationAndAmortization),
          dividendsPaid: Math.abs(m(c.dividendsPaid)),
          shareBuybacks: Math.abs(m(c.commonStockRepurchased)),
          debtIssued: 0,
          debtRepaid: Math.abs(m(c.debtRepayment))
        };
      })
    };

    await setCachedStock(sym, normalized);
    return normalized;
  }

  if (avKey) {
    const base = 'https://www.alphavantage.co/query';
    const [ovRes, incRes, bsRes, cfRes] = await Promise.all([
      fetch(`${base}?function=OVERVIEW&symbol=${sym}&apikey=${avKey}`),
      fetch(`${base}?function=INCOME_STATEMENT&symbol=${sym}&apikey=${avKey}`),
      fetch(`${base}?function=BALANCE_SHEET&symbol=${sym}&apikey=${avKey}`),
      fetch(`${base}?function=CASH_FLOW&symbol=${sym}&apikey=${avKey}`)
    ]);
    const [ov, inc, bs, cf] = await Promise.all([
      ovRes.json(), incRes.json(), bsRes.json(), cfRes.json()
    ]);

    if (!ov?.Symbol || !Array.isArray(inc?.annualReports)) {
      throw new Error(`Alpha Vantage returned no data for "${sym}". Check API key or rate limits.`);
    }

    const shares = m(ov.SharesOutstanding) || 1000;
    const mktCap = m(ov.MarketCapitalization);
    const price = shares > 0 ? Math.round((mktCap / shares) * 100) / 100 : 100;

    const normalized = {
      ticker: sym,
      name: ov.Name || sym,
      cik: String(ov.CIK || '').padStart(10, '0'),
      sector: ov.Sector || 'Public Equity',
      archetype: ov.Industry || 'Live Alpha Vantage Data',
      description: ov.Description ? ov.Description.slice(0, 220) + '...' : 'Fetched via Alpha Vantage.',
      formType: '10-K',
      source: 'api-alphavantage',
      profile: {
        price,
        beta: Number(ov.Beta) || 1.0,
        sharesOutstanding: shares,
        marketCap: mktCap,
        riskFreeRate: 0.042,
        equityRiskPremium: 0.05,
        peerMultiples: { pe: 22.0, evEbitda: 15.0, pb: 4.5, pfcf: 22.0 }
      },
      incomeStatements: inc.annualReports.slice(0, 5).map(i => {
        const fy = new Date(i.fiscalDateEnding).getFullYear();
        const ebit = m(i.ebit) || m(i.operatingIncome);
        const da = m(i.depreciationAndAmortization);
        return {
          period: `FY${fy}`, fy, fp: 'FY', end: i.fiscalDateEnding,
          revenue: m(i.totalRevenue),
          costOfRevenue: m(i.costOfRevenue),
          grossProfit: m(i.grossProfit),
          researchAndDevelopment: m(i.researchAndDevelopment),
          sellingGeneralAndAdmin: m(i.sellingGeneralAndAdministrative),
          operatingIncome: m(i.operatingIncome),
          ebit,
          depreciation: da,
          ebitda: m(i.ebitda) || (ebit + da),
          interestExpense: m(i.interestExpense),
          ebt: m(i.incomeBeforeTax),
          taxExpense: m(i.incomeTaxExpense),
          netIncome: m(i.netIncome),
          epsBasic: shares ? Math.round((m(i.netIncome) / shares) * 100) / 100 : 0,
          epsDiluted: shares ? Math.round((m(i.netIncome) / shares) * 100) / 100 : 0,
          sharesBasic: shares,
          sharesDiluted: shares
        };
      }),
      balanceSheets: (bs.annualReports || []).slice(0, 5).map(b => {
        const fy = new Date(b.fiscalDateEnding).getFullYear();
        const stDebt = m(b.shortTermDebt);
        const ltDebt = m(b.longTermDebt);
        const cash = m(b.cashAndCashEquivalentsAtCarryingValue);
        const stInv = m(b.shortTermInvestments);
        return {
          period: `FY${fy}`, fy, fp: 'FY', end: b.fiscalDateEnding,
          totalAssets: m(b.totalAssets),
          currentAssets: m(b.totalCurrentAssets),
          cash,
          shortTermInvestments: stInv,
          accountsReceivable: m(b.currentNetReceivables),
          inventory: m(b.inventory),
          propertyPlantEquipment: m(b.propertyPlantEquipment),
          goodwill: m(b.goodwill),
          intangibleAssets: m(b.intangibleAssetsExcludingGoodwill),
          totalLiabilities: m(b.totalLiabilities),
          currentLiabilities: m(b.totalCurrentLiabilities),
          accountsPayable: m(b.currentAccountsPayable),
          shortTermDebt: stDebt,
          longTermDebt: ltDebt,
          totalDebt: stDebt + ltDebt,
          netDebt: (stDebt + ltDebt) - (cash + stInv),
          totalEquity: m(b.totalShareholderEquity),
          retainedEarnings: m(b.retainedEarnings),
          treasuryStock: m(b.treasuryStock),
          sharesOutstanding: m(b.commonStockSharesOutstanding) || shares
        };
      }),
      cashFlows: (cf.annualReports || []).slice(0, 5).map(c => {
        const fy = new Date(c.fiscalDateEnding).getFullYear();
        const ocf = m(c.operatingCashflow);
        const capex = Math.abs(m(c.capitalExpenditures));
        return {
          period: `FY${fy}`, fy, fp: 'FY', end: c.fiscalDateEnding,
          operatingCashFlow: ocf,
          investingCashFlow: m(c.cashflowFromInvestment),
          financingCashFlow: m(c.cashflowFromFinancing),
          capitalExpenditures: capex,
          freeCashFlow: ocf - capex,
          depreciation: m(c.depreciationDepletionAndAmortization),
          dividendsPaid: Math.abs(m(c.dividendPayout)),
          shareBuybacks: Math.abs(m(c.paymentsForRepurchaseOfCommonStock)),
          debtIssued: 0,
          debtRepaid: 0
        };
      })
    };

    await setCachedStock(sym, normalized);
    return normalized;
  }

  throw new Error('No API key configured. Open API Settings to save a Financial Modeling Prep (FMP) or Alpha Vantage key, or select one of the 6 built-in 10-K snapshots.');
}
