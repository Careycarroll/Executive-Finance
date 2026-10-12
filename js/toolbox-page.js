/**
 * toolbox-page.js — Live visual harness for all 12 interactive financial components
 * Verifies and mounts components per ADR-0003 contract
 */

const TOOL_DEFINITIONS = {
  'cash-flow-chart': {
    name: 'Cash Flow Chart',
    path: './tools/cash-flow-chart.js',
    milestone: 'M4',
    description: 'Discounted cash flow series, NPV profile, and discount rate sensitivity curve (Hawawini Ch. 2; Bodie Ch. 5).',
    defaults: {
      periods: 10,
      cash_flows: [-1000, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
      discount_rate: 0.10,
      growth_rate: 0.00,
      show_pv: true,
      show_cumulative: true,
    },
  },
  'payoff-diagram': {
    name: 'Multi-Leg Payoff Diagram',
    path: './tools/payoff-diagram.js',
    milestone: 'M4',
    description: 'Options strategy payoff and PnL curve with live Black-Scholes current value curve (Natenberg Ch. 11; Hull Ch. 12).',
    defaults: {
      spot: 100,
      legs: [
        { type: 'call', strike: 100, premium: 5, qty: 1 },
        { type: 'call', strike: 110, premium: 2, qty: -1 },
      ],
      show_current_value: true,
      vol: 0.20,
      rate: 0.05,
      time_to_expiry: 0.25,
    },
  },
  'sensitivity-panel': {
    name: 'Sensitivity Panel & Heatmap',
    path: './tools/sensitivity-panel.js',
    milestone: 'M4',
    description: 'Black-Scholes valuation sensitivities with dual-parameter 2D heatmap matrix (Hull Ch. 15).',
    defaults: {
      spot: 100,
      strike: 100,
      rate: 0.05,
      vol: 0.20,
      time: 1.0,
    },
  },
  'fs-reformulator': {
    name: 'Financial Statement Reformulator',
    path: './tools/fs-reformulator.js',
    milestone: 'M4',
    description: 'Operating vs financing reformulation with Penman ROE decomposition and spread analysis (Penman Ch. 8, 11).',
    defaults: {
      operatingAssets: 1000,
      operatingLiabilities: 300,
      financialLiabilities: 400,
      financialAssets: 50,
      operatingIncome: 140,
      netFinancialExpense: 24,
    },
  },
  'greeks-visualizer': {
    name: 'Greeks Visualizer',
    path: './tools/greeks-visualizer.js',
    milestone: 'M5',
    description: 'First and second-order option Greeks (Delta, Gamma, Theta, Vega, Rho, Charm, Vanna) across spot and expiry (Hull Ch. 19; Natenberg Ch. 6).',
    defaults: {
      spot: 100,
      strike: 100,
      rate: 0.05,
      vol: 0.20,
      time: 1.0,
      isCall: true,
    },
  },
  'frontier-plotter': {
    name: 'Efficient Frontier & CAL Plotter',
    path: './tools/frontier-plotter.js',
    milestone: 'M5',
    description: 'Markowitz Modern Portfolio Theory: Minimum Variance Portfolio (MVP), Tangency portfolio, and Capital Allocation Line (Bodie Ch. 6, 7).',
    defaults: {
      expReturnA: 0.10,
      volA: 0.20,
      expReturnB: 0.05,
      volB: 0.10,
      corr: 0.20,
      riskFreeRate: 0.03,
    },
  },
  'monte-carlo': {
    name: 'Monte Carlo Runner & VaR',
    path: './tools/monte-carlo.js',
    milestone: 'M5',
    description: 'Geometric Brownian Motion (GBM) stochastic paths, terminal return distribution, 95% VaR, and Expected Shortfall (Hull Ch. 21, 22).',
    defaults: {
      s0: 100,
      drift: 0.08,
      vol: 0.20,
      horizon: 1.0,
      nPaths: 2000,
      seed: 42,
    },
  },
  'yield-curve': {
    name: 'Yield Curve & Term Structure Plotter',
    path: './tools/yield-curve.js',
    milestone: 'M5',
    description: 'Term structure spot rates, forward rate bootstrapping, parallel shifts, slope twists, and 10Y-2Y recession spread (Bodie Ch. 15).',
    defaults: {
      preset: 'normal',
      parallelShiftBps: 0,
      twistSlopeBps: 0,
    },
  },
  'binomial-tree': {
    name: 'Binomial Tree Stepper',
    path: './tools/binomial-tree.js',
    milestone: 'M5',
    description: 'Cox-Ross-Rubinstein (CRR) discrete lattice tree with backward induction and American early-exercise detection (Hull Ch. 13).',
    defaults: {
      s0: 100,
      strike: 100,
      rate: 0.05,
      vol: 0.20,
      steps: 5,
      optionType: 'put',
      exerciseStyle: 'american',
    },
  },
  'multiples-table': {
    name: 'Multiples & Comparables Table',
    path: './tools/multiples-table.js',
    milestone: 'M5',
    description: 'Peer valuation matrix with EV/EBITDA, P/E, P/B, harmonic mean bias correction, and football-field valuation bars (Easton Mod. 14; Lundholm Ch. 11).',
    defaults: {
      target: { ebitda: 100, earnings: 60, book_value: 400, net_debt: 50, shares: 25 },
      comps: [
        { name: 'Peer Alpha', ev_ebitda: 12.0, pe: 20.0, pb: 2.5 },
        { name: 'Peer Beta', ev_ebitda: 10.0, pe: 18.0, pb: 2.0 },
        { name: 'Peer Gamma', ev_ebitda: 14.0, pe: 22.0, pb: 3.0 },
        { name: 'Peer Delta', ev_ebitda: 11.0, pe: 19.0, pb: 2.2 },
      ],
      weights: { ev_ebitda: 0.5, pe: 0.3, pb: 0.2 },
    },
  },
  'correlation-heatmap': {
    name: 'Correlation Heatmap & Diversification',
    path: './tools/correlation-heatmap.js',
    milestone: 'M5',
    description: 'N×N cross-asset correlation matrix visualizer with color-coded divergence, symmetric live editing, and Bodie diversification ratio (Bodie Ch. 7).',
    defaults: {
      assets: ['SPY', 'TLT', 'GLD', 'VNQ'],
      matrix: [
        [1.00, -0.30, 0.10, 0.60],
        [-0.30, 1.00, 0.20, -0.10],
        [0.10, 0.20, 1.00, 0.15],
        [0.60, -0.10, 0.15, 1.00],
      ],
      vols: [0.18, 0.14, 0.15, 0.22],
    },
  },
  'decision-tree': {
    name: 'Rules-Based Decision Flowchart',
    path: './tools/decision-tree.js',
    milestone: 'M5',
    description: 'Interactive choice wizard for entity choice, Section 83(b) election, and M&A deal structure (Scholes & Wolfson Ch. 4, 8, 13).',
    defaults: {
      preset: 'entity_choice',
    },
  },
};

let currentInstance = null;

async function mountTool(toolKey) {
  const meta = TOOL_DEFINITIONS[toolKey];
  if (!meta) return;

  const metaId = document.getElementById('tool-meta-id');
  const metaDesc = document.getElementById('tool-meta-desc');
  const container = document.getElementById('active-tool-container');

  if (metaId) metaId.textContent = `js/tools/${toolKey}.js (${meta.milestone})`;
  if (metaDesc) metaDesc.textContent = meta.description;

  // Cleanly destroy previously mounted instance per ADR-0003
  if (currentInstance && typeof currentInstance.destroy === 'function') {
    currentInstance.destroy();
    currentInstance = null;
  }

  container.innerHTML = `
    <div style="padding: 3rem 1rem; text-align: center; color: #64748b; font-size: 0.9375rem;">
      <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⚙️</div>
      Loading <code>${meta.name}</code>...
    </div>
  `;

  try {
    const module = await import(`./tools/${toolKey}.js`);
    container.innerHTML = '';
    if (typeof module.create === 'function') {
      currentInstance = module.create(container, JSON.parse(JSON.stringify(meta.defaults)));
    } else {
      container.innerHTML = `<div style="color: red; padding: 2rem;">Module ${toolKey} did not export create()</div>`;
    }
  } catch (err) {
    console.error(`Failed to load ${toolKey}:`, err);
    container.innerHTML = `
      <div style="color: #dc2626; padding: 2rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
        <strong>Error mounting tool ${toolKey}:</strong>
        <pre style="margin-top: 0.5rem; font-size: 0.8125rem;">${err.message}</pre>
      </div>
    `;
  }
}

// Bind button clicks
document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.toolbox-nav-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const toolKey = btn.getAttribute('data-tool');
      mountTool(toolKey);
    });
  });

  // Mount initial tool (cash-flow-chart)
  mountTool('cash-flow-chart');
});

