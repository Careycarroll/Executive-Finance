# Executive Finance Interactive

An interactive learning tool for Finance for Executives: Managing for Value Creation,
6th Edition by Gabriel Hawawini and Claude Viallet (INSEAD). Built with Vite,
vanilla JavaScript, and CSS custom properties. No frameworks. Deployed as a
Progressive Web App on GitHub Pages.

Live: https://careycarroll.github.io/Executive-Finance/

Source: Hawawini, G. and Viallet, C. -- Finance for Executives: Managing for Value
Creation, 6th Edition. Cengage Learning, 2019.

---

## Goal

Build a comprehensive interactive learning companion covering all 18 chapters of
Finance for Executives. Students learn concepts chapter by chapter (Learn section),
then apply them to real financial decisions (Analyze section). A dedicated Formulas
page provides KaTeX-rendered reference equations for all 32 textbook formulas.

---

## Running Locally

    git clone https://github.com/careycarroll/Executive-Finance.git
    cd Executive-Finance
    npm install
    npm run dev

---

## Book Structure

| Part | Chapters | Theme |
|---|---|---|
| I: Financial Concepts and Techniques | 1-3 | Overview, Time Value of Money, Risk and Return |
| II: Assessing Business Performance | 4-6 | Financial Statements, Operational Efficiency, Profitability |
| III: Making Investment Decisions | 7-9 | NPV Rule, Alternatives to NPV, Cash Flow Estimation |
| IV: Making Financing Decisions | 10-13 | Bonds and Stocks, Capital Raising, Cost of Capital, Capital Structure |
| V: Making Business Decisions | 14-18 | Business Valuation, Corporate Risk, Derivatives, International Finance, Value Creation |

---

## Learn Section -- Chapter Status

| # | Chapter | Status | Tools |
|---|---------|--------|-------|
| 1 | Financial Management and Value Creation: An Overview | Not started | |
| 2 | The Time Value of Money | Not started | |
| 3 | Risk and Return | Not started | |
| 4 | Interpreting Financial Statements | Not started | |
| 5 | Analyzing Operational Efficiency and Liquidity | Not started | |
| 6 | Analyzing Profitability, Risk, and Growth | Not started | |
| 7 | Using the Net Present Value Rule | Not started | |
| 8 | Alternatives to the Net Present Value Rule | Not started | |
| 9 | Identifying and Estimating a Project's Cash Flows | Not started | |
| 10 | Valuing Bonds and Stocks | Not started | |
| 11 | Raising Capital and Paying Out Cash | Not started | |
| 12 | Estimating the Cost of Capital | Not started | |
| 13 | Designing a Capital Structure | Not started | |
| 14 | Valuing and Acquiring a Business | Not started | |
| 15 | Managing Corporate Risk | Not started | |
| 16 | Understanding Forward, Futures, and Options | Not started | |
| 17 | Making International Business Decisions | Not started | |
| 18 | Managing for Value Creation | Not started | |

---

## Reference Section

| Page | Description | Status |
|---|---|---|
| pages/formulas.html | All 32 textbook formulas with KaTeX rendering, chapter references, and interactive calculators | Not started |
| pages/glossary.html | Full glossary of terms and notations from the textbook | Not started |

---

## Analyze Section -- Scenario Status

| Scenario | Chapters | Status |
|----------|----------|--------|
| Will this investment create value? | 7, 8, 9 | Not started |
| How is this business performing? | 4, 5, 6 | Not started |
| What is this company worth? | 10, 14 | Not started |
| How should we finance this investment? | 11, 12, 13 | Not started |
| Should we acquire this company? | 14, 12, 7 | Not started |
| How do we manage financial risk? | 15, 16 | Not started |
| Should we invest internationally? | 17, 12, 7 | Not started |
| Are we creating value for shareholders? | 18, 6, 12 | Not started |

---

## Shared Components


| Component | File | Status |
|-----------|------|--------|
| Randomizer | js/components/randomizer.js | Built |
| Journal Entry | js/components/journal-entry.js | Built |
| Show Work | js/components/show-work.js | Built |
| Progress Tracker | js/core/progress-tracker.js | Built |
| Base Chart | js/charts/chart-core.js | Built |
| CVP Chart | js/charts/cvp-chart.js | Built |
| Scatter Chart | js/charts/scatter-chart.js | Built |
| ROC Chart | js/charts/roc-chart.js | Built |

---

## Technical Notes

- Vite 7 -- multi-page app, no framework, vanilla JS throughout
- PWA -- service worker via vite-plugin-pwa, works offline after first load
- ES Modules -- all JS uses native import/export
- CSS custom properties -- full design system in base.css, responsive min() widths
- Progress tracking -- localStorage via progress-tracker.js
- KaTeX -- installed for formula rendering across chapter tools and formulas page
- GitHub Pages -- base path /Executive-Finance/ in production, / in dev

---

## CSS Authoring Rule

Never write CSS inside Python triple-quoted strings passed through a shell heredoc.
The terminal collapses newlines between closing braces and the next selector.

Always write CSS as a Python list of strings and join with newline:

    lines = [
        '.my-class {',
        '  color: red;',
        '}',
        '.next-class {',
        '  color: blue;',
        '}',
    ]
    with open(path, 'a') as f:
        f.write('\n'.join(lines) + '\n')

After appending CSS, always verify with:

    grep -c '}\.'' css/learn.css

Zero means clean. Non-zero means collapsed rules that need a targeted str.replace() fix.

---

## Useful Dev Commands

    npm run dev
    npm run build
    npm run deploy
    lsof -ti :5173,:5174,:5175,:5176 | xargs kill -9 2>/dev/null; pkill -9 -f vite 2>/dev/null; echo done

---

## Development Roadmap

Phase 0 -- Foundation (May 2026)
Scaffold copied from Managerial-Accounting. CSS design system, shared components,
chart library, vite config, PWA setup, landing page, learn index stub.

Phase 1 -- Formulas and Glossary Pages
pages/formulas.html with all 32 KaTeX-rendered equations and chapter references.
pages/glossary.html with all textbook notations and key terms.

Phase 2 -- Learn Section Part I (Chapters 1-3)
Ch. 1 (Overview), Ch. 2 (Time Value of Money), Ch. 3 (Risk and Return).

Phase 3 -- Learn Section Part II (Chapters 4-6)
Ch. 4 (Financial Statements), Ch. 5 (Operational Efficiency), Ch. 6 (Profitability).

Phase 4 -- Learn Section Part III (Chapters 7-9)
Ch. 7 (NPV Rule), Ch. 8 (Alternatives to NPV), Ch. 9 (Cash Flow Estimation).

Phase 5 -- Learn Section Part IV (Chapters 10-13)
Ch. 10 (Bonds and Stocks), Ch. 11 (Capital Raising), Ch. 12 (Cost of Capital),
Ch. 13 (Capital Structure).

Phase 6 -- Learn Section Part V (Chapters 14-18)
Ch. 14 (Business Valuation), Ch. 15 (Corporate Risk), Ch. 16 (Derivatives),
Ch. 17 (International Finance), Ch. 18 (Value Creation).

Phase 7 -- Analyze Section
Build all 8 scenario pages at Concept depth, then Analysis depth.
