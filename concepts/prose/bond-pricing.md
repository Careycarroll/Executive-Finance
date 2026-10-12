# Bond Pricing Mechanics

## Intuition
A standard fixed-income bond is a contractual debt instrument that pays a stream of periodic interest payments (coupons) over a specified tenor, culminating in the repayment of the principal (face value / par value) at maturity.

Bond pricing is a direct application of the Time Value of Money: the price of a bond equals the **present value of its annuity coupon stream plus the present value of its single principal par lump-sum**, discounted at the market required rate of return (**Yield to Maturity / YTM**).

The fundamental rule of bond mechanics is the **inverse relationship between interest rates and bond prices**:
- **Coupon Rate = YTM:** The bond trades at **Par** ($\text{Price} = 100\%$ of face value).
- **Coupon Rate < YTM:** The bond trades at a **Discount** ($\text{Price} < 100\%$ of par).
- **Coupon Rate > YTM:** The bond trades at a **Premium** ($\text{Price} > 100\%$ of par).

When market interest rates rise, existing bonds with lower coupons become less attractive, forcing their market prices down until their effective yield equals current market rates.

## Formula
$$P = \sum_{t=1}^{2T} \frac{C / 2}{\left(1 + \frac{y}{2}\right)^t} + \frac{M}{\left(1 + \frac{y}{2}\right)^{2T}} = \frac{C}{y} \left[ 1 - \frac{1}{\left(1 + \frac{y}{2}\right)^{2T}} \right] + \frac{M}{\left(1 + \frac{y}{2}\right)^{2T}}$$

## Variable Glossary
- **$P$**: Current clean market price of the bond.
- **$C$**: Annual dollar coupon payment ($= \text{Coupon Rate} \times M$).
- **$M$**: Par / Face value of the bond (typically $\$1{,}000$ in US markets).
- **$y$**: Annualized Yield to Maturity (nominal annual discount rate compounded semi-annually).
- **$T$**: Number of years remaining until maturity.
- **$2T$**: Total number of semi-annual coupon periods remaining.

## Worked Example
An investor is pricing a 10-year senior corporate bond with the following specifications:
- **Par Value ($M$):** $\$1{,}000$
- **Coupon Rate:** $6.0\%$ per annum, paid semi-annually ($\$30.00$ every 6 months)
- **Maturity ($T$):** 10 years ($2T = 20$ semi-annual periods)
- **Market Yield to Maturity ($y$):** Suppose market yields on comparable bonds are currently $8.0\%$ ($y/2 = 4.0\%$ per period)

**Step 1: Present Value of Semi-Annual Coupons (Annuity)**
$$\text{PV}(\text{Coupons}) = \frac{\$30}{0.04} \left[ 1 - \frac{1}{(1.04)^{20}} \right] = \$750 \times [1 - 0.45639] = \$750 \times 0.54361 = \$407.71$$

**Step 2: Present Value of Face Value at Maturity**
$$\text{PV}(\text{Face Value}) = \frac{\$1{,}000}{(1.04)^{20}} = \frac{\$1{,}000}{2.19112} = \$456.39$$

**Step 3: Sum to Calculate Total Bond Price**
$$\text{Price} = \$407.71 + \$456.39 = \$864.10$$

The bond trades at a **discount** of $\$864.10$ ($86.41\%$ of par) because its $6\%$ coupon is below the prevailing $8\%$ market yield.

## When to Use
- **When to use:** Pricing debt securities, calculating debt value for Enterprise Value bridges, analyzing corporate refinancing decisions, and treasury liability management.
- **When not to use / Caveats:** Standard bond pricing assumes zero default risk and a flat term structure. For bonds with credit risk, coupons must be discounted using credit-adjusted spot curves. For bonds with embedded call options (callable debt), use binomial lattice trees rather than static DCF discounting.

## Notes for Future-Me
Beware of **Clean Price vs. Dirty Price (Invoice Price)** in corporate transactions! Quotation terminals (Bloomberg, Refinitiv) quote "Clean Prices" that strip out accrued interest. When you actually execute the wire transfer to buy the bond, you must pay the "Dirty Price":
$$\text{Dirty Price} = \text{Clean Price} + \text{Accrued Interest}$$
If a bond pays semi-annual coupons and you buy it 5 months after the last coupon date, you owe the seller 5 months of accrued interest. If you model cash outflows using clean prices alone, your treasury will encounter an unpleasant cash reconciliation deficit on settlement day.

