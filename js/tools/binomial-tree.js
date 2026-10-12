/**
 * binomial-tree.js — Interactive Cox-Ross-Rubinstein (CRR) Binomial Tree Stepper
 * Visualizes lattice nodes, stock price evolution, option backward induction,
 * and American early exercise decisions.
 * Follows component contract in ADR-0003: create(container, config) -> { destroy(), update(newConfig) }
 */

import { binomialCRR } from '../lib/finance-math/options-advanced.js';
import { renderShowWork } from '../components/show-work.js';

export function create(container, config = {}) {
  if (!container) throw new Error('binomial-tree requires a container element');

  let currentConfig = {
    s0: 100,
    strike: 100,
    rate: 0.05,
    vol: 0.20,
    time: 1.0,
    steps: 3,
    option_type: 'call',
    exercise_style: 'american',
    ...config,
  };

  if (config.optionType !== undefined) currentConfig.option_type = config.optionType;
  if (config.exerciseStyle !== undefined) currentConfig.exercise_style = config.exerciseStyle;

  let listeners = [];

  function computeTree() {
    const isCall = (currentConfig.option_type || 'call').toLowerCase() === 'call';
    const isAmerican = (currentConfig.exercise_style || 'american').toLowerCase() === 'american';

    return binomialCRR({
      spot: Number(currentConfig.s0 ?? 100),
      strike: Number(currentConfig.strike ?? 100),
      rate: Number(currentConfig.rate ?? 0.05),
      vol: Number(currentConfig.vol ?? 0.20),
      time: Number(currentConfig.time ?? 1.0),
      steps: Math.max(1, Math.min(5, Math.round(currentConfig.steps ?? 3))),
      isCall,
      isAmerican,
    });
  }

  function render() {
    listeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    listeners = [];

    const res = computeTree();
    const { tree, price, u, d, p, dt } = res;
    const isCall = (currentConfig.option_type || 'call').toLowerCase() === 'call';
    const isAmerican = (currentConfig.exercise_style || 'american').toLowerCase() === 'american';

    container.innerHTML = `
      <div class="bt-container" style="display: flex; flex-direction: column; gap: 1.5rem; background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        
        <!-- Summary Cards Header -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem;">
          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              ${isAmerican ? 'American' : 'European'} ${isCall ? 'Call' : 'Put'} Price
            </div>
            <div id="bt-price-val" style="font-size: 1.5rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-primary, #0284c7); margin-top: 0.25rem;">
              $${price.toFixed(2)}
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Up Factor (u) / Down (d)
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-gray-900, #0f172a); margin-top: 0.25rem;">
              ${u.toFixed(3)} / ${d.toFixed(3)}
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Risk-Neutral Prob (p)
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-gray-900, #0f172a); margin-top: 0.25rem;">
              ${(p * 100).toFixed(1)}%
            </div>
          </div>

          <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 0.75rem;">
            <div style="font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-500, #64748b);">
              Step Size (Δt)
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono, monospace); color: var(--color-gray-900, #0f172a); margin-top: 0.25rem;">
              ${dt.toFixed(2)} yrs
            </div>
          </div>
        </div>

        <!-- Lattice Tree Display -->
        <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.625rem; padding: 1.25rem; overflow-x: auto;">
          <div style="font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; color: var(--color-gray-700, #334155); margin-bottom: 1rem;">
            Lattice Nodes: Stock Price S [Top] & Option Value V [Bottom]
          </div>

          <div style="display: flex; gap: 2rem; align-items: center; justify-content: space-around; min-width: ${tree.length * 150}px;">
            ${tree.map((stepNodes, stepIdx) => `
              <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: center; flex: 1;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-gray-500, #64748b); text-transform: uppercase;">
                  Step ${stepIdx} (t=${(stepIdx * dt).toFixed(2)})
                </div>

                <div style="display: flex; flex-direction: column; gap: 0.625rem; width: 100%;">
                  ${stepNodes.slice().reverse().map(node => `
                    <div style="background: ${node.isExercised ? '#fef3c7' : '#fff'}; border: 1.5px solid ${node.isExercised ? '#f59e0b' : 'var(--color-border, #cbd5e1)'}; border-radius: 0.5rem; padding: 0.5rem 0.75rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-size: 0.75rem;">
                      <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--color-gray-800, #1e293b);">
                        <span>S: $${node.spot.toFixed(2)}</span>
                        ${node.isExercised ? `<span style="color: #b45309; font-size: 0.625rem; font-weight: 800; background: #fde68a; padding: 1px 4px; border-radius: 2px;">EXERCISE</span>` : ''}
                      </div>
                      <div style="display: flex; justify-content: space-between; margin-top: 0.25rem; font-family: var(--font-mono, monospace);">
                        <span style="color: var(--color-primary, #0284c7); font-weight: 700;">V: $${node.optionVal.toFixed(2)}</span>
                        <span style="color: var(--color-gray-500, #64748b);">Int: $${node.intrinsic.toFixed(1)}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Step-by-Step Show Work Mount -->
        <div id="bt-show-work-mount"></div>

        <!-- Controls: Option Type, American/European, Sliders -->
        <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 0.5rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
          
          <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 0.8125rem; font-weight: 600; color: var(--color-gray-700, #334155);">Option Type:</span>
              <label style="display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; cursor: pointer;">
                <input type="radio" name="bt-type" value="call" ${isCall ? 'checked' : ''} />
                <span>Call</span>
              </label>
              <label style="display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; cursor: pointer;">
                <input type="radio" name="bt-type" value="put" ${!isCall ? 'checked' : ''} />
                <span>Put</span>
              </label>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 0.8125rem; font-weight: 600; color: var(--color-gray-700, #334155);">Exercise Style:</span>
              <label style="display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; cursor: pointer;">
                <input type="radio" name="bt-style" value="american" ${isAmerican ? 'checked' : ''} />
                <span>American</span>
              </label>
              <label style="display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; cursor: pointer;">
                <input type="radio" name="bt-style" value="european" ${!isAmerican ? 'checked' : ''} />
                <span>European</span>
              </label>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
            <!-- Steps Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; color: var(--color-gray-700, #334155); margin-bottom: 0.25rem;">
                <span>Lattice Steps (N)</span>
                <span id="bt-steps-badge">${currentConfig.steps}</span>
              </div>
              <input type="range" id="bt-steps-slider" min="1" max="5" step="1" value="${currentConfig.steps}" style="width: 100%; accent-color: var(--color-primary, #0284c7);" />
            </div>

            <!-- Spot Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; color: var(--color-gray-700, #334155); margin-bottom: 0.25rem;">
                <span>Spot Price (S0)</span>
                <span id="bt-spot-badge">$${Number(currentConfig.s0).toFixed(0)}</span>
              </div>
              <input type="range" id="bt-spot-slider" min="50" max="150" step="1" value="${currentConfig.s0}" style="width: 100%; accent-color: var(--color-primary, #0284c7);" />
            </div>

            <!-- Volatility Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; color: var(--color-gray-700, #334155); margin-bottom: 0.25rem;">
                <span>Volatility (σ)</span>
                <span id="bt-vol-badge">${(Number(currentConfig.vol) * 100).toFixed(0)}%</span>
              </div>
              <input type="range" id="bt-vol-slider" min="0.05" max="0.60" step="0.01" value="${currentConfig.vol}" style="width: 100%; accent-color: var(--color-primary, #0284c7);" />
            </div>

            <!-- Rate Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; color: var(--color-gray-700, #334155); margin-bottom: 0.25rem;">
                <span>Risk-Free Rate (r)</span>
                <span id="bt-rate-badge">${(Number(currentConfig.rate) * 100).toFixed(1)}%</span>
              </div>
              <input type="range" id="bt-rate-slider" min="0.0" max="0.15" step="0.005" value="${currentConfig.rate}" style="width: 100%; accent-color: var(--color-primary, #0284c7);" />
            </div>
          </div>

        </div>

      </div>
    `;

    // Render show-work breakdown
    const swMount = container.querySelector('#bt-show-work-mount');
    if (swMount) {
      const stepsData = [
        {
          step: 1,
          label: 'Lattice Parameters (u, d, p)',
          formula: 'u = e^{\\sigma \\sqrt{\\Delta t}}, \\quad d = 1/u, \\quad p = \\frac{e^{r \\Delta t} - d}{u - d}',
          values: `u = ${u.toFixed(4)}, \\quad d = ${d.toFixed(4)}, \\quad p = ${(p * 100).toFixed(2)}\\%`,
          result: `Step size \\Delta t = ${dt.toFixed(3)} yrs`,
          note: 'Constructs the recombining binomial lattice matching the underlying volatility.',
        },
        {
          step: 2,
          label: 'Backward Induction & Continuation Value',
          formula: 'C = e^{-r \\Delta t} [p V_{up} + (1-p) V_{down}]',
          values: `Discount factor = ${Math.exp(-Number(currentConfig.rate) * dt).toFixed(4)}`,
          result: `Root Option Value = $${price.toFixed(2)}`,
          highlight: true,
          note: isAmerican ? 'American style compares continuation value C with intrinsic value at every node.' : 'European style holds until expiration.',
        },
      ];

      renderShowWork(swMount, stepsData, {
        title: 'CRR Binomial Tree Mathematical Breakdown',
        defaultOpen: false,
        id: 'bt-sw-panel',
      });
    }

    // Attach listeners
    container.querySelectorAll('input[name="bt-type"]').forEach(radio => {
      const onType = (e) => {
        currentConfig.option_type = e.target.value;
        render();
      };
      radio.addEventListener('change', onType);
      listeners.push({ el: radio, type: 'change', fn: onType });
    });

    container.querySelectorAll('input[name="bt-style"]').forEach(radio => {
      const onStyle = (e) => {
        currentConfig.exercise_style = e.target.value;
        render();
      };
      radio.addEventListener('change', onStyle);
      listeners.push({ el: radio, type: 'change', fn: onStyle });
    });

    const stepsSlider = container.querySelector('#bt-steps-slider');
    const spotSlider = container.querySelector('#bt-spot-slider');
    const volSlider = container.querySelector('#bt-vol-slider');
    const rateSlider = container.querySelector('#bt-rate-slider');

    if (stepsSlider) {
      const onSteps = (e) => {
        currentConfig.steps = parseInt(e.target.value, 10);
        render();
      };
      stepsSlider.addEventListener('input', onSteps);
      listeners.push({ el: stepsSlider, type: 'input', fn: onSteps });
    }

    if (spotSlider) {
      const onSpot = (e) => {
        currentConfig.s0 = parseFloat(e.target.value);
        render();
      };
      spotSlider.addEventListener('input', onSpot);
      listeners.push({ el: spotSlider, type: 'input', fn: onSpot });
    }

    if (volSlider) {
      const onVol = (e) => {
        currentConfig.vol = parseFloat(e.target.value);
        render();
      };
      volSlider.addEventListener('input', onVol);
      listeners.push({ el: volSlider, type: 'input', fn: onVol });
    }

    if (rateSlider) {
      const onRate = (e) => {
        currentConfig.rate = parseFloat(e.target.value);
        render();
      };
      rateSlider.addEventListener('input', onRate);
      listeners.push({ el: rateSlider, type: 'input', fn: onRate });
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
      render();
    },

    getTree() {
      return computeTree();
    },
  };
}
