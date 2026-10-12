/**
 * multiples-table.js — Comparable Company Multiples & Valuation Summary
 * Interactive peer comparables table with EV/EBITDA, P/E, P/B, harmonic vs arithmetic averages,
 * editable comps and target metrics, and a football-field valuation summary.
 * Follows component contract in ADR-0003: create(container, config) -> { destroy(), update(newConfig) }
 */

import {
  harmonicMean,
  arithmeticMean,
  median,
  compSummaryStats,
  impliedValuationForMetric,
  computeValuationRanges,
} from '../lib/finance-math/multiples.js';

export const MULTIPLES_PRESETS = {
  default: {
    name: 'Easton & Lundholm Baseline',
    target: { ebitda: 100, earnings: 60, book_value: 400, net_debt: 50, shares: 25 },
    comps: [
      { name: 'Peer Alpha', ev_ebitda: 12.0, pe: 20.0, pb: 2.5 },
      { name: 'Peer Beta', ev_ebitda: 10.0, pe: 18.0, pb: 2.0 },
      { name: 'Peer Gamma', ev_ebitda: 14.0, pe: 22.0, pb: 3.0 },
      { name: 'Peer Delta', ev_ebitda: 11.0, pe: 19.0, pb: 2.2 },
    ],
    weights: { ev_ebitda: 0.5, pe: 0.3, pb: 0.2 },
    meanType: 'harmonic',
  },
  tech_growth: {
    name: 'Tech & Growth Peers',
    target: { ebitda: 80, earnings: 45, book_value: 200, net_debt: -20, shares: 15 },
    comps: [
      { name: 'CloudScale Inc', ev_ebitda: 22.0, pe: 35.0, pb: 6.5 },
      { name: 'DataCore Labs', ev_ebitda: 18.5, pe: 28.0, pb: 5.2 },
      { name: 'OmniSaaS', ev_ebitda: 25.0, pe: 42.0, pb: 7.8 },
      { name: 'CyberPulse', ev_ebitda: 20.0, pe: 32.0, pb: 6.0 },
    ],
    weights: { ev_ebitda: 0.6, pe: 0.3, pb: 0.1 },
    meanType: 'harmonic',
  },
  value_industrials: {
    name: 'Mature Industrials & Value',
    target: { ebitda: 250, earnings: 140, book_value: 1200, net_debt: 350, shares: 50 },
    comps: [
      { name: 'Apex Heavy Corp', ev_ebitda: 7.5, pe: 12.0, pb: 1.4 },
      { name: 'Continental Fab', ev_ebitda: 8.2, pe: 13.5, pb: 1.6 },
      { name: 'Vanguard Foundries', ev_ebitda: 6.8, pe: 11.2, pb: 1.3 },
      { name: 'Nordic Machinery', ev_ebitda: 8.8, pe: 14.0, pb: 1.7 },
    ],
    weights: { ev_ebitda: 0.45, pe: 0.35, pb: 0.20 },
    meanType: 'harmonic',
  },
};

/**
 * Format currency in millions or dollar amount
 */
function fmtCurrency(val, decimals = 1) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return '$' + Number(val).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtMultiple(val, decimals = 1) {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return '—';
  return Number(val).toFixed(decimals) + 'x';
}

/**
 * Create Multiples Table component instance.
 */
export function create(container, config = {}) {
  if (!container) throw new Error('multiples-table requires a container element');

  let state = {
    target: {
      ebitda: config.target?.ebitda ?? 100,
      earnings: config.target?.earnings ?? 60,
      book_value: config.target?.book_value ?? 400,
      net_debt: config.target?.net_debt ?? 50,
      shares: config.target?.shares ?? 25,
    },
    comps: Array.isArray(config.comps) && config.comps.length > 0
      ? JSON.parse(JSON.stringify(config.comps))
      : JSON.parse(JSON.stringify(MULTIPLES_PRESETS.default.comps)),
    weights: {
      ev_ebitda: config.weights?.ev_ebitda ?? 0.5,
      pe: config.weights?.pe ?? 0.3,
      pb: config.weights?.pb ?? 0.2,
    },
    meanType: config.meanType || 'harmonic', // 'harmonic' | 'arithmetic' | 'median'
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'multiples-table-widget';
  wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 1.5rem; font-family: var(--font-sans, system-ui, sans-serif); color: var(--color-gray-900, #1f2937);';

  container.innerHTML = '';
  container.appendChild(wrapper);

  function render() {
    const valuation = computeValuationRanges({
      target: state.target,
      comps: state.comps,
      weights: state.weights,
      meanType: state.meanType,
      netDebt: state.target.net_debt,
    });

    // Compute metric summary stats for table footer
    const ebitdaStats = compSummaryStats(state.comps.map(c => c.ev_ebitda));
    const peStats = compSummaryStats(state.comps.map(c => c.pe));
    const pbStats = compSummaryStats(state.comps.map(c => c.pb));

    // Determine max valuation for football field scaling
    const allHighs = [
      valuation.metrics.ev_ebitda?.high?.impliedEquity || 0,
      valuation.metrics.pe?.high?.impliedEquity || 0,
      valuation.metrics.pb?.high?.impliedEquity || 0,
      valuation.blended.equity.high || 0,
    ];
    const maxScale = Math.max(...allHighs, 100) * 1.15;

    wrapper.innerHTML = `
      <div class="tool-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--color-border, #e5e7eb); padding-bottom: 1rem;">
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 700; margin: 0 0 0.25rem 0; color: var(--color-gray-900, #111827);">
            Comparable Company Multiples & Valuation Summary
          </h2>
          <p style="font-size: 0.875rem; color: var(--color-text-secondary, #6b7280); margin: 0;">
            Relative valuation using Enterprise and Equity multiples with harmonic mean bias correction (Easton & Lundholm).
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <label style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--color-text-secondary, #6b7280);">Preset:</label>
          <select id="comps-preset-select" style="padding: 0.4rem 0.6rem; font-size: 0.8125rem; border: 1px solid var(--color-border, #d1d5db); border-radius: var(--radius-md, 0.375rem); background: var(--color-surface, #fff); cursor: pointer;">
            <option value="default">Easton Baseline</option>
            <option value="tech_growth">Tech & Growth Peers</option>
            <option value="value_industrials">Mature Industrials</option>
          </select>
        </div>
      </div>

      <!-- Target Company Financials Bar -->
      <div style="background: var(--color-gray-50, #f9fafb); border: 1px solid var(--color-border, #e5e7eb); border-radius: var(--radius-lg, 0.5rem); padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h3 style="font-size: 0.875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-primary, #1e40af); margin: 0;">
            Target Company Financial Fundamentals ($ Millions)
          </h3>
          <span style="font-size: 0.75rem; color: var(--color-text-secondary, #6b7280);">Editable metrics</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1rem;">
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">EBITDA ($M)</label>
            <input type="number" id="target-ebitda" value="${state.target.ebitda}" step="5" style="width: 100%; padding: 0.4rem 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-weight: 600;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">Net Income / Earnings ($M)</label>
            <input type="number" id="target-earnings" value="${state.target.earnings}" step="5" style="width: 100%; padding: 0.4rem 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-weight: 600;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">Book Value of Equity ($M)</label>
            <input type="number" id="target-book-value" value="${state.target.book_value}" step="20" style="width: 100%; padding: 0.4rem 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-weight: 600;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">Net Debt ($M)</label>
            <input type="number" id="target-net-debt" value="${state.target.net_debt}" step="10" style="width: 100%; padding: 0.4rem 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-weight: 600;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">Shares Outstanding (M)</label>
            <input type="number" id="target-shares" value="${state.target.shares || 25}" step="1" style="width: 100%; padding: 0.4rem 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; font-weight: 600;" />
          </div>
        </div>
      </div>

      <!-- Peer Comparables Table -->
      <div style="background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e5e7eb); border-radius: var(--radius-lg, 0.5rem); overflow: hidden;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; background: var(--color-gray-50, #f9fafb); border-bottom: 1px solid var(--color-border, #e5e7eb);">
          <div>
            <h3 style="font-size: 0.9375rem; font-weight: 700; margin: 0; color: var(--color-gray-900, #111827);">
              Peer Comparables Matrix
            </h3>
            <span style="font-size: 0.75rem; color: var(--color-text-secondary, #6b7280);">
              ${state.comps.length} active peer companies
            </span>
          </div>
          <button id="add-peer-btn" style="padding: 0.4rem 0.75rem; font-size: 0.8125rem; font-weight: 600; background: var(--color-primary, #1e40af); color: #fff; border: none; border-radius: var(--radius-md, 0.375rem); cursor: pointer;">
            + Add Peer
          </button>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem; text-align: left;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid var(--color-border, #e5e7eb); color: #475569; font-size: 0.75rem; text-transform: uppercase;">
                <th style="padding: 0.75rem 1rem;">Peer Company</th>
                <th style="padding: 0.75rem 1rem;">EV / EBITDA</th>
                <th style="padding: 0.75rem 1rem;">P / E</th>
                <th style="padding: 0.75rem 1rem;">P / B</th>
                <th style="padding: 0.75rem 1rem; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody id="comps-table-body">
              ${state.comps.map((comp, idx) => `
                <tr style="border-bottom: 1px solid var(--color-border, #f1f5f9);" data-comp-idx="${idx}">
                  <td style="padding: 0.6rem 1rem;">
                    <input type="text" class="comp-name-input" data-idx="${idx}" value="${comp.name}" style="padding: 0.3rem 0.5rem; font-weight: 600; border: 1px solid #d1d5db; border-radius: 4px; width: 100%; max-width: 180px;" />
                  </td>
                  <td style="padding: 0.6rem 1rem;">
                    <input type="number" class="comp-metric-input" data-idx="${idx}" data-metric="ev_ebitda" step="0.5" value="${comp.ev_ebitda ?? ''}" style="padding: 0.3rem 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; width: 85px;" />
                  </td>
                  <td style="padding: 0.6rem 1rem;">
                    <input type="number" class="comp-metric-input" data-idx="${idx}" data-metric="pe" step="0.5" value="${comp.pe ?? ''}" style="padding: 0.3rem 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; width: 85px;" />
                  </td>
                  <td style="padding: 0.6rem 1rem;">
                    <input type="number" class="comp-metric-input" data-idx="${idx}" data-metric="pb" step="0.1" value="${comp.pb ?? ''}" style="padding: 0.3rem 0.5rem; border: 1px solid #d1d5db; border-radius: 4px; width: 85px;" />
                  </td>
                  <td style="padding: 0.6rem 1rem; text-align: center;">
                    <button class="delete-peer-btn" data-idx="${idx}" style="background: none; border: none; color: #ef4444; font-size: 1rem; cursor: pointer; padding: 0.2rem 0.5rem;" title="Remove Peer">✕</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background: #f8fafc; border-top: 2px solid var(--color-border, #e2e8f0); font-weight: 600; color: #64748b; font-size: 0.8125rem;">
                <td style="padding: 0.5rem 1rem;">Minimum</td>
                <td style="padding: 0.5rem 1rem;">${fmtMultiple(ebitdaStats.min)}</td>
                <td style="padding: 0.5rem 1rem;">${fmtMultiple(peStats.min)}</td>
                <td style="padding: 0.5rem 1rem;">${fmtMultiple(pbStats.min)}</td>
                <td></td>
              </tr>
              <tr style="background: ${state.meanType === 'harmonic' ? '#eff6ff' : '#f8fafc'}; border-top: 1px solid var(--color-border, #e2e8f0); font-weight: 700; color: ${state.meanType === 'harmonic' ? '#1d4ed8' : '#334155'}; font-size: 0.8125rem;">
                <td style="padding: 0.5rem 1rem;">
                  Harmonic Mean ${state.meanType === 'harmonic' ? '✓ (Active)' : ''}
                </td>
                <td style="padding: 0.5rem 1rem;">${fmtMultiple(ebitdaStats.harmonicMean)}</td>
                <td style="padding: 0.5rem 1rem;">${fmtMultiple(peStats.harmonicMean)}</td>
                <td style="padding: 0.5rem 1rem;">${fmtMultiple(pbStats.harmonicMean)}</td>
                <td></td>
              </tr>
              <tr style="background: ${state.meanType === 'arithmetic' ? '#eff6ff' : '#f8fafc'}; border-top: 1px solid var(--color-border, #e2e8f0); font-weight: 700; color: ${state.meanType === 'arithmetic' ? '#1d4ed8' : '#334155'}; font-size: 0.8125rem;">
                <td style="padding: 0.5rem 1rem;">
                  Arithmetic Mean ${state.meanType === 'arithmetic' ? '✓ (Active)' : ''}
                </td>
                <td style="padding: 0.5rem 1rem;">${fmtMultiple(ebitdaStats.arithmeticMean)}</td>
                <td style="padding: 0.5rem 1rem;">${fmtMultiple(peStats.arithmeticMean)}</td>
                <td style="padding: 0.5rem 1rem;">${fmtMultiple(pbStats.arithmeticMean)}</td>
                <td></td>
              </tr>
              <tr style="background: ${state.meanType === 'median' ? '#eff6ff' : '#f8fafc'}; border-top: 1px solid var(--color-border, #e2e8f0); font-weight: 700; color: ${state.meanType === 'median' ? '#1d4ed8' : '#334155'}; font-size: 0.8125rem;">
                <td style="padding: 0.5rem 1rem;">
                  Median ${state.meanType === 'median' ? '✓ (Active)' : ''}
                </td>
                <td style="padding: 0.5rem 1rem;">${fmtMultiple(ebitdaStats.median)}</td>
                <td style="padding: 0.5rem 1rem;">${fmtMultiple(peStats.median)}</td>
                <td style="padding: 0.5rem 1rem;">${fmtMultiple(pbStats.median)}</td>
                <td></td>
              </tr>
              <tr style="background: #f8fafc; border-top: 1px solid var(--color-border, #e2e8f0); font-weight: 600; color: #64748b; font-size: 0.8125rem;">
                <td style="padding: 0.5rem 1rem;">Maximum</td>
                <td style="padding: 0.5rem 1rem;">${fmtMultiple(ebitdaStats.max)}</td>
                <td style="padding: 0.5rem 1rem;">${fmtMultiple(peStats.max)}</td>
                <td style="padding: 0.5rem 1rem;">${fmtMultiple(pbStats.max)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Valuation Settings: Method & Weights -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
        <div style="background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e5e7eb); border-radius: var(--radius-lg, 0.5rem); padding: 1.25rem;">
          <h4 style="font-size: 0.875rem; font-weight: 700; margin: 0 0 0.75rem 0;">Averaging Methodology</h4>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8125rem;">
            <label style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer;">
              <input type="radio" name="mean-type" value="harmonic" ${state.meanType === 'harmonic' ? 'checked' : ''} style="margin-top: 0.2rem;" />
              <div>
                <strong>Harmonic Mean</strong> (Recommended: corrects upward ratio bias)
                <div style="font-size: 0.75rem; color: #64748b;">H = n / Σ(1/x). Prevents expensive outliers from distorting target valuation.</div>
              </div>
            </label>
            <label style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer;">
              <input type="radio" name="mean-type" value="arithmetic" ${state.meanType === 'arithmetic' ? 'checked' : ''} style="margin-top: 0.2rem;" />
              <div>
                <strong>Arithmetic Mean</strong>
                <div style="font-size: 0.75rem; color: #64748b;">A = Σx / n. Simple unweighted average across peers.</div>
              </div>
            </label>
            <label style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer;">
              <input type="radio" name="mean-type" value="median" ${state.meanType === 'median' ? 'checked' : ''} style="margin-top: 0.2rem;" />
              <div>
                <strong>Median</strong>
                <div style="font-size: 0.75rem; color: #64748b;">Middle peer multiple. Robust against extreme skew.</div>
              </div>
            </label>
          </div>
        </div>

        <div style="background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e5e7eb); border-radius: var(--radius-lg, 0.5rem); padding: 1.25rem;">
          <h4 style="font-size: 0.875rem; font-weight: 700; margin: 0 0 0.75rem 0;">Valuation Blending Weights</h4>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">
                <span>EV / EBITDA Weight:</span>
                <span id="label-weight-ebitda">${Math.round(state.weights.ev_ebitda * 100)}%</span>
              </div>
              <input type="range" id="weight-ebitda" min="0" max="100" step="5" value="${Math.round(state.weights.ev_ebitda * 100)}" style="width: 100%;" />
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">
                <span>P / E Weight:</span>
                <span id="label-weight-pe">${Math.round(state.weights.pe * 100)}%</span>
              </div>
              <input type="range" id="weight-pe" min="0" max="100" step="5" value="${Math.round(state.weights.pe * 100)}" style="width: 100%;" />
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; margin-bottom: 0.25rem;">
                <span>P / B Weight:</span>
                <span id="label-weight-pb">${Math.round(state.weights.pb * 100)}%</span>
              </div>
              <input type="range" id="weight-pb" min="0" max="100" step="5" value="${Math.round(state.weights.pb * 100)}" style="width: 100%;" />
            </div>
          </div>
        </div>
      </div>

      <!-- Football-Field Valuation Summary -->
      <div style="background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e5e7eb); border-radius: var(--radius-lg, 0.5rem); padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.25rem;">
          <div>
            <h3 style="font-size: 1rem; font-weight: 700; margin: 0 0 0.25rem 0; color: var(--color-gray-900, #111827);">
              Implied Equity Valuation Range ("Football Field")
            </h3>
            <p style="font-size: 0.8125rem; color: #64748b; margin: 0;">
              Bars show Min to Max implied equity value ($M); vertical tick indicates the ${state.meanType} multiple estimate.
            </p>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${renderFootballBar('EV / EBITDA', valuation.metrics.ev_ebitda, maxScale, '#3b82f6')}
          ${renderFootballBar('P / E', valuation.metrics.pe, maxScale, '#10b981')}
          ${renderFootballBar('P / B', valuation.metrics.pb, maxScale, '#f59e0b')}
          <div style="height: 1px; background: #e2e8f0; margin: 0.25rem 0;"></div>
          ${renderFootballBar('Blended Target Equity', {
            low: { impliedEquity: valuation.blended.equity.low },
            mid: { impliedEquity: valuation.blended.equity.mid },
            high: { impliedEquity: valuation.blended.equity.high },
          }, maxScale, '#8b5cf6', true)}
        </div>

        <!-- Scale Axis -->
        <div style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; font-family: var(--font-mono, monospace);">
          <span>$0M</span>
          <span>${fmtCurrency(maxScale * 0.25, 0)}</span>
          <span>${fmtCurrency(maxScale * 0.50, 0)}</span>
          <span>${fmtCurrency(maxScale * 0.75, 0)}</span>
          <span>${fmtCurrency(maxScale, 0)}</span>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-lg, 0.5rem); padding: 1rem; text-align: center;">
          <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #166534; margin-bottom: 0.25rem;">
            Blended Implied Equity
          </div>
          <div style="font-size: 1.5rem; font-weight: 800; color: #15803d;" id="kpi-blended-equity">
            ${fmtCurrency(valuation.blended.equity.mid, 1)}M
          </div>
          <div style="font-size: 0.75rem; color: #166534; margin-top: 0.25rem;">
            Range: ${fmtCurrency(valuation.blended.equity.low, 0)}M – ${fmtCurrency(valuation.blended.equity.high, 0)}M
          </div>
        </div>

        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: var(--radius-lg, 0.5rem); padding: 1rem; text-align: center;">
          <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #1e40af; margin-bottom: 0.25rem;">
            Implied Share Price
          </div>
          <div style="font-size: 1.5rem; font-weight: 800; color: #1d4ed8;" id="kpi-share-price">
            ${valuation.blended.impliedSharePrice !== null ? fmtCurrency(valuation.blended.impliedSharePrice, 2) : '—'}
          </div>
          <div style="font-size: 0.75rem; color: #1e40af; margin-top: 0.25rem;">
            Based on ${state.target.shares || 25}M shares outstanding
          </div>
        </div>

        <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: var(--radius-lg, 0.5rem); padding: 1rem; text-align: center;">
          <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #6b21a8; margin-bottom: 0.25rem;">
            Implied Enterprise Value
          </div>
          <div style="font-size: 1.5rem; font-weight: 800; color: #7e22ce;" id="kpi-implied-ev">
            ${fmtCurrency(valuation.blended.ev.mid, 1)}M
          </div>
          <div style="font-size: 0.75rem; color: #6b21a8; margin-top: 0.25rem;">
            Equity Value + Net Debt ($${state.target.net_debt}M)
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function renderFootballBar(label, metricData, maxScale, color, isBlended = false) {
    if (!metricData || !metricData.low) return '';
    const low = metricData.low.impliedEquity || 0;
    const mid = metricData.mid.impliedEquity || 0;
    const high = metricData.high.impliedEquity || 0;

    const leftPct = Math.min(100, Math.max(0, (low / maxScale) * 100));
    const widthPct = Math.min(100 - leftPct, Math.max(1, ((high - low) / maxScale) * 100));
    const midPct = Math.min(100, Math.max(0, (mid / maxScale) * 100));

    return `
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; font-weight: ${isBlended ? '700' : '600'}; margin-bottom: 0.35rem; color: ${isBlended ? '#4c1d95' : '#334155'};">
          <span>${label}</span>
          <span>
            ${fmtCurrency(low, 0)}M — <strong>${fmtCurrency(mid, 0)}M</strong> — ${fmtCurrency(high, 0)}M
          </span>
        </div>
        <div style="position: relative; height: ${isBlended ? '26px' : '20px'}; background: #f1f5f9; border-radius: 4px; overflow: visible;">
          <div style="position: absolute; left: ${leftPct}%; width: ${widthPct}%; height: 100%; background: ${color}; opacity: ${isBlended ? '0.85' : '0.65'}; border-radius: 4px;"></div>
          <!-- Midpoint marker -->
          <div style="position: absolute; left: ${midPct}%; top: -3px; bottom: -3px; width: 4px; background: #0f172a; border-radius: 2px; transform: translateX(-50%); z-index: 2;" title="Midpoint: ${fmtCurrency(mid, 1)}M"></div>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    // Preset dropdown
    const presetSelect = wrapper.querySelector('#comps-preset-select');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        const p = MULTIPLES_PRESETS[e.target.value];
        if (p) {
          state.target = JSON.parse(JSON.stringify(p.target));
          state.comps = JSON.parse(JSON.stringify(p.comps));
          state.weights = JSON.parse(JSON.stringify(p.weights));
          state.meanType = p.meanType || 'harmonic';
          render();
        }
      });
    }

    // Target financial inputs
    const ebitdaInput = wrapper.querySelector('#target-ebitda');
    if (ebitdaInput) {
      ebitdaInput.addEventListener('input', (e) => {
        state.target.ebitda = parseFloat(e.target.value) || 0;
        render();
      });
    }

    const earningsInput = wrapper.querySelector('#target-earnings');
    if (earningsInput) {
      earningsInput.addEventListener('input', (e) => {
        state.target.earnings = parseFloat(e.target.value) || 0;
        render();
      });
    }

    const bvInput = wrapper.querySelector('#target-book-value');
    if (bvInput) {
      bvInput.addEventListener('input', (e) => {
        state.target.book_value = parseFloat(e.target.value) || 0;
        render();
      });
    }

    const debtInput = wrapper.querySelector('#target-net-debt');
    if (debtInput) {
      debtInput.addEventListener('input', (e) => {
        state.target.net_debt = parseFloat(e.target.value) || 0;
        render();
      });
    }

    const sharesInput = wrapper.querySelector('#target-shares');
    if (sharesInput) {
      sharesInput.addEventListener('input', (e) => {
        state.target.shares = parseFloat(e.target.value) || 1;
        render();
      });
    }

    // Add peer button
    const addBtn = wrapper.querySelector('#add-peer-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        state.comps.push({
          name: `Peer ${String.fromCharCode(65 + state.comps.length)}`,
          ev_ebitda: 11.0,
          pe: 18.0,
          pb: 2.0,
        });
        render();
      });
    }

    // Comps inputs
    wrapper.querySelectorAll('.comp-name-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (state.comps[idx]) {
          state.comps[idx].name = e.target.value;
        }
      });
    });

    wrapper.querySelectorAll('.comp-metric-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        const metric = e.target.getAttribute('data-metric');
        if (state.comps[idx]) {
          state.comps[idx][metric] = parseFloat(e.target.value) || 0;
          render();
        }
      });
    });

    // Delete peer buttons
    wrapper.querySelectorAll('.delete-peer-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        if (state.comps.length > 1) {
          state.comps.splice(idx, 1);
          render();
        }
      });
    });

    // Mean type radio buttons
    wrapper.querySelectorAll('input[name="mean-type"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          state.meanType = e.target.value;
          render();
        }
      });
    });

    // Weight sliders
    const wEbitda = wrapper.querySelector('#weight-ebitda');
    if (wEbitda) {
      wEbitda.addEventListener('input', (e) => {
        state.weights.ev_ebitda = parseInt(e.target.value, 10) / 100;
        render();
      });
    }
    const wPe = wrapper.querySelector('#weight-pe');
    if (wPe) {
      wPe.addEventListener('input', (e) => {
        state.weights.pe = parseInt(e.target.value, 10) / 100;
        render();
      });
    }
    const wPb = wrapper.querySelector('#weight-pb');
    if (wPb) {
      wPb.addEventListener('input', (e) => {
        state.weights.pb = parseInt(e.target.value, 10) / 100;
        render();
      });
    }
  }

  render();

  return {
    destroy() {
      wrapper.innerHTML = '';
      if (wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
    },
    update(newConfig = {}) {
      if (newConfig.target) {
        state.target = { ...state.target, ...newConfig.target };
      }
      if (Array.isArray(newConfig.comps)) {
        state.comps = JSON.parse(JSON.stringify(newConfig.comps));
      }
      if (newConfig.weights) {
        state.weights = { ...state.weights, ...newConfig.weights };
      }
      if (newConfig.meanType) {
        state.meanType = newConfig.meanType;
      }
      render();
    },
    getState() {
      return JSON.parse(JSON.stringify(state));
    },
  };
}

