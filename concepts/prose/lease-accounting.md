# Lease Accounting (ASC 842 / IFRS 16)

## Intuition
For decades prior to 2019, airlines, retailers, and restaurant chains structured billions of dollars of aircraft and store obligations as "Operating Leases" to keep massive fixed debt obligations completely **off-balance-sheet** (under legacy ASC 840).

Modern accounting standards (**ASC 842** under US GAAP and **IFRS 16** internationally) eliminated this off-balance-sheet loophole. Today, virtually all leases with terms exceeding 12 months must be capitalized directly onto the corporate balance sheet by recording:
1. **Lease Liability:** The present value of future contractual lease payments, discounted at the rate implicit in the lease (or the lessee's incremental borrowing rate).
2. **Right-of-Use (ROU) Asset:** An operating asset representing the lessee's right to control and use the leased property over the lease term.

Crucially, however, **US GAAP (ASC 842) and IFRS 16 diverge sharply on the income statement**, creating a major analytical trap when comparing US companies against European or Asian peers!

## Structure
### US GAAP (ASC 842) vs. IFRS 16 Income Statement & Cash Flow Divergence

| Accounting Dimension | US GAAP — Finance Lease | US GAAP — Operating Lease | IFRS 16 — All Leases |
|---|---|---|---|
| **Balance Sheet** | ROU Asset + Lease Liability | ROU Asset + Lease Liability | ROU Asset + Lease Liability |
| **Income Statement Expense** | Split into **Amortization** (in D&A) + **Interest Expense** | Single straight-line **Lease Expense** inside Operating Expenses (SG&A/COGS) | Split into **Amortization** (in D&A) + **Interest Expense** |
| **Expense Profile Over Time** | Front-loaded (higher interest in early years) | Constant straight-line expense each year | Front-loaded (higher interest in early years) |
| **EBITDA Impact** | **Higher EBITDA** (both amortization and interest are excluded from EBITDA!) | **Lower EBITDA** (full lease rent is deducted inside operating expenses) | **Higher EBITDA** (all lease costs are excluded from EBITDA!) |
| **Cash Flow Statement** | Interest in Operating CF; Principal in Financing CF | 100% of lease payment inside Operating Cash Flow | Interest in Operating/Financing; Principal in Financing CF |

$$\text{Lease Liability}_0 = \sum_{t=1}^T \frac{\text{Lease Payment}_t}{(1 + r_{\text{IBR}})^t}$$

## Common Misconceptions
- **Misconception 1: "A European retailer with a 15% EBITDA margin is more profitable than a US competitor with a 10% EBITDA margin."**  
  *Reality:* Under IFRS 16, the European retailer classifies all store rents as depreciation and interest—completely removing store rent from EBITDA! Under US GAAP ASC 842, the US retailer's store leases are Operating Leases, so 100% of store rent reduces EBITDA. Comparing raw EV/EBITDA between US GAAP and IFRS companies without adjustment is a classic valuation error. Use **EBITDAR** (EBITDA before Rent) or treat all operating leases as debt across both standards.
- **Misconception 2: "ROU Assets are tangible property that can be liquidated to pay creditors."**  
  *Reality:* An ROU Asset is merely a contractual right to occupy space contingent on paying rent. In bankruptcy, ROU assets cannot be sold like owned real estate unless the lease contract is significantly below current market rent.
- **Misconception 3: "Signing a 1-year renewable lease avoids balance sheet capitalization."**  
  *Reality:* If the lessee has a significant economic incentive to exercise renewal options (e.g., expensive custom leasehold improvements installed in the building), ASC 842 requires including the renewal periods in the capitalized lease liability.

## Notes for Future-Me
When negotiating bank credit facilities or analyzing lease-heavy industries (airlines, retail, data centers, logistics):
1. **Standardize on EBITDAR:** Always compute $\text{EV} / \text{EBITDAR}$ where Enterprise Value includes capitalized operating lease liabilities on the balance sheet.
2. **Audit Debt Covenant Definitions:** Ensure your corporate credit agreement explicitly specifies **"Frozen GAAP"** or excludes ASC 842 Operating Lease Liabilities from the definition of "Total Funded Debt." Otherwise, signing a new 10-year headquarters office lease will artificially spike your $\text{Net Debt} / \text{EBITDA}$ covenant ratio!
