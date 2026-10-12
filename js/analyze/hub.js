/**
 * hub.js — Analyze Hub & Reusable Active Company Target Banner
 */

import { listSnapshots } from './snapshots.js';
import { fetchSECData, parseUploadedCompanyFacts } from './sec-api.js';
import { fetchStockData, getApiKeys, saveApiKey } from './api-manager.js';
import {
  getActiveCompany,
  setActiveCompany,
  selectSnapshot,
  fmtMoney,
  fmtSharePrice,
  fmtPct,
  fmtMult
} from './state.js';

export function mountTargetBanner(container, onChange) {
  if (!container) return;

  const render = () => {
    const company = getActiveCompany();
    const snaps = listSnapshots();
    const inc = company.incomeStatements?.[0] || {};
    const bs = company.balanceSheets?.[0] || {};
    const cf = company.cashFlows?.[0] || {};
    const keys = getApiKeys();

    const sourceLabel = company.source === 'sec-edgar'
      ? 'SEC EDGAR XBRL'
      : company.source?.startsWith('api-')
      ? 'Live Market API'
      : 'Built-in 10-K Snapshot';

    container.innerHTML = `
      <div class="analyze-target-bar">
        <div class="analyze-target-bar__top">
          <div class="analyze-target-bar__identity">
            <div class="analyze-target-bar__badges">
              <span class="analyze-ticker-badge">${company.ticker}</span>
              <span class="analyze-sector-badge">${company.sector || 'Corporate'}</span>
              <span class="analyze-source-badge">${sourceLabel}</span>
            </div>
            <h2 class="analyze-target-bar__name">${company.name}</h2>
            <p class="analyze-target-bar__desc">${company.description || ''}</p>
          </div>
          <div class="analyze-target-bar__kpis">
            <div class="analyze-mini-kpi">
              <div class="analyze-mini-kpi__label">Share Price</div>
              <div class="analyze-mini-kpi__val">${fmtSharePrice(company.profile?.price)}</div>
            </div>
            <div class="analyze-mini-kpi">
              <div class="analyze-mini-kpi__label">Market Cap</div>
              <div class="analyze-mini-kpi__val">${fmtMoney(company.profile?.marketCap)}</div>
            </div>
            <div class="analyze-mini-kpi">
              <div class="analyze-mini-kpi__label">Latest Revenue</div>
              <div class="analyze-mini-kpi__val">${fmtMoney(inc.revenue)}</div>
            </div>
            <div class="analyze-mini-kpi">
              <div class="analyze-mini-kpi__label">Operating Income</div>
              <div class="analyze-mini-kpi__val">${fmtMoney(inc.operatingIncome)}</div>
            </div>
            <div class="analyze-mini-kpi">
              <div class="analyze-mini-kpi__label">Free Cash Flow</div>
              <div class="analyze-mini-kpi__val">${fmtMoney(cf.freeCashFlow)}</div>
            </div>
          </div>
        </div>

        <div class="analyze-switcher">
          <div class="analyze-switcher__pills">
            <span class="analyze-switcher__label">10-K Archetypes:</span>
            ${snaps.map(s => `
              <button type="button" class="analyze-snap-pill ${company.ticker === s.ticker && company.source === 'snapshot' ? 'analyze-snap-pill--active' : ''}"
                data-snap-ticker="${s.ticker}" title="${s.archetype}">
                ${s.ticker} &middot; ${s.name.split(' ')[0]}
              </button>
            `).join('')}
          </div>
          <div class="analyze-switcher__actions">
            <button type="button" class="btn btn--secondary btn--sm" id="toggle-data-drawer-btn">
              &#128269; Load SEC EDGAR / API / JSON
            </button>
            <button type="button" class="btn btn--secondary btn--sm" id="export-company-json-btn">
              &#128190; Export JSON
            </button>
          </div>
        </div>
      </div>

      <div class="analyze-data-drawer" id="analyze-data-drawer">
        <div class="analyze-data-grid">
          <div class="analyze-data-box">
            <div class="analyze-data-box__title">1. Live SEC EDGAR 10-K Fetch</div>
            <div class="analyze-data-box__desc">
              Fetch 5-year XBRL statements via local SEC proxy (<code>http://localhost:3001</code>) with 7-day IndexedDB caching.
            </div>
            <div class="analyze-inline-form">
              <input type="text" class="analyze-input" id="sec-ticker-input" placeholder="Ticker (e.g. NVDA, JPM)" />
              <button type="button" class="btn btn--primary btn--sm" id="sec-fetch-btn">Fetch 10-K</button>
            </div>
          </div>

          <div class="analyze-data-box">
            <div class="analyze-data-box__title">2. Live Market API Fetch (FMP / Alpha Vantage)</div>
            <div class="analyze-data-box__desc">
              Fetch live market profile + 5-year statements (24h IndexedDB cache).
            </div>
            <div class="analyze-inline-form" style="margin-bottom:8px;">
              <input type="text" class="analyze-input" id="api-ticker-input" placeholder="Ticker (e.g. AMZN, GOOGL)" />
              <button type="button" class="btn btn--primary btn--sm" id="api-fetch-btn">Fetch API</button>
            </div>
            <div class="analyze-inline-form">
              <input type="password" class="analyze-input" id="fmp-key-input" placeholder="FMP API Key" value="${keys.fmp || ''}" />
              <input type="password" class="analyze-input" id="av-key-input" placeholder="AlphaVantage Key" value="${keys.alphavantage || ''}" />
              <button type="button" class="btn btn--secondary btn--sm" id="save-api-keys-btn">Save Keys</button>
            </div>
          </div>

          <div class="analyze-data-box">
            <div class="analyze-data-box__title">3. Upload SEC <code>CIK.json</code> or Snapshot JSON</div>
            <div class="analyze-data-box__desc">
              Works 100% offline without a proxy: drop any SEC EDGAR <code>CIK##########.json</code> file or exported company JSON.
            </div>
            <input type="file" accept=".json" id="upload-sec-json-input" class="analyze-input" />
          </div>
        </div>
        <div class="analyze-status-msg" id="analyze-data-status"></div>
      </div>
    `;

    // Bind snapshot buttons
    container.querySelectorAll('[data-snap-ticker]').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = selectSnapshot(btn.dataset.snapTicker);
        render();
        if (onChange) onChange(next);
      });
    });

    // Toggle drawer
    const drawerBtn = container.querySelector('#toggle-data-drawer-btn');
    const drawer = container.querySelector('#analyze-data-drawer');
    if (drawerBtn && drawer) {
      drawerBtn.addEventListener('click', () => {
        drawer.classList.toggle('analyze-data-drawer--open');
      });
    }

    // Export JSON
    const exportBtn = container.querySelector('#export-company-json-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(company, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${company.ticker}-executive-finance.json`;
        a.click();
      });
    }

    const statusEl = container.querySelector('#analyze-data-status');
    const setStatus = (msg, isErr = false) => {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.style.color = isErr ? 'var(--color-danger)' : 'var(--color-success)';
    };

    // SEC Fetch
    const secBtn = container.querySelector('#sec-fetch-btn');
    const secInput = container.querySelector('#sec-ticker-input');
    if (secBtn && secInput) {
      secBtn.addEventListener('click', async () => {
        const t = secInput.value.trim();
        if (!t) return;
        setStatus(`Fetching SEC EDGAR 10-K facts for ${t.toUpperCase()}...`);
        try {
          const data = await fetchSECData(t);
          setActiveCompany(data);
          render();
          if (onChange) onChange(data);
        } catch (err) {
          setStatus(err.message, true);
        }
      });
    }

    // Save API Keys
    const saveKeysBtn = container.querySelector('#save-api-keys-btn');
    if (saveKeysBtn) {
      saveKeysBtn.addEventListener('click', () => {
        saveApiKey('fmp', container.querySelector('#fmp-key-input')?.value || '');
        saveApiKey('alphavantage', container.querySelector('#av-key-input')?.value || '');
        setStatus('API keys saved to localStorage.');
      });
    }

    // Live API Fetch
    const apiBtn = container.querySelector('#api-fetch-btn');
    const apiInput = container.querySelector('#api-ticker-input');
    if (apiBtn && apiInput) {
      apiBtn.addEventListener('click', async () => {
        const t = apiInput.value.trim();
        if (!t) return;
        setStatus(`Fetching live market data for ${t.toUpperCase()}...`);
        try {
          const data = await fetchStockData(t);
          setActiveCompany(data);
          render();
          if (onChange) onChange(data);
        } catch (err) {
          setStatus(err.message, true);
        }
      });
    }

    // File Upload
    const fileInput = container.querySelector('#upload-sec-json-input');
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
          const text = await file.text();
          const json = JSON.parse(text);
          const data = json.facts
            ? parseUploadedCompanyFacts(json, file.name.replace(/\.json$/i, ''))
            : json;
          setActiveCompany(data);
          render();
          if (onChange) onChange(data);
        } catch (err) {
          setStatus(`Invalid JSON file: ${err.message}`, true);
        }
      });
    }
  };

  render();
}

function renderHubCards(company) {
  const grid = document.getElementById('analyze-hub-grid') || document.getElementById('analyze-hub-cards');
  if (!grid) return;

  const inc = company.incomeStatements?.[0] || {};
  const bs = company.balanceSheets?.[0] || {};
  const cf = company.cashFlows?.[0] || {};
  const prof = company.profile || {};

  const taxRate = inc.ebt > 0 ? Math.min(0.4, Math.max(0, inc.taxExpense / inc.ebt)) : 0.21;
  const nopat = (inc.operatingIncome || 0) * (1 - taxRate);
  const opCash = (bs.cash || 0) + (bs.shortTermInvestments || 0);
  const noa = (bs.totalAssets || 0) - opCash - ((bs.totalLiabilities || 0) - (bs.totalDebt || 0));
  const rnoa = noa > 0 ? nopat / noa : 0;
  const roe = bs.totalEquity > 0 ? (inc.netIncome || 0) / bs.totalEquity : 0;
  const ev = (prof.marketCap || 0) + (bs.totalDebt || 0) - opCash;
  const evEbitda = inc.ebitda > 0 ? ev / inc.ebitda : 0;
  const pe = inc.netIncome > 0 ? (prof.marketCap || 0) / inc.netIncome : 0;

  grid.innerHTML = `
    <a href="10k-analyzer.html" class="analyze-wb-card">
      <div class="analyze-wb-card__header">
        <span class="analyze-wb-card__badge">Workbench 1 &middot; FSA &amp; Penman</span>
        <span>&#128209;</span>
      </div>
      <div class="analyze-wb-card__title">10-K &amp; Penman FSA Analyzer</div>
      <p class="analyze-wb-card__desc">
        5-year ratio trends, Penman Balance Sheet &amp; Income Statement reformulation (<code>NOA</code>, <code>NFO</code>, <code>RNOA</code>, <code>FLEV</code>), Dual DuPont + Penman ROE decomposition, Sloan accrual quality, and automated Red Flags.
      </p>
      <div class="analyze-wb-card__preview">
        <div>
          <div class="analyze-wb-card__metric-label">${company.ticker} Op. Margin</div>
          <div class="analyze-wb-card__metric-val">${fmtPct(inc.revenue ? inc.operatingIncome / inc.revenue : 0)}</div>
        </div>
        <div>
          <div class="analyze-wb-card__metric-label">Penman RNOA</div>
          <div class="analyze-wb-card__metric-val">${fmtPct(rnoa)}</div>
        </div>
        <div>
          <div class="analyze-wb-card__metric-label">GAAP ROE</div>
          <div class="analyze-wb-card__metric-val">${fmtPct(roe)}</div>
        </div>
      </div>
      <div class="analyze-wb-card__footer">
        <span class="analyze-wb-card__cta">Open 10-K &amp; Penman Analyzer &rarr;</span>
      </div>
    </a>

    <a href="stock-valuator.html" class="analyze-wb-card">
      <div class="analyze-wb-card__header">
        <span class="analyze-wb-card__badge">Workbench 2 &middot; Valuation</span>
        <span>&#127919;</span>
      </div>
      <div class="analyze-wb-card__title">Multi-Method Stock &amp; Valuation Triangulator</div>
      <p class="analyze-wb-card__desc">
        Interactive WACC builder, 2-Stage FCFF/FCFE DCF with 5&times;5 sensitivity matrix, Penman Residual Income &amp; EVA reconciliation, Graham/EPV asset models, Peer Multiples, and Canvas Football Field chart.
      </p>
      <div class="analyze-wb-card__preview">
        <div>
          <div class="analyze-wb-card__metric-label">Enterprise Value</div>
          <div class="analyze-wb-card__metric-val">${fmtMoney(ev)}</div>
        </div>
        <div>
          <div class="analyze-wb-card__metric-label">EV / EBITDA</div>
          <div class="analyze-wb-card__metric-val">${fmtMult(evEbitda)}</div>
        </div>
        <div>
          <div class="analyze-wb-card__metric-label">Implied P/E</div>
          <div class="analyze-wb-card__metric-val">${fmtMult(pe)}</div>
        </div>
      </div>
      <div class="analyze-wb-card__footer">
        <span class="analyze-wb-card__cta">Open Valuation Triangulator &rarr;</span>
      </div>
    </a>

    <a href="deal-workbench.html" class="analyze-wb-card">
      <div class="analyze-wb-card__header">
        <span class="analyze-wb-card__badge">Workbench 3 &middot; Corp Dev &amp; PE</span>
        <span>&#129309;</span>
      </div>
      <div class="analyze-wb-card__title">Executive Deal &amp; Capital Allocation Workbench</div>
      <p class="analyze-wb-card__desc">
        Model M&amp;A EPS accretion/dilution, synergy break-even &amp; &sect;338(h)(10) step-up tax shields; LBO debt sweeps, IRR/MOIC &amp; GP/LP waterfalls; and multi-year CapEx NPV, IRR, MIRR &amp; EVA schedules.
      </p>
      <div class="analyze-wb-card__preview">
        <div>
          <div class="analyze-wb-card__metric-label">Target EBITDA</div>
          <div class="analyze-wb-card__metric-val">${fmtMoney(inc.ebitda)}</div>
        </div>
        <div>
          <div class="analyze-wb-card__metric-label">Net Debt</div>
          <div class="analyze-wb-card__metric-val">${fmtMoney(bs.netDebt)}</div>
        </div>
        <div>
          <div class="analyze-wb-card__metric-label">Annual CapEx</div>
          <div class="analyze-wb-card__metric-val">${fmtMoney(cf.capitalExpenditures)}</div>
        </div>
      </div>
      <div class="analyze-wb-card__footer">
        <span class="analyze-wb-card__cta">Open Deal &amp; CapEx Workbench &rarr;</span>
      </div>
    </a>

    <a href="risk-analyzer.html" class="analyze-wb-card">
      <div class="analyze-wb-card__header">
        <span class="analyze-wb-card__badge">Workbench 4 &middot; Risk &amp; Derivatives</span>
        <span>&#128737;</span>
      </div>
      <div class="analyze-wb-card__title">Portfolio &amp; Derivative Risk Lab</div>
      <p class="analyze-wb-card__desc">
        Multi-asset portfolio optimization, correlation matrix, Parametric &amp; Monte Carlo VaR / Expected Shortfall (CVaR), and Option Overlay Hedging Simulator (Zero-Cost Collar, Protective Put, Put Spread).
      </p>
      <div class="analyze-wb-card__preview">
        <div>
          <div class="analyze-wb-card__metric-label">${company.ticker} Equity Beta</div>
          <div class="analyze-wb-card__metric-val">${(prof.beta || 1).toFixed(2)}</div>
        </div>
        <div>
          <div class="analyze-wb-card__metric-label">Spot Reference</div>
          <div class="analyze-wb-card__metric-val">${fmtSharePrice(prof.price)}</div>
        </div>
        <div>
          <div class="analyze-wb-card__metric-label">Risk-Free Rate</div>
          <div class="analyze-wb-card__metric-val">${fmtPct(prof.riskFreeRate || 0.042)}</div>
        </div>
      </div>
      <div class="analyze-wb-card__footer">
        <span class="analyze-wb-card__cta">Open Portfolio &amp; Risk Lab &rarr;</span>
      </div>
    </a>
  `;
}

if (typeof document !== 'undefined') {
  const initHub = () => {
    const bannerEl = document.getElementById('analyze-target-banner') || document.getElementById('analyze-target-mount');
    const hubGrid = document.getElementById('analyze-hub-grid') || document.getElementById('analyze-hub-cards');
    if (bannerEl && hubGrid) {
      mountTargetBanner(bannerEl, (updated) => {
        renderHubCards(updated);
      });
      renderHubCards(getActiveCompany());
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHub);
  } else {
    initHub();
  }
}
