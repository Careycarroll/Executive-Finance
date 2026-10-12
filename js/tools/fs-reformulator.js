/**
 * fs-reformulator.js — Financial Statement Reformulator & Penman ROE Decomposition
 * Toggles between standard GAAP view and reformulated (Operating vs. Financing) view,
 * computes live Penman ROE decomposition, and exposes step-by-step calculations via show-work.
 * Follows component contract in ADR-0003: create(container, config) -> { destroy(), update(newConfig) }
 */

import {
  reformulateBalanceSheet,
  reformulateIncomeStatement,
  penmanROEDecomposition,
  dupont3Way,
} from '../lib/finance-math/fsa.js';
import { renderShowWork } from '../components/show-work.js';

const DEFAULT_BALANCE_SHEET = [
  { id: 'op_cash', item: 'Operating Cash', value: 50, class: 'operating', type: 'asset' },
  { id: 'excess_cash', item: 'Excess Cash & Short-Term Investments', value: 50, class: 'financial', type: 'asset' },
  { id: 'ar', item: 'Accounts Receivable', value: 300, class: 'operating', type: 'asset' },
  { id: 'inv', item: 'Inventories', value: 250, class: 'operating', type: 'asset' },
  { id: 'ppe', item: 'Property, Plant & Equipment (Net)', value: 400, class: 'operating', type: 'asset' },
  { id: 'ap', item: 'Accounts Payable', value: 200, class: 'operating', type: 'liability' },
  { id: 'accruals', item: 'Accrued Operating Expenses', value: 100, class: 'operating', type: 'liability' },
  { id: 'st_debt', item: 'Short-Term Debt & Current Portion', value: 150, class: 'financial', type: 'liability' },
  { id: 'lt_debt', item: 'Long-Term Notes & Bonds', value: 250, class: 'financial', type: 'liability' },
  { id: 'equity', item: 'Common Shareholders\' Equity', value: 300, class: 'equity', type: 'equity' },
];

const DEFAULT_INCOME_STATEMENT = [
  { id: 'sales', item: 'Sales Revenues', value: 1200, class: 'operating' },
  { id: 'cogs_sga', item: 'Operating Expenses (COGS & SG&A)', value: 950, class: 'operating' },
  { id: 'oi', item: 'Operating Income after Tax (NOPAT)', value: 140, class: 'operating' },
  { id: 'nfe', item: 'Net Financial Expense after Tax (NFE)', value: 24, class: 'financial' },
  { id: 'ci', item: 'Comprehensive Net Income', value: 116, class: 'bottom_line' },
];

export function create(container, config = {}) {
  if (!container) throw new Error('fs-reformulator requires a container element');

  let currentConfig = {
    viewMode: 'reformulated', // 'standard' | 'reformulated'
    operatingAssets: 1000,
    operatingLiabilities: 300,
    financialLiabilities: 400,
    financialAssets: 50,
    operatingIncome: 140,
    netFinancialExpense: 24,
    sales: 1200,
    show_roe_decomp: true,
    ...config,
  };

  // Support balance_sheet items if passed
  let balanceSheetItems = config.balance_sheet ? JSON.parse(JSON.stringify(config.balance_sheet)) : JSON.parse(JSON.stringify(DEFAULT_BALANCE_SHEET));
  let incomeStatementItems = config.income_statement ? JSON.parse(JSON.stringify(config.income_statement)) : JSON.parse(JSON.stringify(DEFAULT_INCOME_STATEMENT));

  let listeners = [];

  function computeAggregates() {
    // If explicit aggregate parameters were provided without custom line items, use them
    let oa = 0;
    let ol = 0;
    let fa = 0;
    let fo = 0;
    let equity = 0;

    balanceSheetItems.forEach(item => {
      if (item.type === 'asset') {
        if (item.class === 'operating') oa += item.value;
        else if (item.class === 'financial') fa += item.value;
      } else if (item.type === 'liability') {
        if (item.class === 'operating') ol += item.value;
        else if (item.class === 'financial') fo += item.value;
      } else if (item.type === 'equity') {
        equity += item.value;
      }
    });

    // If aggregates are explicitly passed on config and balance_sheet wasn't customized
    if (config.operatingAssets !== undefined && !config.balance_sheet) oa = currentConfig.operatingAssets;
    if (config.operatingLiabilities !== undefined && !config.balance_sheet) ol = currentConfig.operatingLiabilities;
    if (config.financialAssets !== undefined && !config.balance_sheet) fa = currentConfig.financialAssets;
    if (config.financialLiabilities !== undefined && !config.balance_sheet) fo = currentConfig.financialLiabilities;

    let oi = currentConfig.operatingIncome ?? 140;
    let nfe = currentConfig.netFinancialExpense ?? 24;
    let sales = currentConfig.sales ?? 1200;

    const bs = reformulateBalanceSheet({
      operatingAssets: oa,
      operatingLiabilities: ol,
      financialLiabilities: fo,
      financialAssets: fa,
    });

    // If equity item exists, ensure CSE matches or uses calculated CSE
    const cse = bs.cse;
    const netIncome = oi - nfe;

    const decomp = penmanROEDecomposition({
      noa: bs.noa,
      nfo: bs.nfo,
      cse,
      operatingIncome: oi,
      netFinancialExpense: nfe,
    });

    const totalAssets = oa + fa;
    const dp = dupont3Way({
      netIncome,
      sales,
      totalAssets,
      equity: cse,
    });

    return {
      oa,
      ol,
      fa,
      fo,
      totalAssets,
      totalLiabilities: ol + fo,
      totalEquity: cse,
      noa: bs.noa,
      nfo: bs.nfo,
      cse,
      oi,
      nfe,
      netIncome,
      sales,
      decomp,
      dp,
    };
  }

  function render() {
    listeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    listeners = [];

    const agg = computeAggregates();
    const isReformulated = currentConfig.viewMode === 'reformulated';

    container.innerHTML = `
      <div class="fsr-container" style="display: flex; flex-direction: column; gap: 1.5rem; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        
        <!-- View Toggle & Control Header -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; border-bottom: 1px solid var(--color-border, #e2e8f0); padding-bottom: 1rem;">
          <div>
            <div style="font-size: 1.125rem; font-weight: 700; color: var(--color-gray-900, #0f172a);">
              Financial Statement Reformulator (Penman Framework)
            </div>
            <div style="font-size: 0.8125rem; color: var(--color-gray-600, #475569); margin-top: 0.125rem;">
              Separate Operating Activities from Financing Activities to Isolate Core Profitability (RNOA) & Leverage Spread
            </div>
          </div>

          <!-- View Switcher Buttons -->
          <div style="display: inline-flex; background: var(--color-gray-100, #f1f5f9); padding: 0.25rem; border-radius: 0.5rem; border: 1px solid var(--color-border, #e2e8f0);">
            <button
              id="fsr-btn-reformulated"
              style="padding: 0.375rem 0.875rem; font-size: 0.8125rem; font-weight: 600; border: none; border-radius: 0.375rem; cursor: pointer; transition: all 0.15s ease; ${isReformulated ? 'background: #fff; color: var(--color-primary, #0369a1); box-shadow: 0 1px 2px rgba(0,0,0,0.08);' : 'background: transparent; color: var(--color-gray-600, #64748b);'}"
            >
              Penman Reformulated View
            </button>
            <button
              id="fsr-btn-standard"
              style="padding: 0.375rem 0.875rem; font-size: 0.8125rem; font-weight: 600; border: none; border-radius: 0.375rem; cursor: pointer; transition: all 0.15s ease; ${!isReformulated ? 'background: #fff; color: var(--color-primary, #0369a1); box-shadow: 0 1px 2px rgba(0,0,0,0.08);' : 'background: transparent; color: var(--color-gray-600, #64748b);'}"
            >
              Standard GAAP View
            </button>
          </div>
        </div>

        <!-- KPI Metric Badges -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem;">
          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              ${isReformulated ? 'Net Operating Assets (NOA)' : 'Total Assets'}
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-gray-900, #0f172a); margin-top: 0.25rem;">
              $${isReformulated ? agg.noa : agg.totalAssets}
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              ${isReformulated ? 'Net Financial Obligations (NFO)' : 'Total Liabilities'}
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-gray-900, #0f172a); margin-top: 0.25rem;">
              $${isReformulated ? agg.nfo : agg.totalLiabilities}
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Common Equity (CSE)
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-gray-900, #0f172a); margin-top: 0.25rem;">
              $${agg.cse}
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              RNOA (Operating Return)
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono, monospace); color: #0284c7; margin-top: 0.25rem;">
              ${(agg.decomp.rnoa * 100).toFixed(1)}%
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Return on Equity (ROE)
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono, monospace); color: #10b981; margin-top: 0.25rem;">
              ${(agg.decomp.roe * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <!-- Penman ROE Decomposition Formula Display Card -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #fff; border-radius: 0.625rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 0.5rem;">
            <span style="font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">
              Penman ROE Equation
            </span>
            <span style="font-size: 0.75rem; color: #38bdf8; font-weight: 600;">
              ROE = RNOA + [FLEV × Spread]
            </span>
          </div>

          <div style="font-family: var(--font-mono, monospace); font-size: 1.125rem; display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <span style="color: #34d399; font-weight: 800;">${(agg.decomp.roe * 100).toFixed(2)}%</span>
            <span style="color: #94a3b8;">=</span>
            <span style="color: #38bdf8; font-weight: 700;">${(agg.decomp.rnoa * 100).toFixed(2)}%</span>
            <span style="color: #94a3b8;">+</span>
            <span style="color: #cbd5e1;">[</span>
            <span style="color: #fbbf24; font-weight: 700;">${agg.decomp.flev.toFixed(2)}</span>
            <span style="color: #94a3b8;">×</span>
            <span style="color: ${agg.decomp.spread >= 0 ? '#34d399' : '#f87171'}; font-weight: 700;">
              (${(agg.decomp.rnoa * 100).toFixed(2)}% - ${(agg.decomp.nbc * 100).toFixed(2)}%)
            </span>
            <span style="color: #cbd5e1;">]</span>
          </div>

          <div style="font-size: 0.75rem; color: #94a3b8; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
            <span>Core Operating: <strong>${(agg.decomp.rnoa * 100).toFixed(1)}%</strong></span>
            <span>•</span>
            <span>Leverage Boost: <strong style="color: ${agg.decomp.leverageEffect >= 0 ? '#34d399' : '#f87171'}">${(agg.decomp.leverageEffect >= 0 ? '+' : '')}${(agg.decomp.leverageEffect * 100).toFixed(2)}%</strong></span>
            <span>•</span>
            <span>Borrowing Cost (NBC): <strong>${(agg.decomp.nbc * 100).toFixed(1)}%</strong></span>
            <span>•</span>
            <span>Spread: <strong style="color: ${agg.decomp.spread >= 0 ? '#34d399' : '#f87171'}">${(agg.decomp.spread * 100).toFixed(2)}%</strong> (${agg.decomp.spread >= 0 ? 'Favorable Leverage' : 'Unfavorable Penalty'})</span>
          </div>
        </div>

        <!-- Interactive Balance Sheet Reclassification Table -->
        <div style="border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.625rem; overflow: hidden;">
          <div style="background: var(--color-gray-50, #f8fafc); padding: 0.75rem 1rem; border-bottom: 1px solid var(--color-border, #e2e8f0); display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-700, #334155);">
              Balance Sheet Line Items & Reclassification
            </div>
            <div style="font-size: 0.75rem; color: var(--color-gray-500, #64748b);">
              Toggle items between Operating & Financial classes
            </div>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem;">
              <thead>
                <tr style="background: #f8fafc; text-align: left; color: var(--color-gray-600, #475569); border-bottom: 1px solid var(--color-border, #e2e8f0);">
                  <th style="padding: 0.625rem 1rem;">Line Item</th>
                  <th style="padding: 0.625rem 1rem; width: 100px;">Type</th>
                  <th style="padding: 0.625rem 1rem; width: 110px; text-align: right;">Amount</th>
                  <th style="padding: 0.625rem 1rem; width: 140px;">Classification</th>
                </tr>
              </thead>
              <tbody>
                ${balanceSheetItems.map((item, index) => `
                  <tr style="border-bottom: 1px solid #f1f5f9; background: ${index % 2 === 0 ? '#fff' : '#fcfcfd'};">
                    <td style="padding: 0.625rem 1rem; font-weight: 500; color: var(--color-gray-800, #1e293b);">
                      ${item.item}
                    </td>
                    <td style="padding: 0.625rem 1rem; text-transform: capitalize; color: var(--color-gray-500, #64748b);">
                      ${item.type}
                    </td>
                    <td style="padding: 0.625rem 1rem; text-align: right; font-family: var(--font-mono, monospace); font-weight: 600;">
                      $${item.value}
                    </td>
                    <td style="padding: 0.625rem 1rem;">
                      ${item.type === 'equity' ? `
                        <span style="font-size: 0.75rem; font-weight: 600; color: #475569; background: #e2e8f0; padding: 0.125rem 0.5rem; border-radius: 0.25rem;">
                          Equity
                        </span>
                      ` : `
                        <select
                          class="fsr-class-select"
                          data-item-id="${item.id}"
                          style="font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 0.25rem; border: 1px solid var(--color-border, #cbd5e1); background: ${item.class === 'operating' ? '#ecfdf5' : '#eff6ff'}; color: ${item.class === 'operating' ? '#065f46' : '#1e40af'}; cursor: pointer;"
                        >
                          <option value="operating" ${item.class === 'operating' ? 'selected' : ''}>Operating</option>
                          <option value="financial" ${item.class === 'financial' ? 'selected' : ''}>Financial</option>
                        </select>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Step-by-Step Show Work Container -->
        <div id="fsr-show-work-mount"></div>

      </div>
    `;

    // Render step-by-step show-work breakdown
    const swMount = container.querySelector('#fsr-show-work-mount');
    if (swMount) {
      const steps = [
        {
          step: 1,
          label: 'Net Operating Assets (NOA)',
          formula: 'NOA = Operating Assets (OA) - Operating Liabilities (OL)',
          values: `$${agg.oa} - $${agg.ol}`,
          result: `$${agg.noa}`,
          note: 'Represents the net capital invested purely in core business operations.',
        },
        {
          step: 2,
          label: 'Net Financial Obligations (NFO)',
          formula: 'NFO = Financial Debt (FO) - Financial Assets (FA)',
          values: `$${agg.fo} - $${agg.fa}`,
          result: `$${agg.nfo}`,
          note: 'Net interest-bearing obligations owed to outside debtholders.',
        },
        {
          step: 3,
          label: 'Common Shareholders\' Equity (CSE)',
          formula: 'CSE = Net Operating Assets (NOA) - Net Financial Obligations (NFO)',
          values: `$${agg.noa} - $${agg.nfo}`,
          result: `$${agg.cse}`,
          note: 'Fundamental Penman financing identity: Operating assets minus net debt equals equity.',
        },
        {
          step: 4,
          label: 'Return on Net Operating Assets (RNOA)',
          formula: 'RNOA = Operating Income (NOPAT) ÷ Net Operating Assets (NOA)',
          values: `$${agg.oi} ÷ $${agg.noa}`,
          result: `${(agg.decomp.rnoa * 100).toFixed(2)}%`,
          note: 'True measure of operating excellence unclouded by debt leverage.',
        },
        {
          step: 5,
          label: 'Net Borrowing Cost (NBC)',
          formula: 'NBC = Net Financial Expense (NFE) ÷ Net Financial Obligations (NFO)',
          values: `$${agg.nfe} ÷ $${agg.nfo}`,
          result: `${(agg.decomp.nbc * 100).toFixed(2)}%`,
          note: 'Effective after-tax interest rate paid on net borrowings.',
        },
        {
          step: 6,
          label: 'Operating Spread',
          formula: 'Spread = RNOA - NBC',
          values: `${(agg.decomp.rnoa * 100).toFixed(2)}% - ${(agg.decomp.nbc * 100).toFixed(2)}%`,
          result: `${(agg.decomp.spread * 100).toFixed(2)}%`,
          note: agg.decomp.spread > 0 ? 'Positive: Every dollar of debt earns more in operations than it costs to borrow.' : 'Negative: Debt cost exceeds operating returns, destroying equity value.',
        },
        {
          step: 7,
          label: 'Penman ROE Decomposition',
          formula: 'ROE = RNOA + [FLEV × Spread]',
          values: `${(agg.decomp.rnoa * 100).toFixed(2)}% + [${agg.decomp.flev.toFixed(2)} × ${(agg.decomp.spread * 100).toFixed(2)}%]`,
          result: `${(agg.decomp.roe * 100).toFixed(2)}%`,
          highlight: true,
          note: `Decomposes equity return into core operations (${(agg.decomp.rnoa * 100).toFixed(2)}%) and financing leverage contribution (${(agg.decomp.leverageEffect >= 0 ? '+' : '')}${(agg.decomp.leverageEffect * 100).toFixed(2)}%). Matches Comprehensive Income ÷ CSE ($${agg.netIncome} ÷ $${agg.cse} = ${(agg.decomp.roe * 100).toFixed(2)}%).`,
        },
      ];

      renderShowWork(swMount, steps, {
        title: 'Step-by-Step Penman ROE Decomposition & Formula Breakdown',
        defaultOpen: false,
        id: 'fsr-sw-panel',
      });
    }

    // Attach view switcher listeners
    const btnRef = container.querySelector('#fsr-btn-reformulated');
    const btnStd = container.querySelector('#fsr-btn-standard');

    if (btnRef) {
      const onRef = () => {
        currentConfig.viewMode = 'reformulated';
        render();
      };
      btnRef.addEventListener('click', onRef);
      listeners.push({ el: btnRef, type: 'click', fn: onRef });
    }

    if (btnStd) {
      const onStd = () => {
        currentConfig.viewMode = 'standard';
        render();
      };
      btnStd.addEventListener('click', onStd);
      listeners.push({ el: btnStd, type: 'click', fn: onStd });
    }

    // Attach reclassification dropdown listeners
    container.querySelectorAll('.fsr-class-select').forEach(sel => {
      const itemId = sel.getAttribute('data-item-id');
      const onSelect = (e) => {
        const newClass = e.target.value;
        const target = balanceSheetItems.find(it => it.id === itemId);
        if (target) {
          target.class = newClass;
          render();
        }
      };
      sel.addEventListener('change', onSelect);
      listeners.push({ el: sel, type: 'change', fn: onSelect });
    });
  }

  render();

  return {
    destroy() {
      listeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
      listeners = [];
      container.innerHTML = '';
    },

    update(newConfig = {}) {
      currentConfig = { ...currentConfig, ...newConfig };
      if (newConfig.balance_sheet) {
        balanceSheetItems = JSON.parse(JSON.stringify(newConfig.balance_sheet));
      }
      if (newConfig.income_statement) {
        incomeStatementItems = JSON.parse(JSON.stringify(newConfig.income_statement));
      }
      render();
    },

    getAggregates() {
      return computeAggregates();
    },
  };
}
