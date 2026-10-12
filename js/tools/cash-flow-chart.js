/**
 * cash-flow-chart.js — Interactive cash flow time series & NPV visualizer
 * Unlocks TVM, NPV/IRR, DCF, and Capital Budgeting concepts.
 * Follows component contract in ADR-0003: create(container, config) -> { destroy(), update(newConfig) }
 */

import { Chart } from '../charts/chart-core.js';
import {
  npv,
  irr,
  paybackPeriod,
  discountedCashFlows,
} from '../lib/finance-math/tvm.js';

/**
 * Custom Canvas Chart extending Chart base class
 */
class CashFlowCanvasChart extends Chart {
  constructor(canvasEl, options = {}) {
    super(canvasEl, {
      padding: { top: 30, right: 30, bottom: 45, left: 65 },
      ...options,
    });
    this.streamData = [];
    this.options = options;
  }

  setData(streamData, options = {}) {
    this.streamData = streamData;
    this.options = { ...this.options, ...options };
    this.draw();
  }

  draw() {
    this.clear();
    if (!this.streamData || this.streamData.length === 0) return;

    const data = this.streamData;
    const periods = data.length - 1;
    const showPv = this.options.showPv !== false;
    const showCumulative = this.options.showCumulative !== false;

    // Determine Y range across nominal, pv, and cumulative
    let minY = 0;
    let maxY = 0;

    data.forEach(d => {
      minY = Math.min(minY, d.cf, d.pv);
      maxY = Math.max(maxY, d.cf, d.pv);
      if (showCumulative) {
        minY = Math.min(minY, d.cumPv);
        maxY = Math.max(maxY, d.cumPv);
      }
    });

    // Add 15% breathing room
    const span = Math.max(10, maxY - minY);
    const plotMinY = minY - span * 0.12;
    const plotMaxY = maxY + span * 0.12;

    const plotMinX = -0.5;
    const plotMaxX = periods + 0.5;

    const xTicks = [];
    for (let t = 0; t <= periods; t++) xTicks.push(t);
    const yTicks = this.niceTicks(plotMinY, plotMaxY, 6);

    this.drawGrid(xTicks, yTicks, plotMinX, plotMaxX, plotMinY, plotMaxY);
    this.drawAxes(xTicks, yTicks, plotMinX, plotMaxX, plotMinY, plotMaxY, 'Period (Years / t)', 'Cash Flow ($)');

    // Zero baseline
    const zeroY = this.yScale(0, plotMinY, plotMaxY);
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(this.chartX, zeroY);
    ctx.lineTo(this.chartX + this.chartW, zeroY);
    ctx.stroke();
    ctx.restore();

    // Bar width
    const slotW = this.chartW / (periods + 1);
    const barW = Math.min(36, Math.max(12, slotW * 0.35));

    // Draw Bars
    data.forEach((d) => {
      const centerX = this.xScale(d.period, plotMinX, plotMaxX);

      // Undiscounted nominal bar
      const nominalY = this.yScale(d.cf, plotMinY, plotMaxY);
      const nominalH = Math.abs(nominalY - zeroY);
      const nominalTop = Math.min(nominalY, zeroY);

      ctx.save();
      // Nominal bar color: slate gray
      ctx.fillStyle = d.cf >= 0 ? '#cbd5e1' : '#fca5a5';
      ctx.fillRect(centerX - barW / 2, nominalTop, barW, nominalH);

      // Discounted PV bar
      if (showPv && d.period > 0) {
        const pvY = this.yScale(d.pv, plotMinY, plotMaxY);
        const pvH = Math.abs(pvY - zeroY);
        const pvTop = Math.min(pvY, zeroY);

        ctx.fillStyle = d.pv >= 0 ? '#0284c7' : '#ef4444';
        const innerW = barW * 0.65;
        ctx.fillRect(centerX - innerW / 2, pvTop, innerW, pvH);
      }
      ctx.restore();
    });

    // Draw Cumulative Curve
    if (showCumulative) {
      const cumPoints = data.map(d => ({
        x: this.xScale(d.period, plotMinX, plotMaxX),
        y: this.yScale(d.cumPv, plotMinY, plotMaxY),
      }));

      // Draw line
      this.drawLine(cumPoints, '#10b981', 2.5);

      // Draw points
      cumPoints.forEach((p, idx) => {
        const isFinal = idx === data.length - 1;
        this.drawPoint(p.x, p.y, isFinal ? '#047857' : '#10b981', isFinal ? 6 : 4);
      });
    }

    // Hover Tooltip / Crosshair
    if (this._mouse && this._inChartArea(this._mouse.x, this._mouse.y)) {
      const hoveredX = this.xToValue(this._mouse.x, plotMinX, plotMaxX);
      const periodIdx = Math.round(hoveredX);

      if (periodIdx >= 0 && periodIdx < data.length) {
        const d = data[periodIdx];
        const px = this.xScale(d.period, plotMinX, plotMaxX);

        ctx.save();
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, this.chartY);
        ctx.lineTo(px, this.chartY + this.chartH);
        ctx.stroke();

        const tooltipLines = [
          `Period: t = ${d.period}`,
          `Nominal CF: $${Math.round(d.cf).toLocaleString()}`,
          `Discounted PV: $${Math.round(d.pv).toLocaleString()}`,
          `Cumulative NPV: $${Math.round(d.cumPv).toLocaleString()}`,
        ];

        const tooltipX = px > this.chartX + this.chartW - 130 ? px - 135 : px + 10;
        const tooltipY = Math.max(this.chartY + 10, Math.min(this._mouse.y, this.chartY + this.chartH - 75));

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.beginPath();
        ctx.roundRect(tooltipX, tooltipY, 125, 70, 4);
        ctx.fill();

        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        tooltipLines.forEach((line, i) => {
          ctx.fillText(line, tooltipX + 8, tooltipY + 8 + i * 14);
        });
        ctx.restore();
      }
    }
  }
}

/**
 * Main component factory per ADR-0003 contract
 */
export function create(container, config = {}) {
  if (!container) throw new Error('cash-flow-chart requires a container element');

  let currentConfig = {
    periods: 10,
    cash_flows: [-1000, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
    discount_rate: 0.10,
    growth_rate: 0.00,
    show_pv: true,
    show_cumulative: true,
    ...config,
  };

  // Support camelCase overrides
  if (config.discountRate !== undefined) currentConfig.discount_rate = config.discountRate;
  if (config.growthRate !== undefined) currentConfig.growth_rate = config.growthRate;
  if (config.cashFlows !== undefined) currentConfig.cash_flows = config.cashFlows;
  if (config.showPv !== undefined) currentConfig.show_pv = config.showPv;
  if (config.showCumulative !== undefined) currentConfig.show_cumulative = config.showCumulative;

  let chartInstance = null;
  let listeners = [];

  function getBaseCashFlows() {
    let cfs = currentConfig.cash_flows || currentConfig.cashFlows;
    if (!Array.isArray(cfs) || cfs.length === 0) {
      cfs = [-1000, 200, 200, 200, 200, 200];
    }
    return cfs;
  }

  function render() {
    listeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    listeners = [];
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    container.innerHTML = `
      <div class="cfc-container" style="display: flex; flex-direction: column; gap: 1.25rem; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        
        <!-- Metrics Summary Header -->
        <div class="cfc-metrics" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem;">
          <div class="cfc-metric-card" style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Net Present Value (NPV)
            </div>
            <div id="cfc-npv-val" style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); margin-top: 0.25rem;">
              —
            </div>
          </div>

          <div class="cfc-metric-card" style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Internal Rate of Return
            </div>
            <div id="cfc-irr-val" style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-primary, #0284c7); margin-top: 0.25rem;">
              —
            </div>
          </div>

          <div class="cfc-metric-card" style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Payback Period
            </div>
            <div id="cfc-payback-val" style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-gray-800, #1e293b); margin-top: 0.25rem;">
              —
            </div>
          </div>

          <div class="cfc-metric-card" style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Undiscounted Total
            </div>
            <div id="cfc-nominal-val" style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-gray-700, #334155); margin-top: 0.25rem;">
              —
            </div>
          </div>
        </div>

        <!-- Canvas Chart Area -->
        <div style="width: 100%; height: 320px; position: relative; background: #fff; border-radius: 0.5rem; overflow: hidden;">
          <canvas id="cfc-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
        </div>

        <!-- Legend -->
        <div style="display: flex; flex-wrap: wrap; gap: 1.25rem; font-size: 0.75rem; color: var(--color-gray-600, #475569); padding: 0 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.375rem;">
            <span style="display: inline-block; width: 12px; height: 12px; background: #cbd5e1; border-radius: 2px;"></span>
            <span>Nominal Cash Flow</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.375rem;">
            <span style="display: inline-block; width: 12px; height: 12px; background: #0284c7; border-radius: 2px;"></span>
            <span>Discounted PV</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.375rem;">
            <span style="display: inline-block; width: 16px; height: 3px; background: #10b981;"></span>
            <span>Cumulative NPV Curve</span>
          </div>
        </div>

        <!-- Interactive Sliders & Toggles -->
        <div class="cfc-controls" style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem;">
            <!-- Discount Rate Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.375rem;">
                <label for="cfc-rate-slider" style="font-size: 0.8125rem; font-weight: 600; color: var(--color-gray-700, #334155);">
                  Discount Rate (r)
                </label>
                <span id="cfc-rate-badge" style="font-size: 0.8125rem; font-weight: 700; font-family: var(--font-mono, monospace); color: var(--color-primary, #0369a1); background: #e0f2fe; padding: 0.125rem 0.5rem; border-radius: 0.25rem;">
                  ${(Number(currentConfig.discount_rate) * 100).toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                id="cfc-rate-slider"
                min="0"
                max="0.30"
                step="0.005"
                value="${currentConfig.discount_rate}"
                style="width: 100%; height: 6px; cursor: pointer; accent-color: var(--color-primary, #0284c7);"
              />
            </div>

            <!-- Growth Rate Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.375rem;">
                <label for="cfc-growth-slider" style="font-size: 0.8125rem; font-weight: 600; color: var(--color-gray-700, #334155);">
                  Cash Flow Growth Rate (g)
                </label>
                <span id="cfc-growth-badge" style="font-size: 0.8125rem; font-weight: 700; font-family: var(--font-mono, monospace); color: var(--color-primary, #0369a1); background: #e0f2fe; padding: 0.125rem 0.5rem; border-radius: 0.25rem;">
                  ${(Number(currentConfig.growth_rate) * 100).toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                id="cfc-growth-slider"
                min="-0.10"
                max="0.20"
                step="0.005"
                value="${currentConfig.growth_rate}"
                style="width: 100%; height: 6px; cursor: pointer; accent-color: var(--color-primary, #0284c7);"
              />
            </div>
          </div>

          <!-- Toggles -->
          <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; padding-top: 0.5rem; border-top: 1px solid var(--color-border, #e2e8f0);">
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--color-gray-700, #334155); cursor: pointer;">
              <input type="checkbox" id="cfc-toggle-pv" ${currentConfig.show_pv ? 'checked' : ''} />
              <span>Show Discounted PV Bars</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--color-gray-700, #334155); cursor: pointer;">
              <input type="checkbox" id="cfc-toggle-cum" ${currentConfig.show_cumulative ? 'checked' : ''} />
              <span>Show Cumulative NPV Curve</span>
            </label>
          </div>

        </div>

      </div>
    `;

    const canvasEl = container.querySelector('#cfc-canvas');
    if (canvasEl && typeof canvasEl.getContext === 'function' && canvasEl.getContext('2d')) {
      try {
        chartInstance = new CashFlowCanvasChart(canvasEl, {
          showPv: currentConfig.show_pv,
          showCumulative: currentConfig.show_cumulative,
        });
      } catch (err) {
        console.warn('Canvas initialization error:', err);
      }
    }

    // Attach listeners
    const rateSlider = container.querySelector('#cfc-rate-slider');
    const growthSlider = container.querySelector('#cfc-growth-slider');
    const pvCheckbox = container.querySelector('#cfc-toggle-pv');
    const cumCheckbox = container.querySelector('#cfc-toggle-cum');

    if (rateSlider) {
      const onRate = (e) => {
        currentConfig.discount_rate = parseFloat(e.target.value);
        const badge = container.querySelector('#cfc-rate-badge');
        if (badge) badge.textContent = `${(currentConfig.discount_rate * 100).toFixed(1)}%`;
        updateCalculations();
      };
      rateSlider.addEventListener('input', onRate);
      listeners.push({ el: rateSlider, type: 'input', fn: onRate });
    }

    if (growthSlider) {
      const onGrowth = (e) => {
        currentConfig.growth_rate = parseFloat(e.target.value);
        const badge = container.querySelector('#cfc-growth-badge');
        if (badge) badge.textContent = `${(currentConfig.growth_rate * 100).toFixed(1)}%`;
        updateCalculations();
      };
      growthSlider.addEventListener('input', onGrowth);
      listeners.push({ el: growthSlider, type: 'input', fn: onGrowth });
    }

    if (pvCheckbox) {
      const onPv = (e) => {
        currentConfig.show_pv = e.target.checked;
        updateCalculations();
      };
      pvCheckbox.addEventListener('change', onPv);
      listeners.push({ el: pvCheckbox, type: 'change', fn: onPv });
    }

    if (cumCheckbox) {
      const onCum = (e) => {
        currentConfig.show_cumulative = e.target.checked;
        updateCalculations();
      };
      cumCheckbox.addEventListener('change', onCum);
      listeners.push({ el: cumCheckbox, type: 'change', fn: onCum });
    }

    updateCalculations();
  }

  function updateCalculations() {
    const rawCfs = getBaseCashFlows();
    const rate = currentConfig.discount_rate;
    const growth = currentConfig.growth_rate;

    const stream = discountedCashFlows(rawCfs, rate, growth);

    // Compute metrics
    const effectiveCfs = stream.map(s => s.cf);
    const npvVal = stream.length > 0 ? stream[stream.length - 1].cumPv : 0;
    const irrVal = irr(effectiveCfs);
    const pbVal = paybackPeriod(effectiveCfs, rate);
    const totalNominal = stream.length > 0 ? stream[stream.length - 1].cumNominal : 0;

    // Update DOM
    const npvEl = container.querySelector('#cfc-npv-val');
    const irrEl = container.querySelector('#cfc-irr-val');
    const pbEl = container.querySelector('#cfc-payback-val');
    const nomEl = container.querySelector('#cfc-nominal-val');

    if (npvEl) {
      const roundedNpv = Math.round(npvVal);
      npvEl.textContent = roundedNpv < 0 ? `-$${Math.abs(roundedNpv).toLocaleString()}` : `$${roundedNpv.toLocaleString()}`;
      npvEl.style.color = npvVal >= 0 ? '#10b981' : '#ef4444';
    }

    if (irrEl) {
      irrEl.textContent = irrVal !== null ? `${(irrVal * 100).toFixed(1)}%` : 'N/A';
    }

    if (pbEl) {
      pbEl.textContent = pbVal !== null ? `${pbVal.toFixed(1)} yrs` : '> Project Life';
    }

    if (nomEl) {
      const roundedNom = Math.round(totalNominal);
      nomEl.textContent = roundedNom < 0 ? `-$${Math.abs(roundedNom).toLocaleString()}` : `$${roundedNom.toLocaleString()}`;
    }

    if (chartInstance) {
      chartInstance.setData(stream, {
        showPv: currentConfig.show_pv,
        showCumulative: currentConfig.show_cumulative,
      });
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
      if (newConfig.discountRate !== undefined) currentConfig.discount_rate = newConfig.discountRate;
      if (newConfig.growthRate !== undefined) currentConfig.growth_rate = newConfig.growthRate;
      if (newConfig.cashFlows !== undefined) currentConfig.cash_flows = newConfig.cashFlows;
      if (newConfig.showPv !== undefined) currentConfig.show_pv = newConfig.showPv;
      if (newConfig.showCumulative !== undefined) currentConfig.show_cumulative = newConfig.showCumulative;
      render();
    },

    getData() {
      return discountedCashFlows(getBaseCashFlows(), currentConfig.discount_rate, currentConfig.growth_rate);
    },
  };
}
