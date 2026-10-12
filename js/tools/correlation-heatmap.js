/**
 * correlation-heatmap.js — N×N Asset Correlation Matrix Visualizer
 * Visualizes pairwise cross-asset correlations with a diverging color gradient (-1.0 blue to +1.0 crimson),
 * interactive hover tooltips, symmetric live editing, and Bodie portfolio diversification index metrics.
 * Follows component contract in ADR-0003: create(container, config) -> { destroy(), update(newConfig) }
 */

import {
  calcAverageCorrelation,
  calcPortfolioDiversification,
} from '../lib/finance-math/portfolio.js';

export const HEATMAP_PRESETS = {
  bodie_core: {
    name: 'Bodie Multi-Asset Core',
    assets: ['SPY', 'TLT', 'GLD', 'VNQ'],
    matrix: [
      [1.00, -0.30, 0.10, 0.60],
      [-0.30, 1.00, 0.20, -0.10],
      [0.10, 0.20, 1.00, 0.15],
      [0.60, -0.10, 0.15, 1.00],
    ],
    vols: [0.18, 0.14, 0.15, 0.22],
  },
  all_weather: {
    name: 'All-Weather Risk Parity',
    assets: ['Equities', 'Long Bond', 'Interm Bond', 'Commodities', 'Gold'],
    matrix: [
      [1.00, -0.25, -0.10, 0.35, 0.10],
      [-0.25, 1.00, 0.80, -0.15, 0.25],
      [-0.10, 0.80, 1.00, -0.10, 0.15],
      [0.35, -0.15, -0.10, 1.00, 0.30],
      [0.10, 0.25, 0.15, 0.30, 1.00],
    ],
    vols: [0.18, 0.15, 0.07, 0.19, 0.16],
  },
  crisis_panic: {
    name: 'Crisis Contagion (Correlations -> 1.0)',
    assets: ['US Eq', 'Dev Intl', 'EM Eq', 'High Yield', 'Real Estate'],
    matrix: [
      [1.00, 0.88, 0.82, 0.79, 0.85],
      [0.88, 1.00, 0.86, 0.75, 0.80],
      [0.82, 0.86, 1.00, 0.78, 0.82],
      [0.79, 0.75, 0.78, 1.00, 0.74],
      [0.85, 0.80, 0.82, 0.74, 1.00],
    ],
    vols: [0.32, 0.34, 0.38, 0.25, 0.35],
  },
  uncorrelated_alpha: {
    name: 'Uncorrelated Alpha Sources',
    assets: ['Factor A', 'Factor B', 'Factor C', 'Factor D'],
    matrix: [
      [1.00, 0.04, -0.05, 0.02],
      [0.04, 1.00, 0.01, -0.03],
      [-0.05, 0.01, 1.00, 0.06],
      [0.02, -0.03, 0.06, 1.00],
    ],
    vols: [0.12, 0.10, 0.11, 0.13],
  },
};

/**
 * Interpolate RGB color for correlation value in [-1.0, 1.0].
 * -1.0 -> Deep Blue (30, 64, 175)
 *  0.0 -> Neutral Slate/White (248, 250, 252)
 * +1.0 -> Deep Crimson Red (185, 28, 28)
 */
export function getCorrelationColor(corr) {
  const c = Math.max(-1, Math.min(1, corr));
  if (c < 0) {
    const t = -c; // 0 to 1
    const r = Math.round(248 * (1 - t) + 30 * t);
    const g = Math.round(250 * (1 - t) + 64 * t);
    const b = Math.round(252 * (1 - t) + 175 * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = c; // 0 to 1
    const r = Math.round(248 * (1 - t) + 185 * t);
    const g = Math.round(250 * (1 - t) + 28 * t);
    const b = Math.round(252 * (1 - t) + 28 * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

/**
 * Return contrasting text color (white for high saturation, dark slate for light)
 */
export function getTextColorForCorr(corr) {
  return Math.abs(corr) > 0.45 ? '#ffffff' : '#1e293b';
}

function fmtCorr(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  if (val === 1) return '1.00';
  if (val === -1) return '-1.00';
  const s = Number(val).toFixed(2);
  return val > 0 ? `+${s}` : s;
}

/**
 * Create Correlation Heatmap component instance.
 */
export function create(container, config = {}) {
  if (!container) throw new Error('correlation-heatmap requires a container element');

  let state = {
    assets: Array.isArray(config.assets) && config.assets.length > 0
      ? [...config.assets]
      : [...HEATMAP_PRESETS.bodie_core.assets],
    matrix: Array.isArray(config.matrix) && config.matrix.length > 0
      ? JSON.parse(JSON.stringify(config.matrix))
      : JSON.parse(JSON.stringify(HEATMAP_PRESETS.bodie_core.matrix)),
    vols: Array.isArray(config.vols) && config.vols.length > 0
      ? [...config.vols]
      : [...HEATMAP_PRESETS.bodie_core.vols],
    activeHover: null, // { i, j }
    activeEdit: null, // { i, j }
  };

  // Ensure matrix is square and symmetric
  ensureMatrixIntegrity();

  function ensureMatrixIntegrity() {
    const n = state.assets.length;
    while (state.matrix.length < n) {
      state.matrix.push(Array(n).fill(0));
    }
    for (let i = 0; i < n; i++) {
      if (!Array.isArray(state.matrix[i])) {
        state.matrix[i] = Array(n).fill(0);
      }
      while (state.matrix[i].length < n) {
        state.matrix[i].push(0);
      }
      state.matrix[i][i] = 1.0; // diagonal is 1
      for (let j = 0; j < i; j++) {
        // enforce symmetry
        state.matrix[j][i] = state.matrix[i][j];
      }
    }
    if (!state.vols || state.vols.length !== n) {
      state.vols = Array(n).fill(0.20);
    }
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'correlation-heatmap-widget';
  wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 1.5rem; font-family: var(--font-sans, system-ui, sans-serif); color: var(--color-gray-900, #1f2937);';

  container.innerHTML = '';
  container.appendChild(wrapper);

  function render() {
    ensureMatrixIntegrity();
    const n = state.assets.length;
    const divMetrics = calcPortfolioDiversification(state.matrix, state.vols);
    const avgCorr = divMetrics.avgCorr;

    wrapper.innerHTML = `
      <div class="tool-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--color-border, #e5e7eb); padding-bottom: 1rem;">
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 700; margin: 0 0 0.25rem 0; color: var(--color-gray-900, #111827);">
            Asset Correlation Heatmap & Diversification Index
          </h2>
          <p style="font-size: 0.875rem; color: var(--color-text-secondary, #6b7280); margin: 0;">
            Interactive N×N cross-asset correlation matrix. Click any off-diagonal cell to adjust pairwise correlation.
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <label style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--color-text-secondary, #6b7280);">Preset:</label>
          <select id="heatmap-preset-select" style="padding: 0.4rem 0.6rem; font-size: 0.8125rem; border: 1px solid var(--color-border, #d1d5db); border-radius: var(--radius-md, 0.375rem); background: var(--color-surface, #fff); cursor: pointer;">
            <option value="bodie_core">Bodie Core 4-Asset</option>
            <option value="all_weather">All-Weather Risk Parity</option>
            <option value="crisis_panic">Crisis Contagion</option>
            <option value="uncorrelated_alpha">Uncorrelated Alpha</option>
          </select>
        </div>
      </div>

      <!-- Heatmap Grid Container -->
      <div style="background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e5e7eb); border-radius: var(--radius-lg, 0.5rem); padding: 1.5rem; overflow-x: auto;">
        <div style="display: inline-block; min-width: 100%;">
          <table style="border-collapse: separate; border-spacing: 4px; margin: 0 auto; user-select: none;">
            <thead>
              <tr>
                <th style="padding: 0.5rem 0.75rem; text-align: right; font-size: 0.75rem; color: #64748b; font-weight: 700;">Asset</th>
                ${state.assets.map((asset, j) => `
                  <th class="col-hdr" data-col="${j}" style="padding: 0.5rem 0.75rem; text-align: center; font-size: 0.8125rem; font-weight: 700; color: #334155; min-width: 65px; border-radius: 4px; transition: background 0.15s ease;">
                    ${asset}
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${state.assets.map((assetI, i) => `
                <tr>
                  <th class="row-hdr" data-row="${i}" style="padding: 0.5rem 0.75rem; text-align: right; font-size: 0.8125rem; font-weight: 700; color: #334155; border-radius: 4px; transition: background 0.15s ease; white-space: nowrap;">
                    ${assetI}
                  </th>
                  ${state.assets.map((assetJ, j) => {
                    const corr = state.matrix[i][j];
                    const bg = getCorrelationColor(corr);
                    const textColor = getTextColorForCorr(corr);
                    const isDiag = i === j;
                    const isEditing = state.activeEdit && state.activeEdit.i === i && state.activeEdit.j === j;

                    return `
                      <td
                        class="heatmap-cell"
                        data-row="${i}"
                        data-col="${j}"
                        style="
                          position: relative;
                          width: 68px;
                          height: 52px;
                          text-align: center;
                          vertical-align: middle;
                          background: ${bg};
                          color: ${textColor};
                          font-weight: 700;
                          font-size: 0.8125rem;
                          font-family: var(--font-mono, monospace);
                          border-radius: 6px;
                          cursor: ${isDiag ? 'default' : 'pointer'};
                          box-shadow: ${isDiag ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.05)'};
                          transition: transform 0.1s ease, box-shadow 0.1s ease;
                        "
                        title="${assetI} vs ${assetJ}: ${fmtCorr(corr)}"
                      >
                        ${isEditing ? `
                          <input
                            type="number"
                            class="cell-edit-input"
                            data-row="${i}"
                            data-col="${j}"
                            min="-1"
                            max="1"
                            step="0.05"
                            value="${corr.toFixed(2)}"
                            style="width: 54px; font-size: 0.75rem; padding: 0.2rem; text-align: center; font-weight: 700; border: 2px solid #2563eb; border-radius: 4px;"
                          />
                        ` : `
                          ${fmtCorr(corr)}
                        `}
                      </td>
                    `;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Colorbar Gradient Legend -->
          <div style="margin-top: 1.5rem; max-width: 480px; margin-left: auto; margin-right: auto;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.25rem;">
              <span style="color: #1e40af;">-1.0 (Inverse / Perfect Hedge)</span>
              <span style="color: #64748b;">0.0 (Uncorrelated)</span>
              <span style="color: #b91c1c;">+1.0 (Comovement)</span>
            </div>
            <div style="height: 14px; border-radius: 7px; background: linear-gradient(to right, rgb(30, 64, 175) 0%, rgb(147, 197, 253) 30%, rgb(248, 250, 252) 50%, rgb(252, 165, 165) 70%, rgb(185, 28, 28) 100%); border: 1px solid #cbd5e1; box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);"></div>
          </div>
        </div>
      </div>

      <!-- Bodie Portfolio Diversification Metrics -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
        <div style="background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e5e7eb); border-radius: var(--radius-lg, 0.5rem); padding: 1.25rem;">
          <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 0.25rem;">
            Average Pairwise Correlation (ρ̄)
          </div>
          <div style="font-size: 1.75rem; font-weight: 800; color: ${avgCorr > 0.6 ? '#dc2626' : (avgCorr < 0.2 ? '#2563eb' : '#0f172a')};" id="kpi-avg-corr">
            ${fmtCorr(avgCorr)}
          </div>
          <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">
            Across ${n * (n - 1) / 2} unique asset pairs
          </div>
        </div>

        <div style="background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e5e7eb); border-radius: var(--radius-lg, 0.5rem); padding: 1.25rem;">
          <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 0.25rem;">
            Diversification Ratio (DR)
          </div>
          <div style="font-size: 1.75rem; font-weight: 800; color: #16a34a;" id="kpi-div-ratio">
            ${divMetrics.divRatio.toFixed(2)}x
          </div>
          <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">
            Weighted Asset Vol / Portfolio Vol (${(divMetrics.avgVol * 100).toFixed(1)}% → ${(divMetrics.portVol * 100).toFixed(1)}%)
          </div>
        </div>

        <div style="background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e5e7eb); border-radius: var(--radius-lg, 0.5rem); padding: 1.25rem;">
          <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 0.25rem;">
            Variance Reduction vs ρ=1
          </div>
          <div style="font-size: 1.75rem; font-weight: 800; color: #7c3aed;" id="kpi-div-benefit">
            ${divMetrics.divBenefitPct.toFixed(0)}%
          </div>
          <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">
            Diversification benefit (1 - ρ̄)
          </div>
        </div>
      </div>

      <!-- Qualitative Callout -->
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 1rem 1.25rem; border-radius: 0 var(--radius-md, 0.375rem) var(--radius-md, 0.375rem) 0; font-size: 0.875rem; color: #334155;">
        <strong style="color: #1e40af;">Bodie Modern Portfolio Theory Insight:</strong>
        As the number of holdings expands, individual asset variance vanishes and total portfolio variance converges directly to average covariance:
        <span style="font-family: var(--font-mono, monospace); font-size: 0.8125rem;">σ²_p ≈ ρ̄ · σ̄²</span>.
        Negative and near-zero correlations yield the greatest diversification free lunch.
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Preset dropdown
    const presetSelect = wrapper.querySelector('#heatmap-preset-select');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        const p = HEATMAP_PRESETS[e.target.value];
        if (p) {
          state.assets = [...p.assets];
          state.matrix = JSON.parse(JSON.stringify(p.matrix));
          state.vols = [...p.vols];
          state.activeEdit = null;
          render();
        }
      });
    }

    // Cell hover highlight
    wrapper.querySelectorAll('.heatmap-cell').forEach(cell => {
      cell.addEventListener('mouseenter', (e) => {
        const r = parseInt(cell.getAttribute('data-row'), 10);
        const c = parseInt(cell.getAttribute('data-col'), 10);
        const rowHdr = wrapper.querySelector(`.row-hdr[data-row="${r}"]`);
        const colHdr = wrapper.querySelector(`.col-hdr[data-col="${c}"]`);
        if (rowHdr) rowHdr.style.background = '#e2e8f0';
        if (colHdr) colHdr.style.background = '#e2e8f0';
        cell.style.transform = 'scale(1.06)';
        cell.style.zIndex = '5';
      });

      cell.addEventListener('mouseleave', (e) => {
        const r = parseInt(cell.getAttribute('data-row'), 10);
        const c = parseInt(cell.getAttribute('data-col'), 10);
        const rowHdr = wrapper.querySelector(`.row-hdr[data-row="${r}"]`);
        const colHdr = wrapper.querySelector(`.col-hdr[data-col="${c}"]`);
        if (rowHdr) rowHdr.style.background = 'transparent';
        if (colHdr) colHdr.style.background = 'transparent';
        cell.style.transform = 'scale(1)';
        cell.style.zIndex = '1';
      });

      // Cell click to edit
      cell.addEventListener('click', (e) => {
        const r = parseInt(cell.getAttribute('data-row'), 10);
        const c = parseInt(cell.getAttribute('data-col'), 10);
        if (r === c) return; // Cannot edit diagonal 1.00

        // If clicking input, ignore
        if (e.target.tagName === 'INPUT') return;

        state.activeEdit = { i: r, j: c };
        render();

        const input = wrapper.querySelector(`.cell-edit-input[data-row="${r}"][data-col="${c}"]`);
        if (input) {
          input.focus();
          input.select();
        }
      });
    });

    // Handle input editing
    const activeInput = wrapper.querySelector('.cell-edit-input');
    if (activeInput) {
      const commit = () => {
        const r = parseInt(activeInput.getAttribute('data-row'), 10);
        const c = parseInt(activeInput.getAttribute('data-col'), 10);
        let val = parseFloat(activeInput.value);
        if (isNaN(val)) val = 0;
        val = Math.max(-1.0, Math.min(1.0, val));
        state.matrix[r][c] = val;
        state.matrix[c][r] = val; // enforce symmetry
        state.activeEdit = null;
        render();
      };

      activeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          commit();
        } else if (e.key === 'Escape') {
          state.activeEdit = null;
          render();
        }
      });

      activeInput.addEventListener('blur', () => {
        commit();
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
      if (Array.isArray(newConfig.assets)) {
        state.assets = [...newConfig.assets];
      }
      if (Array.isArray(newConfig.matrix)) {
        state.matrix = JSON.parse(JSON.stringify(newConfig.matrix));
      }
      if (Array.isArray(newConfig.vols)) {
        state.vols = [...newConfig.vols];
      }
      state.activeEdit = null;
      render();
    },
    getState() {
      return JSON.parse(JSON.stringify(state));
    },
  };
}

