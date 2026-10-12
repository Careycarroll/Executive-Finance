/**
 * yield-curve.js — Interactive Yield Curve, Forward Rates, & Term Structure Plotter
 * Plots spot and forward rate curves, applies live parallel shifts and twists,
 * and tracks the 10Y-2Y recession spread.
 * Follows component contract in ADR-0003: create(container, config) -> { destroy(), update(newConfig) }
 */

import { Chart } from '../charts/chart-core.js';
import {
  generateForwardCurve,
  transformYieldCurve,
} from '../lib/finance-math/yield-curve.js';

export const CURVE_PRESETS = {
  normal: {
    name: 'Normal (Upward Sloping)',
    tenors: [0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30],
    rates: [0.035, 0.037, 0.040, 0.043, 0.045, 0.048, 0.050, 0.052, 0.054, 0.055],
  },
  inverted: {
    name: 'Inverted (Recession Warning)',
    tenors: [0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30],
    rates: [0.055, 0.054, 0.052, 0.050, 0.048, 0.045, 0.043, 0.041, 0.040, 0.039],
  },
  flat: {
    name: 'Flat Curve',
    tenors: [0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30],
    rates: [0.045, 0.045, 0.045, 0.045, 0.045, 0.045, 0.045, 0.045, 0.045, 0.045],
  },
  humped: {
    name: 'Humped Curve',
    tenors: [0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30],
    rates: [0.035, 0.040, 0.048, 0.052, 0.051, 0.049, 0.047, 0.046, 0.045, 0.045],
  },
};

class YieldCanvasChart extends Chart {
  constructor(canvasEl, options = {}) {
    super(canvasEl, {
      padding: { top: 30, right: 35, bottom: 45, left: 65 },
      ...options,
    });
    this.plotData = null;
  }

  setPlotData(plotData) {
    this.plotData = plotData;
    this.draw();
  }

  draw() {
    this.clear();
    if (!this.plotData) return;

    const {
      tenors,
      effectiveRates,
      baseRates,
      forwardCurve,
      showForward,
      isShifted,
    } = this.plotData;

    let minRate = Math.min(...effectiveRates, ...baseRates);
    let maxRate = Math.max(...effectiveRates, ...baseRates);

    if (showForward && forwardCurve.length > 0) {
      forwardCurve.forEach(fc => {
        minRate = Math.min(minRate, fc.forwardRate);
        maxRate = Math.max(maxRate, fc.forwardRate);
      });
    }

    const minTenor = 0;
    const maxTenor = tenors[tenors.length - 1];

    const plotMinY = Math.max(0, minRate - 0.005);
    const plotMaxY = maxRate + 0.005;

    const xTicks = [0, 2, 5, 10, 20, 30];
    const yTicks = this.niceTicks(plotMinY, plotMaxY, 6);

    this.drawGrid(xTicks, yTicks, minTenor, maxTenor, plotMinY, plotMaxY);
    this.drawAxes(xTicks, yTicks, minTenor, maxTenor, plotMinY, plotMaxY, 'Tenor / Maturity (Years)', 'Yield / Rate');

    const ctx = this.ctx;

    // Draw Original Unshifted Base Curve (light gray dashed if shifted)
    if (isShifted) {
      const basePoints = tenors.map((t, i) => ({
        x: this.xScale(t, minTenor, maxTenor),
        y: this.yScale(baseRates[i], plotMinY, plotMaxY),
      }));
      this.drawLine(basePoints, '#94a3b8', 1.5, true);
    }

    // Draw Implied Forward Curve (green dashed)
    if (showForward && forwardCurve.length > 0) {
      const fPoints = forwardCurve.map(fc => ({
        x: this.xScale((fc.t1 + fc.t2) / 2, minTenor, maxTenor),
        y: this.yScale(fc.forwardRate, plotMinY, plotMaxY),
      }));
      this.drawLine(fPoints, '#10b981', 2, true);

      fPoints.forEach(p => {
        this.drawPoint(p.x, p.y, '#10b981', 3.5);
      });
    }

    // Draw Active Spot Curve (Royal Blue solid)
    const spotPoints = tenors.map((t, i) => ({
      x: this.xScale(t, minTenor, maxTenor),
      y: this.yScale(effectiveRates[i], plotMinY, plotMaxY),
    }));
    this.drawLine(spotPoints, '#2563eb', 2.5);

    // Draw Spot Curve Node Markers
    spotPoints.forEach((p, i) => {
      const t = tenors[i];
      const isKey = t === 2 || t === 10;
      this.drawPoint(p.x, p.y, isKey ? '#1d4ed8' : '#3b82f6', isKey ? 5.5 : 4);
    });

    // Hover tooltip
    if (this._mouse && this._inChartArea(this._mouse.x, this._mouse.y)) {
      const hTenor = this.xToValue(this._mouse.x, minTenor, maxTenor);

      // Find closest tenor
      let closestIdx = 0;
      let closestDist = Infinity;
      tenors.forEach((t, i) => {
        const d = Math.abs(t - hTenor);
        if (d < closestDist) {
          closestDist = d;
          closestIdx = i;
        }
      });

      const tVal = tenors[closestIdx];
      const rVal = effectiveRates[closestIdx];
      const cx = this.xScale(tVal, minTenor, maxTenor);

      ctx.save();
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, this.chartY);
      ctx.lineTo(cx, this.chartY + this.chartH);
      ctx.stroke();

      const text = `${tVal}Y Yield: ${(rVal * 100).toFixed(2)}%`;
      const tw = ctx.measureText(text).width + 20;
      const tx = cx > this.chartX + this.chartW - tw - 15 ? cx - tw - 10 : cx + 10;
      const ty = Math.max(this.chartY + 10, Math.min(this._mouse.y, this.chartY + this.chartH - 35));

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, 26, 4);
      ctx.fill();

      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, tx + 10, ty + 13);
      ctx.restore();
    }
  }
}

export function create(container, config = {}) {
  if (!container) throw new Error('yield-curve requires a container element');

  let currentConfig = {
    tenors: [0.25, 0.5, 1, 2, 3, 5, 7, 10, 20, 30],
    rates: [0.035, 0.037, 0.040, 0.043, 0.045, 0.048, 0.050, 0.052, 0.054, 0.055],
    show_forward: true,
    shift_bps: 0,
    twist_bps: 0,
    ...config,
  };

  let chartInstance = null;
  let listeners = [];

  function getMetrics() {
    const tenors = currentConfig.tenors;
    const baseRates = currentConfig.rates;
    const shiftBps = Number(currentConfig.shift_bps ?? 0);
    const twistBps = Number(currentConfig.twist_bps ?? 0);

    const effectiveRates = transformYieldCurve(tenors, baseRates, shiftBps, twistBps, 5);
    const forwardCurve = generateForwardCurve(tenors, effectiveRates);

    // Find 2Y and 10Y rates
    const idx2Y = tenors.findIndex(t => Math.abs(t - 2) < 0.1);
    const idx10Y = tenors.findIndex(t => Math.abs(t - 10) < 0.1);

    const rate2Y = idx2Y >= 0 ? effectiveRates[idx2Y] : effectiveRates[1];
    const rate10Y = idx10Y >= 0 ? effectiveRates[idx10Y] : effectiveRates[effectiveRates.length - 2];
    const spread10Y2Y = (rate10Y - rate2Y) * 10000; // in bps

    return {
      tenors,
      baseRates,
      effectiveRates,
      forwardCurve,
      rate2Y,
      rate10Y,
      spread10Y2Y,
      shiftBps,
      twistBps,
      isShifted: shiftBps !== 0 || twistBps !== 0,
      showForward: currentConfig.show_forward !== false,
    };
  }

  function render() {
    listeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    listeners = [];
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    const metrics = getMetrics();
    const isInverted = metrics.spread10Y2Y < 0;

    container.innerHTML = `
      <div class="yc-container" style="display: flex; flex-direction: column; gap: 1.25rem; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        
        <!-- Presets Bar -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; border-bottom: 1px solid var(--color-border, #e2e8f0); padding-bottom: 0.75rem;">
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${Object.keys(CURVE_PRESETS).map(k => `
              <button
                type="button"
                class="yc-preset-btn"
                data-preset="${k}"
                style="padding: 0.375rem 0.75rem; font-size: 0.8125rem; font-weight: 600; border-radius: 0.375rem; border: 1px solid var(--color-border, #cbd5e1); background: #f8fafc; color: var(--color-gray-700, #334155); cursor: pointer;"
              >
                ${CURVE_PRESETS[k].name}
              </button>
            `).join('')}
          </div>

          <div style="font-size: 0.75rem; color: var(--color-gray-500, #64748b);">
            Term Structure Analysis
          </div>
        </div>

        <!-- Metric Badges Header -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem;">
          <div style="background: ${isInverted ? '#fee2e2' : 'var(--color-gray-50, #f8fafc)'}; border: 1px solid ${isInverted ? '#fca5a5' : 'var(--color-border, #e2e8f0)'}; border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: ${isInverted ? '#dc2626' : 'var(--color-gray-500, #64748b)'};">
              10Y - 2Y Spread ${isInverted ? '⚠️ INVERTED' : ''}
            </div>
            <div id="yc-spread-val" style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); color: ${isInverted ? '#dc2626' : '#10b981'}; margin-top: 0.25rem;">
              ${metrics.spread10Y2Y >= 0 ? '+' : ''}${metrics.spread10Y2Y.toFixed(0)} bps
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              10-Year Spot Yield
            </div>
            <div id="yc-10y-val" style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); color: #0284c7; margin-top: 0.25rem;">
              ${(metrics.rate10Y * 100).toFixed(2)}%
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              2-Year Spot Yield
            </div>
            <div id="yc-2y-val" style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-gray-800, #1e293b); margin-top: 0.25rem;">
              ${(metrics.rate2Y * 100).toFixed(2)}%
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Parallel Shift
            </div>
            <div id="yc-shift-val" style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-gray-700, #334155); margin-top: 0.25rem;">
              ${metrics.shiftBps >= 0 ? '+' : ''}${metrics.shiftBps.toFixed(0)} bps
            </div>
          </div>
        </div>

        <!-- Canvas Chart Area -->
        <div style="width: 100%; height: 320px; position: relative; background: #fff; border-radius: 0.5rem; overflow: hidden;">
          <canvas id="yc-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
        </div>

        <!-- Legend -->
        <div style="display: flex; flex-wrap: wrap; gap: 1.25rem; font-size: 0.75rem; color: var(--color-gray-600, #475569); padding: 0 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.375rem;">
            <span style="display: inline-block; width: 16px; height: 3px; background: #2563eb;"></span>
            <span>Spot Curve</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.375rem;">
            <span style="display: inline-block; width: 16px; height: 3px; background: #10b981;"></span>
            <span>Implied Forward Rate Curve</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.375rem;">
            <span style="display: inline-block; width: 16px; height: 2px; background: #94a3b8; border-top: 2px dashed #94a3b8;"></span>
            <span>Original Baseline</span>
          </div>
        </div>

        <!-- Controls: Parallel Shift & Slope Twist Sliders -->
        <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
            <!-- Shift Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; font-weight: 600; color: var(--color-gray-700, #334155); margin-bottom: 0.375rem;">
                <span>Parallel Shift</span>
                <span id="yc-shift-badge" style="font-family: var(--font-mono, monospace); color: var(--color-primary, #0369a1); background: #e0f2fe; padding: 0.125rem 0.5rem; border-radius: 0.25rem;">
                  ${metrics.shiftBps >= 0 ? '+' : ''}${metrics.shiftBps.toFixed(0)} bps
                </span>
              </div>
              <input type="range" id="yc-shift-slider" min="-200" max="200" step="5" value="${metrics.shiftBps}" style="width: 100%; accent-color: var(--color-primary, #0284c7);" />
            </div>

            <!-- Twist Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; font-weight: 600; color: var(--color-gray-700, #334155); margin-bottom: 0.375rem;">
                <span>Curve Twist (Slope)</span>
                <span id="yc-twist-badge" style="font-family: var(--font-mono, monospace); color: var(--color-primary, #0369a1); background: #e0f2fe; padding: 0.125rem 0.5rem; border-radius: 0.25rem;">
                  ${metrics.twistBps >= 0 ? '+' : ''}${metrics.twistBps.toFixed(0)} bps
                </span>
              </div>
              <input type="range" id="yc-twist-slider" min="-100" max="100" step="5" value="${metrics.twistBps}" style="width: 100%; accent-color: var(--color-primary, #0284c7);" />
              <div style="display: flex; justify-content: space-between; font-size: 0.6875rem; color: var(--color-gray-500, #64748b); margin-top: 0.25rem;">
                <span>Flatten / Invert</span>
                <span>Unchanged</span>
                <span>Steepen</span>
              </div>
            </div>
          </div>

          <!-- Forward Curve Toggle -->
          <div style="display: flex; align-items: center; gap: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--color-border, #e2e8f0);">
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--color-gray-700, #334155); cursor: pointer;">
              <input type="checkbox" id="yc-toggle-forward" ${currentConfig.show_forward !== false ? 'checked' : ''} />
              <span>Show Implied Forward Rate Curve</span>
            </label>
          </div>

        </div>

      </div>
    `;

    const canvasEl = container.querySelector('#yc-canvas');
    if (canvasEl && typeof canvasEl.getContext === 'function' && canvasEl.getContext('2d')) {
      try {
        chartInstance = new YieldCanvasChart(canvasEl);
        chartInstance.setPlotData(metrics);
      } catch (err) {
        console.warn('Canvas initialization error:', err);
      }
    }

    // Attach listeners
    container.querySelectorAll('.yc-preset-btn').forEach(btn => {
      const onPreset = () => {
        const pKey = btn.getAttribute('data-preset');
        if (CURVE_PRESETS[pKey]) {
          currentConfig.tenors = CURVE_PRESETS[pKey].tenors;
          currentConfig.rates = CURVE_PRESETS[pKey].rates;
          currentConfig.shift_bps = 0;
          currentConfig.twist_bps = 0;
          render();
        }
      };
      btn.addEventListener('click', onPreset);
      listeners.push({ el: btn, type: 'click', fn: onPreset });
    });

    const shiftSlider = container.querySelector('#yc-shift-slider');
    const twistSlider = container.querySelector('#yc-twist-slider');
    const forwardToggle = container.querySelector('#yc-toggle-forward');

    if (shiftSlider) {
      const onShift = (e) => {
        currentConfig.shift_bps = parseFloat(e.target.value);
        const b = container.querySelector('#yc-shift-badge');
        if (b) b.textContent = `${currentConfig.shift_bps >= 0 ? '+' : ''}${currentConfig.shift_bps.toFixed(0)} bps`;
        updatePlot();
      };
      shiftSlider.addEventListener('input', onShift);
      listeners.push({ el: shiftSlider, type: 'input', fn: onShift });
    }

    if (twistSlider) {
      const onTwist = (e) => {
        currentConfig.twist_bps = parseFloat(e.target.value);
        const b = container.querySelector('#yc-twist-badge');
        if (b) b.textContent = `${currentConfig.twist_bps >= 0 ? '+' : ''}${currentConfig.twist_bps.toFixed(0)} bps`;
        updatePlot();
      };
      twistSlider.addEventListener('input', onTwist);
      listeners.push({ el: twistSlider, type: 'input', fn: onTwist });
    }

    if (forwardToggle) {
      const onForward = (e) => {
        currentConfig.show_forward = e.target.checked;
        updatePlot();
      };
      forwardToggle.addEventListener('change', onForward);
      listeners.push({ el: forwardToggle, type: 'change', fn: onForward });
    }
  }

  function updatePlot() {
    const metrics = getMetrics();
    const isInverted = metrics.spread10Y2Y < 0;

    const spreadEl = container.querySelector('#yc-spread-val');
    const rate10YEl = container.querySelector('#yc-10y-val');
    const rate2YEl = container.querySelector('#yc-2y-val');
    const shiftEl = container.querySelector('#yc-shift-val');

    if (spreadEl) {
      spreadEl.textContent = `${metrics.spread10Y2Y >= 0 ? '+' : ''}${metrics.spread10Y2Y.toFixed(0)} bps`;
      spreadEl.style.color = isInverted ? '#dc2626' : '#10b981';
    }
    if (rate10YEl) rate10YEl.textContent = `${(metrics.rate10Y * 100).toFixed(2)}%`;
    if (rate2YEl) rate2YEl.textContent = `${(metrics.rate2Y * 100).toFixed(2)}%`;
    if (shiftEl) shiftEl.textContent = `${metrics.shiftBps >= 0 ? '+' : ''}${metrics.shiftBps.toFixed(0)} bps`;

    if (chartInstance) {
      chartInstance.setPlotData(metrics);
    }
  }

  render();

  return {
    destroy() {
      listeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
      listeners = [];
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
      container.innerHTML = '';
    },

    update(newConfig = {}) {
      currentConfig = { ...currentConfig, ...newConfig };
      render();
    },

    getMetrics,
  };
}
