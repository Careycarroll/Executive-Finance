/**
 * glossary.js -- Full textbook glossary
 * Source: Hawawini and Viallet, Finance for Executives, 6th Edition, pp. 741-762
 */

const TERMS = [
  { term: 'AAR', chapters: '8', def: 'See average accounting return.' },
  { term: 'Abnormal Return', chapters: '3', def: 'Realized return minus expected return. Same as alpha coefficient.' },
  { term: 'Accelerated Depreciation Method', chapters: '4', def: 'Depreciation method according to which annual depreciation expenses are higher in the early years of an asset life and lower in the later years. See straight-line depreciation method.' },
  { term: 'Accounting Exposure', chapters: '17', def: 'Effect of changes in exchange rates on balance sheet and income statement accounts. Same as translation exposure.' },
  { term: 'Accounting Life', chapters: '9', def: 'Number of years over which an asset is depreciated. See economic life.' },
  { term: 'Accounting Period', chapters: '4', def: 'Time period covered by a financial statement, usually one year but sometimes shorter.' },
  { term: 'Accounting Principles', chapters: '4', def: 'Rules governing the systematic collection, organization, and presentation of financial information. Same as accounting standards.' },
  { term: 'Accounting Standards', chapters: '4', def: 'See accounting principles.' },
  { term: 'Accounts Payable', chapters: '1, 4', def: 'Cash owed by a firm to its suppliers for purchases made on credit and not yet paid; reported in the balance sheet as a current liability. Same as payables, trade payables, and trade creditors.' },
  { term: 'Accounts Receivable', chapters: '1, 4', def: 'Cash owed to a firm by its customers for sales made on credit and not yet paid; reported in the balance sheet as a current asset. Same as receivables, trade receivables, and trade debtors.' },
  { term: 'Accrual Accounting', chapters: '4', def: 'Accounting system with reporting based on the realization principle and the matching principle.' },
  { term: 'Accrued Expenses', chapters: '4', def: 'Liabilities other than accounts payable that arise from the lag between the date at which these expenses have been incurred and the date at which they are paid.' },
  { term: 'Accrued Interest', chapters: '10', def: 'Amount of coupon payment that has been earned since the last coupon payment but not yet received by the bondholder.' },
  { term: 'Accumulated Depreciation', chapters: '1, 4', def: 'The sum of the periodic depreciation expenses deducted from the gross value of a fixed asset to obtain its net book value.' },
  { term: 'Acid Test Ratio', chapters: '5', def: 'See quick ratio.' },
  { term: 'Acquisition Cost Principle', chapters: '4', def: 'Asset valuation principle according to which the net book value of a fixed asset is equal to its purchase price less the accumulated depreciation since that asset was bought. Same as historical cost principle.' },
  { term: 'Actual Cash-Flow Principle', chapters: '9', def: 'A capital budgeting principle according to which the cash outflows and cash inflows associated with an investment decision must be estimated at the time they actually occur.' },
  { term: 'ADF', chapters: '2, 7', def: 'See annuity discount factor.' },
  { term: 'Adjusted Present Value (APV)', chapters: '14, 16', def: 'A valuation method according to which the value of a firm assets is equal to the sum of (1) their value assuming they are financed only with equity capital (unlevered asset value), and (2) the present value of the tax savings provided by the portion of the assets financed with debt.' },
  { term: 'After-Tax Cost of Debt', chapters: '1, 10, 12', def: 'Pre-tax cost of debt times (1 minus the marginal corporate tax rate).' },
  { term: 'Agency Costs', chapters: '11, 13', def: 'See agency costs of equity financing and agency costs of debt financing.' },
  { term: 'Agency Costs of Debt Financing', chapters: '13', def: 'Costs associated with debt financing (and borne by shareholders) arising when lenders impose restrictive covenants that limit the firm flexibility.' },
  { term: 'Agency Costs of Equity Financing', chapters: '11, 13', def: 'Costs associated with equity capital (and borne by shareholders) arising when a firm managers (acting as agents of shareholders) make decisions that benefit them at the expense of shareholders.' },
  { term: 'Agency Problem', chapters: '13', def: 'Problem arising from the separation of ownership and control of a firm.' },
  { term: 'Aggressive (Financing) Strategy', chapters: '5', def: 'A firm financing strategy that uses short-term funds to finance a portion of the firm long-term investments. See matching strategy and conservative strategy.' },
  { term: 'All-Current Method (of Translation)', chapters: '17', def: 'A method of translating the financial statements of a foreign business unit. Balance sheet accounts are translated at the exchange rate prevailing at the date of the balance sheet.' },
  { term: 'Allowance for Bad Debts', chapters: '18', def: 'Provision for the possible uncollectibility of accounts receivable.' },
  { term: 'Allowance for Doubtful Accounts', chapters: '4', def: 'Accounts arising when it is expected that some customers will not meet their payment obligations toward the firm.' },
  { term: 'Alpha Coefficient', chapters: '3', def: 'See abnormal return.' },
  { term: 'Alternative Investment', chapters: '7', def: 'An investment used as a benchmark for evaluating a project. The alternative investment must have the same risk, tax, liquidity, and other characteristics as the project.' },
  { term: 'American Option', chapters: '16', def: 'An option that can be exercised at any time before the option maturity date. See European option.' },
  { term: 'Amortization', chapters: '4', def: 'The process of converting the cost of an intangible asset, such as goodwill, into periodic expenses reported in the income statement. When the asset is tangible, the same process is called depreciation.' },
  { term: 'Annual Percentage Rate (APR)', chapters: '2', def: 'The simple one-year rate of interest without the effect of compounding over shorter periods within one year.' },
  { term: 'Annual Report', chapters: '4', def: 'Public report that is prepared by a firm annually and that contains the year financial statements.' },
  { term: 'Annuity', chapters: '2, 10, 11', def: 'A cash-flow stream that is composed of a sequence of equal and uninterrupted periodic cash flows.' },
  { term: 'Annuity Discount Factor (ADF)', chapters: '2, 7', def: 'A discount factor that gives the present value of an annuity.' },
  { term: 'Annuity-Equivalent Cash Flow', chapters: '7', def: 'See constant annual-equivalent cash flow.' },
  { term: 'Appreciation (Currency)', chapters: '17', def: 'Increase in the value of one currency expressed in terms of another currency.' },
  { term: 'APR', chapters: '2', def: 'See annual percentage rate.' },
  { term: 'APV', chapters: '14', def: 'See adjusted present value.' },
  { term: 'Arbitrage Transaction', chapters: '17', def: 'Transaction that attempts to take advantage of discrepancies between asset prices.' },
  { term: 'Arbitrageurs', chapters: '17', def: 'Parties involved in an arbitrage transaction.' },
  { term: 'As-Is (Value)', chapters: '1, 14', def: 'See stand-alone value.' },
  { term: 'Asian Option', chapters: '16', def: 'An option whose payoff at maturity is based on the average price of the underlying asset over a specific set of dates during the option life.' },
  { term: 'Ask Price', chapters: '17', def: 'The price at which a trader in the market is willing to sell. Same as offer price. See bid price.' },
  { term: 'Asset', chapters: '1, 4', def: 'An economic resource that is expected to generate a profit in the future. In financial accounting, assets refer to what shareholders collectively own on the date of the balance sheet.' },
  { term: 'Asset-Based Borrowing', chapters: '11', def: 'Loans extended with tangible assets pledged as collateral or guarantee.' },
  { term: 'Asset Beta', chapters: '12, 13, 14', def: 'The beta of a firm stock if the firm is all-equity financed. Same as unlevered beta.' },
  { term: 'Asymmetric Information', chapters: '11, 13', def: 'A situation that arises when managers (as insiders to the firm) know more about the firm current performance and future prospects than do outsiders.' },
  { term: 'At-the-Money Option', chapters: '16', def: 'Describes a situation when the exercise price of the option is equal to the market price of the underlying asset.' },
  { term: 'Average Accounting Return (AAR)', chapters: '8', def: 'Average earnings after tax expected from a project divided by the project average book value.' },
  { term: 'Average Accounting Return Rule', chapters: '8', def: 'According to the average accounting return rule, a project is acceptable if its average accounting return is higher than a target average return.' },
  { term: 'Average Collection Period', chapters: '5', def: 'Accounts receivable at the end of the period divided by the average daily sales during that period. A measure of operating efficiency.' },
  { term: 'Average Arithmetic Return', chapters: '3', def: 'The sum of a series of realized returns divided by the number of returns.' },
  { term: 'Average Cost Method', chapters: '4', def: 'Inventory valuation method that assigns to all units in inventory the average cost of the units purchased.' },
  { term: 'Average Payment Period', chapters: '5', def: 'Accounts payable at the end of the period divided by the average daily purchases during that period.' },
  { term: 'Avoidable Costs', chapters: '9', def: 'Costs that can be saved if an investment is not undertaken.' },
  { term: 'Balance Sheet', chapters: '1, 4', def: 'Financial statement reporting, at a given date, the total amount of assets held by a firm and the liabilities and owners equity that finance these assets.' },
  { term: 'Bank Prime Rate', chapters: '11', def: 'The rate banks charge their most creditworthy customers.' },
  { term: 'Bankruptcy', chapters: '13', def: 'A legal procedure through which the ownership of a firm assets is transferred to debt holders.' },
  { term: 'Basis Point', chapters: '2, 17', def: 'One-hundredth of 1 percent. For example, 0.12 percent is equal to 12 basis points.' },
  { term: 'Bearer Bonds/Securities', chapters: '11', def: 'Bonds/securities that do not indicate the holder name. See registered securities.' },
  { term: 'Benchmark Rate', chapters: '11', def: 'Rate to which the coupon rate of a floating rate bond is linked. Same as reference rate.' },
  { term: 'Best Efforts Basis', chapters: '11', def: 'A method of distributing securities whereby an investment bank undertakes to do its best to sell on behalf of the firm the securities the firm has issued.' },
  { term: 'Beta Coefficient', chapters: '3, 12, 13, 14', def: 'A measure of risk based on the sensitivity of an individual stock returns to changes in the returns of a broad stock market index. Same as systematic risk, market risk, and undiversifiable risk.' },
  { term: 'Bid-Ask Spread', chapters: '17', def: 'The difference between the bid price and the ask price.' },
  { term: 'Bidder', chapters: '14', def: 'A firm that wants to acquire all or a portion of another firm shares.' },
  { term: 'Bid Price', chapters: '17', def: 'Price at which a trader in a market is willing to buy. See ask price.' },
  { term: 'Binomial Option Pricing Model', chapters: '16', def: 'A technique to value an option over several intermediary periods when the underlying asset can take only two values at the end of each period.' },
  { term: 'Black-Scholes Formula', chapters: '16', def: 'A formula to estimate the value of an option derived from the Black-Scholes option pricing model. It relates the option value to the price of the underlying stock, the interest rate, the option exercise price, its volatility, and its time to expiration.' },
  { term: 'Black-Scholes Option Pricing Model', chapters: '16', def: 'An approach to valuing an option when the underlying asset is traded continuously.' },
  { term: 'Bond', chapters: '1, 10, 11', def: 'A debt security acknowledging a creditor relationship with the issuing firm and stipulating the conditions and terms under which the money is borrowed and repaid.' },
  { term: 'Bond Call Value', chapters: '11, 16', def: 'The price at which the issuer can buy a callable bond from its holder.' },
  { term: 'Bond Equivalent Yield', chapters: '10', def: 'The annualized yield on a bond whose coupon payments are semi-annual or quarterly. It is the yield reported in the press.' },
  { term: 'Bonding Costs', chapters: '13', def: 'Costs (borne by shareholders) resulting from lenders placing restrictions on managerial flexibility.' },
  { term: 'Bond Market', chapters: '10, 11', def: 'Market where bonds are issued and traded.' },
  { term: 'Bond Rating', chapters: '10', def: 'Rating assigned by an agency (such as Standard and Poor or Moody) that provides an assessment of the bond credit risk.' },
  { term: 'Bond Value', chapters: '10', def: 'Present value of a bond expected cash-flow stream discounted at a rate that reflects the risk of that cash-flow stream.' },
  { term: 'Bond Yield', chapters: '10', def: 'Same as yield to maturity and market yield.' },
  { term: 'Book Runner', chapters: '11', def: 'See originating house and lead manager.' },
  { term: 'Book Value Multiple', chapters: '10, 14', def: 'Share price divided by book-value-of-equity per share. Same as price-to-book ratio. Used to value a firm.' },
  { term: 'Book Value (of an Asset)', chapters: '4', def: 'Value at which the asset is shown in the balance sheet. Same as accounting value.' },
  { term: 'Book Value of Equity', chapters: '1, 4, 10', def: 'See owners equity.' },
  { term: 'Bottom Line', chapters: '1, 4', def: 'See earnings after tax.' },
  { term: 'Brokers', chapters: '11', def: 'Individuals or institutions that trade securities on behalf of a third party and do not own the securities.' },
  { term: 'Bullish Money Spread', chapters: '16', def: 'An arbitrage strategy to make a profit when the stock price goes up while limiting the loss if it goes down.' },
  { term: 'Business Assets', chapters: '6, 10, 14', def: 'Working capital requirement plus net fixed assets.' },
  { term: 'Business Cycle (of a Firm)', chapters: '1', def: 'Sequence of events starting with the acquisition of assets to generate sales, produce profits, pay dividends, retain earnings, build up equity capital, raise new debt, and grow the business.' },
  { term: 'Business Risk', chapters: '1, 6, 12, 13, 15', def: 'The cumulative effect of macro risk, strategic risk, and operational risk, stemming from the firm inability to know for certain the outcome of its current investing and operating activities.' },
  { term: 'Callable Bond', chapters: '11, 16', def: 'A bond that gives the issuer the option to redeem (repay) the bond before it reaches its maturity date.' },
  { term: 'Call Option', chapters: '11, 16, 17', def: 'A call option gives the holder the right to buy an underlying asset at a fixed price up to the call expiration date. See put option.' },
  { term: 'Call Provision', chapters: '11, 16', def: 'Option available to a bond issuer to repay the bond before it reaches its maturity date.' },
  { term: 'Call Value', chapters: '11', def: 'The price at which the issuer can buy a callable bond from its holder.' },
  { term: 'Capex', chapters: '1', def: 'See capital expenditure.' },
  { term: 'Capital Asset Pricing Model (CAPM)', chapters: '3, 12, 14', def: 'A formula according to which a security expected return is equal to the risk-free rate plus a risk premium. It can be used to estimate the cost of equity of a firm or a project.' },
  { term: 'Capital Budgeting Decision', chapters: '1, 7', def: 'See capital investment decision.' },
  { term: 'Capital Employed', chapters: '1, 4, 5, 6, 18', def: 'The sum of owners equity and all borrowed funds (short and long term). Equal to invested capital.' },
  { term: 'Capital Expenditure (Capex)', chapters: '1', def: 'New investment in fixed assets.' },
  { term: 'Capital Gain', chapters: '3', def: 'Positive change in the price of an asset.' },
  { term: 'Capital Investment Decision', chapters: '7', def: 'The decision to spend cash now to acquire long-lived assets that will be a source of cash flows in the future.' },
  { term: 'Capital Market Line (CML)', chapters: '3', def: 'The straight line that gives the relationship between the expected returns and the risk (measured by volatility) of efficient portfolios when there is a (unique) market portfolio.' },
  { term: 'Capital Rationing', chapters: '7', def: 'Limit on the amount of capital that can be used to finance investment projects.' },
  { term: 'Capital Structure', chapters: '1, 6, 13', def: 'The amount of debt relative to equity capital a firm should adopt to finance its assets. Same as financial structure.' },
  { term: 'Capital Turnover', chapters: '6, 18', def: 'Sales divided by invested capital. A measure of the efficiency with which invested capital is managed.' },
  { term: 'CAPM', chapters: '3, 12, 14', def: 'See capital asset pricing model.' },
  { term: 'Cash (and Cash Equivalents)', chapters: '1, 4, 5', def: 'Cash in hand, cash on deposit with banks, and short-term liquid investments with less than a year maturity (marketable securities).' },
  { term: 'Cash Conversion Period or Cycle', chapters: '4', def: 'See cash-to-cash period.' },
  { term: 'Cash Dividend', chapters: '1, 4, 10, 11, 12', def: 'The portion of a firm net profit distributed to shareholders in cash.' },
  { term: 'Cash Flow from (Business) Assets (CFA)', chapters: '4, 13', def: 'Net cash flow generated by a firm business assets. Same as free cash flow.' },
  { term: 'Cash Flow from Financing Activities', chapters: '4', def: 'Cash inflow or cash outflow related to the firm financing activity such as cash received from issuing debt or cash paid to reimburse a debt.' },
  { term: 'Cash Flow from Investing Activities', chapters: '4', def: 'Cash inflow or cash outflow related to the firm investing activity such as cash received from selling a fixed asset or cash paid for acquiring fixed assets.' },
  { term: 'Cash Flow from Operating Activities', chapters: '4', def: 'Cash inflow or cash outflow related to the firm operating activities such as cash received from a customer or cash paid to a supplier.' },
  { term: 'Cash-Flow Statement', chapters: '4', def: 'Financial statement reporting how a firm cash position has changed during a particular period of time.' },
  { term: 'Cash-Flow Timeline', chapters: '2', def: 'A line that shows the year, the size and the sign of each cash flow of a cash-flow stream.' },
  { term: 'Cash Flow to Equity Holders (CFE)', chapters: '10, 14', def: 'The portion of free cash flow that belongs to shareholders.' },
  { term: 'Cash Inflow', chapters: '4', def: 'Amount of cash or money that comes into a firm during a given period of time.' },
  { term: 'Cash Outflow', chapters: '4', def: 'Amount of cash or money that goes out of a firm during a given period of time.' },
  { term: 'Cash Price', chapters: '16', def: 'Current price of a product or an asset. Same as spot price.' },
  { term: 'Cash-to-Cash Period or Cycle', chapters: '4', def: 'Period between the dates a firm pays its suppliers and the date it collects its invoices from customers. Same as cash conversion period or cycle.' },
  { term: 'Central Clearing House', chapters: '16', def: 'A financial institution that manages the transactions between buyers and sellers of futures, options, and other securities to reduce the consequences of one party failing to meet its obligations.' },
  { term: 'Century Bonds', chapters: '10', def: 'Bonds with a 100-year maturity.' },
  { term: 'Certificates of Deposit (CD)', chapters: '4, 11', def: 'Short-term securities sold by banks in the money markets to raise cash.' },
  { term: 'Characteristic Line', chapters: '12', def: 'A line whose slope measures the sensitivity of a stock returns to changes in the returns of a market index. See beta coefficient.' },
  { term: 'Clean Price (of a Bond)', chapters: '10', def: 'The price without the accrued interest. Same as flat price and quoted price.' },
  { term: 'Cleanup Clause', chapters: '11', def: 'Loan clause that requires the firm to be completely out of debt to the bank for at least one month during the year.' },
  { term: 'Clientele Effect/Hypothesis', chapters: '11', def: 'A hypothesis according to which firms design their dividend payout policies to attract groups of investors who have specific distribution preferences.' },
  { term: 'CML', chapters: '3', def: 'See capital market line.' },
  { term: 'COGS', chapters: '4', def: 'See cost of goods sold.' },
  { term: 'Coinsurance Effect', chapters: '14', def: 'Describes a situation in which merged firms are perceived by their creditors to be less likely to fail as a combination than as separate entities.' },
  { term: 'Collar', chapters: '16', def: 'The combination of a covered call (with an exercise price higher than the stock price) and a protective put (with an exercise price lower than stock price).' },
  { term: 'Collateral', chapters: '11, 14', def: 'Any assets pledged as guarantee to a lender in case the borrower defaults.' },
  { term: 'Collateralized Loan', chapters: '16', def: 'A loan that requires the borrowing firm to assign assets to the lender as collateral to the loan.' },
  { term: 'Commercial Bank(s)', chapters: '1, 11', def: 'Financial intermediaries that take deposits, make payments, and extend loans.' },
  { term: 'Commercial Paper (CP)', chapters: '1, 4, 11', def: 'Unsecured security issued by firms to raise short-term funds in the money market.' },
  { term: 'Common Stock', chapters: '4, 10, 11', def: 'Certificate issued by a firm to raise equity capital that represents a specified share of total equity funds.' },
  { term: 'Comparables', chapters: '10, 14', def: 'See valuation by comparables.' },
  { term: 'Compensating Balances', chapters: '5', def: 'Deposits that banks may require their corporate clients to maintain with them in exchange for services they provide to the firm.' },
  { term: 'Compound Factor', chapters: '2, 7', def: 'Future value of one dollar growing at a particular compound (or growth) rate for a given number of years.' },
  { term: 'Compound Option', chapters: '16', def: 'An option on an option.' },
  { term: 'Compound Rate', chapters: '2', def: 'The rate of interest used to calculate the future value.' },
  { term: 'Compounded Value', chapters: '2, 7', def: 'Future value of an amount of money growing at a particular compound (or growth) rate for a given number of years.' },
  { term: 'Compounding', chapters: '2, 7', def: 'The process of finding the future value given the present value. The reverse of discounting.' },
  { term: 'Conglomerate Merger', chapters: '1, 14', def: 'Combination of unrelated businesses for which there are no obvious synergies.' },
  { term: 'Conservatism Principle', chapters: '4', def: 'States that assets and liabilities should be reported in financial statements at a value that would be least likely to overstate assets or to understate liabilities.' },
  { term: 'Conservative (Financing) Strategy', chapters: '5', def: 'The use of long-term funds to finance both long-term investments and a portion of short-term investments. See aggressive strategy and matching strategy.' },
  { term: 'Constant Annual-Equivalent Cash Flow', chapters: '7', def: 'An equivalent stream of equal annual cash flows with the same present value as another stream with variable annual cash flows.' },
  { term: 'Constant Dividend-Growth Model', chapters: '10', def: 'Formula that gives the value of a firm equity as the present value of its expected future dividend stream discounted at a rate that reflects the risk of that dividend stream, when the dividends are assumed to grow forever at a constant rate.' },
  { term: 'Contango', chapters: '16', def: 'Describes a situation when the forward price is higher than the expected spot price.' },
  { term: 'Contingent Value Rights (CVR)', chapters: '11, 16', def: 'Put options sold by a firm that give the holder the right to sell a fixed number of shares to the issuing firm at a fixed price during the life of the right.' },
  { term: 'Contractual Exposure', chapters: '17', def: 'Effect of changes in exchange rates on the firm cash flows generated by past (contractual) transactions denominated in foreign currency and still outstanding. Same as transaction exposure.' },
  { term: 'Control (Retention of)', chapters: '13', def: 'Refers to the policies adopted by current owners or management to prevent any outsiders from sharing or influencing the firm operation and strategy.' },
  { term: 'Conversion Option', chapters: '11', def: 'The right, but not the obligation, to convert a firm bond or a preferred share into the firm common stocks.' },
  { term: 'Conversion Premium', chapters: '11', def: 'Difference between the conversion price of a convertible bond and the current price of the stock, if the former is higher, divided by the current stock price.' },
  { term: 'Conversion Price', chapters: '11', def: 'Price at which the holder of a convertible bond has the right to buy one share of the firm common stock.' },
  { term: 'Conversion Ratio', chapters: '11', def: 'The number of shares into which each convertible bond can be converted.' },
  { term: 'Conversion Value', chapters: '11', def: 'The current price of the stock multiplied by the number of shares to which the convertible bond can be converted.' },
  { term: 'Convertible Bond', chapters: '11, 16', def: 'A bond that the holder can convert into the firm common stock.' },
  { term: 'Core Working Capital Requirement', chapters: '5', def: 'Accounts receivables plus inventories less accounts payable.' },
  { term: 'Corporate Bond', chapters: '11', def: 'Debt securities issued by firms that usually have a maturity exceeding ten years and trade in the bond market.' },
  { term: 'Corporate Note', chapters: '11', def: 'Debt securities issued by firms that usually have a maturity between one and ten years.' },
  { term: 'Corporate Risk', chapters: '15', def: 'A risk not captured by a project, but that affects the firm.' },
  { term: 'Correlation Coefficient', chapters: '3', def: 'A statistical measure of the direction and the strength of the co-movements between the returns of two securities. See covariance.' },
  { term: 'Cost of Capital', chapters: '1, 10', def: 'The return expected by investors for the capital they supply to firms. Also, the highest return on an alternative investment with the same risk as the investment under consideration.' },
  { term: 'Cost-of-Carry Model', chapters: '16', def: 'Model used to express the relationship between spot and forward prices.' },
  { term: 'Cost of Debt', chapters: '1, 12', def: 'The cost of borrowing new funds.' },
  { term: 'Cost of Equity (Capital)', chapters: '1, 10, 12', def: 'Rate of return required by the firm owners on their equity capital used to finance the firm assets or a particular project.' },
  { term: 'Cost of Goods Sold (COGS)', chapters: '4', def: 'The cost of the goods the firm has sold during the accounting period; reported in the income statement as expenses.' },
  { term: 'Cost Synergy', chapters: '14', def: 'Cost reductions resulting from combining the operations of two or more firms.' },
  { term: 'Counterparty Risk', chapters: '16', def: 'The risk that the seller of an asset does not deliver the asset or the buyer does not pay for the asset on the settlement date.' },
  { term: 'Country Risk', chapters: '1, 15, 17', def: 'The risk that the cash flows from a project may be affected by changes in local regulations governing foreign investments. A form of political risk.' },
  { term: 'Coupon Effect', chapters: '10', def: 'If two bonds have the same maturity, the one with the lower coupon rate has a higher interest-rate risk.' },
  { term: 'Coupon Payment', chapters: '10, 11', def: 'The periodic (contractual) interest payment paid to bondholders over the life of a bond.' },
  { term: 'Coupon Rate', chapters: '10, 11', def: 'Coupon payment divided by the face value of a bond.' },
  { term: 'Covariance', chapters: '3', def: 'A statistical measure of the direction and the strength of the co-movements between the returns of two securities.' },
  { term: 'Covenants (Restrictive)', chapters: '11, 13', def: 'Conditions imposed by lenders and stipulated in a bond indenture that require managers to achieve certain financial targets or refrain from certain actions that may be detrimental to lenders interests.' },
  { term: 'Covered Calls', chapters: '16', def: 'Selling calls and holding the underlying stock to hedge an unexpected sharp drop in the price of the stock.' },
  { term: 'Credit Default Risk', chapters: '16', def: 'Same as counterparty risk.' },
  { term: 'Credit Line (Line of Credit)', chapters: '4, 5, 11', def: 'A nonbinding arrangement in which a bank lends a firm a stated maximum amount of money over a fixed but renewable period of time, usually one year.' },
  { term: 'Credit Market', chapters: '11', def: 'Market in which debt securities are issued and traded.' },
  { term: 'Creditors', chapters: '1', def: 'Parties to whom a firm owes money, including lenders and suppliers.' },
  { term: 'Credit Rating', chapters: '10, 13', def: 'Rating that provides an overall assessment of a borrower credit risk.' },
  { term: 'Credit Rating Agency', chapters: '10, 13', def: 'An agency, such as Standard and Poor or Moody Investment Service, that provides credit ratings.' },
  { term: 'Credit Risk', chapters: '10, 15', def: 'The risk that a borrower will be unable to service its debt.' },
  { term: 'Credit Risk Premium', chapters: '10', def: 'See yield spread.' },
  { term: 'Credit Spread', chapters: '10', def: 'See yield spread and credit risk premium.' },
  { term: 'Cross Rates', chapters: '17', def: 'Foreign exchange rates between two currencies computed from their exchange rate with a third currency.' },
  { term: 'Cum-Dividend', chapters: '11', def: 'With the right to receive the dividend.' },
  { term: 'Currency Forward Contract', chapters: '17', def: 'An agreement between two parties for the delivery of currencies on a specific date in the future at an exchange rate fixed today.' },
  { term: 'Currency Futures (Contracts)', chapters: '17', def: 'Standardized forward currency contracts traded in futures markets.' },
  { term: 'Currency Forward Hedge', chapters: '17', def: 'Hedging with currency forward contracts.' },
  { term: 'Currency Option Hedge', chapters: '17', def: 'Hedging with currency options.' },
  { term: 'Currency Rate', chapters: '17', def: 'See foreign-exchange rate.' },
  { term: 'Currency Risk', chapters: '1, 11, 15, 17', def: 'Risk arising from unexpected changes in the exchange rate between two currencies. See foreign-exchange risk.' },
  { term: 'Currency Swap Contract', chapters: '17', def: 'Agreement with a bank to exchange a set of future cash flows denominated in one currency for another set denominated in another currency.' },
  { term: 'Current Assets', chapters: '4', def: 'Assets that are expected to be turned into cash within one year. Same as short-term assets.' },
  { term: 'Current Liabilities', chapters: '4', def: 'Obligations of a firm that must be paid within one year. Same as short-term liabilities.' },
  { term: 'Current Maturity (Tenor)', chapters: '10', def: 'At any point in time, the time remaining until a bond is redeemed (repaid).' },
  { term: 'Current Ratio', chapters: '5', def: 'Current assets divided by current liabilities. A measure of liquidity.' },
  { term: 'Current Yield', chapters: '10', def: 'A bond coupon payment divided by its price.' },
  { term: 'Cutoff Period', chapters: '8', def: 'In capital budgeting, the period (usually in years) below which a project payback period must fall in order to accept the project.' },
  { term: 'CVR', chapters: '11', def: 'See contingent value rights.' },
  { term: 'Days of Sales Outstanding (DSO)', chapters: '5', def: 'See average collection period.' },
  { term: 'DCF', chapters: '10, 14', def: 'See discounted cash flow.' },
  { term: 'DDM', chapters: '10, 12', def: 'See dividend-discount model.' },
  { term: 'Dealers', chapters: '11', def: 'Individuals or institutions that trade securities that they own. See brokers.' },
  { term: 'Debentures', chapters: '11', def: 'Bonds supported by the general credit standing of the issuing firm (US definition).' },
  { term: 'Debt Capacity', chapters: '13', def: 'The ability to quickly raise debt in the future if a need for funds arises unexpectedly.' },
  { term: 'Debt Capital', chapters: '1', def: 'Capital provided by borrowed funds.' },
  { term: 'Debt Holders', chapters: '1, 11', def: 'Holders of loans, leasing agreements, corporate bonds, and similar liabilities issued by firms to raise debt capital.' },
  { term: 'Debt Overhang', chapters: '16', def: 'Describes a situation when equity holders do not invest in a positive NPV project if most of the value created goes to the bondholders.' },
  { term: 'Debt Ratio', chapters: '6', def: 'A measure of financial leverage. Usually identified as the debt-to-invested capital ratio or the debt-to-equity ratio.' },
  { term: 'Debt-to-Equity Ratio', chapters: '1, 6, 13', def: 'Total interest-bearing debt divided by owners equity. A measure of financial leverage.' },
  { term: 'Debt-to-Invested Capital Ratio', chapters: '6', def: 'Debt divided by the sum of debt and equity.' },
  { term: 'Default Risk', chapters: '10', def: 'See credit risk.' },
  { term: 'Deferred Call Provision', chapters: '11', def: 'Provision that allows the issuer of a callable bond to repay (or call) the bond only after a specified date (first date of call).' },
  { term: 'Deferred Tax (Liability)', chapters: '4', def: 'Taxes owed to the tax authority originating from the difference between the amount of tax due on the reported pre-tax profit and the amount of tax claimed by the tax authorities.' },
  { term: 'Degree of Risk Aversion', chapters: '3', def: 'Risk-averse investors have different appetite for risk; some are more risk-averse than others.' },
  { term: 'Delta (of an Option)', chapters: '16', def: 'The approximate change in the price of an option in response to a one-dollar change in the price of the underlying stock.' },
  { term: 'Depreciation (Accounting)', chapters: '4', def: 'The process of periodic and systematic value-reduction of the gross value of fixed assets over their accounting life.' },
  { term: 'Depreciation (Currency)', chapters: '17', def: 'Reduction in the value of one currency expressed in terms of another currency.' },
  { term: 'Depreciation Expense(s)', chapters: '1, 4', def: 'The portion of the cost of a fixed asset that is expensed during the accounting period and reported in the income statement. Same as depreciation charge.' },
  { term: 'Derivatives (Instruments)', chapters: '16', def: 'Financial instruments such as forwards, futures, and options that derive their value from an underlying security such as a share.' },
  { term: 'DF', chapters: '2, 7', def: 'See discount factor.' },
  { term: 'Differential Cash Flows', chapters: '9', def: 'See incremental cash flows.' },
  { term: 'Dilution', chapters: '11, 13', def: 'Reduction in the fraction of a firm equity held by its existing shareholders after the firm sells common stock to new investors or grants shares to its employees.' },
  { term: 'Direct Costs of Financial Distress', chapters: '13', def: 'The actual costs the firm will incur if it becomes legally bankrupt, such as payments to lawyers and other third parties.' },
  { term: 'Direct Financing', chapters: '11', def: 'When firms raise funds by issuing securities that are held by ultimate savers (household sector) instead of financial intermediaries.' },
  { term: 'Direct Lease', chapters: '11', def: 'A financial lease involving a straight contract between the owner of an asset (the lessor) and the user of that asset (the lessee).' },
  { term: 'Dirty Price (of a Bond)', chapters: '10', def: 'See invoice price.' },
  { term: 'Discount (from Face or Par Value)', chapters: '10, 11', def: 'The difference between the price of a bond and its face value, if the former is lower.' },
  { term: 'Discount Bond', chapters: '10', def: 'Same as zero-coupon bond. See pure discount bond.' },
  { term: 'Discount Factor (DF)', chapters: '2, 7', def: 'Present value, at a particular discount rate, of one dollar to be received after a specified number of years.' },
  { term: 'Discount Rate', chapters: '1, 2, 7', def: 'Rate at which future cash flows are discounted to the present. See discounting.' },
  { term: 'Discounted Cash Flow (DCF) Model', chapters: '10', def: 'Asset valuation model based on the concept of the time value of money and risk.' },
  { term: 'Discounted Payback Period', chapters: '8', def: 'Capital budgeting method that measures a project payback period with cash flows that have been discounted to the present at the project cost of capital.' },
  { term: 'Discounted Payback Period Rule', chapters: '8', def: 'Accept (reject) the project if its discounted payback period is shorter (longer) than a given cutoff period.' },
  { term: 'Discounted Value', chapters: '2, 7', def: 'Same as present value.' },
  { term: 'Discounting', chapters: '1, 2, 7', def: 'The process used to convert future cash flows into their equivalent value today.' },
  { term: 'Diversifiable Risk', chapters: '3, 12', def: 'Risk that can be eliminated through portfolio diversification. Same as unsystematic risk and firm-specific risk.' },
  { term: 'Diversification Investments', chapters: '7', def: 'Investments in areas unrelated to the existing activities of the firm.' },
  { term: 'Dividend', chapters: '3, 4, 11', def: 'The portion of a firm net profit paid out to its owners in cash.' },
  { term: 'Dividend Declaration Date', chapters: '11', def: 'The date the company board of directors announces the dividend.' },
  { term: 'Dividend-Discount Model (DDM)', chapters: '10, 12', def: 'A formula that values a firm equity as the present value of the entire stream of cash dividends the firm is expected to generate in the future.' },
  { term: 'Dividend Payment', chapters: '11', def: 'The distribution of a firm cash to its shareholders either through a regular quarterly or annual payments and/or through a special, one-time distribution.' },
  { term: 'Dividend Payment Date', chapters: '11', def: 'The date when the declared dividend is actually paid.' },
  { term: 'Dividend Payout Ratio', chapters: '1, 6, 11', def: 'Dividends divided by net profit. See dividend policy.' },
  { term: 'Dividend Per Share (DPS)', chapters: '3', def: 'The amount of dividend paid per share of stock.' },
  { term: 'Dividend Policy', chapters: '11, 13', def: 'The decision regarding the portion of a year profit that should be paid out in the form of cash dividends to the firm shareholders.' },
  { term: 'Dividend Puzzle', chapters: '11', def: 'Refers to why firms pay dividends instead of using cash to buy back their shares given that dividend payments are usually taxed at a higher rate than capital gains.' },
  { term: 'Dividend Signaling Hypothesis', chapters: '11', def: 'Hypothesis according to which dividend announcements affect share prices because they signal good or bad prospects for the firm.' },
  { term: 'Dividend Yield', chapters: '3', def: 'Dividend per share divided by share price.' },
  { term: 'DPS', chapters: '3', def: 'See dividend per share.' },
  { term: 'DSO', chapters: '5', def: 'See days of sales outstanding.' },
  { term: 'Duration (of a Bond)', chapters: '10', def: 'A measure (in years) of a bond interest-rate risk.' },
  { term: 'Earnings After Tax (EAT)', chapters: '1, 4', def: 'Revenues minus all expenses, including interest and tax expenses. Same as net income, net profit, and bottom line.' },
  { term: 'Earnings Before Interest and Tax (EBIT)', chapters: '1, 4', def: 'Difference between the firm operating profit and any extraordinary items reported in its income statement.' },
  { term: 'Earnings Before Interest, Tax, Depreciation, and Amortization (EBITDA)', chapters: '4, 14', def: 'Revenues minus all operating expenses excluding depreciation and amortization.' },
  { term: 'Earnings Before Tax (EBT)', chapters: '1, 4', def: 'Earnings before interest and tax minus net interest expenses.' },
  { term: 'Earnings Multiple', chapters: '6, 10, 14', def: 'Share price divided by the firm earnings per share. Same as price-to-earnings ratio (PER). Used to value a firm.' },
  { term: 'Earnings Per Share (EPS)', chapters: '6, 10, 14', def: 'Earnings after tax divided by the total number of shares outstanding.' },
  { term: 'EAT', chapters: '1, 4', def: 'See earnings after tax.' },
  { term: 'EBIT', chapters: '1, 4', def: 'See earnings before interest and tax.' },
  { term: 'EBITDA', chapters: '4, 10, 14', def: 'See earnings before interest, tax, depreciation, and amortization.' },
  { term: 'EBITDA Multiple', chapters: '10, 14', def: 'Enterprise value divided by EBITDA; used to estimate a firm enterprise value.' },
  { term: 'EBT', chapters: '1, 4', def: 'See earnings before tax.' },
  { term: 'Economic Exposure', chapters: '17', def: 'Effect of changes in exchange rates on the value of the firm future cash flows generated either by past and known transactions (contractual or transaction exposure) or by future and uncertain transactions (operating exposure).' },
  { term: 'Economic Life', chapters: '9', def: 'Number of years over which a project adds value to a firm, as opposed to the number of years over which it is depreciated (accounting life). Same as useful life.' },
  { term: 'Economic Payback Period', chapters: '8', def: 'See discounted payback period.' },
  { term: 'Economic Profit', chapters: '18', def: 'See economic value added.' },
  { term: 'Economic Risk', chapters: '15', def: 'Risk arising from unexpected sales fluctuations because of the uncertain economic environment in which firms operate.' },
  { term: 'Economic Value Added (EVA)', chapters: '18', def: 'Net operating profit after tax (NOPAT) minus a charge for the capital consumed to achieve that profit. Same as economic profit.' },
  { term: 'Economies of Scale', chapters: '14', def: 'The ability of a firm to reduce its average costs of production and distribution because of size. A motivation to acquire other companies.' },
  { term: 'Effective Annual Interest Return', chapters: '2', def: 'The annual rate of interest when compounding occurs over shorter periods within one year.' },
  { term: 'Effective (Corporate) Tax Rate', chapters: '6', def: 'The tax rate at which a firm actually pays its taxes, which may differ from the statutory corporate tax rate.' },
  { term: 'Efficient Investment Line (EIL)', chapters: '3', def: 'The straight line that gives the relationship between the expected returns of efficient portfolios in the presence of a riskless asset and their risk (measured by volatility) in the absence of a (unique) market portfolio.' },
  { term: 'Efficient Investment Set', chapters: '3', def: 'The set that contains all available efficient portfolios.' },
  { term: 'Efficient (Securities) Markets', chapters: '1, 11', def: 'Markets in which security (share) prices adjust to new and relevant information as soon as it becomes available to market participants.' },
  { term: 'Efficient Portfolio', chapters: '3', def: 'Portfolios that offer the highest expected returns for any given level of risk and the lowest risk for any given level of expected return.' },
  { term: 'EIL', chapters: '3', def: 'See efficient investment line.' },
  { term: 'Enterprise Value (EV)', chapters: '10, 14', def: 'A firm market value of equity plus its market value of debt less its holding of cash and other financial assets. It is the value of the firm business assets.' },
  { term: 'Enterprise Value-to-EBITDA Ratio (EV/EBITDA)', chapters: '10, 14', def: 'Same as EBITDA multiple.' },
  { term: 'Entry Barriers', chapters: '1', def: 'Barriers that are costly enough to discourage potential competitors from entering a particular market.' },
  { term: 'EPS', chapters: '6, 10, 14', def: 'See earnings per share.' },
  { term: 'Equipment Financing Loan', chapters: '11', def: 'A medium- to long-term loan backed by a piece of machinery.' },
  { term: 'Equity Beta', chapters: '12, 13', def: 'The beta of a firm common stock. Same as levered beta and market beta.' },
  { term: 'Equity Capital', chapters: '1, 4', def: 'Funds contributed by shareholders that are equal to the difference, at a particular date, between what a firm shareholders collectively own, called assets, and what they owe, called liabilities.' },
  { term: 'Equity Kicker', chapters: '11', def: 'The conversion option of a convertible bond.' },
  { term: 'Equity Multiplier', chapters: '6', def: 'Invested capital divided by owners equity. A measure of financial leverage.' },
  { term: 'Eurobonds', chapters: '11', def: 'Bonds issued in the Euromarket.' },
  { term: 'Euro-Commercial Paper (Euro-CP)', chapters: '11', def: 'Commercial paper issued in the Euromarket.' },
  { term: 'Eurodollar Bonds', chapters: '11', def: 'Bonds denominated in US dollars that are sold simultaneously to investors in several countries via the Euromarket.' },
  { term: 'Euro-Equity', chapters: '11', def: 'Equity issued in the Euromarket.' },
  { term: 'Euromarket', chapters: '11', def: 'A market that is outside the direct control and jurisdiction of the issuer country of origin.' },
  { term: 'European Option', chapters: '16', def: 'An option that can be only exercised on the maturity date of the option. See American option.' },
  { term: 'EV', chapters: '10, 14', def: 'See enterprise value.' },
  { term: 'EVA', chapters: '18', def: 'See economic value added.' },
  { term: 'Event Risk', chapters: '15', def: 'Unexpected incident that reduces the firm value if and when it occurs.' },
  { term: 'Excess Cash', chapters: '5', def: 'Amount of cash held by a firm in excess of the cash needed to support its operating activities.' },
  { term: 'Exchange Rate', chapters: '17', def: 'The price one has to pay in one country currency to buy one unit of another country currency. Same as foreign-exchange rate or currency rate.' },
  { term: 'Exchange-Rate Risk', chapters: '15', def: 'Risk borne by firms with foreign operations that originates from unexpected changes in the exchange rate between two currencies.' },
  { term: 'Exercise Price', chapters: '11, 16, 17', def: 'The fixed price at which the holder of a warrant or an option has the right to buy the underlying asset. Same as strike price.' },
  { term: 'Exit Barriers', chapters: '6', def: 'Barriers, such as high capital investment, that significantly reduce a firm ability to leave an industry by selling its assets rapidly and easily.' },
  { term: 'Exit Strategy', chapters: '14', def: 'The way leveraged buyout (LBO) investors cash in on their investment by selling some (or all) of their shares after a period of time to other investors or through an initial price offering (IPO).' },
  { term: 'Expansion Investments', chapters: '7', def: 'Projects that result in additional sales revenues, margins, and working capital requirement.' },
  { term: 'Expected Return', chapters: '3', def: 'The return of an asset drawn from its probability distribution.' },
  { term: 'Expiration Date (Option)', chapters: '16, 17', def: 'The fixed settlement date of an option contract. Same as maturity date.' },
  { term: 'Face Value', chapters: '10', def: 'The fixed amount that has to be paid back to bondholders at the maturity date of a bond. Same as principal, par value, nominal value, or redemption value.' },
  { term: 'Fair Market Value', chapters: '4, 18', def: 'An estimate of the amount that could be received on the sale of an asset under normal market conditions.' },
  { term: 'Fair Price', chapters: '11', def: 'Best estimate of the unobservable value of a firm assets and securities.' },
  { term: 'FASB', chapters: '4', def: 'See Financial Accounting Standards Board.' },
  { term: 'Fat Tails', chapters: '3', def: 'Refer to the shape of the histogram of investment returns that shows higher returns than would be expected by a normal distribution at both ends of the distribution.' },
  { term: 'FCF', chapters: '4, 10', def: 'See free cash flows.' },
  { term: 'FIFO', chapters: '4', def: 'See first-in, first-out method.' },
  { term: 'Financial Accounting Standards Board (FASB)', chapters: '4', def: 'The accounting body responsible for setting accounting standards in the United States.' },
  { term: 'Financial Balance', chapters: '6', def: 'Achieved when the firm can finance its growth without modifying its operating and financing policies and without issuing new equity.' },
  { term: 'Financial (Financing) Cost Effect', chapters: '6', def: 'The negative effect of an increase in debt financing on return on equity -- more debt means larger interest payments, which reduces earnings after tax and lowers ROE.' },
  { term: 'Financial Cost Ratio', chapters: '6', def: 'Earnings before tax (EBT) divided by earnings before interest and tax (EBIT). A measure of financial leverage based on income statement data.' },
  { term: 'Financial Cost Risk', chapters: '5, 15', def: 'Risk arising from unexpected changes in the level of interest rates that affect the firm future cost of debt financing.' },
  { term: 'Financial Distress', chapters: '13, 15, 16', def: 'Situation arising when a firm finds it increasingly difficult to service its debt.' },
  { term: 'Financial Distress Costs', chapters: '1, 13, 15', def: 'Direct and indirect costs borne by a firm which has excessive borrowing and difficulties servicing its debt, and that reduce the firm value.' },
  { term: 'Financial Distress Risk', chapters: '13, 15', def: 'The risk that the firm will experience financial distress costs as its use of debt financing rises.' },
  { term: 'Financial Flexibility', chapters: '13', def: 'Having a buildup of cash that allows for immediate investment and that increases the firm debt capacity.' },
  { term: 'Financial Intermediaries', chapters: '11', def: 'Institutions that act as middlemen between the ultimate recipients of capital (firms) and the ultimate suppliers of capital (household sector).' },
  { term: 'Financial Investment Risk', chapters: '15', def: 'The risks associated with the firm holding of financial investments such as shares and bonds of other companies as well as cash and marketable securities.' },
  { term: 'Financial Lease', chapters: '11', def: 'A long-term lease that extends over most of the useful life of the asset.' },
  { term: 'Financial Leverage', chapters: '6, 13', def: 'The use of debt financing to complement equity financing. Same as gearing.' },
  { term: 'Financial Leverage Multiplier', chapters: '6', def: 'The financial cost ratio multiplied by the financial structure ratio.' },
  { term: 'Financial Leverage Risk', chapters: '15', def: 'Increase in the volatility of operating earnings because of borrowing and fixed interest payments.' },
  { term: 'Financial Markets', chapters: '1', def: 'Markets in which financial assets are traded. Same as securities markets.' },
  { term: 'Financial Risk', chapters: '1, 6, 12, 13, 15', def: 'All the risks that result from borrowing: financial leverage risk, financial cost risk, and refinancing risk.' },
  { term: 'Financial Slack', chapters: '13', def: 'Cash surplus that firms may build up during good times.' },
  { term: 'Financial Statements', chapters: '1, 4', def: 'Formal documents issued by firms to provide financial information about their business and financial transactions.' },
  { term: 'Financial Strategy Matrix', chapters: '18', def: 'A diagnostic and managerial tool that compares the capacity of a particular business to create value versus its capacity to finance the growth of its sales.' },
  { term: 'Financial Structure Effect', chapters: '6', def: 'The positive effect of an increase in debt financing on return on equity -- more debt means less equity capital and thus higher ROE.' },
  { term: 'Financial Structure Ratio', chapters: '6', def: 'Invested capital divided by owners equity. A measure of financial leverage based on balance sheet data.' },
  { term: 'Financial System', chapters: '11', def: 'The institutions and practices that allow the cash surplus of savers to be channeled to firms with a cash shortage.' },
  { term: 'Finished Goods Inventory', chapters: '4', def: 'The cost of completed units not yet sold at the date of the balance sheet.' },
  { term: 'Firm Cost of Capital', chapters: '12', def: 'The return expected by investors for the capital they supply to fund all the assets acquired and managed by the firm.' },
  { term: 'Firm-Specific Risk', chapters: '3', def: 'Risk that can be eliminated through portfolio diversification. Same as diversifiable risk and unsystematic risk.' },
  { term: 'First-In, First-Out (FIFO) Method', chapters: '4', def: 'Inventory valuation method that assigns to all units in inventory the cost of the unit purchased first.' },
  { term: 'Fisher Effect', chapters: '17', def: 'States that the nominal interest rate is the sum of the real interest rate and the expected inflation rate.' },
  { term: 'Fixed Asset', chapters: '4', def: 'See noncurrent asset.' },
  { term: 'Fixed Asset Turnover Ratio', chapters: '6', def: 'Sales divided by fixed assets. A measure of the efficiency of fixed assets management.' },
  { term: 'Flat Price (of a Bond)', chapters: '10', def: 'See clean price.' },
  { term: 'Floating Rate Bond or Floater', chapters: '11', def: 'A bond whose rate is linked to another rate that is revised periodically.' },
  { term: 'Flotation Costs', chapters: '11, 13', def: 'Costs incurred when issuing securities. Same as issuance or issue costs.' },
  { term: 'Foreign Bonds', chapters: '11', def: 'Bonds issued in the domestic bond market of another country.' },
  { term: 'Foreign-Exchange Line of Credit', chapters: '17', def: 'A credit line demanded by a bank to guarantee a firm ability to deliver on its foreign-exchange obligations.' },
  { term: 'Foreign-Exchange Market', chapters: '17', def: 'Market in which currencies are bought and sold. Same as currency market.' },
  { term: 'Foreign-Exchange Rate', chapters: '17', def: 'See exchange rate.' },
  { term: 'Foreign-Exchange Risk', chapters: '11, 15, 17', def: 'Risk arising from unexpected changes in the exchange rate between two currencies. See currency risk.' },
  { term: 'Forward (Contract)', chapters: '16, 17', def: 'Agreement between two parties for delivery of an asset at an agreed-upon price and at a specified future date (settlement date).' },
  { term: 'Forward Price', chapters: '16', def: 'The contractual price in a forward contract.' },
  { term: 'Forward Rate', chapters: '10, 17', def: 'The fixed rate at which a forward contract is settled.' },
  { term: 'Free Cash Flow', chapters: '4, 10, 13, 14', def: 'The cash flow generated by a firm business assets. Same as cash flow from (business) assets.' },
  { term: 'Fundamental Finance Principle', chapters: '1', def: 'States that a business proposal will raise the firm value only if the present value of the future stream of net cash benefits the proposal is expected to generate exceeds the initial cash outlay required to undertake the proposal. Same as the net present value (NPV) rule.' },
  { term: 'Fundamental Value', chapters: '1, 10', def: 'See intrinsic value.' },
  { term: 'Future Value (FV)', chapters: '2, 7', def: 'The value at a future date of an amount deposited today that grows at a given compound, or growth, rate.' },
  { term: 'Futures (Contract)', chapters: '16, 17', def: 'A forward contract that has a standardized contract size and a standardized delivery date; traded on futures markets.' },
  { term: 'Futures Exchanges', chapters: '16', def: 'Same as futures markets.' },
  { term: 'Futures Markets', chapters: '16, 17', def: 'Organized exchanges in which futures contracts are traded.' },
  { term: 'Futures Price', chapters: '16', def: 'Price of a futures contract traded in a futures market.' },
  { term: 'FV', chapters: '2', def: 'See future value.' },
  { term: 'Gearing', chapters: '6, 13', def: 'Same as financial leverage.' },
  { term: 'General Cash Offering', chapters: '11', def: 'The issuance and sale of a firm securities to any investor, including current shareholders. Same as public offering.' },
  { term: 'Generally Accepted Accounting Principles (GAAP)', chapters: '4', def: 'Accounting standards and rules that firms use to prepare their financial statements.' },
  { term: 'Going Concern', chapters: '14', def: 'An assumption according to which a firm will operate forever.' },
  { term: 'Goodwill', chapters: '4, 18', def: 'The difference between the (higher) price at which a firm has been acquired and either its reported net book value or its estimated fair value.' },
  { term: 'Government Bills', chapters: '4', def: 'Short-term marketable securities issued by governments.' },
  { term: 'Gross Profit', chapters: '4', def: 'The difference between the firm net sales and its cost of goods sold.' },
  { term: 'Gross Value (of Fixed Assets)', chapters: '4', def: 'The purchase price of fixed assets reported in the balance sheet. Same as historical price.' },
  { term: 'Ground-Floor Financing', chapters: '14', def: 'Equity capital financing in a leveraged buyout (LBO).' },
  { term: 'Hedge Ratio', chapters: '16', def: 'The change in the price of an option when the underlying asset price changes by one unit of currency (dollar).' },
  { term: 'Hedging', chapters: '16', def: 'A risk management technique that is employed to eliminate price risk through the use of forward, futures, and option contracts.' },
  { term: 'High-Yield Bond', chapters: '10', def: 'Same as junk bond and speculative-grade bond.' },
  { term: 'Histogram', chapters: '3', def: 'The graphical representation of the distribution of an asset realized returns.' },
  { term: 'Historical Cost (Principle)', chapters: '4', def: 'See acquisition cost principle.' },
  { term: 'Historical Multiples', chapters: '14', def: 'Multiples calculated using past financial data. Same as trailing multiples.' },
  { term: 'Holding Period Return', chapters: '3', def: 'Actual return realized over a specified time horizon.' },
  { term: 'Homemade Diversification', chapters: '14', def: 'The diversification investors can achieve themselves by combining shares of different companies in their personal portfolios.' },
  { term: 'Homemade Dividend', chapters: '11', def: 'The ability of shareholders to pay themselves the equivalent of a dividend by selling shares they own instead of receiving a dividend payment.' },
  { term: 'Homemade Leverage', chapters: '13', def: 'Personal financial leverage as opposed to corporate financial leverage.' },
  { term: 'Horizontal Merger', chapters: '14', def: 'Two firms in the same sector pooling their resources.' },
  { term: 'Hurdle Rate', chapters: '8, 12', def: 'An investment cost of capital when used in comparison with the investment internal rate of return. Same as minimum required rate of return.' },
  { term: 'IASB', chapters: '4', def: 'See International Accounting Standards Board.' },
  { term: 'IFRS', chapters: '4', def: 'See International Financial Reporting Standards.' },
  { term: 'Impairment Loss', chapters: '4', def: 'The difference between the carrying amount of an asset in a balance sheet and its recoverable amount if the latter is smaller.' },
  { term: 'Impairment Test', chapters: '4', def: 'A check to find whether the carrying amount of an asset in a balance sheet exceeds its recoverable amount.' },
  { term: 'Implied Volatility', chapters: '16', def: 'The volatility of the price of an option underlying asset calculated from the Black-Scholes formula.' },
  { term: 'Income Statement', chapters: '1, 4', def: 'Financial statement reporting information about the firm activities that resulted in changes in the value of owners equity during a period of time.' },
  { term: 'Incremental Cash Flows', chapters: '9', def: 'The difference between the firm expected cash flows if the investment is made and its expected cash flows if the investment is not undertaken. Same as differential cash flows.' },
  { term: 'Indenture (Bonds)', chapters: '11', def: 'Formal contract between a bond issuing firm and its lenders.' },
  { term: 'Indifference Curve', chapters: '3', def: 'A curve in the risk-return plane along which all the investment opportunities are equally preferred by an investor.' },
  { term: 'Indirect Costs of Financial Distress', chapters: '13', def: 'Costs created by the increasing probability that a firm may become bankrupt, thus preventing it from operating at maximum efficiency.' },
  { term: 'Indirect Financing', chapters: '11', def: 'When firms raise funds by issuing securities that are held by financial intermediaries instead of ultimate savers.' },
  { term: 'Inefficient Management (Hypothesis)', chapters: '14', def: 'Refers to a rationale for takeover whereby the target firm is not currently managed at its optimal level and the acquiring firm managers believe that they can do a better job.' },
  { term: 'Information-Content of Payout Policy', chapters: '11', def: 'Refers to the hypothesis according to which a firm payout policy conveys information to the market beyond the cash distribution itself.' },
  { term: 'Initial Public Offering (IPO)', chapters: '11', def: 'When a firm sells equity to the public for the first time.' },
  { term: 'Institutional Investors', chapters: '11', def: 'Any financial intermediaries that invest in the financial markets.' },
  { term: 'Intangible Assets', chapters: '4', def: 'Assets such as goodwill, patents, trademarks, and copyrights.' },
  { term: 'Interest Coverage Ratio', chapters: '6', def: 'See times-interest-earned ratio.' },
  { term: 'Interest Tax Shield (ITS)', chapters: '4, 13', def: 'The annual and recurrent tax saving resulting from debt financing.' },
  { term: 'Interest-Rate Parity (IRP) Relation', chapters: '17', def: 'States that the percentage difference between the forward and spot rates is equal to the difference in interest rates between the home and foreign markets.' },
  { term: 'Interest-Rate Risk', chapters: '10, 16', def: 'Risk arising from unexpected changes in the level of interest rates that affect bond prices.' },
  { term: 'Internal Rate of Return (IRR)', chapters: '1, 2, 7, 8', def: 'The discount rate that makes the net present value of a project equal to zero.' },
  { term: 'Internal Rate of Return (IRR) Rule', chapters: '1, 8', def: 'Accept (reject) a proposal if its internal rate of return (IRR) is higher (lower) than its weighted average cost of capital (WACC).' },
  { term: 'Internally Generated Funds', chapters: '11', def: 'The sum of retained earnings and depreciation expenses.' },
  { term: 'International Accounting Standards Board (IASB)', chapters: '4', def: 'An international accounting body responsible for setting accounting standards.' },
  { term: 'International Financial Reporting Standards (IFRS)', chapters: '4', def: 'Accounting standards and rules formulated by the International Accounting Standards Board.' },
  { term: 'International Fisher Effect', chapters: '17', def: 'States that the difference in interest rates between two countries reflects the difference in their expected inflation rates.' },
  { term: 'In-the-Money Option', chapters: '16', def: 'Describes a situation when the exercise price of a call option is lower than the market price of the underlying asset.' },
  { term: 'Intrinsic Value', chapters: '10', def: 'The estimated value of a security or an asset derived from a financial model and a set of assumptions.' },
  { term: 'Inventories', chapters: '1, 4', def: 'Raw materials, work in process, and finished goods not yet sold, reported in the balance sheet as current assets.' },
  { term: 'Inventory Turnover', chapters: '5', def: 'Cost of goods sold divided by ending inventories. A measure of the efficiency of inventory management.' },
  { term: 'Invested Capital', chapters: '1, 4, 5, 6', def: 'The sum of cash and marketable securities, working capital requirement, and net fixed assets. Equal to capital employed.' },
  { term: 'Investment Banks (Bankers)', chapters: '1, 11', def: 'Financial intermediaries that act as middlemen between firms wanting to issue securities to raise funds and the suppliers of capital.' },
  { term: 'Investment-Grade Bonds', chapters: '10', def: 'Highly rated bonds (BBB and above) that can be purchased by pension funds and other institutional investors.' },
  { term: 'Invoice Price (of a Bond)', chapters: '10', def: 'The price without the accrued interest. Same as full price and dirty price.' },
  { term: 'IPO', chapters: '11', def: 'See initial public offering.' },
  { term: 'IRP Relation', chapters: '17', def: 'See interest-rate parity.' },
  { term: 'IRR', chapters: '1, 8', def: 'See internal rate of return.' },
  { term: 'Irrelevant Costs', chapters: '9', def: 'Costs (past or future) that the firm must bear even if the investment project is not undertaken. See unavoidable costs and sunk costs.' },
  { term: 'Issuance or Issue Costs', chapters: '11, 13', def: 'Costs incurred when issuing securities. Same as issue costs or flotation costs.' },
  { term: 'ITS', chapters: '13', def: 'See interest tax shield.' },
  { term: 'Junior Bond/Debt/Loan', chapters: '11, 14', def: 'See subordinated bond/debt/loan.' },
  { term: 'Junk Bond/Debt', chapters: '10', def: 'See speculative grade bond/debt.' },
  { term: 'Last-In, First-Out (LIFO) Method', chapters: '4', def: 'Inventory valuation method that assigns to all units in inventory the cost of the unit purchased last.' },
  { term: 'Law of One Price (LOP)', chapters: '16, 17', def: 'LOP states that transactions which generate the same cash flows must have the same value.' },
  { term: 'LBO', chapters: '14', def: 'See leveraged buyout.' },
  { term: 'Lead Manager', chapters: '11', def: 'Same as originating house and book runner.' },
  { term: 'Lease Agreements', chapters: '11', def: 'See direct lease, financial lease, leveraged lease, operating lease, and sale and leaseback lease.' },
  { term: 'Leveraged Buyout (LBO)', chapters: '14', def: 'Transaction in which a group of investors purchase a firm by borrowing an unusually large amount of debt relative to equity capital.' },
  { term: 'Levered Beta', chapters: '12, 13', def: 'The beta of a stock when the firm is indebted. Same as equity or market beta.' },
  { term: 'Liabilities', chapters: '1, 4', def: 'What a firm shareholders collectively owe on the date of the balance sheet.' },
  { term: 'LIBOR', chapters: '11', def: 'See London Interbank Offering Rate.' },
  { term: 'LIFO', chapters: '4', def: 'See last-in, first-out method.' },
  { term: 'Liquidation Value', chapters: '14', def: 'Amount of cash that can be raised if the various items that make up a firm assets are sold separately. Usually the minimum value of assets.' },
  { term: 'Liquidity (of a Firm)', chapters: '5', def: 'The ability of a firm to meet short-term recurrent cash obligations.' },
  { term: 'Liquidity (of a Market)', chapters: '11', def: 'Characterizes a market in which buyers and sellers can quickly trade their securities at the quoted price and settle their transactions at a relatively low cost.' },
  { term: 'Liquidity (of an Asset/Security)', chapters: '4, 11', def: 'The speed with which an asset or a security can be turned into cash without significant loss of value.' },
  { term: 'Liquidity Ratio', chapters: '5', def: 'Net long-term financing (NLF) divided by working capital requirement (WCR). A measure of a firm liquidity position.' },
  { term: 'Liquidity Risk', chapters: '15', def: 'A deterioration in money market conditions that would prevent a firm from selling rapidly and without loss of value the marketable securities it holds.' },
  { term: 'London Interbank Offering Rate (LIBOR)', chapters: '11', def: 'The interest rate at which international banks lend US dollars to one another.' },
  { term: 'Long Position', chapters: '16', def: 'The position of the buyer of a contract.' },
  { term: 'Long-Term Debt/Liabilities', chapters: '4', def: 'Debt/liabilities due after a period longer than one year.' },
  { term: 'Macro Risk', chapters: '15', def: 'Economic, political, and social risk; it is a component of business risk.' },
  { term: 'Managerial Balance Sheet', chapters: '1, 4', def: 'Restructured balance sheet that shows invested capital (Cash + Working capital requirement + Net fixed assets) on one side and capital employed (Debt + Equity capital) on the other side.' },
  { term: 'Margin Account', chapters: '16, 17', def: 'Account opened by traders with brokers in which they must make an initial deposit before they can start trading.' },
  { term: 'Market Beta', chapters: '12', def: 'Beta coefficient of a stock when the firm is indebted. Same as equity or levered beta.' },
  { term: 'Market Capitalization', chapters: '1, 3, 10, 14, 18', def: 'Market value of a firm equity. Equal to its quoted price per share multiplied by the total number of shares the company has issued.' },
  { term: 'Market Portfolio', chapters: '3, 12', def: 'A benchmark portfolio containing all the assets in a particular market.' },
  { term: 'Market Power Hypothesis', chapters: '14', def: 'Takeover rationale according to which the acquiring firm has a larger market share after the acquisition that may enable it to raise the price of its products.' },
  { term: 'Market Risk', chapters: '3, 10', def: 'Risk that cannot be eliminated through portfolio diversification. Same as undiversifiable risk and systematic risk.' },
  { term: 'Market Risk Premium', chapters: '3, 12, 14', def: 'The difference between the expected return on a portfolio of all existing securities and the risk-free rate.' },
  { term: 'Market Synergies', chapters: '14', def: 'Increased revenues, beyond pre-merger levels, resulting from combining the operations of two or more firms.' },
  { term: 'Market Value Added (MVA)', chapters: '18', def: 'The difference between the market value of a firm capital (equity and debt) and the amount of capital that shareholders and debt holders have invested in the firm.' },
  { term: 'Market Value at Risk (MVR)', chapters: '15', def: 'The expected reduction in a firm market value if a risk occurs.' },
  { term: 'Market Yield (of a Bond)', chapters: '10, 12', def: 'The rate that makes the bond price equal to the present value of the bond future cash-flow stream. Same as yield to maturity.' },
  { term: 'Marketable Securities', chapters: '4', def: 'Short-term liquid assets investments with less than one year maturity held by a firm as a cash equivalent asset.' },
  { term: 'Matching Principle', chapters: '4', def: 'Accounting principle according to which expenses are recognized in the income statement not when they are paid but during the period when they effectively contribute to the firm revenues.' },
  { term: 'Matching Strategy', chapters: '5', def: 'The financing of long-term investments with long-term funds, and short-term investments with short-term funds to minimize financing cost risk and re-financing risk.' },
  { term: 'Maturity Date', chapters: '10, 16, 17', def: 'The date on which the face value of a bond must be repaid. The date on which an option contract must be settled.' },
  { term: 'Mean-Variance Analysis', chapters: '3', def: 'The analysis of the risk and return of alternative investments based on the average (mean) return and their risk measured by the variance or the standard deviation of their return distribution.' },
  { term: 'Minimum Required Rate of Return', chapters: '8', def: 'An investment cost of capital when used in comparison with the investment internal rate of return. Same as hurdle rate.' },
  { term: 'Minimum-Risk Portfolio (MRP)', chapters: '3', def: 'The portfolio on the opportunity set that has the least amount of risk.' },
  { term: 'MM Theory of Capital Structure', chapters: '13', def: 'The Modigliani and Miller theory of how changes in debt financing affect the value of a firm and its cost of capital.' },
  { term: 'Monetary/Nonmonetary (Translation) Method', chapters: '17', def: 'A method of translating the financial statements of a foreign business unit. Monetary assets and monetary liabilities are translated at the exchange rate prevailing at the date of the financial statements.' },
  { term: 'Money Market', chapters: '1, 11', def: 'Market in which firms raise short-term funds and where money market instruments are issued and traded.' },
  { term: 'Monitoring Costs', chapters: '13', def: 'Costs resulting from lenders placing restrictions on the use of the funds they lend to companies. These costs are borne by shareholders.' },
  { term: 'MVA', chapters: '18', def: 'See market value added.' },
  { term: 'MVR', chapters: '15', def: 'See market value at risk.' },
  { term: 'Net Advantage to Leasing (NAL)', chapters: '11', def: 'The net present value of the difference in cash flows between leasing and buying an asset. If NAL is positive, the asset should be leased.' },
  { term: 'Net Asset Value', chapters: '4', def: 'The difference, at a particular date, between what a firm shareholders collectively own, called assets, and what they owe, called liabilities. Same as net worth, owners equity, shareholders equity.' },
  { term: 'Net Book Value (of a Fixed Asset)', chapters: '4', def: 'The value at which a fixed asset is reported in the balance sheet.' },
  { term: 'Net Fixed Assets', chapters: '1, 4', def: 'Long-term assets, such as equipment, machinery, and buildings, from which accumulated depreciation expenses have been deducted.' },
  { term: 'Net Long-Term Financing (NLF)', chapters: '5', def: 'Long-term financing less net fixed assets.' },
  { term: 'Net Operating Profit After Tax (NOPAT)', chapters: '4, 18', def: 'Earnings before interest and tax x (1 minus Tax rate). See economic value added.' },
  { term: 'Net Present Value (NPV)', chapters: '1, 2, 7', def: 'The discounted value (at the weighted average cost of capital) of an investment future stream of free cash flows less the initial cash outlay required to launch the investment.' },
  { term: 'Net Present Value (NPV) Rule', chapters: '1, 2, 7', def: 'If a business proposal has a positive net present value (NPV), it should be carried out because it will increase the firm value by an amount equal to the proposal NPV.' },
  { term: 'Net Working Capital (NWC)', chapters: '5', def: 'Current assets less current liabilities.' },
  { term: 'NLF', chapters: '5', def: 'See net long-term financing.' },
  { term: 'Nominal Cash Flows', chapters: '9', def: 'Cash flows measured in nominal terms, that is, including inflation.' },
  { term: 'Nominal (Interest) Rate', chapters: '2, 17', def: 'The interest rate that a borrower will actually pay, including a premium for the rate of inflation.' },
  { term: 'Noncurrent Assets', chapters: '4', def: 'Long-lived assets that are not expected to be turned into cash within a year. Same as long-term financial assets, fixed assets, or capital assets.' },
  { term: 'NOPAT', chapters: '4, 18', def: 'See net operating profit after tax. Same as EBIT (1 minus TC).' },
  { term: 'Normal Distribution', chapters: '3', def: 'A bell-shaped distribution that is completely described by its mean and standard deviation.' },
  { term: 'NPV', chapters: '1, 2, 7', def: 'See net present value.' },
  { term: 'NPV Rule', chapters: '1, 2, 7, 8', def: 'See net present value rule.' },
  { term: 'NWC', chapters: '5', def: 'See net working capital.' },
  { term: 'Operating Cycle', chapters: '4, 5', def: 'The sequence of operating activities that begins with the acquisition of raw materials and ends with the collection of cash for the sale of final goods.' },
  { term: 'Operating Exposure', chapters: '17', def: 'Effect of changes in exchange rates on the firm cash flows generated by future and uncertain transactions. See economic exposure.' },
  { term: 'Operating Lease', chapters: '11', def: 'A short-term lease for which the length of the contract is shorter than the useful life of the asset leased.' },
  { term: 'Operating Profit', chapters: '4', def: 'Net sales less operating expenses. Same as EBIT.' },
  { term: 'Operating Profit Margin', chapters: '6, 18', def: 'Earnings before interest and tax (EBIT) divided by sales. A measure of profitability.' },
  { term: 'Operational Risk(s)', chapters: '15', def: 'The risks that arise in the course of implementing a firm strategy; includes business process risk, commodity price risk, credit risk, legal risk, fiscal risk, and reputational risk.' },
  { term: 'Opportunity Cost', chapters: '9', def: 'Loss of revenues that results from giving up an activity to carry out an alternative one.' },
  { term: 'Opportunity Set', chapters: '3', def: 'The expected return/standard deviation pairs of all portfolios that can be constructed from a given set of stocks.' },
  { term: 'Optimal Capital Structure', chapters: '1, 13', def: 'The debt-to-equity ratio that maximizes the market value of the firm assets. See target capital structure.' },
  { term: 'Option (Contract)', chapters: '16, 17', def: 'A contract that gives the holder the right (with no obligation) to buy (call option) or sell (put option) a fixed number of securities or a stated amount of currency, at a specified price before or on the expiration date of the option.' },
  { term: 'Originating House', chapters: '11', def: 'The investment bank that has initiated and carried out the issuance of securities for a firm. Same as lead manager or book runner.' },
  { term: 'Out-of-the-Money Option', chapters: '16', def: 'Describes a situation when the exercise price of a call option is higher than the market price of the underlying asset.' },
  { term: 'Owners Equity', chapters: '1, 4', def: 'The difference, at a particular date, between what a firm shareholders collectively own, called assets, and what they owe, called liabilities. Same as net asset value, net worth, shareholders equity, equity capital, and shareholders funds.' },
  { term: 'P&L', chapters: '1, 4', def: 'See profit and loss statement.' },
  { term: 'Parity Relations', chapters: '17', def: 'Relationships linking the spot exchange rates, the forward exchange rates, the interest rates, and the inflation rates prevailing in two countries.' },
  { term: 'Par Value', chapters: '4, 10', def: 'For a share of stock, an arbitrary fixed value set when shares are issued. For a bond, the fixed amount (face value) that has to be paid back to bondholders at the maturity date of the bond.' },
  { term: 'Payback Period', chapters: '7, 8', def: 'The number of periods (usually years) required for the sum of the project expected cash flows to equal its initial cash outlay.' },
  { term: 'Payback Period Rule', chapters: '8', def: 'Accept (reject) the project if its payback period is shorter (longer) than a given cutoff period.' },
  { term: 'Payout Policy', chapters: '1, 11', def: 'The amount and the timing of a firm cash distribution in the form of dividends or share buybacks.' },
  { term: 'Pecking Order', chapters: '13', def: 'Refers to the order in which firms raise capital, relying first on retaining earnings then issuing debt before finally raising new equity.' },
  { term: 'Perpetuity', chapters: '2, 10', def: 'An annuity with an infinite life.' },
  { term: 'PI', chapters: '7, 8', def: 'See profitability index.' },
  { term: 'Political Risk', chapters: '15, 17', def: 'Unexpected government regulations and decisions that constrain the firm ability to generate profits.' },
  { term: 'Preferred Stocks', chapters: '11', def: 'A security that has a priority over common stock in the payment of dividends and a prior claim on the firm assets in the event of liquidation, but that has no voting rights.' },
  { term: 'Present Value (PV)', chapters: '1, 2, 7', def: 'The value today of an expected future cash flow stream discounted at a rate that reflects its risk. Same as discounted value.' },
  { term: 'Price Risk', chapters: '15, 16', def: 'The risk of unexpected changes in the price of an asset such as a commodity or a financial asset.' },
  { term: 'Price-to-Book Ratio (PBR or P/B Ratio)', chapters: '10, 14', def: 'Share price divided by book value of equity per share. Same as market-to-book ratio and book value multiple; used to value a firm.' },
  { term: 'Price-to-Earnings Ratio (PER or P/E Ratio)', chapters: '6, 10, 14', def: 'Share price divided by the firm earnings per share. Same as earnings multiple. Used to value a firm.' },
  { term: 'Primary Markets', chapters: '1, 11', def: 'Financial markets in which newly issued securities are sold to the public.' },
  { term: 'Private Placement', chapters: '11', def: 'The issuance and sale of a firm securities directly to financial institutions and qualified investors, thus bypassing the financial markets.' },
  { term: 'Profitability Index (PI)', chapters: '7, 8', def: 'The present value of an investment expected cash-flow stream divided by the investment initial cash outlay.' },
  { term: 'Profitability Index (PI) Rule', chapters: '7, 8', def: 'Accept (reject) the project if its profitability index is higher (lower) than one.' },
  { term: 'Profit Retention Rate', chapters: '1, 6', def: 'Retained earnings divided by net profit.' },
  { term: 'Project Cost of Capital', chapters: '7, 12', def: 'The return expected by investors for the capital they supply to fund a specific project. Same as project opportunity cost of capital.' },
  { term: 'Protective Put', chapters: '16', def: 'A put option bought to protect against a drop in the price of the underlying asset.' },
  { term: 'Public Offering', chapters: '11', def: 'The issuance and sale of a firm securities not only to its existing shareholders, but also to the public at large. Same as general cash offering.' },
  { term: 'Purchasing Power Parity (PPP) Relation', chapters: '17', def: 'States that the general cost of living should be the same across countries.' },
  { term: 'Pure Discount Bond', chapters: '10', def: 'A default-free zero-coupon bond.' },
  { term: 'Put-Call Parity', chapters: '16', def: 'The relationship between the price of a European call option and a European put option on the same underlying asset, both with the same strike price and expiration date.' },
  { term: 'Put Option', chapters: '11, 16, 17', def: 'A contract that gives the holder the right (with no obligation) to sell a fixed number of shares or a certain amount of currency at a fixed price during the life of the option (American option) or at the expiration date of the option (European option).' },
  { term: 'PV', chapters: '1, 2, 7', def: 'See present value.' },
  { term: 'Quick Ratio', chapters: '5', def: 'Cash plus accounts receivable divided by current liabilities. Same as acid test. A measure of liquidity.' },
  { term: 'Real Cash Flows', chapters: '9', def: 'Cash flows from which the effect of inflation has been removed.' },
  { term: 'Real Options', chapters: '16', def: 'Options written on tangible (physical) assets. Same as managerial options.' },
  { term: 'Real (Interest) Rate', chapters: '2, 17', def: 'The interest rate adjusted for changes in the cost of living. See nominal interest rate.' },
  { term: 'Realization Principle', chapters: '4', def: 'The recognition of revenue (in an income statement) during the period when the transaction generating the revenue has taken place, not when the cash generated by the transaction is received.' },
  { term: 'Recapitalization', chapters: '1, 6, 13', def: 'The substitution of debt for equity, leaving assets unchanged.' },
  { term: 'Refinancing Risk', chapters: '5, 11, 15', def: 'Risk arising from the unwillingness of a lender to renew the loans made to finance assets, thus forcing the firm to sell part or all of these assets to repay the loan.' },
  { term: 'Relevant Cash Flows', chapters: '9', def: 'Cash flows that are affected by an investment decision.' },
  { term: 'Relevant Costs', chapters: '9', def: 'Costs incurred only if the investment project is undertaken.' },
  { term: 'Replacement Investments', chapters: '7', def: 'Cost saving projects that do not generate extra cash inflows.' },
  { term: 'Replacement Value (of an Asset)', chapters: '14', def: 'What it would cost today to replace a firm assets with similar ones to start a new business with the same earning power.' },
  { term: 'Required Investments', chapters: '7', def: 'Investments a firm must make to comply with safety, health, and environmental regulations.' },
  { term: 'Retained Earnings', chapters: '1, 4', def: 'The part of a firm profit that owners decide to invest back into their company.' },
  { term: 'Retention Rate', chapters: '1', def: 'Retained earnings divided by earnings after tax (EAT).' },
  { term: 'Return on Assets (ROA)', chapters: '6', def: 'Earnings after tax (EAT) divided by total assets. A measure of profitability.' },
  { term: 'Return on Business Assets (ROBA)', chapters: '6', def: 'Earnings before interest and tax (EBIT) divided by business assets (working capital requirement plus net fixed assets). A measure of operating profitability.' },
  { term: 'Return on Capital Employed (ROCE)', chapters: '1', def: 'Net operating profit after tax (NOPAT) divided by capital employed (equity plus debt capital). Equal to return on invested capital (ROIC).' },
  { term: 'Return on Equity (ROE)', chapters: '1, 6', def: 'Earnings after tax (EAT) divided by owners equity. A measure of the firm profitability to shareholders.' },
  { term: 'Return on Invested Capital (ROIC)', chapters: '1, 6, 18', def: 'Net operating profit after tax (NOPAT) divided by invested capital (cash plus working capital requirement plus net fixed assets). Equal to return on capital employed (ROCE).' },
  { term: 'Return on Sales (ROS)', chapters: '6', def: 'Earnings after tax (EAT) divided by sales. Same as net profit margin. A measure of profitability.' },
  { term: 'Return Spread', chapters: '18', def: 'The difference between a firm, or a project, after tax return on invested capital (ROIC) and its weighted average cost of capital (WACC). See economic value added.' },
  { term: 'Revenues', chapters: '1, 4', def: 'A firm activities that result in increases in the value of owners equity.' },
  { term: 'Rights Issue (Offering)', chapters: '11', def: 'Offering of a firm common stocks exclusively to its existing stockholders.' },
  { term: 'Risk', chapters: '1, 3, 7, 15', def: 'A term used to describe a situation in which a firm only knows the expected value of its future cash-flow stream. See business risk, financial risk.' },
  { term: 'Risk-Averse (Investors)', chapters: '1, 3, 7', def: 'Investors who would buy shares of riskier firms only if they expect to earn a higher return to compensate them for the higher risk they have to bear.' },
  { term: 'Risk-Free Rate (Rf)', chapters: '3, 12', def: 'The rate of return of a risk-free asset, usually government securities. Same as riskless rate.' },
  { term: 'Risk Premium', chapters: '3', def: 'Return in excess of the risk-free rate.' },
  { term: 'ROA', chapters: '6', def: 'See return on assets.' },
  { term: 'ROCE', chapters: '1', def: 'See return on capital employed.' },
  { term: 'ROE', chapters: '1, 6', def: 'See return on equity.' },
  { term: 'ROIC', chapters: '1, 6, 18', def: 'See return on invested capital.' },
  { term: 'ROS', chapters: '6', def: 'See return on sales.' },
  { term: 'Sale and Leaseback (Lease)', chapters: '11', def: 'A financial lease under which the lessee sells the asset to the leasing company which immediately leases it back to the lessee.' },
  { term: 'Salvage Value', chapters: '9, 11', def: 'The resale, or scrap, value of an asset. Same as residual value and terminal value.' },
  { term: 'Secondary Market', chapters: '1, 11', def: 'Financial market in which outstanding securities are traded. See primary market.' },
  { term: 'Secured Bond', chapters: '11', def: 'A bond for which the issuer has provided collateral to the lender.' },
  { term: 'Security Market Line (SML)', chapters: '3, 12', def: 'A straight line that relates the expected returns of risky investments to their corresponding risk measured by the beta coefficient.' },
  { term: 'Self-Sustainable Growth Rate (SGR)', chapters: '1, 6, 18', def: 'The fastest growth rate a firm can achieve by retaining a constant percentage of its profit, keeping both its operating and financing policies unchanged, and not issuing new equity. Equal to the profit retention rate multiplied by return on equity.' },
  { term: 'Selling, General, and Administrative Expenses (SG&As)', chapters: '4', def: 'Expenses incurred by the firm that relate to the sale of its products and the running of its operations during the accounting period.' },
  { term: 'Senior Bond/Debt/Loan', chapters: '11, 14', def: 'A bond/debt/loan that has a claim on the firm assets (in the event of liquidation) that precedes the claim of junior or subordinated debt.' },
  { term: 'Separation Principle', chapters: '3', def: 'An investment principle according to which all investors should hold the market portfolio irrespective of their degree of risk aversion and then adjust for their degree of risk aversion by allocating their investible funds between a riskless asset and the market portfolio.' },
  { term: 'SGR', chapters: '1, 6, 18', def: 'See self-sustainable growth rate.' },
  { term: 'Share Buyback (Program)', chapters: '1, 11, 18', def: 'The buying by a firm of its own shares for the purpose of reducing the number of shares outstanding. Same as share repurchase program.' },
  { term: 'Shareholders', chapters: '1, 4', def: 'Investors who have bought common stocks issued by a firm to raise equity capital. Shareholders are the owners of the firm.' },
  { term: 'Sharpe Ratio', chapters: '3', def: 'The excess return of a security or portfolio divided by its volatility. A measure of excess return per unit of risk.' },
  { term: 'Short Position', chapters: '16', def: 'The position of the seller of a contract.' },
  { term: 'Signaling Effects', chapters: '13', def: 'Market reactions to a firm actions, such as a drop in the firm share price when the firm skips a dividend payment -- an action interpreted by the market as a signal of weakening corporate cash flow.' },
  { term: 'Sinking Fund Provision', chapters: '11', def: 'Requires that a bond issuing firm set aside cash in a special account according to a regular schedule to allow the firm to redeem the bond at maturity.' },
  { term: 'SML', chapters: '3, 12', def: 'See security market line.' },
  { term: 'Speculative-Grade Bonds', chapters: '10', def: 'Corporate bonds with ratings below BBB. Same as junk bonds or high-yield bonds.' },
  { term: 'Spot Price', chapters: '16', def: 'The price at which a spot transaction is executed.' },
  { term: 'Spot Rate', chapters: '17', def: 'The rate at which a spot transaction is executed.' },
  { term: 'Spot-Forward Parity', chapters: '16', def: 'The relationship between spot and forward prices.' },
  { term: 'Spread (in Floating Rate Bonds)', chapters: '11', def: 'The difference between the floating coupon rate and the benchmark rate.' },
  { term: 'Stable Dividend Policy', chapters: '13', def: 'A dividend distribution policy that attempts to maintain a stable dividend yield over time.' },
  { term: 'Stakeholders Approach', chapters: '1', def: 'Managing a firm with the objective of balancing out the interests of all its stakeholders: its employees, customers, suppliers, owners, and the community where it is located.' },
  { term: 'Stand-Alone Value', chapters: '1, 14', def: 'Estimated value of a takeover target firm before the acquiring firm factors in any performance improvements. Same as as-is value.' },
  { term: 'Standard Deviation (of Returns)', chapters: '3', def: 'The square root of the variance of returns. A measure of risk also called volatility.' },
  { term: 'Statement of Cash Flows', chapters: '4', def: 'Financial statement that provides information about the cash transactions between the firm and the outside world by separating these transactions into cash flows related to operating, investing, and financing activities.' },
  { term: 'Straight-Line Depreciation Method', chapters: '4', def: 'Depreciation method according to which the firm tangible fixed assets are depreciated by an equal amount each year.' },
  { term: 'Strategic Risk', chapters: '15', def: 'Risk associated with unanticipated changes in the dynamics of a firm industry that may have a negative impact on the firm market value.' },
  { term: 'Strike Price', chapters: '16, 17', def: 'See exercise price.' },
  { term: 'Subordinated Bond/Debt/Loan', chapters: '11, 14', def: 'Bond/debt/loan that has a claim on the firm assets (in the event of liquidation) that follows the claim of senior debt holders. Same as junior bond/debt/loan.' },
  { term: 'Sunk Costs', chapters: '9', def: 'Money already spent that cannot be recovered irrespective of future decisions. Same as irrelevant costs and unavoidable costs.' },
  { term: 'Sustainable Growth Rate', chapters: '1, 6, 18', def: 'See self-sustainable growth rate.' },
  { term: 'Systematic Risk', chapters: '3, 12', def: 'Risk that cannot be eliminated through portfolio diversification. Measured with the beta coefficient. Same as market risk or undiversifiable risk.' },
  { term: 'Takeover Premium', chapters: '14', def: 'The difference between the acquisition price paid by the bidder and the current market value of the target firm.' },
  { term: 'Tangible Assets', chapters: '4', def: 'Assets such as land, buildings, machines, and furniture (collectively called property, plant, and equipment) and long-term financial assets.' },
  { term: 'Target Capital Structure', chapters: '12, 13', def: 'The debt-to-equity ratio that maximizes the market value of the firm assets. See optimal capital structure.' },
  { term: 'Tax Shield', chapters: '13', def: 'See interest tax shield.' },
  { term: 'Term Loans', chapters: '11', def: 'Medium- to long-term loans extended by banks and insurance companies.' },
  { term: 'Term Structure of Interest Rates', chapters: '10', def: 'The relationship between interest rates (bond yields) and different terms to maturity. See yield curve.' },
  { term: 'Terminal Cash Flow', chapters: '9', def: 'Cash flow that occurs in the last year of a project.' },
  { term: 'Terminal Value (of a Firm)', chapters: '2, 14', def: 'The estimated value that the firm will have at the end of a forecasting period, which is determined by the expected cash flows beyond the forecasting period.' },
  { term: 'Time Value of Money', chapters: '2, 7', def: 'Time has value because a dollar received earlier is worth more than a dollar received later.' },
  { term: 'Times-Interest-Earned Ratio', chapters: '6', def: 'The ratio of earnings before interest and tax (EBIT) divided by interest expenses. Same as interest coverage ratio. A measure of financial leverage based on income statement data.' },
  { term: 'Trade-Off Model of Capital Structure', chapters: '1, 13', def: 'Optimal capital structure reached by means of a trade-off between the present value of the interest tax shield and the present value of financial distress costs.' },
  { term: 'Transaction Exposure', chapters: '17', def: 'See contractual exposure.' },
  { term: 'Translation Exposure', chapters: '17', def: 'See accounting exposure.' },
  { term: 'Treasury Stock', chapters: '4', def: 'The amount that a firm has spent to repurchase its own shares up to the date of the balance sheet.' },
  { term: 'Unavoidable Costs', chapters: '9', def: 'Costs incurred regardless of whether the investment is undertaken. Same as irrelevant costs or sunk costs.' },
  { term: 'Undervaluation Hypothesis', chapters: '14', def: 'Takeover rationale according to which the acquiring company has superior skills in finding undervalued target firms that can be bought cheaply.' },
  { term: 'Underwriter', chapters: '11', def: 'Investment bank that buys the securities a firm wants to issue and then resells them to the public at a higher price.' },
  { term: 'Undiversifiable Risk', chapters: '3, 12', def: 'Risk that cannot be eliminated through portfolio diversification. See systematic risk and market risk.' },
  { term: 'Unlevered Beta', chapters: '12, 13, 14', def: 'Same as asset beta.' },
  { term: 'Unlevered Cost of Equity', chapters: '14', def: 'The cost of equity of an all-equity financed firm. Can be estimated with the capital asset pricing model using the firm unlevered beta.' },
  { term: 'Unsystematic Risk', chapters: '3, 12', def: 'Risk that can be eliminated through portfolio diversification. Same as diversifiable risk and firm-specific risk.' },
  { term: 'Useful Life', chapters: '7, 9', def: 'See economic life.' },
  { term: 'Valuation by Comparables', chapters: '10, 14', def: 'A valuation method that uses financial data for firms similar to the business or firm to be valued to estimate the market value of its equity or its enterprise value.' },
  { term: 'Value-Based Management (System)', chapters: '1, 18', def: 'Managing a firm resources with the goal of increasing the firm market value.' },
  { term: 'Variance (of Returns)', chapters: '3', def: 'A statistical measure of the dispersion of a distribution of returns around their average value. A measure of risk also called variability.' },
  { term: 'Venture Capital Firm', chapters: '11, 14', def: 'An investment firm specializing in the financing of small and new ventures.' },
  { term: 'Vertical Merger', chapters: '14', def: 'For example, the integration of a car manufacturer with its major supplier or its major distributor.' },
  { term: 'Volatility (of an Asset)', chapters: '3, 12', def: 'Unpredictable fluctuations in the market price of an asset. Same as the standard deviation of return.' },
  { term: 'WACC', chapters: '1, 10, 12, 14, 18', def: 'See weighted average cost of capital.' },
  { term: 'Warrants', chapters: '11, 16', def: 'Call options sold by a firm that give the holder the right (with no obligation) to buy a specific number of the firm shares of common stock at a fixed price during the life of the warrant.' },
  { term: 'WCR', chapters: '1, 4, 5', def: 'See working capital requirement.' },
  { term: 'Weighted Average Cost of Capital (WACC)', chapters: '1, 10, 12, 14, 18', def: 'The weighted average of the after-tax cost of debt and cost of equity. The minimum rate of return a project must generate in order to meet the return expectations of its suppliers of capital (lenders and shareholders).' },
  { term: 'With/Without Principle', chapters: '9', def: 'States that the cash flows that are relevant to an investment decision are only those that increase or decrease the firm overall cash position if the investment is undertaken.' },
  { term: 'Working Capital Requirement (WCR)', chapters: '1, 4, 5', def: 'The difference between operating assets (trade receivables, inventories, and prepaid expenses) and operating liabilities (trade payables and accrued expenses). WCR measures the firm net investment in its operating cycle.' },
  { term: 'Yankee Bonds', chapters: '11', def: 'Bonds issued by foreign firms in the United States, denominated in US dollars or other currencies.' },
  { term: 'Yield Curve', chapters: '10', def: 'A graphical representation of the term structure of interest rates.' },
  { term: 'Yield Spread', chapters: '10', def: 'The difference between the market yield on a non-government bond and the yield on a government bond with the same maturity and currency denomination.' },
  { term: 'Yield to Maturity', chapters: '10, 12', def: 'The rate that makes the bond price equal to the present value of the bond future cash-flow stream. Same as market yield.' },
  { term: 'Zero-Coupon Bond', chapters: '10', def: 'A bond with no coupon payments that is sold at an original discount from face value.' },
];

// ── Render ────────────────────────────────────────────────────────────────────

function getLetters() {
  const letters = new Set(TERMS.map(t => t.term[0].toUpperCase()));
  return [...letters].sort();
}

function buildAlphaNav(letters) {
  const nav = document.getElementById('glossary-alpha');
  if (!nav) return;
  letters.forEach(letter => {
    const a = document.createElement('a');
    a.className = 'glossary-alpha__link';
    a.href = '#glossary-letter-' + letter;
    a.textContent = letter;
    nav.appendChild(a);
  });
}

function renderTermCard(term) {
  const div = document.createElement('div');
  div.className = 'glossary-term';
  div.setAttribute('role', 'button');
  div.setAttribute('tabindex', '0');
  div.setAttribute('aria-expanded', 'false');
  div.dataset.term     = term.term.toLowerCase();
  div.dataset.chapters = term.chapters;
  div.dataset.origTerm = term.term;
  div.dataset.origDef  = term.def;

  div.innerHTML = '<div class="glossary-term__header">'
    + '<div class="glossary-term__word">' + term.term + '</div>'
    + '<div class="glossary-term__chapters">Ch. ' + term.chapters + '</div>'
    + '<span class="glossary-term__toggle">&#9660;</span>'
    + '</div>'
    + '<div class="glossary-term__def" style="display:none;">' + term.def + '</div>';

  const toggle = () => {
    const def     = div.querySelector('.glossary-term__def');
    const chevron = div.querySelector('.glossary-term__toggle');
    const open    = def.style.display === 'none';
    def.style.display  = open ? 'block' : 'none';
    chevron.innerHTML  = open ? '&#9650;' : '&#9660;';
    div.setAttribute('aria-expanded', open);
    if (open) div.classList.add('glossary-term--open');
    else div.classList.remove('glossary-term--open');
  };

  div.addEventListener('click', toggle);
  div.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });

  return div;
}

function renderAll() {
  const body    = document.getElementById('glossary-body');
  const letters = getLetters();
  body.innerHTML = '';

  letters.forEach(letter => {
    const group = TERMS.filter(t => t.term[0].toUpperCase() === letter);

    const section = document.createElement('div');
    section.className = 'glossary-section';
    section.id = 'glossary-letter-' + letter;

    const heading = document.createElement('div');
    heading.className = 'glossary-section__letter';
    heading.textContent = letter;
    section.appendChild(heading);

    group.forEach(term => section.appendChild(renderTermCard(term)));
    body.appendChild(section);
  });

  updateCount(TERMS.length);
}

function updateCount(n) {
  const el = document.getElementById('glossary-count');
  if (el) el.textContent = n + ' term' + (n !== 1 ? 's' : '');
}

function updateAlphaNav() {
  const links = document.querySelectorAll('.glossary-alpha__link');
  links.forEach(link => {
    const letter  = link.textContent.trim();
    const section = document.getElementById('glossary-letter-' + letter);
    if (!section) return;
    const hasVisible = [...section.querySelectorAll('.glossary-term')]
      .some(card => !card.classList.contains('glossary-term--hidden'));
    link.classList.toggle('glossary-alpha__link--active', hasVisible);
    link.classList.toggle('glossary-alpha__link--inactive', !hasVisible);
  });
}

function buildChapterFilter() {
  const select = document.getElementById('glossary-chapter-filter');
  if (!select) return;
  const chapters = new Set();
  TERMS.forEach(t => {
    t.chapters.split(',').forEach(c => {
      const ch = c.trim();
      if (ch) chapters.add(ch);
    });
  });
  const sorted = [...chapters].sort((a, b) => parseInt(a) - parseInt(b));
  sorted.forEach(ch => {
    const opt = document.createElement('option');
    opt.value = ch;
    opt.textContent = 'Chapter ' + ch;
    select.appendChild(opt);
  });
}

function initSearch() {
  const input     = document.getElementById('glossary-search');
  const clearBtn  = document.getElementById('glossary-clear');
  const chFilter  = document.getElementById('glossary-chapter-filter');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    clearBtn.style.display = (q || (chFilter && chFilter.value)) ? 'inline-flex' : 'none';
    filterTerms();
  });

  if (chFilter) {
    chFilter.addEventListener('change', () => {
      clearBtn.style.display = (input.value.trim() || chFilter.value) ? 'inline-flex' : 'none';
      filterTerms();
    });
  }

  clearBtn.addEventListener('click', () => {
    input.value = '';
    if (chFilter) chFilter.value = '';
    clearBtn.style.display = 'none';
    filterTerms();
    input.focus();
  });

  const defsToggle = document.getElementById('glossary-search-defs');
  if (defsToggle) {
    defsToggle.addEventListener('change', () => filterTerms());
  }
}

function getActiveFilters() {
  const q       = (document.getElementById('glossary-search')?.value || '').trim().toLowerCase();
  const ch      = (document.getElementById('glossary-chapter-filter')?.value || '');
  const searchDefs = document.getElementById('glossary-search-defs')?.checked || false;
  return { q, ch, searchDefs };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, q) {
  if (!q) return text;
  const re = new RegExp('(' + escapeRegex(q) + ')', 'gi');
  return text.replace(re, '<mark class="glossary-highlight">$1</mark>');
}

function filterTerms() {
  const { q, ch, searchDefs } = getActiveFilters();
  const sections = document.querySelectorAll('.glossary-section');
  let visibleCount = 0;

  sections.forEach(section => {
    const cards = section.querySelectorAll('.glossary-term');
    let sectionVisible = false;

    cards.forEach(card => {
      const termText    = card.dataset.term || '';
      const chaptersStr = card.dataset.chapters || '';
      const origTerm    = card.dataset.origTerm || '';
      const origDef     = card.dataset.origDef  || '';
      const defText     = origDef.toLowerCase();

      const matchQ  = !q || termText.includes(q) || (searchDefs && defText.includes(q));
      const matchCh = !ch || chaptersStr.split(',').map(s => s.trim()).includes(ch);
      const match   = matchQ && matchCh;

      card.classList.toggle('glossary-term--hidden', !match);

      // Update highlights
      const wordEl = card.querySelector('.glossary-term__word');
      const defEl  = card.querySelector('.glossary-term__def');
      if (wordEl) wordEl.innerHTML = highlightText(origTerm, q);
      if (defEl && searchDefs) defEl.innerHTML = highlightText(origDef, q);
      else if (defEl) defEl.innerHTML = origDef;

      // Auto-expand card if definition match and search-defs is on
      if (match && q && searchDefs && defText.includes(q) && !termText.includes(q)) {
        defEl.style.display = 'block';
        card.querySelector('.glossary-term__toggle').innerHTML = '&#9650;';
        card.setAttribute('aria-expanded', 'true');
        card.classList.add('glossary-term--open');
      }

      if (match) { sectionVisible = true; visibleCount++; }
    });

    section.style.display = sectionVisible ? '' : 'none';
  });

  updateCount(visibleCount);
  updateAlphaNav();
}

function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.className = 'back-to-top';
  btn.innerHTML = '&#8679;';
  btn.title = 'Back to top';
  btn.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('back-to-top--visible', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initStickySearch() {
  const hero    = document.querySelector('.page__hero');
  const controls = document.querySelector('.glossary-controls');
  if (!hero || !controls) return;

  const sticky = document.createElement('div');
  sticky.className = 'glossary-sticky-search';
  sticky.innerHTML = '<div class="container">'
    + '<input class="glossary-search glossary-search--sticky" type="text" '
    + 'id="glossary-search-sticky" placeholder="Search terms..." autocomplete="off" />'
    + '</div>';
  document.body.insertBefore(sticky, document.querySelector('main'));

  const stickyInput = document.getElementById('glossary-search-sticky');
  const mainInput   = document.getElementById('glossary-search');

  const observer = new IntersectionObserver(entries => {
    sticky.classList.toggle('glossary-sticky-search--visible', !entries[0].isIntersecting);
  }, { threshold: 0 });
  observer.observe(hero);

  stickyInput.addEventListener('input', () => {
    const q = stickyInput.value.trim().toLowerCase();
    mainInput.value = stickyInput.value;
    document.getElementById('glossary-clear').style.display = q ? 'inline-flex' : 'none';
    filterTerms();
  });

  mainInput.addEventListener('input', () => {
    stickyInput.value = mainInput.value;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const letters = getLetters();
  buildAlphaNav(letters);
  renderAll();
  buildChapterFilter();
  initSearch();
  updateAlphaNav();
  initBackToTop();
  initStickySearch();
});
