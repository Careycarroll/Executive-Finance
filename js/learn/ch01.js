import { markChapterComplete, isChapterComplete, resetChapter } from '/js/core/progress-tracker.js';
import { initRandomizer } from '/js/components/randomizer.js';
import { renderShowWork } from '/js/components/show-work.js';

// ── Formatters ────────────────────────────────────────────────────────────────
const fmt    = n => '$' + Math.abs(Math.round(n)).toLocaleString();
const fmtN   = n => Math.round(n).toLocaleString();
const fmtPct = n => (Math.round(n * 10) / 10).toFixed(1) + '%';

function getOrCreate(id, tag, className, parent) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement(tag || 'div');
    el.id = id;
    if (className) el.className = className;
    if (parent) parent.appendChild(el);
  }
  return el;
}

const val = id => parseFloat(document.getElementById(id).value) || 0;

// Stored results for cross-tool sharing
let t1Results = null;
let t2Results = null;


// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 1 -- Managerial Balance Sheet Builder
// ═══════════════════════════════════════════════════════════════════════════════

function calcTool1() {
  const cash   = val('t1-cash');
  const ar     = val('t1-ar');
  const inv    = val('t1-inv');
  const nfa    = val('t1-nfa');
  const ap     = val('t1-ap');
  const std    = val('t1-std');
  const ltd    = val('t1-ltd');
  const equity = val('t1-equity');

  const totalAssets = cash + ar + inv + nfa;
  const totalLE     = std + ap + ltd + equity;
  const wcr         = ar + inv - ap;
  const ic          = cash + wcr + nfa;
  const ce          = std + ltd + equity;
  const balanced    = Math.abs(totalAssets - totalLE) < 0.01;
  const icBalanced  = Math.abs(ic - ce) < 0.01;

  t1Results = { cash, ar, inv, nfa, ap, std, ltd, equity, wcr, ic, ce };

  const out = getOrCreate('t1-output', 'div', 'tool-output',
    document.getElementById('t1-output').parentElement);

  const balanceWarning = !balanced
    ? '<div class="ch01-warning">Warning: Balance sheet does not balance. Total Assets (' + fmt(totalAssets) + ') does not equal Total Liabilities + Equity (' + fmt(totalLE) + '). Check your inputs.</div>'
    : '';

  out.innerHTML = balanceWarning + '<div class="ch01-bs-grid">'

    + '<div class="ch01-bs-panel">'
    + '<div class="ch01-bs-panel__title">Standard Balance Sheet</div>'
    + '<table class="ch01-bs-table">'
    + '<thead><tr><th>Assets</th><th></th><th>Liabilities and Equity</th><th></th></tr></thead>'
    + '<tbody>'
    + '<tr><td>Cash</td><td>' + fmt(cash) + '</td><td>Short-Term Debt</td><td>' + fmt(std) + '</td></tr>'
    + '<tr><td>Accounts Receivable</td><td>' + fmt(ar) + '</td><td>Accounts Payable</td><td>' + fmt(ap) + '</td></tr>'
    + '<tr><td>Inventories</td><td>' + fmt(inv) + '</td><td>Long-Term Debt</td><td>' + fmt(ltd) + '</td></tr>'
    + '<tr><td>Net Fixed Assets</td><td>' + fmt(nfa) + '</td><td>Owners Equity</td><td>' + fmt(equity) + '</td></tr>'
    + '</tbody>'
    + '<tfoot><tr class="ch01-bs-total"><td>Total Assets</td><td>' + fmt(totalAssets) + '</td><td>Total L + E</td><td>' + fmt(totalLE) + '</td></tr></tfoot>'
    + '</table>'
    + '</div>'

    + '<div class="ch01-bs-panel ch01-bs-panel--mgr">'
    + '<div class="ch01-bs-panel__title">Managerial Balance Sheet</div>'
    + '<table class="ch01-bs-table">'
    + '<thead><tr><th>Invested Capital</th><th></th><th>Capital Employed</th><th></th></tr></thead>'
    + '<tbody>'
    + '<tr><td>Cash</td><td>' + fmt(cash) + '</td><td>Short-Term Debt</td><td>' + fmt(std) + '</td></tr>'
    + '<tr class="ch01-wcr-row"><td>Working Capital Req. (WCR)</td><td>' + fmt(wcr) + '</td><td>Long-Term Debt</td><td>' + fmt(ltd) + '</td></tr>'
    + '<tr><td>Net Fixed Assets</td><td>' + fmt(nfa) + '</td><td>Owners Equity</td><td>' + fmt(equity) + '</td></tr>'
    + '</tbody>'
    + '<tfoot><tr class="ch01-bs-total"><td>Total Invested Capital</td><td>' + fmt(ic) + '</td><td>Total Capital Employed</td><td>' + fmt(ce) + '</td></tr></tfoot>'
    + '</table>'
    + (icBalanced
        ? '<div class="ch01-balance-ok">&#10003; Invested Capital = Capital Employed (' + fmt(ic) + ')</div>'
        : '<div class="ch01-warning">Invested Capital (' + fmt(ic) + ') does not equal Capital Employed (' + fmt(ce) + ')</div>')
    + '</div>'

    + '</div>'

    + '<div class="ch01-wcr-callout">'
    + '<div class="ch01-wcr-callout__title">Working Capital Requirement (WCR)</div>'
    + '<div class="ch01-wcr-callout__formula">WCR = Accounts Receivable + Inventories &minus; Accounts Payable</div>'
    + '<div class="ch01-wcr-callout__calc">' + fmt(ar) + ' + ' + fmt(inv) + ' &minus; ' + fmt(ap) + ' = <strong>' + fmt(wcr) + '</strong></div>'
    + '<div class="ch01-wcr-callout__note">WCR is the net investment required to run the operating cycle. Accounts payable from suppliers partially finances this investment, reducing the cash the firm must raise from debt and equity holders.</div>'
    + '</div>';

  renderShowWork(document.getElementById('t1-show-work'), [
    { label: 'Working Capital Requirement', formula: 'AR + Inventories - Accounts Payable', values: fmt(ar) + ' + ' + fmt(inv) + ' - ' + fmt(ap), result: fmt(wcr) },
    { label: 'Invested Capital', formula: 'Cash + WCR + Net Fixed Assets', values: fmt(cash) + ' + ' + fmt(wcr) + ' + ' + fmt(nfa), result: fmt(ic), highlight: true },
    { label: 'Capital Employed', formula: 'Short-Term Debt + Long-Term Debt + Owners Equity', values: fmt(std) + ' + ' + fmt(ltd) + ' + ' + fmt(equity), result: fmt(ce), highlight: true },
    { label: 'Verification', formula: 'Invested Capital must equal Capital Employed', values: fmt(ic) + ' vs ' + fmt(ce), result: icBalanced ? 'Balanced' : 'Does not balance -- check inputs' }
  ], { title: 'Managerial Balance Sheet Calculation', defaultOpen: false });
}

function initTool1() {
  document.getElementById('t1-calculate').addEventListener('click', calcTool1);
  document.getElementById('t1-load-hlc').addEventListener('click', () => {
    document.getElementById('t1-cash').value   = 100;
    document.getElementById('t1-ar').value     = 150;
    document.getElementById('t1-inv').value    = 250;
    document.getElementById('t1-nfa').value    = 600;
    document.getElementById('t1-ap').value     = 100;
    document.getElementById('t1-std').value    = 200;
    document.getElementById('t1-ltd').value    = 300;
    document.getElementById('t1-equity').value = 500;
    calcTool1();
  });
  initRandomizer('t1-randomize', [
    { id: 't1-cash',   min: 50,   max: 500,  step: 25,  integer: true },
    { id: 't1-ar',     min: 50,   max: 600,  step: 25,  integer: true },
    { id: 't1-inv',    min: 50,   max: 800,  step: 25,  integer: true },
    { id: 't1-nfa',    min: 200,  max: 2000, step: 50,  integer: true },
    { id: 't1-ap',     min: 25,   max: 400,  step: 25,  integer: true },
    { id: 't1-std',    min: 50,   max: 500,  step: 25,  integer: true },
    { id: 't1-ltd',    min: 100,  max: 1000, step: 50,  integer: true },
    { id: 't1-equity', min: 200,  max: 2000, step: 50,  integer: true }
  ], calcTool1);
}


// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 2 -- Income Statement Analyzer
// ═══════════════════════════════════════════════════════════════════════════════

function calcTool2() {
  const sales    = val('t2-sales');
  const opex     = val('t2-opex');
  const dep      = val('t2-dep');
  const interest = val('t2-interest');
  const taxRate  = val('t2-tax-rate') / 100;
  const payout   = val('t2-payout') / 100;
  const equity   = val('t2-equity');
  const ic       = val('t2-ic');

  const ebit     = sales - opex - dep;
  const ebt      = ebit - interest;
  const tax      = Math.max(0, ebt * taxRate);
  const eat      = ebt - tax;
  const dividend = Math.max(0, eat * payout);
  const retained = eat - dividend;
  const nopat    = ebit * (1 - taxRate);
  const roe      = equity > 0 ? (eat / equity) * 100 : 0;
  const roic     = ic > 0 ? (nopat / ic) * 100 : 0;

  t2Results = { ebit, ebt, eat, nopat, roe, roic, equity, ic };

  const out = getOrCreate('t2-output', 'div', 'tool-output',
    document.getElementById('t2-output').parentElement);

  out.innerHTML = '<div class="ch01-is-grid">'

    + '<div class="ch01-is-panel">'
    + '<div class="ch01-is-panel__title">Income Statement</div>'
    + '<table class="ch01-is-table">'
    + '<tbody>'
    + '<tr><td>Sales Revenue</td><td>' + fmt(sales) + '</td></tr>'
    + '<tr class="ch01-is-indent"><td>Less: Operating Expenses</td><td>(' + fmt(opex) + ')</td></tr>'
    + '<tr class="ch01-is-indent"><td>Less: Depreciation Expense</td><td>(' + fmt(dep) + ')</td></tr>'
    + '<tr class="ch01-is-subtotal"><td>Earnings Before Interest and Tax (EBIT)</td><td>' + fmt(ebit) + '</td></tr>'
    + '<tr class="ch01-is-indent"><td>Less: Interest Expense</td><td>(' + fmt(interest) + ')</td></tr>'
    + '<tr class="ch01-is-subtotal"><td>Earnings Before Tax (EBT)</td><td>' + fmt(ebt) + '</td></tr>'
    + '<tr class="ch01-is-indent"><td>Less: Tax Expense (' + fmtPct(taxRate * 100) + ')</td><td>(' + fmt(tax) + ')</td></tr>'
    + '<tr class="ch01-is-total"><td>Earnings After Tax (EAT)</td><td>' + fmt(eat) + '</td></tr>'
    + '<tr class="ch01-is-indent"><td>Less: Dividend Payment (' + fmtPct(payout * 100) + ' payout)</td><td>(' + fmt(dividend) + ')</td></tr>'
    + '<tr class="ch01-is-subtotal"><td>Addition to Retained Earnings</td><td>' + fmt(retained) + '</td></tr>'
    + '</tbody>'
    + '</table>'
    + '</div>'

    + '<div class="ch01-ratios-panel">'
    + '<div class="ch01-is-panel__title">Profitability Ratios</div>'

    + '<div class="ch01-ratio-card">'
    + '<div class="ch01-ratio-card__label">Return on Equity (ROE)</div>'
    + '<div class="ch01-ratio-card__formula">EAT / Owners Equity</div>'
    + '<div class="ch01-ratio-card__value">' + fmtPct(roe) + '</div>'
    + '<div class="ch01-ratio-card__calc">' + fmt(eat) + ' / ' + fmt(equity) + '</div>'
    + '</div>'

    + '<div class="ch01-ratio-card">'
    + '<div class="ch01-ratio-card__label">Return on Invested Capital (ROIC)</div>'
    + '<div class="ch01-ratio-card__formula">NOPAT / Invested Capital</div>'
    + '<div class="ch01-ratio-card__value">' + fmtPct(roic) + '</div>'
    + '<div class="ch01-ratio-card__calc">' + fmt(nopat) + ' / ' + fmt(ic) + '</div>'
    + '</div>'

    + '<div class="ch01-ratio-card">'
    + '<div class="ch01-ratio-card__label">NOPAT</div>'
    + '<div class="ch01-ratio-card__formula">EBIT x (1 - Tax Rate)</div>'
    + '<div class="ch01-ratio-card__value">' + fmt(nopat) + '</div>'
    + '<div class="ch01-ratio-card__calc">' + fmt(ebit) + ' x (1 - ' + fmtPct(taxRate * 100) + ')</div>'
    + '</div>'

    + '<div class="ch01-ratio-card">'
    + '<div class="ch01-ratio-card__label">Operating Profit Margin</div>'
    + '<div class="ch01-ratio-card__formula">EBIT / Sales</div>'
    + '<div class="ch01-ratio-card__value">' + fmtPct(sales > 0 ? (ebit / sales) * 100 : 0) + '</div>'
    + '<div class="ch01-ratio-card__calc">' + fmt(ebit) + ' / ' + fmt(sales) + '</div>'
    + '</div>'

    + '</div>'
    + '</div>';

  renderShowWork(document.getElementById('t2-show-work'), [
    { label: 'EBIT', formula: 'Sales - Operating Expenses - Depreciation', values: fmt(sales) + ' - ' + fmt(opex) + ' - ' + fmt(dep), result: fmt(ebit) },
    { label: 'EBT', formula: 'EBIT - Interest Expense', values: fmt(ebit) + ' - ' + fmt(interest), result: fmt(ebt) },
    { label: 'Tax Expense', formula: 'EBT x Tax Rate', values: fmt(ebt) + ' x ' + fmtPct(taxRate * 100), result: fmt(tax) },
    { label: 'EAT (Net Profit)', formula: 'EBT - Tax', values: fmt(ebt) + ' - ' + fmt(tax), result: fmt(eat), highlight: true },
    { label: 'NOPAT', formula: 'EBIT x (1 - Tax Rate)', values: fmt(ebit) + ' x (1 - ' + fmtPct(taxRate * 100) + ')', result: fmt(nopat) },
    { label: 'ROE', formula: 'EAT / Owners Equity', values: fmt(eat) + ' / ' + fmt(equity), result: fmtPct(roe), highlight: true },
    { label: 'ROIC', formula: 'NOPAT / Invested Capital', values: fmt(nopat) + ' / ' + fmt(ic), result: fmtPct(roic), highlight: true }
  ], { title: 'Income Statement Analysis', defaultOpen: false });
}

function initTool2() {
  document.getElementById('t2-calculate').addEventListener('click', calcTool2);

  document.getElementById('t2-load-hlc').addEventListener('click', () => {
    document.getElementById('t2-sales').value    = 1000;
    document.getElementById('t2-opex').value     = 700;
    document.getElementById('t2-dep').value      = 60;
    document.getElementById('t2-interest').value = 40;
    document.getElementById('t2-tax-rate').value = 50;
    document.getElementById('t2-payout').value   = 50;
    document.getElementById('t2-equity').value   = 500;
    document.getElementById('t2-ic').value       = 1000;
    calcTool2();
  });

  document.getElementById('t2-pull-t1').addEventListener('click', () => {
    if (!t1Results) { alert('Run Tool 1 first to generate balance sheet data.'); return; }
    document.getElementById('t2-equity').value = t1Results.equity;
    document.getElementById('t2-ic').value     = t1Results.ic;
  });

  initRandomizer('t2-randomize', [
    { id: 't2-sales',    min: 500,  max: 5000, step: 100, integer: true },
    { id: 't2-opex',     min: 200,  max: 3500, step: 100, integer: true },
    { id: 't2-dep',      min: 20,   max: 300,  step: 10,  integer: true },
    { id: 't2-interest', min: 10,   max: 200,  step: 10,  integer: true },
    { id: 't2-tax-rate', min: 15,   max: 40,   step: 5,   integer: true },
    { id: 't2-payout',   min: 0,    max: 80,   step: 10,  integer: true },
    { id: 't2-equity',   min: 200,  max: 2000, step: 100, integer: true },
    { id: 't2-ic',       min: 400,  max: 4000, step: 100, integer: true }
  ], calcTool2);
}


// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 3 -- Cash Flow Statement Builder
// ═══════════════════════════════════════════════════════════════════════════════

function calcTool3() {
  const eat         = val('t3-eat');
  const dep         = val('t3-dep');
  const dwcr        = val('t3-dwcr');
  const capex       = val('t3-capex');
  const newDebt     = val('t3-new-debt');
  const dividends   = val('t3-dividends');
  const openingCash = val('t3-opening-cash');

  const cfOps      = eat + dep - dwcr;
  const cfInvest   = -capex;
  const cfFinance  = newDebt - dividends;
  const netCF      = cfOps + cfInvest + cfFinance;
  const closingCash = openingCash + netCF;

  const cfOpsClass    = cfOps >= 0    ? 'ch01-cf-pos' : 'ch01-cf-neg';
  const cfInvestClass = cfInvest >= 0 ? 'ch01-cf-pos' : 'ch01-cf-neg';
  const cfFinClass    = cfFinance >= 0 ? 'ch01-cf-pos' : 'ch01-cf-neg';
  const netClass      = netCF >= 0    ? 'ch01-cf-pos' : 'ch01-cf-neg';

  const out = getOrCreate('t3-output', 'div', 'tool-output',
    document.getElementById('t3-output').parentElement);

  out.innerHTML = '<div class="ch01-cf-statement">'
    + '<div class="ch01-cf-statement__title">Statement of Cash Flows</div>'

    + '<div class="ch01-cf-section">'
    + '<div class="ch01-cf-section__header">A. Cash Flows from Operating Activities</div>'
    + '<table class="ch01-cf-table"><tbody>'
    + '<tr><td>Earnings After Tax</td><td>' + fmt(eat) + '</td></tr>'
    + '<tr><td>Add: Depreciation Expense (non-cash)</td><td>+' + fmt(dep) + '</td></tr>'
    + '<tr><td>Less: Increase in Working Capital Requirement</td><td>(' + fmt(dwcr) + ')</td></tr>'
    + '</tbody><tfoot><tr class="ch01-cf-subtotal"><td>Net Cash Flow from Operating Activities</td>'
    + '<td class="' + cfOpsClass + '">' + fmt(cfOps) + '</td></tr></tfoot></table>'
    + '</div>'

    + '<div class="ch01-cf-section">'
    + '<div class="ch01-cf-section__header">B. Cash Flows from Investing Activities</div>'
    + '<table class="ch01-cf-table"><tbody>'
    + '<tr><td>Capital Expenditures and Acquisitions</td><td>(' + fmt(capex) + ')</td></tr>'
    + '</tbody><tfoot><tr class="ch01-cf-subtotal"><td>Net Cash Flow from Investing Activities</td>'
    + '<td class="' + cfInvestClass + '">' + fmt(cfInvest) + '</td></tr></tfoot></table>'
    + '</div>'

    + '<div class="ch01-cf-section">'
    + '<div class="ch01-cf-section__header">C. Cash Flows from Financing Activities</div>'
    + '<table class="ch01-cf-table"><tbody>'
    + '<tr><td>New Borrowings</td><td>+' + fmt(newDebt) + '</td></tr>'
    + '<tr><td>Less: Dividend Payments</td><td>(' + fmt(dividends) + ')</td></tr>'
    + '</tbody><tfoot><tr class="ch01-cf-subtotal"><td>Net Cash Flow from Financing Activities</td>'
    + '<td class="' + cfFinClass + '">' + fmt(cfFinance) + '</td></tr></tfoot></table>'
    + '</div>'

    + '<div class="ch01-cf-section ch01-cf-section--total">'
    + '<table class="ch01-cf-table"><tbody>'
    + '<tr class="ch01-cf-total"><td>D. Total Net Cash Flow (A + B + C)</td>'
    + '<td class="' + netClass + '">' + fmt(netCF) + '</td></tr>'
    + '<tr><td>E. Opening Cash Balance</td><td>' + fmt(openingCash) + '</td></tr>'
    + '<tr class="ch01-cf-total"><td>F. Closing Cash Balance (E + D)</td>'
    + '<td class="' + (closingCash >= 0 ? 'ch01-cf-pos' : 'ch01-cf-neg') + '">' + fmt(closingCash) + '</td></tr>'
    + '</tbody></table>'
    + '</div>'

    + (cfOps < 0
        ? '<div class="ch01-warning">Warning: Negative operating cash flow. A firm that consistently fails to generate cash from operations may be headed for trouble regardless of reported profits.</div>'
        : '<div class="ch01-insight">Operating cash flow is positive (' + fmt(cfOps) + '). The firm is generating cash from its core business activities.</div>')
    + '</div>';

  renderShowWork(document.getElementById('t3-show-work'), [
    { label: 'Net Cash Flow from Operations', formula: 'EAT + Depreciation - Change in WCR', values: fmt(eat) + ' + ' + fmt(dep) + ' - ' + fmt(dwcr), result: fmt(cfOps), highlight: true },
    { label: 'Net Cash Flow from Investing', formula: '-CAPEX', values: '-' + fmt(capex), result: fmt(cfInvest) },
    { label: 'Net Cash Flow from Financing', formula: 'New Borrowings - Dividends', values: fmt(newDebt) + ' - ' + fmt(dividends), result: fmt(cfFinance) },
    { label: 'Total Net Cash Flow', formula: 'Operating + Investing + Financing', values: fmt(cfOps) + ' + ' + fmt(cfInvest) + ' + ' + fmt(cfFinance), result: fmt(netCF), highlight: true },
    { label: 'Closing Cash Balance', formula: 'Opening Cash + Total Net Cash Flow', values: fmt(openingCash) + ' + ' + fmt(netCF), result: fmt(closingCash) }
  ], { title: 'Cash Flow Statement Calculation', defaultOpen: false });
}

function initTool3() {
  document.getElementById('t3-calculate').addEventListener('click', calcTool3);
  document.getElementById('t3-load-hlc').addEventListener('click', () => {
    document.getElementById('t3-eat').value          = 100;
    document.getElementById('t3-dep').value          = 60;
    document.getElementById('t3-dwcr').value         = 30;
    document.getElementById('t3-capex').value        = 120;
    document.getElementById('t3-new-debt').value     = 50;
    document.getElementById('t3-dividends').value    = 50;
    document.getElementById('t3-opening-cash').value = 100;
    calcTool3();
  });
  initRandomizer('t3-randomize', [
    { id: 't3-eat',          min: -50,  max: 500,  step: 25,  integer: true },
    { id: 't3-dep',          min: 10,   max: 200,  step: 10,  integer: true },
    { id: 't3-dwcr',         min: -50,  max: 150,  step: 10,  integer: true },
    { id: 't3-capex',        min: 0,    max: 500,  step: 25,  integer: true },
    { id: 't3-new-debt',     min: 0,    max: 300,  step: 25,  integer: true },
    { id: 't3-dividends',    min: 0,    max: 200,  step: 10,  integer: true },
    { id: 't3-opening-cash', min: 0,    max: 500,  step: 25,  integer: true }
  ], calcTool3);
}


// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 4 -- Value Creation Analyzer
// ═══════════════════════════════════════════════════════════════════════════════

function calcTool4() {
  const ebit         = val('t4-ebit');
  const taxRate      = val('t4-tax-rate') / 100;
  const ic           = val('t4-ic');
  const ke           = val('t4-ke') / 100;
  const kd           = val('t4-kd') / 100;
  const equityWeight = val('t4-equity-weight') / 100;
  const debtWeight   = 1 - equityWeight;

  const nopat        = ebit * (1 - taxRate);
  const roic         = ic > 0 ? (nopat / ic) * 100 : 0;
  const wacc         = (kd * (1 - taxRate) * debtWeight + ke * equityWeight) * 100;
  const spread       = roic - wacc;
  const eva          = (spread / 100) * ic;
  const creates      = spread > 0;

  const out = getOrCreate('t4-output', 'div', 'tool-output',
    document.getElementById('t4-output').parentElement);

  const verdictClass = creates ? 'ch01-verdict--positive' : 'ch01-verdict--negative';
  const verdictText  = creates
    ? 'Value Created: ROIC (' + fmtPct(roic) + ') exceeds WACC (' + fmtPct(wacc) + ') by ' + fmtPct(spread) + '. The firm earned more than its cost of capital.'
    : 'Value Destroyed: ROIC (' + fmtPct(roic) + ') is below WACC (' + fmtPct(wacc) + ') by ' + fmtPct(Math.abs(spread)) + '. The firm did not earn enough to cover its cost of capital.';

  out.innerHTML = '<div class="ch01-vc-grid">'

    + '<div class="ch01-vc-card">'
    + '<div class="ch01-vc-card__label">NOPAT</div>'
    + '<div class="ch01-vc-card__formula">EBIT x (1 - Tax Rate)</div>'
    + '<div class="ch01-vc-card__value">' + fmt(nopat) + '</div>'
    + '</div>'

    + '<div class="ch01-vc-card ' + (roic >= wacc ? 'ch01-vc-card--good' : 'ch01-vc-card--bad') + '">'
    + '<div class="ch01-vc-card__label">ROIC</div>'
    + '<div class="ch01-vc-card__formula">NOPAT / Invested Capital</div>'
    + '<div class="ch01-vc-card__value">' + fmtPct(roic) + '</div>'
    + '</div>'

    + '<div class="ch01-vc-card ' + (roic >= wacc ? 'ch01-vc-card--bad' : 'ch01-vc-card--good') + '">'
    + '<div class="ch01-vc-card__label">WACC</div>'
    + '<div class="ch01-vc-card__formula">kD(1-t) x D% + kE x E%</div>'
    + '<div class="ch01-vc-card__value">' + fmtPct(wacc) + '</div>'
    + '</div>'

    + '<div class="ch01-vc-card ' + (creates ? 'ch01-vc-card--good' : 'ch01-vc-card--bad') + '">'
    + '<div class="ch01-vc-card__label">Return Spread</div>'
    + '<div class="ch01-vc-card__formula">ROIC - WACC</div>'
    + '<div class="ch01-vc-card__value">' + (spread >= 0 ? '+' : '') + fmtPct(spread) + '</div>'
    + '</div>'

    + '</div>'

    + '<div class="ch01-eva-panel">'
    + '<div class="ch01-eva-panel__label">Economic Value Added (EVA)</div>'
    + '<div class="ch01-eva-panel__formula">Return Spread x Invested Capital = (' + fmtPct(spread) + ') x ' + fmt(ic) + '</div>'
    + '<div class="ch01-eva-panel__value ' + (creates ? 'ch01-cf-pos' : 'ch01-cf-neg') + '">' + (eva >= 0 ? '+' : '') + fmt(eva) + '</div>'
    + '<div class="ch01-eva-panel__note">EVA is the dollar amount of value created (positive) or destroyed (negative) in the period.</div>'
    + '</div>'

    + '<div class="ch01-verdict ' + verdictClass + '">' + verdictText + '</div>';

  renderShowWork(document.getElementById('t4-show-work'), [
    { label: 'NOPAT', formula: 'EBIT x (1 - Tax Rate)', values: fmt(ebit) + ' x (1 - ' + fmtPct(taxRate * 100) + ')', result: fmt(nopat) },
    { label: 'ROIC', formula: 'NOPAT / Invested Capital', values: fmt(nopat) + ' / ' + fmt(ic), result: fmtPct(roic), highlight: true },
    { label: 'After-Tax Cost of Debt', formula: 'kD x (1 - Tax Rate)', values: fmtPct(kd * 100) + ' x (1 - ' + fmtPct(taxRate * 100) + ')', result: fmtPct(kd * (1 - taxRate) * 100) },
    { label: 'WACC', formula: 'kD(1-t) x Debt% + kE x Equity%', values: fmtPct(kd * (1 - taxRate) * 100) + ' x ' + fmtPct(debtWeight * 100) + ' + ' + fmtPct(ke * 100) + ' x ' + fmtPct(equityWeight * 100), result: fmtPct(wacc), highlight: true },
    { label: 'Return Spread', formula: 'ROIC - WACC', values: fmtPct(roic) + ' - ' + fmtPct(wacc), result: (spread >= 0 ? '+' : '') + fmtPct(spread), highlight: true },
    { label: 'EVA', formula: 'Return Spread x Invested Capital', values: fmtPct(spread) + ' x ' + fmt(ic), result: fmt(eva) }
  ], { title: 'Value Creation Analysis', defaultOpen: false });
}

function initTool4() {
  document.getElementById('t4-calculate').addEventListener('click', calcTool4);
  document.getElementById('t4-load-hlc').addEventListener('click', () => {
    document.getElementById('t4-ebit').value          = 240;
    document.getElementById('t4-tax-rate').value      = 50;
    document.getElementById('t4-ic').value            = 1000;
    document.getElementById('t4-ke').value            = 12;
    document.getElementById('t4-kd').value            = 8;
    document.getElementById('t4-equity-weight').value = 50;
    calcTool4();
  });
  initRandomizer('t4-randomize', [
    { id: 't4-ebit',          min: 50,  max: 1000, step: 25,  integer: true },
    { id: 't4-tax-rate',      min: 15,  max: 40,   step: 5,   integer: true },
    { id: 't4-ic',            min: 200, max: 5000, step: 100, integer: true },
    { id: 't4-ke',            min: 6,   max: 20,   step: 0.5 },
    { id: 't4-kd',            min: 3,   max: 12,   step: 0.5 },
    { id: 't4-equity-weight', min: 20,  max: 80,   step: 5,   integer: true }
  ], calcTool4);
}


// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 5 -- NPV and IRR Decision Tool
// ═══════════════════════════════════════════════════════════════════════════════

function calcIRR(cf0, cashflows) {
  // Newton-Raphson iteration
  let rate = 0.1;
  for (let i = 0; i < 100; i++) {
    let npv = -cf0;
    let dnpv = 0;
    cashflows.forEach((cf, t) => {
      const disc = Math.pow(1 + rate, t + 1);
      npv  += cf / disc;
      dnpv -= (t + 1) * cf / (disc * (1 + rate));
    });
    if (Math.abs(npv) < 0.0001) break;
    if (Math.abs(dnpv) < 0.0000001) break;
    rate = rate - npv / dnpv;
    if (rate < -0.999) rate = -0.999;
  }
  return rate * 100;
}

function calcTool5() {
  const cf0        = val('t5-outlay');
  const wacc       = val('t5-wacc') / 100;
  const shares     = val('t5-shares');
  const sharePrice = val('t5-share-price');
  const cfs        = [
    val('t5-cf1'), val('t5-cf2'), val('t5-cf3'),
    val('t5-cf4'), val('t5-cf5')
  ].filter((cf, i) => i === 0 || cf !== 0);

  // NPV
  let npv = -cf0;
  const pvs = cfs.map((cf, t) => {
    const pv = cf / Math.pow(1 + wacc, t + 1);
    npv += pv;
    return pv;
  });

  // IRR
  const irr = calcIRR(cf0, cfs);

  // Profitability Index
  const sumPV = pvs.reduce((s, pv) => s + pv, 0);
  const pi    = cf0 > 0 ? sumPV / cf0 : 0;

  // Share price impact
  const newSharePrice = shares > 0 ? sharePrice + npv / shares : null;

  const accept     = npv >= 0;
  const irrAccept  = irr >= val('t5-wacc');

  const out = getOrCreate('t5-output', 'div', 'tool-output',
    document.getElementById('t5-output').parentElement);

  const cfRows = cfs.map((cf, t) =>
    '<tr><td>Year ' + (t + 1) + '</td><td>' + fmt(cf) + '</td>'
    + '<td>' + fmt(1 / Math.pow(1 + wacc, t + 1)) + '</td>'
    + '<td>' + fmt(pvs[t]) + '</td></tr>'
  ).join('');

  out.innerHTML = '<div class="ch01-npv-grid">'

    + '<div class="ch01-npv-table-panel">'
    + '<div class="ch01-is-panel__title">Present Value of Cash Flows</div>'
    + '<table class="ch01-cf-table">'
    + '<thead><tr><th>Period</th><th>Cash Flow</th><th>Discount Factor</th><th>Present Value</th></tr></thead>'
    + '<tbody>'
    + '<tr><td>Year 0</td><td>(' + fmt(cf0) + ')</td><td>1.000</td><td>(' + fmt(cf0) + ')</td></tr>'
    + cfRows
    + '</tbody>'
    + '<tfoot><tr class="ch01-cf-total"><td colspan="3">Net Present Value</td>'
    + '<td class="' + (npv >= 0 ? 'ch01-cf-pos' : 'ch01-cf-neg') + '">' + (npv >= 0 ? '+' : '') + fmt(npv) + '</td></tr></tfoot>'
    + '</table>'
    + '</div>'

    + '<div class="ch01-npv-results-panel">'
    + '<div class="ch01-is-panel__title">Decision Metrics</div>'

    + '<div class="ch01-ratio-card ' + (accept ? 'ch01-vc-card--good' : 'ch01-vc-card--bad') + '">'
    + '<div class="ch01-ratio-card__label">Net Present Value (NPV)</div>'
    + '<div class="ch01-ratio-card__formula">PV of cash flows - Initial outlay</div>'
    + '<div class="ch01-ratio-card__value">' + (npv >= 0 ? '+' : '') + fmt(npv) + '</div>'
    + '<div class="ch01-ratio-card__calc">' + (accept ? 'Accept: NPV &ge; 0' : 'Reject: NPV &lt; 0') + '</div>'
    + '</div>'

    + '<div class="ch01-ratio-card ' + (irrAccept ? 'ch01-vc-card--good' : 'ch01-vc-card--bad') + '">'
    + '<div class="ch01-ratio-card__label">Internal Rate of Return (IRR)</div>'
    + '<div class="ch01-ratio-card__formula">Rate where NPV = 0</div>'
    + '<div class="ch01-ratio-card__value">' + fmtPct(irr) + '</div>'
    + '<div class="ch01-ratio-card__calc">' + (irrAccept ? 'Accept: IRR &ge; WACC (' + fmtPct(wacc * 100) + ')' : 'Reject: IRR &lt; WACC (' + fmtPct(wacc * 100) + ')') + '</div>'
    + '</div>'

    + '<div class="ch01-ratio-card">'
    + '<div class="ch01-ratio-card__label">Profitability Index (PI)</div>'
    + '<div class="ch01-ratio-card__formula">PV of cash flows / Initial outlay</div>'
    + '<div class="ch01-ratio-card__value">' + (Math.round(pi * 100) / 100).toFixed(2) + '</div>'
    + '<div class="ch01-ratio-card__calc">' + (pi >= 1 ? 'Accept: PI &ge; 1.0' : 'Reject: PI &lt; 1.0') + '</div>'
    + '</div>'

    + (newSharePrice !== null && shares > 0
        ? '<div class="ch01-ratio-card">'
        + '<div class="ch01-ratio-card__label">Share Price Impact</div>'
        + '<div class="ch01-ratio-card__formula">Current price + NPV / Shares outstanding</div>'
        + '<div class="ch01-ratio-card__value">' + fmt(newSharePrice) + '</div>'
        + '<div class="ch01-ratio-card__calc">Was ' + fmt(sharePrice) + ' &rarr; ' + (npv >= 0 ? '+' : '') + fmt(npv / shares) + ' per share</div>'
        + '</div>'
        : '')

    + '</div>'
    + '</div>'

    + '<div class="ch01-verdict ' + (accept ? 'ch01-verdict--positive' : 'ch01-verdict--negative') + '">'
    + (accept
        ? 'Accept the investment. NPV of ' + fmt(npv) + ' is positive -- the proposal creates value. The present value of future cash flows exceeds the initial outlay by ' + fmt(npv) + '.'
        : 'Reject the investment. NPV of ' + fmt(Math.abs(npv)) + ' is negative -- the proposal destroys value. The present value of future cash flows falls short of the initial outlay by ' + fmt(Math.abs(npv)) + '.')
    + '</div>';

  const swSteps = [
    { label: 'WACC (Discount Rate)', formula: 'Given', values: fmtPct(wacc * 100), result: 'Applied to each year' }
  ];
  cfs.forEach((cf, t) => {
    swSteps.push({
      label: 'PV of Year ' + (t + 1) + ' Cash Flow',
      formula: 'CF / (1 + WACC)^t',
      values: fmt(cf) + ' / (1 + ' + fmtPct(wacc * 100) + ')^' + (t + 1),
      result: fmt(pvs[t])
    });
  });
  swSteps.push({ label: 'NPV', formula: '-CF0 + Sum of PVs', values: '-' + fmt(cf0) + ' + ' + fmt(sumPV), result: fmt(npv), highlight: true });
  swSteps.push({ label: 'IRR', formula: 'Rate where NPV = 0 (Newton-Raphson)', values: 'Solved iteratively', result: fmtPct(irr), highlight: true });
  swSteps.push({ label: 'Profitability Index', formula: 'Sum of PVs / Initial Outlay', values: fmt(sumPV) + ' / ' + fmt(cf0), result: (Math.round(pi * 100) / 100).toFixed(2) });

  renderShowWork(document.getElementById('t5-show-work'), swSteps,
    { title: 'NPV and IRR Calculation', defaultOpen: false });
}

function initTool5() {
  document.getElementById('t5-calculate').addEventListener('click', calcTool5);
  document.getElementById('t5-load-nmc').addEventListener('click', () => {
    document.getElementById('t5-outlay').value      = 95;
    document.getElementById('t5-wacc').value        = 10.5;
    document.getElementById('t5-shares').value      = 50;
    document.getElementById('t5-share-price').value = 40;
    document.getElementById('t5-cf1').value         = 111.4;
    document.getElementById('t5-cf2').value         = 0;
    document.getElementById('t5-cf3').value         = 0;
    document.getElementById('t5-cf4').value         = 0;
    document.getElementById('t5-cf5').value         = 0;
    calcTool5();
  });
  initRandomizer('t5-randomize', [
    { id: 't5-outlay',      min: 50,  max: 1000, step: 25,  integer: true },
    { id: 't5-wacc',        min: 5,   max: 20,   step: 0.5 },
    { id: 't5-shares',      min: 10,  max: 500,  step: 10,  integer: true },
    { id: 't5-share-price', min: 10,  max: 200,  step: 5,   integer: true },
    { id: 't5-cf1',         min: 0,   max: 500,  step: 25 },
    { id: 't5-cf2',         min: 0,   max: 500,  step: 25 },
    { id: 't5-cf3',         min: 0,   max: 500,  step: 25 }
  ], calcTool5);
}


// ═══════════════════════════════════════════════════════════════════════════════
// KEY TERMS
// ═══════════════════════════════════════════════════════════════════════════════

const KEY_TERMS = [
  { term: 'Value Creation', definition: 'The objective of financial management. A firm creates value when its decisions generate returns that exceed the cost of the capital required to finance them. Measured by NPV and EVA.' },
  { term: 'Fundamental Finance Principle', definition: 'A business proposal will create value only if the present value of its expected future cash benefits exceeds the initial cash outlay required to carry it out. Equivalently, a proposal creates value if its NPV is positive.' },
  { term: 'Net Present Value (NPV)', definition: 'The difference between the present value of a proposal future cash flows and its initial cash outlay. A positive NPV means value is created; a negative NPV means value is destroyed.' },
  { term: 'Internal Rate of Return (IRR)', definition: 'The discount rate that makes the NPV of an investment equal to zero. Accept if IRR exceeds the cost of capital (WACC); reject if IRR is below WACC.' },
  { term: 'Discount Rate', definition: 'The rate at which future cash flows are discounted to find their present value. For a firm, the appropriate discount rate is the cost of capital (WACC).' },
  { term: 'Cost of Capital', definition: 'The return expected by investors for the capital they supply to the firm. It is the minimum return a project must generate to create value. Equal to WACC when both debt and equity are used.' },
  { term: 'Weighted Average Cost of Capital (WACC)', definition: 'The blended cost of all capital sources, weighted by their market value proportions. WACC = kD(1-TC) x D/(D+E) + kE x E/(D+E). Used as the discount rate for investment decisions.' },
  { term: 'Equity Capital', definition: 'Cash contributed by shareholders to finance the firm. Riskier than debt capital because shareholders have a residual claim on profits after all other obligations are met.' },
  { term: 'Debt Capital', definition: 'Cash contributed by lenders (banks, bondholders) to finance the firm. Less risky than equity because debt holders have a prior claim on assets and cash flows.' },
  { term: 'Working Capital Requirement (WCR)', definition: 'The net investment required to finance the operating cycle. WCR = Accounts Receivable + Inventories - Accounts Payable. Represents cash the firm must raise from investors to fund day-to-day operations.' },
  { term: 'Invested Capital', definition: 'The total capital invested in the operating assets of the firm. Invested Capital = Cash + WCR + Net Fixed Assets. Equal to Capital Employed.' },
  { term: 'Capital Employed', definition: 'The total capital provided by all investors. Capital Employed = Short-Term Debt + Long-Term Debt + Owners Equity. Always equals Invested Capital.' },
  { term: 'Return on Equity (ROE)', definition: 'Earnings After Tax divided by Owners Equity. Measures how profitably the firm uses shareholders funds. Affected by operating profitability, financial leverage, and taxation.' },
  { term: 'Return on Invested Capital (ROIC)', definition: 'NOPAT divided by Invested Capital. Measures the after-tax operating return earned on all capital invested in the firm. Value is created when ROIC exceeds WACC.' },
  { term: 'Self-Sustainable Growth Rate (SGR)', definition: 'The maximum rate at which a firm can grow its sales without issuing new equity capital. SGR = Profit Retention Rate x ROE. Profit retention is the fuel of sustainable business expansion.' },
  { term: 'Business Cycle', definition: 'The sequence of events in a firm: raise capital, buy assets, generate sales, produce profits, pay dividends, retain earnings, build equity, raise new debt, grow. The rate of sustainable growth depends on profit retention and ROE.' },
  { term: 'Business Risk', definition: 'The risk arising from uncertain sales and operating results. Stems from the economic, political, social, and competitive environments. Transmitted from sales fluctuations through to EBIT.' },
  { term: 'Financial Risk', definition: 'The additional risk borne by shareholders due to the presence of fixed interest payments on debt. Financial leverage amplifies the effect of business risk on earnings after tax.' },
  { term: 'NOPAT', definition: 'Net Operating Profit After Tax. Equal to EBIT x (1 - Tax Rate). Measures after-tax operating profit before financing costs. The numerator in the ROIC calculation.' },
  { term: 'Economic Value Added (EVA)', definition: 'The dollar amount of value created or destroyed in a period. EVA = Return Spread x Invested Capital = (ROIC - WACC) x IC. Positive EVA means value creation; negative EVA means value destruction.' }
];

function initKeyTerms() {
  const grid = document.getElementById('key-terms-grid');
  if (!grid) return;
  KEY_TERMS.forEach(item => {
    const div = document.createElement('div');
    div.className = 'key-term';
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-expanded', 'false');
    div.innerHTML = '<div class="key-term__word">' + item.term + '</div>'
      + '<p class="key-term__definition">' + item.definition + '</p>';
    div.addEventListener('click', () => {
      const open = div.classList.toggle('key-term--open');
      div.setAttribute('aria-expanded', open);
    });
    div.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); div.click(); }
    });
    grid.appendChild(div);
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// CHAPTER COMPLETE
// ═══════════════════════════════════════════════════════════════════════════════

function injectResetButton(card) {
  if (document.getElementById('ch01-reset-btn')) return;
  const resetBtn = document.createElement('button');
  resetBtn.id = 'ch01-reset-btn';
  resetBtn.className = 'btn btn--ghost btn--small';
  resetBtn.textContent = 'Reset Chapter';
  resetBtn.style.marginTop = 'var(--space-3)';
  resetBtn.addEventListener('click', () => {
    resetChapter('ch01');
    const markBtn = document.getElementById('mark-complete-btn');
    if (markBtn) {
      markBtn.textContent = 'Mark as Complete';
      markBtn.disabled = false;
      markBtn.classList.remove('btn--success');
    }
    resetBtn.remove();
  });
  card.appendChild(resetBtn);
}

function initChapterComplete() {
  const btn  = document.getElementById('mark-complete-btn');
  const card = document.getElementById('chapter-complete');
  if (!btn || !card) return;
  if (isChapterComplete('ch01')) {
    btn.textContent = 'Chapter Complete!';
    btn.disabled = true;
    btn.classList.add('btn--success');
    injectResetButton(card);
  }
  btn.addEventListener('click', () => {
    markChapterComplete('ch01');
    btn.textContent = 'Chapter Complete!';
    btn.disabled = true;
    btn.classList.add('btn--success');
    injectResetButton(card);
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initTool1();
  initTool2();
  initTool3();
  initTool4();
  initTool5();
  initKeyTerms();
  initChapterComplete();
});
