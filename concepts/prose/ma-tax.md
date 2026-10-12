# M&A Tax Structuring (Asset vs. Stock vs. §338(h)(10))

## Intuition
In every corporate acquisition, the buyer and seller sit on opposite sides of a fundamental tax tension regarding the **tax basis of the target company's assets** (Scholes & Wolfson Ch. 13):
- **The Buyer's Objective:** Wants a **Step-Up in Tax Basis** of the target's assets (including amortizable goodwill under IRC §197 over 15 years) so the buyer can claim massive future tax depreciation and amortization deductions that shield future operating cash flows.
- **The Seller's Objective:** Wants to pay **only a single layer of Long-Term Capital Gains tax** (or defer taxes entirely via a **Tax-Free Reorganization under IRC §368**) and avoid paying corporate-level tax on asset gains.

The Scholes-Wolfson paradigm requires evaluating the **joint tax burden of both parties simultaneously**: a structure that saves the buyer $\$50\text{M}$ in present-value tax shields while costing the seller $\$30\text{M}$ in incremental upfront tax creates $\$20\text{M}$ of net transaction wealth that can be shared via a purchase price adjustment!

## Structure
### The Four Primary M&A Tax Architectures

| Deal Structure | Buyer Tax Basis in Target Assets | Tax Impact on Seller(s) | Legal Liability & Contract Transfer | Optimal Use Case |
|---|---|---|---|---|
| **1. Taxable Stock Purchase** | **Carryover Basis** (No step-up; zero §197 goodwill tax amortization). | **Single layer of tax:** Target shareholders pay LTCG ($20\%$) on stock gain. | Simple: Buyer steps into ownership of legal entity; contracts stay intact. | Buying a standalone C-Corp where double taxation makes an asset sale prohibitive. |
| **2. Taxable Asset Purchase** | **Full Step-Up to Fair Market Value** (15-year §197 goodwill amortization!). | **Double Taxation for C-Corp:** Target C-Corp pays $21\%$ tax on asset gain, *then* shareholders pay $20\%$ tax on liquidating distribution! | Complex: Requires re-titling every deed, contract, license, and permit. | Buying a division/subsidiary or a pass-through LLC/S-Corp (only 1 tax layer). |
| **3. IRC §338(h)(10) / §336(e) Election** | **Full Step-Up to Fair Market Value** (treated as an Asset Purchase for tax!). | **Single layer of tax** (if target is an S-Corp or $80\%$-owned C-Corp subsidiary). | **Best of Both Worlds:** Legally a simple Stock Purchase, taxed as an Asset Purchase! | Acquiring an S-Corporation or a corporate subsidiary spin-out. |
| **4. Tax-Free Reorganization (IRC §368 A, B, C)** | **Carryover Basis** (No step-up). | **Tax Deferred:** Target shareholders receive Buyer Stock with zero immediate tax! | Continuity of Interest (COI) requires $\ge 40\%-80\%$ stock consideration. | Public-to-public stock mergers where sellers want tax deferral. |

$$\text{Present Value of §197 Goodwill Tax Shield (15-Year Straight Line)} = \sum_{t=1}^{15} \frac{(\text{Step-Up Amount} / 15) \cdot t_{\text{corp}}}{(1 + r)^t}$$

## Common Misconceptions
- **Misconception 1: "Goodwill created in an M&A acquisition is never tax-deductible."**  
  *Reality:* While goodwill is never amortized on *GAAP financial statements*, in a **Taxable Asset Purchase or §338(h)(10) election**, acquired goodwill and intangible assets are **100% tax-deductible straight-line over 15 years under IRC Section 197**! In a Taxable Stock Purchase (without a §338 election), acquired goodwill is *not* tax-deductible.
- **Misconception 2: "Buyers should always demand a §338(h)(10) election when buying a standalone C-Corporation."**  
  *Reality:* First, a §338(h)(10) election is only legally permitted when buying an **S-Corporation** or an **$80\%+$-owned subsidiary of a parent corporation**. For a standalone C-Corp, the equivalent is a regular **§338(g) election**, which triggers an immediate $21\%$ corporate tax bill on the entire asset gain today just to get 15 years of future $21\%$ deductions—which is almost always **value-destructive** in present-value terms unless the target has massive expiring Net Operating Losses (NOLs) to absorb the gain!

## Notes for Future-Me
When acquiring an S-Corporation or corporate subsidiary, **always model the §338(h)(10) Tax Gross-Up**:
1. Calculate the Present Value of the 15-year §197 tax amortization shield created for you (the Buyer) by the basis step-up.
2. Calculate the incremental tax cost to the Sellers (often tiny, caused only by ordinary income recapture on depreciated equipment vs capital gains).
3. Offer to **reimburse ("Gross Up") the Sellers in cash** for their incremental tax cost plus a $20\%$ sweetener! You secure tens of millions in net present value tax shields while leaving the sellers happier after tax.

