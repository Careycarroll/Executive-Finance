# Entity Choice (C-Corp, S-Corp, LLC, Partnership)

## Intuition
The legal and tax structure chosen for a business dictates whether income is subject to double taxation (entity level plus shareholder distribution level) or pass-through taxation (taxed solely at owner personal rates). Choosing an entity requires trading off access to public equity markets and institutional venture capital against operational tax friction and self-employment payroll taxes.

## Structure
- **C-Corporation:** Separate legal and tax taxpayer. Entity pays corporate income tax ($t_c = 21\%$ federal). Dividends and share repurchases pay capital gains/qualified dividend rates ($t_{cg} \le 20\% + \text{NIIT}$). Double tax, but allows Qualified Small Business Stock (QSBS / Section 1202) capital gains exemptions and institutional VC investment.
- **S-Corporation:** Pass-through tax status with corporate limited liability. Avoids entity-level double tax. Strict statutory caps: maximum 100 shareholders, only US individuals/trusts, only one class of stock permitted (disqualifies institutional preferred equity).
- **LLC / Partnership:** Pass-through flexibility. Profits and losses allocate according to the operating agreement, not rigid share count. Substantial flexibility for debt basis adjustments (Section 752).

## Common Misconceptions
- **Myth 1: "Pass-through entities always result in lower total tax than C-corps."**  
  *Reality:* If high-growth business profits are 100% retained and reinvested inside the entity rather than distributed, the 21% flat corporate tax rate can be significantly lower than high personal marginal tax brackets (up to 37% + state).
- **Myth 2: "An LLC cannot issue equity to venture capitalists."**  
  *Reality:* It can, but standard institutional VCs typically mandate converting to a Delaware C-Corp prior to Series A funding to avoid pass-through tax filing complexities for tax-exempt LP investors.

## Notes for future-me
Always remember the Scholes-Wolfson three-way rule for tax planning: Effective tax planning considers taxes to **all parties**, **all taxes** (explicit income, payroll, state, implicit asset prices), and **all costs** (non-tax organizational and agency costs).
