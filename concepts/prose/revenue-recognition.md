# Revenue Recognition (ASC 606 / IFRS 15)

## Intuition
Revenue is the single largest item on the corporate income statement and the primary target of aggressive earnings management. Under converged global accounting standards (**ASC 606** in US GAAP and **IFRS 15** internationally), companies cannot recognize revenue merely because cash is collected or an invoice is mailed.

Instead, the core principle mandates that **revenue is recognized when (or as) control of promised goods or services is transferred to the customer**, in an amount that reflects the consideration the company expects to be entitled to receive.

This principle creates two critical balance sheet accounts that executive analysts track closely:
1. **Contract Liabilities (Deferred / Unearned Revenue):** Cash collected from customers *before* the service is delivered (e.g., annual SaaS software subscriptions). Represents an obligation to perform future work, not debt!
2. **Contract Assets (Unbilled Receivables):** Revenue recognized for work completed *before* the customer can be contractually invoiced (e.g., multi-year defense or aerospace milestones).

## Structure
### The Five-Step ASC 606 Revenue Recognition Model

| Step | Analytical Requirement | Executive Red Flag / Manipulation Vector |
|---|---|---|
| **1. Identify the Contract** | Legally enforceable agreement with commercial substance and probable collection. | Recognizing revenue on non-binding letters of intent or side letters granting unconditional return rights. |
| **2. Identify Performance Obligations** | Distinct goods/services promised in the bundle (e.g., hardware + 3-year cloud support + installation). | Treating bundled multi-year services as a single obligation to front-load 100% of revenue on Day 1. |
| **3. Determine Transaction Price** | Total consideration adjusted for **variable consideration** (rebates, discounts, performance bonuses, returns). | Underestimating future customer returns or volume rebates to inflate current-quarter net sales. |
| **4. Allocate Transaction Price** | Split total price across distinct obligations based on **Standalone Selling Prices (SSP)**. | Artificially inflating the SSP of immediately delivered hardware while discounting deferred software maintenance. |
| **5. Recognize Revenue** | Recognize **Point-in-Time** (upon delivery) or **Over Time** (percentage-of-completion / input-output methods). | Prematurely inflating "estimated percentage complete" on long-term construction contracts to hit quarterly EPS targets. |

$$\text{Remaining Performance Obligations (RPO / Backlog)} = \text{Deferred Revenue on Balance Sheet} + \text{Unbilled Contracted Backlog}$$

## Common Misconceptions
- **Misconception 1: "Deferred revenue is a financial liability that hurts enterprise valuation."**  
  *Reality:* In subscription software (SaaS), growing deferred revenue is the ultimate indicator of business health! Customers have funded your working capital upfront in cash. However, in M&A purchase accounting, buyers must watch out for the historical "deferred revenue write-down" trap ( largely mitigated by ASU 2021-08).
- **Misconception 2: "Gross revenue and net revenue are interchangeable."**  
  *Reality:* Under **Principal vs. Agent** rules, a company that takes inventory risk and controls the product before transfer is a **Principal** and reports **Gross Revenue** (e.g., Amazon direct retail). A marketplace platform that merely matches buyers and sellers without taking title is an **Agent** and may only report its net commission fee as **Net Revenue** (e.g., Uber, Airbnb, eBay). Confusing gross merchandise value (GMV) with net revenue distorts EV/Sales multiples by $5\times-10\times$.
- **Misconception 3: "Billings equal GAAP Revenue."**  
  *Reality:* $\text{Billings} = \text{GAAP Revenue} + \Delta\text{Deferred Revenue}$. Billings measure current commercial sales momentum; GAAP revenue measures historical service delivery.

## Notes for Future-Me
When conducting financial due diligence on a target company, immediately run the **Unbilled Receivable Diagnostic**:
$$\text{Days Sales in Unbilled Receivables} = \frac{\text{Contract Assets (Unbilled A/R)}}{\text{Total Revenue}} \times 365$$
If Contract Assets (Unbilled Receivables) are growing twice as fast as total revenue while Deferred Revenue is shrinking, management is almost certainly **pulling forward future revenue** ("channel stuffing" or aggressive percentage-of-completion estimates) to mask a commercial slowdown.
