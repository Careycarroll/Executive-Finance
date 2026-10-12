# Position Sizing & The Kelly Criterion

## Intuition
In quantitative trading and speculative capital allocation, having a positive mathematical edge ($\text{EV} > 0$) is necessary, but wholly insufficient to prevent catastrophic bankruptcy. If a trader or enterprise bets too aggressively on favorable bets, sequential streaks of bad variance will trigger the **Gambler's Ruin (irreversible capital drawdown)**. Conversely, betting too little leaves compounding wealth on the table.

John L. Kelly Jr. (Bell Labs, 1956) solved this by deriving the **Kelly Criterion**: the exact fraction of total bankroll or capital that maximizes the long-term expected geometric growth rate of wealth ($\mathbb{E}[\ln(W_{\infty})]$).

The core insight of the Kelly Criterion is that **geometric compounding penalizes volatility exponentially**:
- Betting less than the Kelly fraction ($f < f^*$) produces sub-optimal wealth growth, but lowers drawdown volatility.
- Betting exactly full Kelly ($f = f^*$) maximizes compounding growth, but incurs extreme, stomach-churning drawdowns (up to $50\%-80\%$ peak-to-trough drawdowns).
- Betting more than full Kelly ($f > f^*$) is catastrophic: you take more risk for *lower* expected compounding growth, eventually converging to guaranteed mathematical ruin ($W \to 0$).

Professional institutional traders and hedge funds universally employ **Fractional Kelly** (typically Half-Kelly or Quarter-Kelly, $f^* / 2$ or $f^* / 4$) to capture $75\%-90\%$ of optimal growth while slashing drawdown severity by half.

## Formula
f^* = \frac{p \cdot b - q}{b} = \frac{p \cdot (b + 1) - 1}{b} = \frac{\text{Edge}}{\text{Odds}} \quad \text{(Binary Bets)}

$$f^* = \frac{\mu - r}{\sigma^2} \quad \text{(Continuous Continuous-Time Asset Allocation)}$$

$$f_{\text{practical}} = c \cdot f^* \quad \text{where } c \in [0.25, 0.50] \text{ (Fractional Kelly)}$$

## Variable Glossary
- **f^***: Optimal percentage of total capital/bankroll to commit to the trade.
- **p**: Probability of winning the trade.
- **q**: Probability of losing the trade ($1 - p$).
- **b**: Net odds received on the wager ($\frac{\text{Dollar Profit on Win}}{\text{Dollar Loss on Loss}}$).
- **\text{Edge}**: Mathematical advantage ($p \cdot b - q$).
- **\mu - r**: Excess expected return over risk-free rate.
- **\sigma^2**: Variance of returns.
- **c**: Kelly fraction multiplier (e.g., $0.5$ for Half-Kelly).

## Worked Example
A quantitative trading strategy identifies an asymmetric earnings options trade with the following parameters:
- Probability of profit ($p$): $60\%$ ($0.60$)
- Probability of loss ($q$): $40\%$ ($0.40$)
- Payout odds ($b$): On a win, the trade makes $\$1.50$ profit for every $\$1.00$ risked ($b = 1.50$).
- Total portfolio capital available: $\$1{,}000{,}000$.

**Step 1: Calculate Full Kelly Fraction ($f^*$)**
$$f^* = \frac{(0.60 \times 1.50) - 0.40}{1.50} = \frac{0.90 - 0.40}{1.50} = \frac{0.50}{1.50} = 0.333 \ (33.3\%)$$

Full Kelly dictates wagering $33.3\%$ of the entire $\$1\text{M}$ capital base ($\$333{,}333$) on this single trade.

**Step 2: Apply Institutional Half-Kelly Reality Filter ($c = 0.50$)**
$$f_{\text{Half-Kelly}} = 0.50 \times 33.3\% = 16.7\% \implies \$167{,}000$$

**Step 3: Account for Parameter Uncertainty (Quarter-Kelly, $c = 0.25$)**
Because real-world win rates are estimated with statistical noise, hedge fund risk limits dictate Quarter-Kelly:
$$f_{\text{Quarter-Kelly}} = 0.25 \times 33.3\% = 8.33\% \implies \$83{,}333$$

Allocating $\$83{,}333$ captures $75\%$ of optimal long-term compounding growth while ensuring that a rare string of 5 consecutive losses causes only a manageable drawdown rather than total liquidation.

## When to Use
- **When to use:** Sizing algorithmic trading bets, allocating corporate venture capital across early-stage seed projects, setting position limits for credit default desks, and deciding capital commitments in binary M&A auctions.
- **When not to use / Caveats:** NEVER use Full Kelly when win probability $p$ is based on short-term backtests! Backtests suffer from overfitting and survivorship bias. Overestimating your edge by even $20\%$ when using Full Kelly pushes your allocation into the negative-compounding death zone ($f > 2 f^*$), guaranteeing account destruction.

## Notes for Future-Me
"Surviving variance is the prerequisite to compounding." The most brilliant mathematical edge in the world is useless if you get margin-called on step 14 before the law of large numbers kicks in. Always default to **Quarter-Kelly or Half-Kelly**. If your model tells you to put 30% of your fund into a trade, scale it back to 7.5%. You will sacrifice only a tiny fraction of peak theoretical upside while buying complete structural immunity against black swan wipeouts.

