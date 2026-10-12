/**
 * decision-tree.js — Interactive Rules-Based Decision Flowchart & Wizard
 * Supports complex qualitative choices in corporate finance, tax strategy, and capital structure.
 * Features:
 * - Dynamic branching engine accepting nodes[] and outcomes{}
 * - Visual flowchart node graph + active path breadcrumb highlighting
 * - Comprehensive outcome recommendation cards with tax treatment, pros/cons, and citations
 * - Built-in presets for Entity Choice, M&A Deal Structure, Section 83(b) Election, and Hedging Strategy
 * Follows component contract in ADR-0003: create(container, config) -> { destroy(), update(newConfig) }
 */

export const DECISION_PRESETS = {
  entity_choice: {
    name: 'Business Entity Selection (Scholes & Wolfson)',
    description: 'Determine optimal legal & tax structure: C-Corp, S-Corp, LLC, Partnership, or Sole Proprietorship.',
    root: 'multiple_owners',
    nodes: [
      {
        id: 'multiple_owners',
        question: 'Will the enterprise have multiple owners or co-founders?',
        context: 'Single-member vs multi-member structure determines base partnership tax eligibility.',
        choices: [
          { text: 'Yes (Multiple owners)', next: 'liability_protection' },
          { text: 'No (Single founder)', next: 'single_liability' },
        ],
      },
      {
        id: 'single_liability',
        question: 'Do you require limited personal liability protection?',
        context: 'Without legal separation, personal assets (home, savings) are exposed to business creditors and torts.',
        choices: [
          { text: 'Yes (Shield personal assets)', next: 'single_llc_election' },
          { text: 'No (Simple low-risk freelance)', next: 'sole_prop' },
        ],
      },
      {
        id: 'single_llc_election',
        question: 'Do you expect net profits to substantially exceed reasonable owner compensation?',
        context: 'S-Corporation pass-through election saves on SECA self-employment taxes (15.3%) on distribution portion.',
        choices: [
          { text: 'Yes (Significant profit above salary)', next: 's_corp' },
          { text: 'No (Simpler single-member LLC)', next: 'single_llc' },
        ],
      },
      {
        id: 'liability_protection',
        question: 'Do owners need personal liability protection from business obligations?',
        context: 'General partnerships expose all partners to unlimited joint and several liability.',
        choices: [
          { text: 'Yes (Limited liability required)', next: 'vc_institutional' },
          { text: 'No (Direct general partnership)', next: 'gp' },
        ],
      },
      {
        id: 'vc_institutional',
        question: 'Do you plan to raise institutional Venture Capital or go public (IPO)?',
        context: 'VC funds and foreign/tax-exempt LPs almost universally mandate Delaware C-Corps due to QSBS Section 1202 and pass-through UBTI tax friction.',
        choices: [
          { text: 'Yes (VC-backed / Public roadmap)', next: 'c_corp' },
          { text: 'No (Self-funded / Private distributions)', next: 'pass_through_choice' },
        ],
      },
      {
        id: 'pass_through_choice',
        question: 'Are all owners US individuals/entities, under 100 members, with one class of stock?',
        context: 'IRC Subchapter S has strict eligibility tests; LLCs offer total ownership and distribution flexibility.',
        choices: [
          { text: 'Yes (Eligible for S-Corp status)', next: 's_corp' },
          { text: 'No (Foreign owners, multiple share classes, or corporate members)', next: 'multi_llc' },
        ],
      },
    ],
    outcomes: {
      c_corp: {
        title: 'C Corporation (Delaware or State of Operation)',
        tagline: 'Standard corporate entity with separate legal identity and double taxation (IRC Subchapter C)',
        taxTreatment: 'Taxed at flat 21% federal corporate rate; distributions taxed as dividends (0%/15%/20%) to shareholders.',
        advantages: [
          'Eligible for Section 1202 Qualified Small Business Stock (QSBS) up to $10M+ tax-free capital gain exclusion',
          'Standard requirement for venture capital, accelerator equity, and stock option pools (ISOs)',
          'No limit on number or nationality of shareholders; unlimited stock classes (Preferred vs Common)',
        ],
        tradeoffs: [
          'Double taxation on distributed dividends',
          'Operating losses cannot be passed through to offset founders personal income',
        ],
        citation: 'Scholes et al., Taxes and Business Strategy, Ch. 4 (Organizational Form).',
      },
      s_corp: {
        title: 'S Corporation (IRC Subchapter S)',
        tagline: 'Pass-through corporate charter avoiding double taxation while providing payroll tax efficiency',
        taxTreatment: 'Pass-through entity; corporate net income reported directly on shareholders Form 1040 Schedule K-1.',
        advantages: [
          'Single level of income tax at individual shareholder tax rates',
          'Self-employment tax savings: profits above reasonable salary escape 15.3% FICA/Medicare taxes',
          'Full corporate limited liability shielding owners personal assets',
        ],
        tradeoffs: [
          'Strict 100-shareholder ceiling; must be US citizens or resident aliens (no institutional or foreign investors)',
          'Strict single-class-of-stock rule (no preferred liquidation rights or differing dividend splits)',
        ],
        citation: 'Brealey, Myers & Allen, Principles of Corporate Finance, Ch. 1.',
      },
      multi_llc: {
        title: 'Multi-Member LLC (Taxed as Partnership)',
        tagline: 'Maximum structural flexibility with pass-through partnership taxation (IRC Subchapter K)',
        taxTreatment: 'Pass-through taxation under Subchapter K; profits, losses, and special allocations flow to members.',
        advantages: [
          'Complete contractual flexibility in operating agreement; bespoke profit/loss split waterfalls',
          'No restriction on member types (foreign, corporate, trust, or institutional members allowed)',
          'Limited liability protection for all members',
        ],
        tradeoffs: [
          'All active member earnings subject to self-employment tax unless structured as limited partner',
          'Complex partnership accounting (Section 704(b) capital accounts and 754 basis step-ups)',
        ],
        citation: 'Easton et al., Financial Statement Analysis & Valuation, Ch. 14.',
      },
      single_llc: {
        title: 'Single-Member LLC (Disregarded Entity)',
        tagline: 'Streamlined limited liability with sole proprietor schedule C simplicity',
        taxTreatment: 'Treated as a disregarded entity for tax purposes; reported directly on owner Form 1040 Schedule C.',
        advantages: [
          'Simple compliance: no separate corporate income tax return required (Schedule C on Form 1040)',
          'Full limited liability protection shielding personal assets against general business liabilities',
          'Can elect corporate taxation (S-Corp or C-Corp) later via Form 8832 / 2553 as company scales',
        ],
        tradeoffs: [
          'All net profit is subject to self-employment tax (15.3% FICA/Medicare)',
          'Annual state franchise fees and franchise filings apply in most jurisdictions',
        ],
        citation: 'Scholes et al., Taxes and Business Strategy, Ch. 4.',
      },
      sole_prop: {
        title: 'Sole Proprietorship',
        tagline: 'Informal single-owner business with zero entity formation formalities',
        taxTreatment: 'Direct reporting on Form 1040 Schedule C; combined with individual return.',
        advantages: [
          'Zero state registration or formation legal fees',
          'Simplest tax compliance and administrative overhead',
        ],
        tradeoffs: [
          'Unlimited personal liability: owner personal bank accounts, home, and assets are fully exposed to business lawsuits and debts',
          'Cannot sell equity to co-owners or raise capital from outside investors',
        ],
        citation: 'Berk & DeMarzo, Corporate Finance, Ch. 1.',
      },
      gp: {
        title: 'General Partnership',
        tagline: 'Multi-owner unincorporated business structure',
        taxTreatment: 'Pass-through taxation under Subchapter K (Form 1065 + Schedule K-1s).',
        advantages: [
          'Easy informal establishment among partners',
          'Single level of pass-through taxation',
        ],
        tradeoffs: [
          'Joint and several unlimited liability: each partner can be held personally liable for 100% of the debts incurred by any other partner',
          'High legal and financial risk in modern commerce',
        ],
        citation: 'Brealey, Myers & Allen, Corporate Finance, Ch. 1.',
      },
    },
  },
  section_83b: {
    name: 'Equity Vesting & Section 83(b) Election',
    description: 'Determine whether to file an IRC Section 83(b) election within 30 days of receiving restricted equity.',
    root: 'restricted_stock',
    nodes: [
      {
        id: 'restricted_stock',
        question: 'Did you receive restricted equity subject to a substantial risk of forfeiture (vesting)?',
        context: 'Section 83(b) only applies to unvested property/stock subject to vesting schedules, not fully vested equity or stock options.',
        choices: [
          { text: 'Yes (Unvested stock subject to repurchase/vesting)', next: 'current_fmv' },
          { text: 'No (Fully vested stock or stock options)', next: 'no_83b_needed' },
        ],
      },
      {
        id: 'current_fmv',
        question: 'Is the current Fair Market Value (FMV) zero or nominal (penny stock at founding)?',
        context: 'If shares are granted at incorporation, taxable income today is $0 or negligible pennies.',
        choices: [
          { text: 'Yes (Incorporation stage / negligible FMV)', next: 'file_83b_now' },
          { text: 'No (Substantial current valuation / later-stage round)', next: 'cash_to_pay_tax' },
        ],
      },
      {
        id: 'cash_to_pay_tax',
        question: 'Do you have the liquid cash today to pay ordinary income tax on the entire grant upfront?',
        context: 'Filing 83(b) accelerates tax on the full unvested block today. If the startup fails later, tax paid is NOT deductible as capital loss.',
        choices: [
          { text: 'Yes (Have liquidity & confident in company)', next: 'growth_expectations' },
          { text: 'No (Cannot afford immediate cash tax burden)', next: 'standard_vesting' },
        ],
      },
      {
        id: 'growth_expectations',
        question: 'Do you expect high future enterprise appreciation before liquidity/sale?',
        context: 'Section 83(b) locks in tax at today low price and starts the 1-year long-term capital gains and Section 1202 QSBS clocks immediately.',
        choices: [
          { text: 'Yes (High growth anticipated)', next: 'file_83b_now' },
          { text: 'No (Uncertain / flat trajectory)', next: 'standard_vesting' },
        ],
      },
    ],
    outcomes: {
      file_83b_now: {
        title: 'File IRC Section 83(b) Election Immediately',
        tagline: 'Must be postmarked within 30 days of grant date — absolute hard IRS deadline',
        taxTreatment: 'Tax calculated on grant date FMV less purchase price (usually $0). All subsequent appreciation converts to Long-Term Capital Gains (maximum 20% vs 37% ordinary income).',
        advantages: [
          'Avoids massive future tax surprises as equity vests at escalating 409A valuations',
          'Starts the 1-year Long-Term Capital Gains holding period immediately',
          'Starts the 5-year holding clock for Section 1202 Qualified Small Business Stock (QSBS) 100% tax exemption',
        ],
        tradeoffs: [
          'If founder departs before vesting, upfront taxes paid cannot be refunded or claimed as a capital loss',
          'Absolute 30-day strict statutory deadline with zero IRS relief for late filings',
        ],
        citation: 'Scholes et al., Taxes and Business Strategy, Ch. 8 (Executive Compensation).',
      },
      standard_vesting: {
        title: 'Allow Standard Section 83(a) Vesting (Do Not File)',
        tagline: 'Recognize ordinary income incrementally as each vesting tranche vests',
        taxTreatment: 'Ordinary income is recognized on each vesting date equal to FMV minus purchase price, subject to ordinary income tax rates and payroll withholding.',
        advantages: [
          'Zero upfront tax risk if company fails or if you leave prior to vesting',
          'No immediate cash outlay required at time of grant',
        ],
        tradeoffs: [
          'If stock skyrockets, each vest event triggers large ordinary income tax liability on illiquid shares (dry tax liability)',
          'Subsequent capital gains clock only begins on the vesting date of each specific tranche',
        ],
        citation: 'Scholes et al., Taxes and Business Strategy, Ch. 8.',
      },
      no_83b_needed: {
        title: 'Section 83(b) Inapplicable',
        tagline: 'No election required for fully vested stock or standard option grants',
        taxTreatment: 'Non-restricted stock is taxed upon receipt; standard stock options (ISOs/NSOs) are taxed upon exercise or disposition under IRC Section 421/422.',
        advantages: ['No 30-day IRS filing deadline pressure'],
        tradeoffs: ['Review whether option exercise strategy (e.g. early exercise) should be considered'],
        citation: 'Brealey, Myers & Allen, Corporate Finance, Ch. 24.',
      },
    },
  },
  deal_structure: {
    name: 'M&A Deal Structure (Stock vs Asset vs 338(h)(10))',
    description: 'Determine optimal M&A acquisition architecture: Stock purchase, Asset purchase, or Section 338(h)(10) election.',
    root: 'target_entity',
    nodes: [
      {
        id: 'target_entity',
        question: 'What is the corporate legal form of the Target entity being acquired?',
        context: 'C-Corps face corporate-level gain on asset sales, whereas S-Corps and LLCs pass through gains with single-level taxation.',
        choices: [
          { text: 'S-Corporation or Subsidiary in Consolidated Group', next: 'asset_basis_stepup' },
          { text: 'Standalone C-Corporation', next: 'c_corp_liabilities' },
        ],
      },
      {
        id: 'c_corp_liabilities',
        question: 'Are there significant undisclosed, contingent, or legacy litigation liabilities?',
        context: 'In a stock purchase, buyer inherits all historical liabilities by operation of law. In an asset purchase, buyer specifies which liabilities to assume.',
        choices: [
          { text: 'Yes (High legacy risk / clean slate needed)', next: 'asset_purchase' },
          { text: 'No (Clean operating history / key contracts non-assignable)', next: 'stock_purchase' },
        ],
      },
      {
        id: 'asset_basis_stepup',
        question: 'Does the buyer desire a stepped-up tax basis for depreciable assets and Section 197 goodwill?',
        context: 'Stepping up basis creates future tax deductions for depreciation and amortization (PV of tax shield ≈ 20–25% of step-up).',
        choices: [
          { text: 'Yes (Step-up is highly valuable)', next: 'election_338_h_10' },
          { text: 'No (Basis step-up is negligible)', next: 'stock_purchase' },
        ],
      },
    ],
    outcomes: {
      stock_purchase: {
        title: 'Stock Purchase Structure',
        tagline: 'Acquisition of 100% of outstanding target stock from selling shareholders',
        taxTreatment: 'Sellers pay single-level capital gains tax on difference between stock price and stock basis. Target tax attributes (historical basis, NOLs subject to Section 382) carry over.',
        advantages: [
          'Single level of taxation for sellers (avoids corporate double tax on asset gain)',
          'Contracts, licenses, and permits remain intact with no assignment required',
          'Simpler legal execution than transferring hundreds of individual assets and titles',
        ],
        tradeoffs: [
          'Buyer carries over historical asset basis (no fresh goodwill amortization or step-up tax shield)',
          'Buyer inherits all known and unknown historical contingent liabilities',
        ],
        citation: 'Scholes et al., Taxes and Business Strategy, Ch. 13 (Corporate Reorganizations & M&A).',
      },
      asset_purchase: {
        title: 'Asset Purchase Structure',
        tagline: 'Acquisition of specific operating assets and assumption of explicitly enumerated liabilities',
        taxTreatment: 'Target recognizes gain on asset sale; proceeds distributed to shareholders trigger second level of tax in C-Corps. Buyer gets stepped-up basis in all acquired assets.',
        advantages: [
          'Buyer takes stepped-up fair market value basis, creating 15-year Section 197 goodwill amortization tax shield',
          'Buyer selectively leaves behind legacy liabilities, environmental claims, and litigation risks',
        ],
        tradeoffs: [
          'Severe double taxation if target is a C-Corporation',
          'Requires manual assignment and consent for each commercial contract, lease, and employee transfer',
        ],
        citation: 'Scholes et al., Taxes and Business Strategy, Ch. 13.',
      },
      election_338_h_10: {
        title: 'Section 338(h)(10) Joint Election',
        tagline: 'Stock purchase legally treated as a deemed asset sale for federal income tax purposes',
        taxTreatment: 'Buyer purchases stock (no contract assignment hassles), but IRS treats transaction as a deemed asset sale followed by a deemed liquidation of the target.',
        advantages: [
          'Best of both worlds: simple legal transfer of stock without re-assigning thousands of contracts',
          'Buyer receives full stepped-up basis in all assets and Section 197 goodwill amortization deductions',
          'Applicable to target S-Corporations or corporate subsidiaries without catastrophic double tax',
        ],
        tradeoffs: [
          'Both Buyer and Seller must jointly consent and sign IRS Form 8023',
          'Buyer typically compensates seller with a purchase price gross-up for any extra state or ordinary tax costs',
        ],
        citation: 'Scholes et al., Taxes and Business Strategy, Ch. 14.',
      },
    },
  },
};

/**
 * Create Decision Tree component instance.
 */
export function create(container, config = {}) {
  if (!container) throw new Error('decision-tree requires a container element');

  // Load preset or custom config
  const initialPreset = config.preset && DECISION_PRESETS[config.preset]
    ? DECISION_PRESETS[config.preset]
    : DECISION_PRESETS.entity_choice;

  let state = {
    name: config.name || initialPreset.name,
    description: config.description || initialPreset.description,
    root: config.root || (config.nodes && config.nodes[0] ? config.nodes[0].id : initialPreset.root),
    nodes: Array.isArray(config.nodes) && config.nodes.length > 0
      ? normalizeNodes(config.nodes)
      : normalizeNodes(initialPreset.nodes),
    outcomes: config.outcomes || initialPreset.outcomes,
    // History stack of visited node IDs and choices made: [ { nodeId, choiceText, nextId } ]
    history: [],
    currentNodeId: null,
  };

  state.currentNodeId = state.root;

  function normalizeNodes(rawNodes) {
    return rawNodes.map(node => {
      // If node uses shorthand { yes: 'id1', no: 'id2' }
      if (node.yes && node.no && !node.choices) {
        return {
          id: node.id,
          question: node.question,
          context: node.context || '',
          choices: [
            { text: 'Yes', next: node.yes },
            { text: 'No', next: node.no },
          ],
        };
      }
      return {
        id: node.id,
        question: node.question,
        context: node.context || '',
        choices: node.choices || [],
      };
    });
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'decision-tree-widget';
  wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 1.5rem; font-family: var(--font-sans, system-ui, sans-serif); color: var(--color-gray-900, #1f2937);';

  container.innerHTML = '';
  container.appendChild(wrapper);

  function getCurrentNode() {
    return state.nodes.find(n => n.id === state.currentNodeId) || null;
  }

  function getOutcome(outcomeId) {
    if (!state.outcomes) return null;
    const out = state.outcomes[outcomeId];
    if (typeof out === 'string') {
      return {
        title: out,
        tagline: '',
        taxTreatment: '',
        advantages: [],
        tradeoffs: [],
      };
    }
    return out || null;
  }

  function render() {
    const currentNode = getCurrentNode();
    const currentOutcome = !currentNode ? getOutcome(state.currentNodeId) : null;
    const isLeaf = Boolean(currentOutcome);

    wrapper.innerHTML = `
      <div class="tool-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--color-border, #e5e7eb); padding-bottom: 1rem;">
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 700; margin: 0 0 0.25rem 0; color: var(--color-gray-900, #111827);">
            ${state.name}
          </h2>
          <p style="font-size: 0.875rem; color: var(--color-text-secondary, #6b7280); margin: 0;">
            ${state.description}
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <label style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--color-text-secondary, #6b7280);">Framework:</label>
          <select id="decision-preset-select" style="padding: 0.4rem 0.6rem; font-size: 0.8125rem; border: 1px solid var(--color-border, #d1d5db); border-radius: var(--radius-md, 0.375rem); background: var(--color-surface, #fff); cursor: pointer;">
            <option value="entity_choice">Business Entity Selection</option>
            <option value="section_83b">Section 83(b) Tax Election</option>
            <option value="deal_structure">M&A Deal Architecture</option>
          </select>
        </div>
      </div>

      <!-- Path Breadcrumb Trail -->
      <div style="background: var(--color-gray-50, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius-md, 0.375rem); padding: 0.75rem 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">
            Active Decision Path (${state.history.length} decision${state.history.length === 1 ? '' : 's'} made)
          </span>
          <div style="display: flex; gap: 0.5rem;">
            ${state.history.length > 0 ? `
              <button id="btn-back" style="font-size: 0.75rem; font-weight: 600; color: var(--color-primary, #2563eb); background: none; border: none; cursor: pointer; padding: 0.2rem 0.4rem;">
                ◀ Back
              </button>
            ` : ''}
            <button id="btn-restart" style="font-size: 0.75rem; font-weight: 600; color: #64748b; background: none; border: none; cursor: pointer; padding: 0.2rem 0.4rem;">
              ↺ Restart
            </button>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; font-size: 0.8125rem;">
          <span style="padding: 0.25rem 0.5rem; background: #e2e8f0; border-radius: 4px; font-weight: 600; color: #334155;">Start</span>
          ${state.history.map((h, i) => `
            <span style="color: #94a3b8;">➔</span>
            <span style="padding: 0.25rem 0.5rem; background: #dbeafe; border-radius: 4px; font-weight: 600; color: #1e40af;">
              ${h.choiceText}
            </span>
          `).join('')}
          ${isLeaf ? `
            <span style="color: #94a3b8;">➔</span>
            <span style="padding: 0.25rem 0.5rem; background: #dcfce7; border-radius: 4px; font-weight: 700; color: #15803d;">
              ★ ${currentOutcome.title || state.currentNodeId}
            </span>
          ` : ''}
        </div>
      </div>

      <!-- Main Decision Card or Recommendation Card -->
      ${!isLeaf && currentNode ? `
        <!-- Question Card -->
        <div style="background: var(--color-surface, #fff); border: 2px solid var(--color-primary, #3b82f6); border-radius: var(--radius-lg, 0.5rem); padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="display: inline-block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; background: #eff6ff; color: #1d4ed8; padding: 0.25rem 0.75rem; border-radius: 9999px; margin-bottom: 1rem;">
            Step ${state.history.length + 1} of Flow
          </div>

          <h3 style="font-size: 1.375rem; font-weight: 800; color: #0f172a; margin: 0 0 0.75rem 0; line-height: 1.3;" id="current-question">
            ${currentNode.question}
          </h3>

          ${currentNode.context ? `
            <p style="font-size: 0.9375rem; color: #64748b; line-height: 1.5; margin: 0 0 1.5rem 0;">
              ${currentNode.context}
            </p>
          ` : ''}

          <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.5rem;">
            ${currentNode.choices.map((choice, idx) => `
              <button
                class="decision-choice-btn"
                data-idx="${idx}"
                data-next="${choice.next}"
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 1rem 1.25rem;
                  background: #f8fafc;
                  border: 2px solid #e2e8f0;
                  border-radius: var(--radius-md, 0.375rem);
                  font-size: 1rem;
                  font-weight: 600;
                  color: #1e293b;
                  text-align: left;
                  cursor: pointer;
                  transition: all 0.15s ease;
                "
              >
                <span>${choice.text}</span>
                <span style="color: #3b82f6; font-size: 1.25rem; font-weight: 800;">➔</span>
              </button>
            `).join('')}
          </div>
        </div>
      ` : `
        <!-- Outcome Recommendation Card -->
        <div style="background: var(--color-surface, #fff); border: 2px solid #22c55e; border-radius: var(--radius-lg, 0.5rem); padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);" id="recommendation-card">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
            <span style="font-size: 1.5rem;">🎯</span>
            <span style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; background: #dcfce7; color: #166534; padding: 0.3rem 0.75rem; border-radius: 9999px;">
              Recommended Resolution
            </span>
          </div>

          <h3 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem 0;">
            ${currentOutcome?.title || state.currentNodeId}
          </h3>

          ${currentOutcome?.tagline ? `
            <p style="font-size: 1rem; color: #475569; margin: 0 0 1.25rem 0; font-weight: 500;">
              ${currentOutcome.tagline}
            </p>
          ` : ''}

          ${currentOutcome?.taxTreatment ? `
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md, 0.375rem); padding: 1rem 1.25rem; margin-bottom: 1.25rem;">
              <strong style="display: block; font-size: 0.75rem; text-transform: uppercase; color: #15803d; margin-bottom: 0.25rem;">
                Tax & Legal Treatment
              </strong>
              <div style="font-size: 0.875rem; color: #166534; line-height: 1.4;">
                ${currentOutcome.taxTreatment}
              </div>
            </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
            ${currentOutcome?.advantages && currentOutcome.advantages.length > 0 ? `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md, 0.375rem); padding: 1rem;">
                <h4 style="font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; color: #16a34a; margin: 0 0 0.5rem 0;">
                  Key Advantages
                </h4>
                <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.8125rem; color: #334155; line-height: 1.5;">
                  ${currentOutcome.advantages.map(a => `<li>${a}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${currentOutcome?.tradeoffs && currentOutcome.tradeoffs.length > 0 ? `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: var(--radius-md, 0.375rem); padding: 1rem;">
                <h4 style="font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; color: #dc2626; margin: 0 0 0.5rem 0;">
                  Trade-offs & Friction
                </h4>
                <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.8125rem; color: #334155; line-height: 1.5;">
                  ${currentOutcome.tradeoffs.map(t => `<li>${t}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>

          ${currentOutcome?.citation ? `
            <div style="font-size: 0.75rem; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 0.75rem;">
              <strong>Academic Reference:</strong> ${currentOutcome.citation}
            </div>
          ` : ''}
        </div>
      `}

      <!-- Node Structure Diagram Overview -->
      <details style="background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e5e7eb); border-radius: var(--radius-md, 0.375rem); padding: 1rem;">
        <summary style="font-size: 0.8125rem; font-weight: 700; color: #475569; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em;">
          Decision Map Overview (${state.nodes.length} Decision Checkpoints)
        </summary>
        <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
          ${state.nodes.map(n => {
            const isCurrent = n.id === state.currentNodeId;
            const isVisited = state.history.some(h => h.nodeId === n.id);
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: ${isCurrent ? '#eff6ff' : (isVisited ? '#f1f5f9' : '#fff')}; border: 1px solid ${isCurrent ? '#93c5fd' : '#e2e8f0'}; border-radius: 4px; font-size: 0.8125rem;">
                <span style="font-weight: ${isCurrent ? '700' : '500'}; color: ${isCurrent ? '#1d4ed8' : '#334155'};">
                  ${n.question}
                </span>
                <span style="font-size: 0.75rem; color: #64748b; font-family: var(--font-mono, monospace);">
                  ${isCurrent ? '● Active' : (isVisited ? '✓ Visited' : '○ Standby')}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      </details>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Preset dropdown
    const presetSelect = wrapper.querySelector('#decision-preset-select');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        const p = DECISION_PRESETS[e.target.value];
        if (p) {
          state.name = p.name;
          state.description = p.description;
          state.root = p.root;
          state.nodes = normalizeNodes(p.nodes);
          state.outcomes = p.outcomes;
          state.history = [];
          state.currentNodeId = state.root;
          render();
        }
      });
    }

    // Choice buttons
    wrapper.querySelectorAll('.decision-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextId = btn.getAttribute('data-next');
        const choiceText = btn.querySelector('span')?.textContent || 'Choice';
        const currentNodeId = state.currentNodeId;

        state.history.push({
          nodeId: currentNodeId,
          choiceText,
          nextId,
        });

        state.currentNodeId = nextId;
        render();
      });

      btn.addEventListener('mouseenter', () => {
        btn.style.borderColor = '#3b82f6';
        btn.style.background = '#eff6ff';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.borderColor = '#e2e8f0';
        btn.style.background = '#f8fafc';
      });
    });

    // Back button
    const backBtn = wrapper.querySelector('#btn-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (state.history.length > 0) {
          const prev = state.history.pop();
          state.currentNodeId = prev.nodeId;
          render();
        }
      });
    }

    // Restart button
    const restartBtn = wrapper.querySelector('#btn-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        state.history = [];
        state.currentNodeId = state.root;
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
      if (newConfig.name) state.name = newConfig.name;
      if (newConfig.description) state.description = newConfig.description;
      if (Array.isArray(newConfig.nodes)) {
        state.nodes = normalizeNodes(newConfig.nodes);
      }
      if (newConfig.outcomes) {
        state.outcomes = newConfig.outcomes;
      }
      if (newConfig.root) {
        state.root = newConfig.root;
      }
      state.history = [];
      state.currentNodeId = state.root;
      render();
    },
    getState() {
      return JSON.parse(JSON.stringify(state));
    },
    selectChoice(choiceIndex) {
      const currentNode = getCurrentNode();
      if (!currentNode || !currentNode.choices[choiceIndex]) return false;
      const choice = currentNode.choices[choiceIndex];
      state.history.push({
        nodeId: state.currentNodeId,
        choiceText: choice.text,
        nextId: choice.next,
      });
      state.currentNodeId = choice.next;
      render();
      return true;
    },
  };
}
