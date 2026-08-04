# Bibliography

- Status: Living
- Last updated: 2026-08-04
- Owner: Carey Carroll

The ten-book library. Each entry has a short ID used in registry entries
under `sources[].book`.

| ID              | Title                                               | Author(s)                         | Edition | ISBN          | Role                           |
| --------------- | --------------------------------------------------- | --------------------------------- | ------- | ------------- | ------------------------------ |
| hawawini        | Finance for Executives                              | Hawawini & Viallet                | 6e      | 9781473749245 | Corporate finance spine        |
| bodie           | Investments (ISE)                                   | Bodie, Kane, Marcus               | 12e     | 9781260571158 | Investments / portfolio theory |
| hull            | Options, Futures and Other Derivatives              | Hull                              | 11e     | 9789356062559 | Derivatives theory             |
| natenberg       | Option Volatility & Pricing                         | Natenberg                         | 2e      | 9780071818780 | Options / volatility (applied) |
| natenberg-wb    | Option Volatility & Pricing Workbook                | Natenberg                         | —       | 9781260116946 | Practice for Natenberg         |
| sinclair        | Positional Option Trading                           | Sinclair                          | —       | 9781119583530 | Advanced options strategy      |
| penman          | Financial Statement Analysis and Security Valuation | Penman                            | —       | 9780073127132 | FSA + valuation (primary)      |
| easton          | Financial Statement Analysis and Valuation          | Easton                            | —       | 9781618531049 | FSA + valuation (applied)      |
| lundholm-sloan  | Equity Valuation and Analysis w/ eVal               | Lundholm & Sloan                  | —       | 9780073526898 | Equity valuation, modeling     |
| scholes-wolfson | Taxes and Business Strategy                         | Scholes, Wolfson, Erickson et al. | —       | 9781618533210 | Business tax                   |

## Notes on Selection

- **Hawawini** remains in the library despite the pivot away from
  chapter-organized structure (ADR-0001). It's still the primary source for
  the corp-finance foundations.
- **Three FSA/valuation books** (Penman, Easton, Lundholm-Sloan) are
  complementary, not redundant: Penman for the conceptual framework, Easton
  for applied analyst work, Lundholm-Sloan for the eVal modeling approach.
- **Sinclair** is deliberately narrow: position sizing, edge, and trade
  management. Not a general options text.
- **No Damodaran text** in the library. His free website covers what a
  Damodaran text would, and Lundholm-Sloan + Penman already cover DCF and
  reformulation-based valuation.
- **No M&A/LBO/PE text** in the library. Those pages are Reference-tier and
  sourced from external online material.

## Reference-Tier External Sources

For concepts tagged `Reference` with `sources[].book == "external"`, source
citations point to publicly available material rather than a book:

- **M&A mechanics, LBO math, PE fund economics, VC term sheets:** street of
  walls, WSO, industry primers
- **Fed policy transmission:** FRED blog, various Fed research papers
- **Real estate valuation:** ULI publications, appraisal institute materials

These citations are recorded per-concept in the registry, not aggregated
here.
