# Prospect Theory & Loss Aversion

## Intuition
Neoclassical financial theory (such as Expected Utility Theory under von Neumann–Morgenstern) assumes that economic agents are hyper-rational decision-makers who evaluate choices based on total absolute terminal wealth ($W$) and display uniform risk aversion.

In their seminal behavioral economics framework, Daniel Kahneman and Amos Tversky (1979, 1992) demonstrated that real human decision-makers deviate systematically from expected utility theory through four core psychological phenomena:

1. **Reference Dependence:** People do not evaluate decisions based on absolute wealth, but on **gains and losses relative to an internal psychological reference point ($R$)** (such as original purchase price, current budget target, or industry peer benchmarks).
2. **Loss Aversion:** "Losses loom larger than gains." The emotional and psychological pain of losing $\$100{,}000$ is empirically measured to be **2.0 to 2.5 times** as intense as the joy of gaining $\$100{,}000$ ($\lambda \approx 2.25$).
3. **Diminishing Sensitivity (The S-Shaped Value Function):** The subjective marginal value of both gains and losses decreases as the magnitude grows. The psychological difference between $\$0$ and $\$100$ feels vast; the difference between $\$10,000$ and $\$10,100$ feels negligible. Crucially, this creates an asymmetrical risk attitude:
   - **Concave in Gains $\implies$ Risk-Averse:** When facing positive outcomes, executives lock in guaranteed profits rather than gamble for higher potential gains.
   - **Convex in Losses $\implies$ Risk-Seeking:** When facing losses, executives actively gamble with corporate capital, preferring a risky bet with a chance of breaking even over accepting a certain loss.
4. **Non-Linear Probability Weighting:** People systematically **overweight low-probability extreme tail events** (explaining the purchase of lottery tickets and overpriced disaster insurance) and **underweight moderate-to-high probabilities** (discounting likely execution risks).

## Formula
v(x) = \begin{cases} x^\alpha & \text{if } x \ge 0 \quad (\text{Domain of Gains}) \\ -\lambda (-x)^\beta & \text{if } x < 0 \quad (\text{Domain of Losses}) \end{cases}

$$\text{Cumulative Prospect Value: } V = \sum_{i=1}^n \pi(p_i) \cdot v(x_i)$$

$$\text{Tversky-Kahneman Probability Weighting: } w(p) = \frac{p^\gamma}{\left( p^\gamma + (1 - p)^\gamma \right)^{1/\gamma}}$$

## Variable Glossary
- **x**: Outcome payoff relative to the psychological reference point ($x = W - R$).
- **v(x)**: Subjective psychological value assigned to gain or loss $x$.
- **\lambda**: Loss aversion coefficient (empirically estimated at $\approx 2.25$).
- **\alpha, \beta**: Diminishing sensitivity curvature parameters (empirically estimated at $\approx 0.88$, creating concavity for gains and convexity for losses).
- **p**: Objective probability of an outcome occurring.
- **w(p) / \pi(p)**: Decision weight assigned to probability $p$.
- **\gamma**: Probability distortion parameter (empirically $\approx 0.61$ for gains, $\approx 0.69$ for losses).

## Worked Example
An executive vice president oversees a troubled strategic software division that has fallen behind schedule and faces an impending $\$1,000,000$ write-down:
- **Baseline Reference Point ($R$):** $0$ (break-even expectation).
- **Option A (Certain Loss):** Shut down the initiative immediately and take a guaranteed loss of **$-\$500,000$**.
- **Option B (The Hail Mary Gamble):** Authorize an emergency $\$500,000$ technical refactor with a $50\%$ chance of fixing the system ($0$ net loss) and a $50\%$ chance of catastrophic failure resulting in a total loss of **$-\$1,000,000$**.

**Step 1: Expected Monetary Value (Rational Baseline)**
$$\mathbb{E}[\text{Payoff}_A] = -\$500{,}000$$
$$\mathbb{E}[\text{Payoff}_B] = 0.50 \times \$0 + 0.50 \times (-\$1{,}000{,}000) = -\$500{,}000$$
A risk-neutral or risk-averse rational manager should prefer Option A (avoiding unnecessary variance).

**Step 2: Prospect Theory Evaluation (Using $\lambda = 2.25$, $\beta = 0.88$, $w(0.50) \approx 0.42$)**
- **Subjective Value of Option A (Sure Loss):**
  $$v(-\$500{,}000) = -2.25 \times (500{,}000)^{0.88} = -2.25 \times 105{,}115 = -236{,}509$$
- **Subjective Value of Option B (Gamble in Loss Domain):**
  $$v(-\$1{,}000{,}000) = -2.25 \times (1{,}000{,}000)^{0.88} = -2.25 \times 193{,}463 = -435{,}292$$
  $$V_B = w(0.50) \times v(-\$1{,}000{,}000) = 0.42 \times (-435{,}292) = -182{,}823$$

**Behavioral Result:**
Because $-182{,}823 > -236{,}509$, **the executive strongly chooses Option B!**
The convexity of the loss function makes the sure loss feel intolerable. To avoid confronting the certainty of a $\$500\text{k}$ failure, the executive gambles $\$1\text{M}$ of shareholder capital on a low-probability turnaround.

## When to Use
- **When to use:** Explaining capital market anomalies (the Equity Risk Premium Puzzle, post-earnings announcement drift, investor disposition effect), designing executive bonus compensation contracts (setting bonus thresholds where executives are in the gain domain), structuring M&A earnouts, and calibrating consumer product pricing models.
- **When not to use / Caveats:** Prospect Theory is a **descriptive model of human psychological irrationality**, not a normative prescription for corporate governance. A Chief Financial Officer or Board of Directors should never use Prospect Theory formulas to justify risk-seeking gambles in failing business units.

## Notes for Future-Me
"Beware of leaders who are operating in the loss domain."
When a division falls significantly behind its annual EBIT targets, human psychology dictates that management will instinctively abandon disciplined corporate risk limits and double down on reckless, high-variance gambles to "get back to even" before the annual audit.

**Corporate Defense Architecture:**
1. **Reset Reference Points Regularly:** In prolonged project turnarounds, officially adjust the budget baseline down to current reality so team incentives operate in the **gain domain** (where humans are prudently risk-averse), rather than trapping managers in the toxic loss domain.
2. **Enforce Objective Stop-Loss Gates:** Strip failing projects of discretionary budget authority. Tie continuation decisions to pre-committed external operational milestones rather than manager optimism.
3. **Neutralize Regret Aversion:** Cultivate a culture that rewards fast, decisive terminations of unviable initiatives: *"Killing a failing $\$10M$ project after spending $\$2M$ is a $\$8M$ victory, not a $\$2M$ defeat."*

