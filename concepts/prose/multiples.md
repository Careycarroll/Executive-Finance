# Relative Valuation & Comparable Multiples

## Intuition
Relative valuation determines the value of an enterprise by comparing it to the market pricing of similar ("comparable") peer companies or recent precedent transactions. It is the most ubiquitous valuation methodology in investment banking, equity research, and board pitch decks due to its apparent speed and market anchoring.

Multiples express the ratio of a market value measure to an operational performance metric:
1. **Enterprise Value Multiples (EV/EBITDA, EV/EBIT, EV/Sales):** Compare the value of the entire operating business ($\text{EV}$) to operating metrics generated before debt payments. These multiples are capital-structure neutral, making them ideal for comparing companies with differing debt levels.
2. **Equity Multiples (P/E, P/B, P/CF):** Compare the market price of common equity to earnings or book value after debt interest and taxes.

**The Aggregation Trap: Arithmetic vs. Harmonic Mean**
When calculating peer group average multiples, standard financial analysts almost universally use the simple arithmetic average. However, academic finance (Easton, Lundholm, Baker & Ruback) proves that **the arithmetic mean of price ratios suffers from severe upward Jensen's inequality bias**: outliers with tiny denominators (near-zero earnings or EBITDA) create massive ratio spikes that drag the arithmetic average artificially upward!

To eliminate this upward distortion, valuation rigor requires using the **harmonic mean** or **median**:
$$\text{Harmonic Mean} = \frac{n}{\sum_{i=1}^n \frac{1}{x_i}}$$

## Formula
\text{EV / EBITDA} = \frac{\text{Market Value of Equity} + \text{Total Debt} - \text{Cash}}{\text{EBITDA}}

$$\text{P / E} = \frac{\text{Price per Share}}{\text{Earnings per Share (EPS)}} = \frac{\text{Market Capitalization}}{\text{Net Income}}$$

$$\text{Harmonic Mean Multiple} = \frac{n}{\sum_{i=1}^n \left(\frac{1}{\text{Multiple}_i}\right)}$$

$$\text{Implied Enterprise Value} = \text{Target Operating Metric} \times \text{Peer Harmonic Multiple}$$

## Variable Glossary
- **\text{EV}**: Enterprise Value ($= \text{Market Equity} + \text{Debt} + \text{Preferred} + \text{Minority Interest} - \text{Cash}$).
- **\text{EBITDA}**: Earnings Before Interest, Taxes, Depreciation, and Amortization.
- **\text{P / E}**: Price-to-Earnings ratio.
- **\text{P / B}**: Price-to-Book ratio ($\text{Market Equity} / \text{Common Shareholders' Equity}$).
- **n**: Number of comparable companies in the peer benchmark set.
- **\text{Multiple}_i**: Valuation multiple observed for peer company $i$.

## Notes for Future-Me
Multiples are shorthand heuristics, not substitutes for fundamental analysis. Every multiple is an implicit DCF model in disguise:
$$\frac{\text{EV}}{\text{EBITDA}} \approx \frac{(1 - t) \times (1 - \text{Reinvestment Rate})}{\text{WACC} - g}$$

When an analyst says *"Our company deserves a 15x EV/EBITDA multiple because the peer group trades at 15x,"* they are implicitly asserting that your company has the identical growth rate ($g$), identical reinvestment requirements, identical tax profile ($t$), and identical operating risk ($\text{WACC}$) as the peer group!

If your target company has lower ROIC, higher customer churn, or slower projected growth than its peers, applying the peer average multiple will cause you to dramatically overpay. Always adjust multiples for differences in growth and return on capital using regression analysis or PEG ratios.
