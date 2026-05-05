/**
 * formulas.js -- All 32 textbook formulas with KaTeX rendering
 * Source: Hawawini and Viallet, Finance for Executives, 6th Edition
 */

const FORMULAS = [
  // ── PART I ──────────────────────────────────────────────────────────────────
  {
    num: 1, part: 1,
    title: 'Discount Factor',
    ref: 'Chapter 2, Equation 2.3',
    desc: 'Value of $1 to be received at time T, discounted to the present at rate k.',
    latex: 'DF_{T,k} = \\dfrac{\\$1}{(1+k)^T} = \\left(\\dfrac{\\$1}{1+k}\\right)^T = \\$1 \\times (1+k)^{-T}',
    notes: 'k = discount rate (cost of capital); T = time in years. The discount factor is always between 0 and 1.'
  },
  {
    num: 2, part: 1,
    title: 'Present Value of a Cash-Flow Stream',
    ref: 'Chapter 2',
    desc: 'Value today of a T-year cash-flow stream discounted at rate k.',
    latex: 'PV = [CF_1 \\times DF_{1,k}] + \\cdots + [CF_t \\times DF_{t,k}] + \\cdots + [CF_T \\times DF_{T,k}]',
    notes: 'Each cash flow is multiplied by its period-specific discount factor. The sum is the present value of the entire stream.'
  },
  {
    num: 3, part: 1,
    title: 'Present Value of a Perpetuity',
    ref: 'Chapter 2, Equation 2.6',
    desc: 'Present value of an infinite stream of identical cash flows discounted at rate k.',
    latex: 'PV = \\dfrac{CF}{k}',
    notes: 'A perpetuity pays the same cash flow CF every period forever. Examples include preferred stock dividends and consol bonds.'
  },
  {
    num: 4, part: 1,
    title: 'Present Value of a Growing Perpetuity',
    ref: 'Chapter 2, Equation 2.9',
    desc: 'Present value of a perpetuity growing at constant rate g, with first cash flow CF\u2081 at end of year 1.',
    latex: 'PV = \\dfrac{CF_1}{k - g} \\quad \\text{with } k > g',
    notes: 'Requires k > g. Used in the Gordon Growth Model for stock valuation and terminal value estimation.'
  },
  {
    num: 5, part: 1,
    title: 'Present Value of an Annuity',
    ref: 'Chapter 2, Equation 2.11',
    desc: 'Present value of a T-year annuity at rate k with constant cash flow CF.',
    latex: 'PV = CF \\times ADF_{T,k} \\qquad \\text{where} \\quad ADF_{T,k} = \\dfrac{1}{k}\\left[1 - \\dfrac{1}{(1+k)^T}\\right]',
    notes: 'ADF = Annuity Discount Factor. Used for loan payments, lease valuations, and any fixed periodic cash flow.'
  },
  {
    num: 6, part: 1,
    title: 'Sharpe Ratio',
    ref: 'Chapter 3, Equation 3.8',
    desc: 'Risk-adjusted return of asset i: excess return per unit of total risk.',
    latex: '\\text{Sharpe ratio of asset } i = \\dfrac{E(R_i) - R_F}{\\sigma_i}',
    notes: 'E(R\u1d62) = expected return; R\u209F = risk-free rate; \u03c3\u1d62 = standard deviation of returns. Higher Sharpe ratio = better risk-adjusted performance.'
  },
  {
    num: 7, part: 1,
    title: 'Beta Coefficient',
    ref: 'Chapter 3, Equation 3.11',
    desc: 'Measure of systematic (market) risk of stock i relative to the market portfolio.',
    latex: '\\beta_i = \\dfrac{\\text{Cov}(R_i, R_M)}{\\text{Var}(R_M)} = \\rho_{iM}\\dfrac{\\sigma_i}{\\sigma_M}',
    notes: '\u03b2 = 1: same risk as market. \u03b2 > 1: more volatile than market. \u03b2 < 1: less volatile. \u03b2 = 0: no systematic risk.'
  },
  {
    num: 8, part: 1,
    title: 'Capital Asset Pricing Model (CAPM)',
    ref: 'Chapter 3, Equation 3.13a; Chapter 10, Equation 10.11a; Chapter 12, Equation 12.10',
    desc: 'Expected return of asset i as a function of its systematic risk (beta).',
    latex: 'E(R_i) = R_F + [E(R_M) - R_F]\\,\\beta_i',
    notes: 'The term [E(R\u2098) - R\u209F] is the market risk premium. Used to estimate cost of equity capital in WACC calculations.'
  },

  // ── PART II ─────────────────────────────────────────────────────────────────
  {
    num: 9, part: 2,
    title: 'Invested Capital',
    ref: 'Chapter 4, Equation 4.5',
    desc: 'Total capital invested in the operating assets of the firm.',
    latex: '\\text{Invested Capital} = \\text{Cash} + \\text{WCR} + \\text{Net Fixed Assets}',
    notes: 'WCR = Working Capital Requirement. Invested capital equals capital employed (the right side of the managerial balance sheet).'
  },
  {
    num: 10, part: 2,
    title: 'Capital Employed',
    ref: 'Chapter 4, Equation 4.6',
    desc: 'Total capital provided by debt holders and equity holders to finance the firm.',
    latex: '\\text{Capital Employed} = \\text{Short-term Debt} + \\text{Long-term Debt} + \\text{Owners Equity}',
    notes: 'Capital employed always equals invested capital. This identity is the foundation of the managerial balance sheet.'
  },
  {
    num: 11, part: 2,
    title: 'Working Capital Requirement (WCR)',
    ref: 'Chapter 4, Equation 4.7',
    desc: 'Net investment required to finance the operating cycle.',
    latex: 'WCR = [\\text{Accounts Receivable} + \\text{Inventories} + \\text{Prepaid Expenses}] - [\\text{Accounts Payable} + \\text{Net Accruals}]',
    notes: 'WCR is positive when operating assets exceed operating liabilities. A negative WCR (e.g. supermarkets) means suppliers finance the firm.'
  },
  {
    num: 12, part: 2,
    title: 'EBITDA',
    ref: 'Chapter 4, Equation 4.10',
    desc: 'Earnings before interest, tax, depreciation, and amortization.',
    latex: 'EBITDA = EBIT + \\text{Depreciation Expense} + \\text{Amortization Expense}',
    notes: 'EBITDA is a proxy for operating cash flow before tax. Widely used in valuation multiples (EV/EBITDA).'
  },
  {
    num: 13, part: 2,
    title: 'Free Cash Flow (FCF)',
    ref: 'Chapter 4, Equation 4.15',
    desc: 'Cash generated by operations available to all capital providers after reinvestment.',
    latex: 'FCF = EBIT(1 - T_C) + \\text{Depreciation} - \\Delta WCR - \\text{CAPEX}',
    notes: 'FCF is independent of financing decisions. It is the numerator in DCF valuation. CAPEX = capital expenditures net of disposals.'
  },
  {
    num: 14, part: 2,
    title: 'Return on Equity (ROE)',
    ref: 'Chapter 6, Equation 6.1',
    desc: 'After-tax profitability of the equity capital invested by shareholders.',
    latex: 'ROE = \\dfrac{\\text{Earnings After Tax}}{\\text{Owners Equity}}',
    notes: 'ROE measures how efficiently the firm uses shareholders funds. Affected by operating profitability, financial leverage, and taxation.'
  },
  {
    num: 15, part: 2,
    title: 'Return on Invested Capital Before Tax (ROIC\u1d2e\u1d1b)',
    ref: 'Chapter 6, Equation 6.4',
    desc: 'Pre-tax operating profitability of the total capital invested in the firm.',
    latex: 'ROIC_{BT} = \\dfrac{EBIT}{\\text{Invested Capital}} = \\dfrac{EBIT}{\\text{Sales}} \\times \\dfrac{\\text{Sales}}{\\text{Invested Capital}}',
    notes: 'Decomposes into operating margin (EBIT/Sales) and asset turnover (Sales/IC). Both drivers must be managed to improve ROIC.'
  },
  {
    num: 16, part: 2,
    title: 'Structure of Return on Equity',
    ref: 'Chapter 6, Equation 6.9',
    desc: 'Full DuPont decomposition of ROE into five value drivers.',
    latex: 'ROE = \\dfrac{EBIT}{\\text{Sales}} \\times \\dfrac{\\text{Sales}}{IC} \\times \\dfrac{EBT}{EBIT} \\times \\dfrac{IC}{\\text{Equity}} \\times \\dfrac{EAT}{EBT}',
    notes: 'The five factors: (1) operating margin, (2) asset turnover, (3) interest burden, (4) financial leverage, (5) tax burden.'
  },
  {
    num: 17, part: 2,
    title: 'Self-Sustainable Growth Rate (SGR)',
    ref: 'Chapter 6, Equation 6.12',
    desc: 'Maximum rate at which a firm can grow without issuing new equity capital.',
    latex: 'SGR = \\text{Profit Retention Rate} \\times ROE',
    notes: 'If actual growth exceeds SGR, the firm must raise external equity or increase leverage. Key input to financial strategy planning.'
  },

  // ── PART III ────────────────────────────────────────────────────────────────
  {
    num: 18, part: 3,
    title: 'Net Present Value (NPV)',
    ref: 'Chapter 7',
    desc: 'Value created or destroyed by an investment: present value of future cash flows minus initial outlay.',
    latex: 'NPV(k,T) = -CF_0 + \\dfrac{CF_1}{(1+k)^1} + \\cdots + \\dfrac{CF_t}{(1+k)^t} + \\cdots + \\dfrac{CF_T}{(1+k)^T} = -CF_0 + \\sum_{t=1}^{T} \\dfrac{CF_t}{(1+k)^t}',
    notes: 'Accept if NPV > 0 (value creating). Reject if NPV < 0 (value destroying). NPV = 0 means the project breaks even at the cost of capital.'
  },

  // ── PART IV ─────────────────────────────────────────────────────────────────
  {
    num: 19, part: 4,
    title: 'Bond Price',
    ref: 'Chapter 10, Equation 10.2',
    desc: 'Present value of all future coupon payments and face value, discounted at the yield to maturity y.',
    latex: 'P = \\dfrac{CP_1}{(1+y)^1} + \\dfrac{CP_2}{(1+y)^2} + \\cdots + \\dfrac{CP_T + F}{(1+y)^T}',
    notes: 'CP = coupon payment; F = face value; y = yield to maturity. Bond price moves inversely with yield.'
  },
  {
    num: 20, part: 4,
    title: 'Share Price (Dividend Discount Model)',
    ref: 'Chapter 10, Equation 10.9',
    desc: 'Present value of all future dividend payments discounted at the cost of equity k\u1d31.',
    latex: 'P = \\dfrac{DPS_1}{(1+k_E)^1} + \\dfrac{DPS_2}{(1+k_E)^2} + \\cdots + \\dfrac{DPS_t}{(1+k_E)^t} + \\cdots',
    notes: 'DPS = dividend per share; k\u1d31 = cost of equity. This is the general DDM -- requires forecasting all future dividends.'
  },
  {
    num: 21, part: 4,
    title: 'Constant Dividend Growth Model',
    ref: 'Chapter 10, Equation 10.10',
    desc: 'Share price when dividends grow at a constant rate g in perpetuity.',
    latex: 'P = \\dfrac{DPS_1}{k_E - g}',
    notes: 'Requires k\u1d31 > g. DPS\u2081 = next year dividend. Also called the Gordon Growth Model. Used to estimate cost of equity from observable price.'
  },
  {
    num: 22, part: 4,
    title: 'Enterprise Value and Equity Value',
    ref: 'Chapter 10, Equation 10.13',
    desc: 'Relationship between enterprise value (EV), equity value, debt, and cash.',
    latex: '\\begin{aligned} EV &= \\text{Equity Value} + \\text{Debt} - \\text{Cash} \\\\ V_E &= EV + \\text{Cash} - \\text{Debt} \\end{aligned}',
    notes: 'EV is the value of the firm operating assets. Equity value (V\u1d31) is what belongs to shareholders after paying off debt.'
  },
  {
    num: 23, part: 4,
    title: 'Equity (Levered) Beta',
    ref: 'Chapter 12, Equation 12.6',
    desc: 'Relationship between the levered (equity) beta and the unlevered (asset) beta.',
    latex: '\\beta_{\\text{equity}} = \\beta_{\\text{asset}} \\left[1 + \\dfrac{\\text{Debt}}{\\text{Equity}}\\right]',
    notes: 'Financial leverage amplifies equity beta. To compare firms with different capital structures, unlever betas first. Also called the Hamada equation.'
  },
  {
    num: 24, part: 4,
    title: 'Weighted Average Cost of Capital (WACC)',
    ref: 'Chapter 12, Equation 12.12',
    desc: 'Blended cost of all capital sources, weighted by their market value proportions.',
    latex: 'WACC = k_D(1 - T_C)\\dfrac{D}{E+D} + k_E\\dfrac{E}{E+D}',
    notes: 'k\u1d30 = cost of debt; k\u1d31 = cost of equity; T\u1d04 = corporate tax rate; D = market value of debt; E = market value of equity. Debt is tax-advantaged.'
  },
  {
    num: 25, part: 4,
    title: 'Interest Tax Shield (ITS)',
    ref: 'Chapter 13, Equation 13.3',
    desc: 'Annual tax saving generated by the tax deductibility of interest payments.',
    latex: 'ITS = T_C \\times k_D \\times D',
    notes: 'The interest tax shield is a benefit of debt financing. Its present value increases firm value under the trade-off theory of capital structure.'
  },
  {
    num: 26, part: 4,
    title: 'Market Value of a Levered Firm',
    ref: 'Chapter 13, Equation 13.4',
    desc: 'Value of a levered firm equals the unlevered firm value plus the present value of interest tax shields.',
    latex: 'V_L = V_U + PV_{ITS}',
    notes: 'V\u1d38 = levered firm value; V\u1d41 = unlevered firm value (all-equity). This is the Modigliani-Miller proposition with taxes.'
  },

  // ── PART V ──────────────────────────────────────────────────────────────────
  {
    num: 27, part: 5,
    title: 'Market Value at Risk (MVR)',
    ref: 'Chapter 15, Equation 15.1',
    desc: 'Expected reduction in firm value from a specific risk event.',
    latex: 'MVR = [\\text{Reduction in firm value if risk occurs}] \\times [\\text{Probability that risk occurs}]',
    notes: 'MVR is used to prioritize risks. Risks with high MVR (large impact and/or high probability) should be managed first.'
  },
  {
    num: 28, part: 5,
    title: 'Put-Call Parity',
    ref: 'Chapter 16, Equation 16.5',
    desc: 'Arbitrage-free relationship between put price, call price, stock price, and strike price.',
    latex: 'P_0 = C_0 + Xe^{-R_F T} - S_0',
    notes: 'P\u2080 = put price; C\u2080 = call price; X = strike price; R\u209F = risk-free rate; S\u2080 = current stock price; T = time to expiry.'
  },
  {
    num: 29, part: 5,
    title: 'Black-Scholes Option Pricing Formula',
    ref: 'Chapter 16, Equations 16.6 and 16.7',
    desc: 'Prices of European call and put options on non-dividend-paying stocks.',
    latex: '\\begin{aligned} C_0 &= S_0 N(d_1) - Xe^{-R_F T} N(d_2) \\\\ P_0 &= Xe^{-R_F T}[1 - N(d_2)] - S_0[1 - N(d_1)] \\end{aligned}',
    notes: 'N(d) = cumulative standard normal distribution. d\u2081 and d\u2082 depend on S\u2080, X, R\u209F, T, and \u03c3 (volatility). See Chapter 16 for full derivation.'
  },
  {
    num: 30, part: 5,
    title: 'Market Value Added (MVA)',
    ref: 'Chapter 18, Equation 18.1',
    desc: 'Difference between the market value of capital and the capital employed by the firm.',
    latex: 'MVA = \\text{Market Value of Capital} - \\text{Capital Employed}',
    notes: 'Positive MVA means the firm has created value above what was invested. MVA is the cumulative NPV of all past and expected future investments.'
  },
  {
    num: 31, part: 5,
    title: 'Return on Invested Capital (ROIC)',
    ref: 'Chapter 18',
    desc: 'After-tax operating return earned on the total capital invested in the firm.',
    latex: 'ROIC = \\dfrac{NOPAT}{\\text{Invested Capital}} = \\dfrac{EBIT(1 - T_C)}{\\text{Invested Capital}}',
    notes: 'NOPAT = Net Operating Profit After Tax. Value is created when ROIC > WACC. Also called ROCE (Return on Capital Employed).'
  },
  {
    num: 32, part: 5,
    title: 'Economic Value Added (EVA)',
    ref: 'Chapter 18, Equation 18.6',
    desc: 'Dollar value created (or destroyed) in a period: the return spread times invested capital.',
    latex: 'EVA = [ROIC - WACC] \\times \\text{Invested Capital}',
    notes: 'EVA > 0: value created. EVA < 0: value destroyed. The present value of all future EVAs equals MVA. EVA links operating decisions to shareholder value.'
  },
];

// ── Render ────────────────────────────────────────────────────────────────────

function renderFormula(f) {
  const card = document.createElement('div');
  card.className = 'formula-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-expanded', 'false');

  const katexEl = document.createElement('div');
  katexEl.className = 'formula-card__katex';
  try {
    katex.render(f.latex, katexEl, { displayMode: true, throwOnError: false });
  } catch (e) {
    katexEl.textContent = f.latex;
  }

  card.innerHTML = '<div class="formula-card__header">'
    + '<div class="formula-card__num">' + f.num + '</div>'
    + '<div class="formula-card__meta">'
    + '<div class="formula-card__title">' + f.title + '</div>'
    + '<div class="formula-card__ref">' + f.ref + '</div>'
    + '</div>'
    + '<span class="formula-card__toggle">&#9660;</span>'
    + '</div>'
    + '<div class="formula-card__body" style="display:none;">'
    + '<p class="formula-card__desc">' + f.desc + '</p>'
    + '</div>'
    + '<div class="formula-card__notes" style="display:none;">'
    + '<p>' + f.notes + '</p>'
    + '</div>';

  card.querySelector('.formula-card__body').appendChild(katexEl);

  const toggle = () => {
    const body    = card.querySelector('.formula-card__body');
    const notes   = card.querySelector('.formula-card__notes');
    const chevron = card.querySelector('.formula-card__toggle');
    const open    = body.style.display === 'none';
    body.style.display   = open ? 'block' : 'none';
    notes.style.display  = open ? 'block' : 'none';
    chevron.innerHTML    = open ? '&#9650;' : '&#9660;';
    card.setAttribute('aria-expanded', open);
    if (open) card.classList.add('formula-card--open');
    else card.classList.remove('formula-card--open');
  };

  card.addEventListener('click', toggle);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });

  return card;
}

document.addEventListener('DOMContentLoaded', () => {
  [1, 2, 3, 4, 5].forEach(part => {
    const grid = document.getElementById('formulas-part-' + part);
    if (!grid) return;
    FORMULAS.filter(f => f.part === part).forEach(f => {
      grid.appendChild(renderFormula(f));
    });
  });
});
