# Stock-Based Compensation (ASC 718)

## Intuition
Stock-Based Compensation (SBC)—issued via Restricted Stock Units (RSUs), Employee Stock Options (ESOs), and Performance Share Units (PSUs)—is the primary mechanism technology and growth companies use to attract talent while conserving cash.

Under **ASC 718**, companies must measure the fair value of equity awards on the **Grant Date** (using the stock price for RSUs or Black-Scholes/lattice models for options) and recognize that cost as an operating expense on the income statement ratably over the employee's **service vesting period** (typically 4 years).

In modern financial analysis, SBC sits at the center of a fierce valuation debate:
- **Management's "Non-Cash" Argument:** Because granting RSUs requires zero immediate cash outflow from the corporate treasury, companies add back 100% of SBC when reporting **Adjusted EBITDA** and **Non-GAAP Earnings**, and GAAP adds SBC back inside **Operating Cash Flow**.
- **The Economic Reality (Penman / Damodaran / Buffett):** SBC is **not free**. It is a very real economic expense paid via **shareholder dilution** rather than cash. It is economically identical to issuing new shares to the public for cash and handing that cash to employees as salary.

## Structure
### Accounting vs. Economic Treatment of Stock-Based Compensation

| Financial Statement | GAAP Accounting Treatment | Economic Valuation Reality (DCF & True FCF) |
|---|---|---|
| **Income Statement** | Deducted inside COGS, R&D, and SG&A based on grant-date fair value. | **True Operating Expense:** Keep SBC deducted inside NOPAT! Do not add it back when valuing ongoing operations. |
| **Cash Flow Statement** | Added back as a non-cash item in **Operating Cash Flow (CFO)**. | **In-Kind Financing:** Adding SBC back to FCF overstates cash generation unless offset by cash share buybacks to neutralize dilution. |
| **Balance Sheet** | Increases Additional Paid-In Capital (APIC) as expense is recognized. | **Dilutes Per-Share Value:** Expands total diluted share count via the **Treasury Stock Method (TSM)**. |

### The Treasury Stock Method (TSM) for Diluted Shares
In-the-money options and unvested RSUs increase diluted share count assuming exercise proceeds are used to repurchase shares at the current market price:
$$\text{Net Dilutive Shares Added} = N_{\text{options}} - \frac{N_{\text{options}} \times \text{Strike Price}}{\text{Current Stock Price}}$$

## Common Misconceptions
- **Misconception 1: "Adding back SBC to Free Cash Flow is harmless because we also use diluted share count."**  
  *Reality:* Diluted share count only captures options and RSUs granted *in the past* that exist today! If you add SBC back to Free Cash Flow in a 10-year DCF model, including terminal value, you are assuming the company will receive **10 years of future employee labor for free** with zero future dilution!
- **Misconception 2: "SBC expense changes when the stock price moves after the grant date."**  
  *Reality:* Under ASC 718, equity-classified RSU and option expense is locked in at the **Grant-Date Fair Value**. If a company grants RSUs when its stock is at \$200, and the stock crashes to \$40, the company must still record GAAP expense based on the \$200 grant price (even though employees are receiving only \$40 of economic value).
- **Misconception 3: "Net Share Settlement (withholding shares for taxes) is non-dilutive."**  
  *Reality:* When a company withholds 40% of vesting RSUs to remit employee payroll taxes in cash to the IRS, that cash payment shows up in the **Financing section** of the cash flow statement, masking a massive cash outflow caused by employee compensation.

## Notes for Future-Me
"If Stock-Based Compensation isn't an expense, what is it? And if it doesn't go into the calculation of earnings, where does it go?" — *Warren Buffett*

**Two Non-Negotiable Rules for Valuing Tech Companies:**
1. **Treat SBC as a Cash Expense in DCF:** Never add back Stock-Based Compensation when calculating Free Cash Flow for a DCF valuation. Deduct 100% of SBC just like cash salaries.
2. **Track Net Burn & Dilution Rate:** Always compare annual SBC as a percentage of revenue against the company's **Net Share Count Growth** ($\Delta \text{Diluted Shares} / \text{Total Shares}$). If a mature company spends $20\%$ of revenue on SBC and spends 100% of its Free Cash Flow on share buybacks just to keep its share count flat, its true economic Free Cash Flow to shareholders is **zero**.
