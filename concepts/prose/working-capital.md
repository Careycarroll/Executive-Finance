# Working Capital Management & Cash Conversion Cycle

## Intuition
Working capital management governs the operational circulatory system of an enterprise. It balances two competing executive priorities: **liquidity** (ensuring the business never defaults on short-term payroll or supplier obligations) and **profitability** (minimizing the amount of expensive capital trapped idly in accounts receivable, raw materials, and unsold warehouse inventory).

Hawawini & Viallet introduce a vital distinction often missed in generic accounting:
- **Working Capital Requirement (WCR / Operating Net Working Capital):** The net operating capital tied up in the business cycle: $\text{Operating Current Assets (Inventories + Receivables)} - \text{Operating Current Liabilities (Payables)}$.
- **Cash Conversion Cycle (CCC):** The time lag (in days) between the cash outflow paid to suppliers for raw materials and the cash inflow collected from customers for finished sales.

A shorter Cash Conversion Cycle accelerates internal cash generation, boosting Free Cash Flow and reducing the need for external bank credit lines. Elite supply-chain operators (e.g., Apple, Dell, Amazon) operate with **negative Cash Conversion Cycles**, effectively financing their entire working capital on zero-interest credit provided by their suppliers!

## Formula
\text{CCC} = \text{DIO} + \text{DSO} - \text{DPO} = \frac{\text{Inventory}}{\text{COGS}/365} + \frac{\text{Receivables}}{\text{Revenue}/365} - \frac{\text{Payables}}{\text{COGS}/365}

$$\text{WCR} = \text{Accounts Receivable} + \text{Inventories} + \text{Prepaid Expenses} - (\text{Accounts Payable} + \text{Accrued Expenses})$$

## Variable Glossary
- **\text{CCC}**: Cash Conversion Cycle (net operating cash cycle in days).
- **\text{DIO}**: Days Inventory Outstanding (average days inventory sits in stock before being sold).
- **\text{DSO}**: Days Sales Outstanding (average days required to collect cash from customers after a credit sale; also called Average Collection Period).
- **\text{DPO}**: Days Payables Outstanding (average days taken to pay vendors and suppliers for credit purchases).
- **\text{COGS}**: Cost of Goods Sold.
- **\text{WCR}**: Working Capital Requirement (Operating NWC).
- **\Delta\text{WCR}**: Annual change in working capital requirement, which directly drains or fuels Free Cash Flow ($\text{FCFF} = \text{NOPAT} + \text{D\&A} - \Delta\text{WCR} - \text{CapEx}$).

## Worked Example
An electronics manufacturer is benchmarking its supply chain performance against competitors:
- **Annual Revenue:** $\$365{,}000{,}000$ ($\$1{,}000{,}000$ per day)
- **Annual Cost of Goods Sold (COGS):** $\$219{,}000{,}000$ ($\$600{,}000$ per day)
- **Accounts Receivable:** $\$50{,}000{,}000$
- **Inventory (Raw + WIP + Finished):** $\$42{,}000{,}000$
- **Accounts Payable:** $\$30{,}000{,}000$

**Step 1: Compute Component Days**
$$\text{DSO} = \frac{\$50{,}000{,}000}{\$365{,}000{,}000 / 365} = \frac{\$50\text{M}}{\$1.0\text{M}} = 50.0 \text{ days}$$
$$\text{DIO} = \frac{\$42{,}000{,}000}{\$219{,}000{,}000 / 365} = \frac{\$42\text{M}}{\$0.6\text{M}} = 70.0 \text{ days}$$
$$\text{DPO} = \frac{\$30{,}000{,}000}{\$219{,}000{,}000 / 365} = \frac{\$30\text{M}}{\$0.6\text{M}} = 50.0 \text{ days}$$

**Step 2: Compute Operating Cycle & Cash Conversion Cycle**
$$\text{Operating Cycle} = \text{DIO} + \text{DSO} = 70.0 + 50.0 = 120.0 \text{ days}$$
$$\text{CCC} = \text{Operating Cycle} - \text{DPO} = 120.0 - 50.0 = 70.0 \text{ days}$$

The company ties up cash for 70 days between paying vendors and collecting from customers.

**Step 3: Executive Optimization Scenario**
If the COO institutes automated invoice reconciliation (cutting DSO by 10 days to 40 days) and adopts just-in-time manufacturing (cutting DIO by 15 days to 55 days):
$$\Delta\text{Cash Released} = (10 \text{ days} \times \$1.0\text{M/day}) + (15 \text{ days} \times \$0.6\text{M/day}) = \$10\text{M} + \$9\text{M} = \$19{,}000{,}000$$

A 25-day CCC compression delivers $\$19{,}000{,}000$ of instant, non-dilutive liquidity directly to the corporate balance sheet!

## When to Use
- **When to use:** Post-merger operational turnarounds, cash forecasting during rapid sales growth, bank credit facility sizing, and assessing supplier credit risk.
- **When not to use / Caveats:** Beware of destructive CCC "optimizations." Artificially stretching DPO to 120 days by ignoring supplier payment terms destroys supplier relationships, loses cash discounts (e.g., 2/10 net 30), and risks parts delivery boycotts. Similarly, slashing inventory too aggressively induces expensive factory stockouts and missed customer deliveries.

## Notes for Future-Me
"Growth eats cash." The single most dangerous phase for a rapidly scaling business is a sudden doubling of sales. Because accounts receivable and inventory must be funded weeks or months before customer cash arrives, a doubling of revenue causes Working Capital Requirements ($\Delta\text{WCR}$) to explode. Without adequate revolving credit or cash cushions, a wildly profitable company can suffer a catastrophic liquidity crisis ("overtrading"). Always model working capital cash drains at every stage of growth projections.
