/**
 * greeks-visualizer.js — Interactive Option Greeks Visualizer
 * Plots primary and second-order Greeks (Delta, Gamma, Theta, Vega, Rho, Charm, Vanna)
 * across underlying price, time to expiry, and volatility.
 * Follows component contract in ADR-0003: create(container, config) -> { destroy(), update(newConfig) }
 */

import { Chart } from '../charts/chart-core.js';
import {
  blackScholesGreeks,
} from '../lib/finance-math/black-scholes.js';
import {
  calcCharm,
  calcVanna,
} from '../lib/finance-math/options-advanced.js';

export const GREEK_METADATA = {
  delta: {
    name: 'Delta (Δ)',
    desc: 'Rate of change of option price with respect to underlying asset price.',
    yLabel: 'Delta',
    format: 'decimal3',
    unit: '',
  },
  gamma: {
    name: 'Gamma (Γ)',
    desc: 'Rate of change of Delta with respect to underlying asset price (curvature).',
    yLabel: 'Gamma',
    format: 'decimal4',
    unit: '',
  },
  theta: {
    name: 'Theta (Θ)',
    desc: 'Time decay: expected dollar change in option price per day.',
    yLabel: 'Theta ($/day)',
    format: 'currency',
    unit: '$/day',
  },
  vega: {
    name: 'Vega (ν)',
    desc: 'Sensitivity: dollar change in option price per 1% change in implied volatility.',
    yLabel: 'Vega ($/1% IV)',
    format: 'currency',
    unit: '$/%',
  },
  rho: {
    name: 'Rho (ρ)',
    desc: 'Sensitivity: dollar change in option price per 1% change in risk-free interest rate.',
    yLabel: 'Rho ($/1% Rate)',
    format: 'currency',
    unit: '$/%',
  },
  charm: {
    name: 'Charm',
    desc: 'Delta decay over time (dDelta / dt).',
    yLabel: 'Charm (dΔ/day)',
    format: 'decimal4',
    unit: '/day',
  },
  vanna: {
    name: 'Vanna',
    desc: 'Cross-sensitivity of Delta to changes in volatility (dDelta / dVol).',
    yLabel: 'Vanna (dΔ/1% IV)',
    format: 'decimal4',
    unit: '/%',
  },
};

/**
 * Compute the chosen Greek value at a specific point
 */
export function evaluateGreek(greekKey, spot, strike, rate, vol, time, isCall) {
  const greeks = blackScholesGreeks(spot, strike, rate, vol, time);

  switch (greekKey) {
    case 'delta':
      return isCall ? greeks.callDelta : greeks.putDelta;
    case 'gamma':
      return greeks.gamma;
    case 'theta':
      return isCall ? greeks.callTheta : greeks.putTheta;
    case 'vega':
      return greeks.vega;
    case 'rho':
      return isCall ? greeks.callRho : greeks.putRho;
    case 'charm':
      return calcCharm(spot, strike, rate, vol, time, isCall);
    case 'vanna':
      return calcVanna(spot, strike, rate, vol, time);
    default:
      return isCall ? greeks.callDelta : greeks.putDelta;
  }
}

/**
 * Canvas chart renderer extending Chart base class
 */
class GreeksCanvasChart extends Chart {
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
      minX,
      maxX,
      minY,
      maxY,
      points,
      spotCurrent,
      currentGreekVal,
      greekMeta,
    } = this.plotData;

    const xTicks = this.niceTicks(minX, maxX, 7);
    const yTicks = this.niceTicks(minY, maxY, 6);

    this.drawGrid(xTicks, yTicks, minX, maxX, minY, maxY);
    this.drawAxes(xTicks, yTicks, minX, maxX, minY, maxY, 'Underlying Asset Price ($)', greekMeta.yLabel);

    const zeroY = this.yScale(0, minY, maxY);
    const ctx = this.ctx;

    // Zero baseline
    if (minY <= 0 && maxY >= 0) {
      ctx.save();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(this.chartX, zeroY);
      ctx.lineTo(this.chartX + this.chartW, zeroY);
      ctx.stroke();
      ctx.restore();
    }

    // Greek Curve (Royal Blue)
    if (points.length > 1) {
      const screenPoints = points.map(p => ({
        x: this.xScale(p.x, minX, maxX),
        y: this.yScale(p.y, minY, maxY),
      }));
      this.drawLine(screenPoints, '#2563eb', 2.5);
    }

    // Current Spot Reference Line & Marker
    if (spotCurrent >= minX && spotCurrent <= maxX) {
      const cx = this.xScale(spotCurrent, minX, maxX);
      const cy = this.yScale(currentGreekVal, minY, maxY);

      ctx.save();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, this.chartY);
      ctx.lineTo(cx, this.chartY + this.chartH);
      ctx.stroke();
      ctx.restore();

      this.drawPoint(cx, cy, '#4f46e5', 5);
      this.drawLabelWithBackground(
        `Spot: $${spotCurrent} (${currentGreekVal.toFixed(3)})`,
        cx,
        this.chartY + 12,
        '#4f46e5',
        { align: 'center', baseline: 'top', bg: 'rgba(238, 242, 255, 0.95)', border: '#c7d2fe' }
      );
    }

    // Hover tooltip
    if (this._mouse && this._inChartArea(this._mouse.x, this._mouse.y)) {
      const hX = this.xToValue(this._mouse.x, minX, maxX);
      const hY = evaluateGreek(
        this.plotData.greekKey,
        hX,
        this.plotData.strike,
        this.plotData.rate,
        this.plotData.vol,
        this.plotData.time,
        this.plotData.isCall
      );

      ctx.save();
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this._mouse.x, this.chartY);
      ctx.lineTo(this._mouse.x, this.chartY + this.chartH);
      ctx.stroke();

      const text = `S: $${hX.toFixed(1)} | ${greekMeta.name}: ${hY.toFixed(4)}`;
      const tw = ctx.measureText(text).width + 20;
      const tx = this._mouse.x > this.chartX + this.chartW - tw - 15 ? this._mouse.x - tw - 10 : this._mouse.x + 10;
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

/**
 * Main factory per ADR-0003 contract
 */
export function create(container, config = {}) {
  if (!container) throw new Error('greeks-visualizer requires a container element');

  let currentConfig = {
    greek: 'delta',
    x_axis: 'spot',
    spot: 100,
    strike: 100,
    rate: 0.05,
    vol: 0.20,
    time_to_expiry: 0.25,
    option_type: 'call',
    ...config,
  };

  if (config.optionType !== undefined) currentConfig.option_type = config.optionType;
  if (config.timeToExpiry !== undefined) currentConfig.time_to_expiry = config.timeToExpiry;

  let chartInstance = null;
  let listeners = [];

  function getPlotData() {
    const greekKey = currentConfig.greek || 'delta';
    const isCall = (currentConfig.option_type || 'call').toLowerCase() === 'call';
    const strike = Number(currentConfig.strike ?? 100);
    const spot = Number(currentConfig.spot ?? 100);
    const rate = Number(currentConfig.rate ?? 0.05);
    const vol = Number(currentConfig.vol ?? 0.20);
    const time = Number(currentConfig.time_to_expiry ?? 0.25);

    const minX = Math.max(10, strike * 0.5);
    const maxX = strike * 1.5;
    const nSteps = 100;
    const step = (maxX - minX) / nSteps;

    const points = [];
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i <= nSteps; i++) {
      const s = minX + i * step;
      const gVal = evaluateGreek(greekKey, s, strike, rate, vol, time, isCall);
      points.push({ x: s, y: gVal });
      minY = Math.min(minY, gVal);
      maxY = Math.max(maxY, gVal);
    }

    const currentGreekVal = evaluateGreek(greekKey, spot, strike, rate, vol, time, isCall);
    minY = Math.min(minY, currentGreekVal);
    maxY = Math.max(maxY, currentGreekVal);

    const span = Math.max(0.001, maxY - minY);
    const plotMinY = minY - span * 0.15;
    const plotMaxY = maxY + span * 0.15;

    const greekMeta = GREEK_METADATA[greekKey] || GREEK_METADATA.delta;

    return {
      greekKey,
      isCall,
      strike,
      spotCurrent: spot,
      rate,
      vol,
      time,
      minX,
      maxX,
      minY: plotMinY,
      maxY: plotMaxY,
      points,
      currentGreekVal,
      greekMeta,
    };
  }

  function render() {
    listeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    listeners = [];
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    const plotData = getPlotData();
    const greekKeys = Object.keys(GREEK_METADATA);

    container.innerHTML = `
      <div class="gv-container" style="display: flex; flex-direction: column; gap: 1.25rem; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        
        <!-- Greek Selector Tabs -->
        <div style="display: flex; flex-wrap: wrap; gap: 0.375rem; border-bottom: 1px solid var(--color-border, #e2e8f0); padding-bottom: 0.75rem;">
          ${greekKeys.map(k => `
            <button
              class="gv-greek-tab"
              data-greek="${k}"
              style="padding: 0.375rem 0.75rem; font-size: 0.8125rem; font-weight: 600; border-radius: 0.375rem; border: 1px solid ${currentConfig.greek === k ? 'var(--color-primary, #0284c7)' : 'var(--color-border, #cbd5e1)'}; background: ${currentConfig.greek === k ? '#e0f2fe' : '#fff'}; color: ${currentConfig.greek === k ? 'var(--color-primary, #0369a1)' : 'var(--color-gray-700, #334155)'}; cursor: pointer;"
            >
              ${GREEK_METADATA[k].name}
            </button>
          `).join('')}
        </div>

        <!-- Metric Readout Card -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 1rem 1.25rem;">
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              ${plotData.greekMeta.name} — ${currentConfig.option_type.toUpperCase()} Option
            </div>
            <div style="font-size: 0.8125rem; color: var(--color-gray-600, #475569); margin-top: 0.125rem;">
              ${plotData.greekMeta.desc}
            </div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Value at Spot $${plotData.spotCurrent}
            </div>
            <div id="gv-metric-val" style="font-size: 1.75rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-primary, #0284c7);">
              ${plotData.currentGreekVal.toFixed(4)}
            </div>
          </div>
        </div>

        <!-- Canvas Chart Area -->
        <div style="width: 100%; height: 320px; position: relative; background: #fff; border-radius: 0.5rem; overflow: hidden;">
          <canvas id="gv-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
        </div>

        <!-- Controls: Option Type Toggle & Parameter Sliders -->
        <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
          
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: 0.8125rem; font-weight: 600; color: var(--color-gray-700, #334155);">Option Type:</span>
            <label style="display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; cursor: pointer;">
              <input type="radio" name="gv-type" value="call" ${currentConfig.option_type === 'call' ? 'checked' : ''} />
              <span>Call</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; cursor: pointer;">
              <input type="radio" name="gv-type" value="put" ${currentConfig.option_type === 'put' ? 'checked' : ''} />
              <span>Put</span>
            </label>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <!-- Spot Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; color: var(--color-gray-700, #334155); margin-bottom: 0.25rem;">
                <span>Spot Price (S)</span>
                <span id="gv-spot-badge">$${Number(currentConfig.spot).toFixed(0)}</span>
              </div>
              <input type="range" id="gv-spot-slider" min="50" max="150" step="1" value="${currentConfig.spot}" style="width: 100%; accent-color: var(--color-primary, #0284c7);" />
            </div>

            <!-- Volatility Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; color: var(--color-gray-700, #334155); margin-bottom: 0.25rem;">
                <span>Volatility (σ)</span>
                <span id="gv-vol-badge">${(Number(currentConfig.vol) * 100).toFixed(0)}%</span>
              </div>
              <input type="range" id="gv-vol-slider" min="0.05" max="1.00" step="0.01" value="${currentConfig.vol}" style="width: 100%; accent-color: var(--color-primary, #0284c7);" />
            </div>

            <!-- Time to Expiry Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; color: var(--color-gray-700, #334155); margin-bottom: 0.25rem;">
                <span>Time to Expiry (T)</span>
                <span id="gv-time-badge">${Number(currentConfig.time_to_expiry).toFixed(2)} yrs</span>
              </div>
              <input type="range" id="gv-time-slider" min="0.02" max="2.00" step="0.02" value="${currentConfig.time_to_expiry}" style="width: 100%; accent-color: var(--color-primary, #0284c7);" />
            </div>

            <!-- Rate Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; color: var(--color-gray-700, #334155); margin-bottom: 0.25rem;">
                <span>Risk-Free Rate (r)</span>
                <span id="gv-rate-badge">${(Number(currentConfig.rate) * 100).toFixed(1)}%</span>
              </div>
              <input type="range" id="gv-rate-slider" min="0.00" max="0.15" step="0.005" value="${currentConfig.rate}" style="width: 100%; accent-color: var(--color-primary, #0284c7);" />
            </div>
          </div>

        </div>

      </div>
    `;

    const canvasEl = container.querySelector('#gv-canvas');
    if (canvasEl && typeof canvasEl.getContext === 'function' && canvasEl.getContext('2d')) {
      try {
        chartInstance = new GreeksCanvasChart(canvasEl);
        chartInstance.setPlotData(plotData);
      } catch (err) {
        console.warn('Canvas initialization error:', err);
      }
    }

    // Attach listeners
    container.querySelectorAll('.gv-greek-tab').forEach(tab => {
      const onTab = () => {
        currentConfig.greek = tab.getAttribute('data-greek');
        render();
      };
      tab.addEventListener('click', onTab);
      listeners.push({ el: tab, type: 'click', fn: onTab });
    });

    container.querySelectorAll('input[name="gv-type"]').forEach(radio => {
      const onRadio = (e) => {
        currentConfig.option_type = e.target.value;
        render();
      };
      radio.addEventListener('change', onRadio);
      listeners.push({ el: radio, type: 'change', fn: onRadio });
    });

    const spotSlider = container.querySelector('#gv-spot-slider');
    const volSlider = container.querySelector('#gv-vol-slider');
    const timeSlider = container.querySelector('#gv-time-slider');
    const rateSlider = container.querySelector('#gv-rate-slider');

    if (spotSlider) {
      const onSpot = (e) => {
        currentConfig.spot = parseFloat(e.target.value);
        const b = container.querySelector('#gv-spot-badge');
        if (b) b.textContent = `$${currentConfig.spot.toFixed(0)}`;
        updatePlot();
      };
      spotSlider.addEventListener('input', onSpot);
      listeners.push({ el: spotSlider, type: 'input', fn: onSpot });
    }

    if (volSlider) {
      const onVol = (e) => {
        currentConfig.vol = parseFloat(e.target.value);
        const b = container.querySelector('#gv-vol-badge');
        if (b) b.textContent = `${(currentConfig.vol * 100).toFixed(0)}%`;
        updatePlot();
      };
      volSlider.addEventListener('input', onVol);
      listeners.push({ el: volSlider, type: 'input', fn: onVol });
    }

    if (timeSlider) {
      const onTime = (e) => {
        currentConfig.time_to_expiry = parseFloat(e.target.value);
        const b = container.querySelector('#gv-time-badge');
        if (b) b.textContent = `${currentConfig.time_to_expiry.toFixed(2)} yrs`;
        updatePlot();
      };
      timeSlider.addEventListener('input', onTime);
      listeners.push({ el: timeSlider, type: 'input', fn: onTime });
    }

    if (rateSlider) {
      const onRate = (e) => {
        currentConfig.rate = parseFloat(e.target.value);
        const b = container.querySelector('#gv-rate-badge');
        if (b) b.textContent = `${(currentConfig.rate * 100).toFixed(1)}%`;
        updatePlot();
      };
      rateSlider.addEventListener('input', onRate);
      listeners.push({ el: rateSlider, type: 'input', fn: onRate });
    }
  }

  function updatePlot() {
    const plotData = getPlotData();
    const metricEl = container.querySelector('#gv-metric-val');
    if (metricEl) {
      metricEl.textContent = plotData.currentGreekVal.toFixed(4);
    }
    if (chartInstance) {
      chartInstance.setPlotData(plotData);
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
      if (newConfig.optionType !== undefined) currentConfig.option_type = newConfig.optionType;
      if (newConfig.timeToExpiry !== undefined) currentConfig.time_to_expiry = newConfig.timeToExpiry;
      render();
    },

    getPlotData,
  };
}

