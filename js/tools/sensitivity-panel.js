/**
 * sensitivity-panel.js — Generic sensitivity analysis slider component
 * Drives 1–5 input sliders to compute and display live financial outputs and sensitivities.
 * Follows component contract in ADR-0003: create(container, config) -> { destroy(), update(newConfig) }
 */

import {
  blackScholesCall,
  blackScholesPut,
  blackScholesGreeks,
} from '../lib/finance-math/black-scholes.js';
import {
  wacc,
  costOfEquityCAPM,
} from '../lib/finance-math/wacc.js';
import {
  bondPrice,
  macaulayDuration,
  modifiedDuration,
  bondConvexity,
} from '../lib/finance-math/bonds.js';

/**
 * Built-in named compute handlers
 */
const BUILTIN_COMPUTERS = {
  'black-scholes': (vals) => {
    const spot = Number(vals.spot ?? 100);
    const strike = Number(vals.strike ?? 100);
    const rate = Number(vals.rate ?? 0.05);
    const vol = Number(vals.vol ?? 0.20);
    const time = Number(vals.time ?? 1.0);

    const call = blackScholesCall(spot, strike, rate, vol, time);
    const put = blackScholesPut(spot, strike, rate, vol, time);
    const greeks = blackScholesGreeks(spot, strike, rate, vol, time);

    return {
      primary: call,
      primaryLabel: 'Call Price',
      primaryFormat: 'currency',
      secondary: [
        { label: 'Put Price', value: put, format: 'currency' },
        { label: 'Call Delta (Δ)', value: greeks.callDelta, format: 'decimal3' },
        { label: 'Gamma (Γ)', value: greeks.gamma, format: 'decimal4' },
        { label: 'Vega (ν per 1%)', value: greeks.vega, format: 'currency' },
        { label: 'Theta (Θ per day)', value: greeks.callTheta, format: 'currency' },
      ],
    };
  },

  'black-scholes-call': (vals) => {
    const res = BUILTIN_COMPUTERS['black-scholes'](vals);
    return {
      primary: res.primary,
      primaryLabel: 'Call Price',
      primaryFormat: 'currency',
      secondary: res.secondary,
    };
  },

  'wacc': (vals) => {
    const equityVal = Number(vals.equityVal ?? 600);
    const debtVal = Number(vals.debtVal ?? 400);
    const costOfEquity = Number(vals.costOfEquity ?? 0.12);
    const costOfDebt = Number(vals.costOfDebt ?? 0.06);
    const taxRate = Number(vals.taxRate ?? 0.25);

    const waccVal = wacc(equityVal, debtVal, costOfEquity, costOfDebt, taxRate);
    const totalVal = equityVal + debtVal;
    const equityWeight = totalVal > 0 ? equityVal / totalVal : 0;
    const debtWeight = totalVal > 0 ? debtVal / totalVal : 0;
    const afterTaxKd = costOfDebt * (1 - taxRate);

    return {
      primary: waccVal,
      primaryLabel: 'WACC',
      primaryFormat: 'percent',
      secondary: [
        { label: 'Equity Weight (E/V)', value: equityWeight, format: 'percent' },
        { label: 'Debt Weight (D/V)', value: debtWeight, format: 'percent' },
        { label: 'After-tax Cost of Debt', value: afterTaxKd, format: 'percent' },
        { label: 'Total Capital (V)', value: totalVal, format: 'currency0' },
      ],
    };
  },

  'duration': (vals) => {
    const face = Number(vals.face ?? 1000);
    const couponRate = Number(vals.couponRate ?? 0.08);
    const ytm = Number(vals.ytm ?? 0.08);
    const years = Number(vals.years ?? 10);
    const freq = Number(vals.freq ?? 2);

    const price = bondPrice(face, couponRate, ytm, years, freq);
    const macD = macaulayDuration(face, couponRate, ytm, years, freq);
    const modD = modifiedDuration(macD, ytm, freq);
    const convexity = bondConvexity(face, couponRate, ytm, years, freq);

    return {
      primary: modD,
      primaryLabel: 'Modified Duration',
      primaryFormat: 'years',
      secondary: [
        { label: 'Bond Price', value: price, format: 'currency' },
        { label: 'Macaulay Duration', value: macD, format: 'years' },
        { label: 'Annual Convexity', value: convexity, format: 'decimal2' },
        { label: 'Est. ΔP for +100bps', value: -modD * 0.01 + 0.5 * convexity * 0.0001, format: 'percent' },
      ],
    };
  },
};

/**
 * Standard default input definitions for known models
 */
const DEFAULT_INPUTS_BY_MODEL = {
  'black-scholes': [
    { id: 'spot', label: 'Spot Price (S)', min: 10, max: 200, step: 1, value: 100, format: 'currency' },
    { id: 'strike', label: 'Strike Price (K)', min: 10, max: 200, step: 1, value: 100, format: 'currency' },
    { id: 'rate', label: 'Risk-Free Rate (r)', min: 0, max: 0.20, step: 0.0025, value: 0.05, format: 'percent' },
    { id: 'vol', label: 'Volatility (σ)', min: 0.01, max: 1.00, step: 0.01, value: 0.20, format: 'percent' },
    { id: 'time', label: 'Time to Expiry (T, years)', min: 0.05, max: 3.0, step: 0.05, value: 1.0, format: 'decimal2' },
  ],
  'wacc': [
    { id: 'equityVal', label: 'Equity Market Value (E)', min: 50, max: 2000, step: 25, value: 600, format: 'currency0' },
    { id: 'debtVal', label: 'Debt Market Value (D)', min: 0, max: 2000, step: 25, value: 400, format: 'currency0' },
    { id: 'costOfEquity', label: 'Cost of Equity (rₑ)', min: 0.02, max: 0.30, step: 0.005, value: 0.12, format: 'percent' },
    { id: 'costOfDebt', label: 'Pre-tax Cost of Debt (r_d)', min: 0.01, max: 0.20, step: 0.0025, value: 0.06, format: 'percent' },
    { id: 'taxRate', label: 'Tax Rate (t)', min: 0, max: 0.45, step: 0.01, value: 0.25, format: 'percent' },
  ],
  'duration': [
    { id: 'face', label: 'Face Value', min: 100, max: 5000, step: 100, value: 1000, format: 'currency0' },
    { id: 'couponRate', label: 'Coupon Rate', min: 0, max: 0.15, step: 0.0025, value: 0.08, format: 'percent' },
    { id: 'ytm', label: 'Yield to Maturity (YTM)', min: 0.005, max: 0.20, step: 0.0025, value: 0.08, format: 'percent' },
    { id: 'years', label: 'Maturity (Years)', min: 1, max: 30, step: 1, value: 10, format: 'integer' },
  ],
};

function formatValue(val, fmt) {
  if (val === null || val === undefined || Number.isNaN(val)) return '—';
  switch (fmt) {
    case 'currency':
    case '$0.00':
      return `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'currency0':
      return `$${Math.round(val).toLocaleString('en-US')}`;
    case 'percent':
    case '0.00%':
      return `${(Number(val) * 100).toFixed(2)}%`;
    case 'percent1':
      return `${(Number(val) * 100).toFixed(1)}%`;
    case 'years':
      return `${Number(val).toFixed(2)} yrs`;
    case 'decimal3':
      return Number(val).toFixed(3);
    case 'decimal4':
      return Number(val).toFixed(4);
    case 'decimal2':
      return Number(val).toFixed(2);
    case 'integer':
      return Math.round(val).toString();
    default:
      return Number(val).toFixed(2);
  }
}

/**
 * Main export per ADR-0003 contract
 */
export function create(container, config = {}) {
  if (!container) throw new Error('sensitivity-panel requires a container element');

  let currentConfig = { ...config };
  let currentValues = {};
  let listeners = [];

  // Determine compute model
  function getModelKey() {
    if (typeof currentConfig.compute === 'string' && BUILTIN_COMPUTERS[currentConfig.compute]) {
      return currentConfig.compute.startsWith('black-scholes') ? 'black-scholes' : currentConfig.compute;
    }
    if (currentConfig.spot !== undefined || currentConfig.strike !== undefined) {
      return 'black-scholes';
    }
    if (currentConfig.costOfEquity !== undefined || currentConfig.debtVal !== undefined) {
      return 'wacc';
    }
    if (currentConfig.couponRate !== undefined || currentConfig.ytm !== undefined) {
      return 'duration';
    }
    return 'black-scholes';
  }

  // Resolve input definitions
  function resolveInputs() {
    if (Array.isArray(currentConfig.inputs) && currentConfig.inputs.length > 0) {
      return currentConfig.inputs;
    }

    const modelKey = getModelKey();
    const defaults = DEFAULT_INPUTS_BY_MODEL[modelKey] || DEFAULT_INPUTS_BY_MODEL['black-scholes'];

    // Overlay any values passed directly on currentConfig (e.g. from registry defaults: { spot: 100, strike: 100... })
    return defaults.map(input => {
      const overrideVal = currentConfig[input.id];
      return {
        ...input,
        value: overrideVal !== undefined ? Number(overrideVal) : input.value,
      };
    });
  }

  function getComputeFn() {
    if (typeof currentConfig.compute === 'function') {
      return currentConfig.compute;
    }
    if (typeof currentConfig.compute === 'string' && BUILTIN_COMPUTERS[currentConfig.compute]) {
      return BUILTIN_COMPUTERS[currentConfig.compute];
    }
    const modelKey = getModelKey();
    return BUILTIN_COMPUTERS[modelKey] || BUILTIN_COMPUTERS['black-scholes'];
  }

  // Render HTML structure
  function render() {
    listeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    listeners = [];

    const inputs = resolveInputs();

    // Initialize current values from currentConfig first
    Object.keys(currentConfig).forEach(k => {
      if (typeof currentConfig[k] === 'number') {
        currentValues[k] = currentConfig[k];
      }
    });

    // Initialize slider values
    inputs.forEach(inp => {
      if (currentValues[inp.id] === undefined) {
        currentValues[inp.id] = inp.value;
      }
    });

    container.innerHTML = `
      <div class="sp-container" style="display: flex; flex-direction: column; gap: 1.5rem; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        
        <!-- Top Output Dashboard -->
        <div class="sp-dashboard" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div class="sp-primary-card" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #fff; padding: 1.25rem; border-radius: 0.625rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div class="sp-primary-label" style="font-size: 0.8125rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 0.25rem;">
              Primary Output
            </div>
            <div class="sp-primary-value" id="sp-primary-value" style="font-size: 2rem; font-weight: 800; font-family: var(--font-mono, monospace); line-height: 1.1; color: #38bdf8;">
              —
            </div>
            <div class="sp-primary-hint" id="sp-primary-hint" style="font-size: 0.75rem; color: #cbd5e1; margin-top: 0.375rem;">
              Live computed sensitivity
            </div>
          </div>

          <div class="sp-secondary-grid" id="sp-secondary-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem;">
            <!-- Populated dynamically -->
          </div>
        </div>

        <!-- Slider Inputs Controls Grid -->
        <div class="sp-controls-card" style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.625rem; padding: 1.25rem;">
          <div style="font-size: 0.875rem; font-weight: 700; color: var(--color-gray-800, #1e293b); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em;">
            Parameter Controls & Sensitivity Sliders
          </div>

          <div class="sp-sliders-grid" style="display: flex; flex-direction: column; gap: 1.125rem;">
            ${inputs.map(inp => `
              <div class="sp-slider-group" data-input-id="${inp.id}">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.375rem;">
                  <label for="sp-slider-${inp.id}" style="font-size: 0.875rem; font-weight: 600; color: var(--color-gray-700, #334155);">
                    ${inp.label}
                  </label>
                  <span class="sp-badge-value" id="sp-val-${inp.id}" style="font-size: 0.875rem; font-weight: 700; font-family: var(--font-mono, monospace); color: var(--color-primary, #0369a1); background: #e0f2fe; padding: 0.125rem 0.5rem; border-radius: 0.375rem;">
                    ${formatValue(currentValues[inp.id], inp.format)}
                  </span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <span style="font-size: 0.75rem; color: var(--color-gray-500, #64748b); min-width: 2.5rem; text-align: right;">
                    ${formatValue(inp.min, inp.format)}
                  </span>
                  <input
                    type="range"
                    id="sp-slider-${inp.id}"
                    data-id="${inp.id}"
                    min="${inp.min}"
                    max="${inp.max}"
                    step="${inp.step}"
                    value="${currentValues[inp.id]}"
                    style="flex: 1; height: 6px; cursor: pointer; accent-color: var(--color-primary, #0284c7);"
                  />
                  <span style="font-size: 0.75rem; color: var(--color-gray-500, #64748b); min-width: 2.5rem;">
                    ${formatValue(inp.max, inp.format)}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Attach listeners
    inputs.forEach(inp => {
      const slider = container.querySelector(`#sp-slider-${inp.id}`);
      if (!slider) return;

      const handler = (e) => {
        const val = parseFloat(e.target.value);
        currentValues[inp.id] = val;
        const valBadge = container.querySelector(`#sp-val-${inp.id}`);
        if (valBadge) {
          valBadge.textContent = formatValue(val, inp.format);
        }
        recalculate();
      };

      slider.addEventListener('input', handler);
      listeners.push({ el: slider, type: 'input', fn: handler });
    });

    recalculate();
  }

  // Compute and update outputs
  function recalculate() {
    const computeFn = getComputeFn();
    const result = computeFn(currentValues);

    const primaryEl = container.querySelector('#sp-primary-value');
    const primaryLabelEl = container.querySelector('.sp-primary-label');
    const secondaryGrid = container.querySelector('#sp-secondary-grid');

    if (!primaryEl) return;

    if (typeof result === 'number') {
      const fmt = currentConfig.outputFormat || currentConfig.output_format || 'currency';
      primaryEl.textContent = formatValue(result, fmt);
      if (primaryLabelEl && (currentConfig.outputLabel || currentConfig.output_label)) {
        primaryLabelEl.textContent = currentConfig.outputLabel || currentConfig.output_label;
      }
    } else if (result && typeof result === 'object') {
      primaryEl.textContent = formatValue(result.primary, result.primaryFormat || currentConfig.outputFormat || 'currency');
      if (primaryLabelEl && result.primaryLabel) {
        primaryLabelEl.textContent = result.primaryLabel;
      }

      if (secondaryGrid && Array.isArray(result.secondary)) {
        secondaryGrid.innerHTML = result.secondary.map(sec => `
          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.625rem 0.875rem;">
            <div style="font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; color: var(--color-gray-500, #64748b); margin-bottom: 0.125rem;">
              ${sec.label}
            </div>
            <div style="font-size: 1.125rem; font-weight: 700; font-family: var(--font-mono, monospace); color: var(--color-gray-900, #0f172a);">
              ${formatValue(sec.value, sec.format)}
            </div>
          </div>
        `).join('');
      }
    }
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
      // If newConfig contains explicit parameter overrides, update currentValues
      Object.keys(newConfig).forEach(k => {
        if (typeof newConfig[k] === 'number') {
          currentValues[k] = newConfig[k];
        }
      });
      render();
    },

    // Testing / programmatic helper
    getValues() {
      return { ...currentValues };
    },
  };
}
