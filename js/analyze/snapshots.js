/**
 * snapshots.js — Built-in 5-Year 10-K Benchmark Company Snapshots
 *
 * Provides complete multi-year Income Statements, Balance Sheets, Cash Flow
 * Statements, and Market Profiles (in $ millions except per-share data) for 6
 * canonical executive finance archetypes so all Analyze workbenches work
 * offline and out of the box with zero setup.
 */

export const BENCHMARK_SNAPSHOTS = {
  AAPL: {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    cik: '0000320193',
    sector: 'Consumer Technology & Ecosystem',
    archetype: 'Negative Working Capital & Ultra-High RNOA',
    description: 'Hardware + high-margin Services ecosystem with negative working capital (suppliers finance inventory), massive free cash flow conversion, and aggressive share buybacks.',
    formType: '10-K',
    source: 'snapshot',
    profile: {
      price: 225.00,
      beta: 1.24,
      sharesOutstanding: 15204,
      marketCap: 3420900,
      riskFreeRate: 0.042,
      equityRiskPremium: 0.05,
      peerMultiples: { pe: 28.5, evEbitda: 22.0, pb: 35.0, pfcf: 26.0 }
    },
    incomeStatements: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-09-28',
        revenue: 391035, costOfRevenue: 210352, grossProfit: 180683,
        researchAndDevelopment: 31370, sellingGeneralAndAdmin: 26097,
        operatingIncome: 123216, ebit: 123216, depreciation: 11445, ebitda: 134661,
        interestExpense: 3002, ebt: 123485, taxExpense: 29749, netIncome: 93736,
        epsBasic: 6.11, epsDiluted: 6.08, sharesBasic: 15343, sharesDiluted: 15408
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-09-30',
        revenue: 383285, costOfRevenue: 214137, grossProfit: 169148,
        researchAndDevelopment: 29915, sellingGeneralAndAdmin: 24932,
        operatingIncome: 114301, ebit: 114301, depreciation: 11519, ebitda: 125820,
        interestExpense: 3933, ebt: 113736, taxExpense: 16741, netIncome: 96995,
        epsBasic: 6.16, epsDiluted: 6.13, sharesBasic: 15744, sharesDiluted: 15812
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-09-24',
        revenue: 394328, costOfRevenue: 223546, grossProfit: 170782,
        researchAndDevelopment: 26251, sellingGeneralAndAdmin: 25094,
        operatingIncome: 119437, ebit: 119437, depreciation: 11104, ebitda: 130541,
        interestExpense: 2931, ebt: 119103, taxExpense: 19300, netIncome: 99803,
        epsBasic: 6.15, epsDiluted: 6.11, sharesBasic: 16215, sharesDiluted: 16325
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-09-25',
        revenue: 365817, costOfRevenue: 212981, grossProfit: 152836,
        researchAndDevelopment: 21914, sellingGeneralAndAdmin: 21973,
        operatingIncome: 108949, ebit: 108949, depreciation: 11284, ebitda: 120233,
        interestExpense: 2645, ebt: 109207, taxExpense: 14527, netIncome: 94680,
        epsBasic: 5.67, epsDiluted: 5.61, sharesBasic: 16701, sharesDiluted: 16864
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-09-26',
        revenue: 274515, costOfRevenue: 169559, grossProfit: 104956,
        researchAndDevelopment: 18752, sellingGeneralAndAdmin: 19916,
        operatingIncome: 66288, ebit: 66288, depreciation: 11056, ebitda: 77344,
        interestExpense: 2873, ebt: 67091, taxExpense: 9680, netIncome: 57411,
        epsBasic: 3.31, epsDiluted: 3.28, sharesBasic: 17352, sharesDiluted: 17528
      }
    ],
    balanceSheets: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-09-28',
        totalAssets: 364980, currentAssets: 152987, cash: 29943, shortTermInvestments: 35228,
        accountsReceivable: 33410, inventory: 7286, propertyPlantEquipment: 45680,
        goodwill: 0, intangibleAssets: 0, totalLiabilities: 308030, currentLiabilities: 176392,
        accountsPayable: 68960, shortTermDebt: 20879, longTermDebt: 85750,
        totalDebt: 106629, netDebt: 41458, totalEquity: 56950, retainedEarnings: -19154,
        treasuryStock: 0, sharesOutstanding: 15204
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-09-30',
        totalAssets: 352583, currentAssets: 143566, cash: 29965, shortTermInvestments: 31590,
        accountsReceivable: 29508, inventory: 6331, propertyPlantEquipment: 43715,
        goodwill: 0, intangibleAssets: 0, totalLiabilities: 290437, currentLiabilities: 145308,
        accountsPayable: 62611, shortTermDebt: 15807, longTermDebt: 95281,
        totalDebt: 111088, netDebt: 49533, totalEquity: 62146, retainedEarnings: -214,
        treasuryStock: 0, sharesOutstanding: 15550
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-09-24',
        totalAssets: 352755, currentAssets: 135405, cash: 23646, shortTermInvestments: 24658,
        accountsReceivable: 28184, inventory: 4946, propertyPlantEquipment: 42117,
        goodwill: 0, intangibleAssets: 0, totalLiabilities: 302083, currentLiabilities: 153982,
        accountsPayable: 64115, shortTermDebt: 21110, longTermDebt: 98959,
        totalDebt: 120069, netDebt: 71765, totalEquity: 50672, retainedEarnings: -3068,
        treasuryStock: 0, sharesOutstanding: 15943
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-09-25',
        totalAssets: 351002, currentAssets: 134836, cash: 34940, shortTermInvestments: 27699,
        accountsReceivable: 26278, inventory: 6580, propertyPlantEquipment: 39440,
        goodwill: 0, intangibleAssets: 0, totalLiabilities: 287912, currentLiabilities: 125481,
        accountsPayable: 54763, shortTermDebt: 15613, longTermDebt: 109106,
        totalDebt: 124719, netDebt: 62080, totalEquity: 63090, retainedEarnings: 5562,
        treasuryStock: 0, sharesOutstanding: 16426
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-09-26',
        totalAssets: 323888, currentAssets: 143713, cash: 38016, shortTermInvestments: 52927,
        accountsReceivable: 16120, inventory: 4061, propertyPlantEquipment: 36766,
        goodwill: 0, intangibleAssets: 0, totalLiabilities: 258549, currentLiabilities: 105392,
        accountsPayable: 42296, shortTermDebt: 13769, longTermDebt: 98667,
        totalDebt: 112436, netDebt: 21493, totalEquity: 65339, retainedEarnings: 14966,
        treasuryStock: 0, sharesOutstanding: 16976
      }
    ],
    cashFlows: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-09-28',
        operatingCashFlow: 118254, investingCashFlow: 2935, financingCashFlow: -121983,
        capitalExpenditures: 9447, freeCashFlow: 108807, depreciation: 11445,
        dividendsPaid: 15234, shareBuybacks: 94949, debtIssued: 0, debtRepaid: 9958
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-09-30',
        operatingCashFlow: 110543, investingCashFlow: 3705, financingCashFlow: -108488,
        capitalExpenditures: 10959, freeCashFlow: 99584, depreciation: 11519,
        dividendsPaid: 15025, shareBuybacks: 77550, debtIssued: 5228, debtRepaid: 11151
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-09-24',
        operatingCashFlow: 122151, investingCashFlow: -22354, financingCashFlow: -110749,
        capitalExpenditures: 10708, freeCashFlow: 111443, depreciation: 11104,
        dividendsPaid: 14841, shareBuybacks: 89402, debtIssued: 5465, debtRepaid: 9543
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-09-25',
        operatingCashFlow: 104038, investingCashFlow: -14545, financingCashFlow: -93353,
        capitalExpenditures: 11085, freeCashFlow: 92953, depreciation: 11284,
        dividendsPaid: 14467, shareBuybacks: 85971, debtIssued: 20393, debtRepaid: 8750
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-09-26',
        operatingCashFlow: 80674, investingCashFlow: -4289, financingCashFlow: -86820,
        capitalExpenditures: 7309, freeCashFlow: 73365, depreciation: 11056,
        dividendsPaid: 14081, shareBuybacks: 72358, debtIssued: 16091, debtRepaid: 12629
      }
    ]
  },

  MSFT: {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    cik: '0000789019',
    sector: 'Enterprise Cloud & Software',
    archetype: 'High-Margin Recurring Cloud & AI CapEx Compounder',
    description: 'Enterprise software and Azure cloud leader combining 70% gross margins, massive operating cash flow, and heavy AI data-center CapEx reinvestment.',
    formType: '10-K',
    source: 'snapshot',
    profile: {
      price: 428.00,
      beta: 0.98,
      sharesOutstanding: 7434,
      marketCap: 3181752,
      riskFreeRate: 0.042,
      equityRiskPremium: 0.05,
      peerMultiples: { pe: 31.0, evEbitda: 23.5, pb: 11.5, pfcf: 34.0 }
    },
    incomeStatements: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-06-30',
        revenue: 245122, costOfRevenue: 74114, grossProfit: 171008,
        researchAndDevelopment: 29510, sellingGeneralAndAdmin: 32065,
        operatingIncome: 109433, ebit: 109433, depreciation: 22287, ebitda: 131720,
        interestExpense: 2935, ebt: 107787, taxExpense: 19651, netIncome: 88136,
        epsBasic: 11.86, epsDiluted: 11.80, sharesBasic: 7431, sharesDiluted: 7469
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-06-30',
        revenue: 211915, costOfRevenue: 65863, grossProfit: 146052,
        researchAndDevelopment: 27195, sellingGeneralAndAdmin: 30334,
        operatingIncome: 88523, ebit: 88523, depreciation: 13861, ebitda: 102384,
        interestExpense: 1968, ebt: 89311, taxExpense: 16950, netIncome: 72361,
        epsBasic: 9.72, epsDiluted: 9.68, sharesBasic: 7446, sharesDiluted: 7472
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-06-30',
        revenue: 198270, costOfRevenue: 62650, grossProfit: 135620,
        researchAndDevelopment: 24512, sellingGeneralAndAdmin: 27725,
        operatingIncome: 83383, ebit: 83383, depreciation: 14460, ebitda: 97843,
        interestExpense: 2063, ebt: 83716, taxExpense: 10978, netIncome: 72738,
        epsBasic: 9.70, epsDiluted: 9.65, sharesBasic: 7496, sharesDiluted: 7540
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-06-30',
        revenue: 168088, costOfRevenue: 52232, grossProfit: 115856,
        researchAndDevelopment: 20716, sellingGeneralAndAdmin: 25224,
        operatingIncome: 69916, ebit: 69916, depreciation: 11686, ebitda: 81602,
        interestExpense: 2346, ebt: 71102, taxExpense: 9831, netIncome: 61271,
        epsBasic: 8.12, epsDiluted: 8.05, sharesBasic: 7547, sharesDiluted: 7608
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-06-30',
        revenue: 143015, costOfRevenue: 46078, grossProfit: 96937,
        researchAndDevelopment: 19269, sellingGeneralAndAdmin: 24709,
        operatingIncome: 52959, ebit: 52959, depreciation: 12796, ebitda: 65755,
        interestExpense: 2591, ebt: 53036, taxExpense: 8755, netIncome: 44281,
        epsBasic: 5.82, epsDiluted: 5.76, sharesBasic: 7610, sharesDiluted: 7683
      }
    ],
    balanceSheets: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-06-30',
        totalAssets: 512163, currentAssets: 159734, cash: 18315, shortTermInvestments: 57228,
        accountsReceivable: 56924, inventory: 1246, propertyPlantEquipment: 135591,
        goodwill: 119220, intangibleAssets: 27597, totalLiabilities: 243686, currentLiabilities: 125286,
        accountsPayable: 21996, shortTermDebt: 6693, longTermDebt: 42688,
        totalDebt: 49381, netDebt: -26162, totalEquity: 268477, retainedEarnings: 173144,
        treasuryStock: 0, sharesOutstanding: 7434
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-06-30',
        totalAssets: 411976, currentAssets: 184257, cash: 34704, shortTermInvestments: 76558,
        accountsReceivable: 48688, inventory: 2500, propertyPlantEquipment: 95641,
        goodwill: 67886, intangibleAssets: 9366, totalLiabilities: 205753, currentLiabilities: 104149,
        accountsPayable: 18095, shortTermDebt: 5247, longTermDebt: 41990,
        totalDebt: 47237, netDebt: -64025, totalEquity: 206223, retainedEarnings: 118848,
        treasuryStock: 0, sharesOutstanding: 7432
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-06-30',
        totalAssets: 364840, currentAssets: 169684, cash: 13931, shortTermInvestments: 90826,
        accountsReceivable: 44261, inventory: 3742, propertyPlantEquipment: 74398,
        goodwill: 67524, intangibleAssets: 11298, totalLiabilities: 198298, currentLiabilities: 95082,
        accountsPayable: 19000, shortTermDebt: 2749, longTermDebt: 47032,
        totalDebt: 49781, netDebt: -54976, totalEquity: 166542, retainedEarnings: 84281,
        treasuryStock: 0, sharesOutstanding: 7464
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-06-30',
        totalAssets: 333779, currentAssets: 184406, cash: 14224, shortTermInvestments: 116110,
        accountsReceivable: 38043, inventory: 2636, propertyPlantEquipment: 59715,
        goodwill: 49711, intangibleAssets: 7800, totalLiabilities: 191791, currentLiabilities: 88657,
        accountsPayable: 15163, shortTermDebt: 8072, longTermDebt: 50074,
        totalDebt: 58146, netDebt: -72188, totalEquity: 141988, retainedEarnings: 57055,
        treasuryStock: 0, sharesOutstanding: 7519
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-06-30',
        totalAssets: 301311, currentAssets: 181915, cash: 13576, shortTermInvestments: 122951,
        accountsReceivable: 32011, inventory: 1895, propertyPlantEquipment: 44151,
        goodwill: 43351, intangibleAssets: 7038, totalLiabilities: 183007, currentLiabilities: 72310,
        accountsPayable: 12530, shortTermDebt: 3749, longTermDebt: 59578,
        totalDebt: 63327, netDebt: -73200, totalEquity: 118304, retainedEarnings: 34566,
        treasuryStock: 0, sharesOutstanding: 7571
      }
    ],
    cashFlows: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-06-30',
        operatingCashFlow: 118548, investingCashFlow: -96970, financingCashFlow: -37757,
        capitalExpenditures: 44477, freeCashFlow: 74071, depreciation: 22287,
        dividendsPaid: 21771, shareBuybacks: 17254, debtIssued: 24300, debtRepaid: 29070
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-06-30',
        operatingCashFlow: 87582, investingCashFlow: -22680, financingCashFlow: -43935,
        capitalExpenditures: 28107, freeCashFlow: 59475, depreciation: 13861,
        dividendsPaid: 19800, shareBuybacks: 22245, debtIssued: 0, debtRepaid: 2750
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-06-30',
        operatingCashFlow: 89035, investingCashFlow: -30311, financingCashFlow: -58876,
        capitalExpenditures: 23886, freeCashFlow: 65149, depreciation: 14460,
        dividendsPaid: 18135, shareBuybacks: 32696, debtIssued: 0, debtRepaid: 9023
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-06-30',
        operatingCashFlow: 76740, investingCashFlow: -27577, financingCashFlow: -48486,
        capitalExpenditures: 20622, freeCashFlow: 56118, depreciation: 11686,
        dividendsPaid: 16521, shareBuybacks: 27385, debtIssued: 0, debtRepaid: 3750
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-06-30',
        operatingCashFlow: 60675, investingCashFlow: -12223, financingCashFlow: -46031,
        capitalExpenditures: 15441, freeCashFlow: 45234, depreciation: 12796,
        dividendsPaid: 15137, shareBuybacks: 22968, debtIssued: 0, debtRepaid: 5518
      }
    ]
  },

  COST: {
    ticker: 'COST',
    name: 'Costco Wholesale Corporation',
    cik: '0000909832',
    sector: 'Warehouse Club Retail',
    archetype: 'High Asset Turnover & Low Margin DuPont Archetype',
    description: 'Textbook DuPont velocity business: ~3.6% operating margin multiplied by >3.5x invested capital turnover and membership fee annuity stream.',
    formType: '10-K',
    source: 'snapshot',
    profile: {
      price: 885.00,
      beta: 0.78,
      sharesOutstanding: 443,
      marketCap: 392055,
      riskFreeRate: 0.042,
      equityRiskPremium: 0.05,
      peerMultiples: { pe: 46.0, evEbitda: 30.0, pb: 14.0, pfcf: 42.0 }
    },
    incomeStatements: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-09-01',
        revenue: 254453, costOfRevenue: 222358, grossProfit: 32095,
        researchAndDevelopment: 0, sellingGeneralAndAdmin: 22810,
        operatingIncome: 9285, ebit: 9285, depreciation: 2237, ebitda: 11522,
        interestExpense: 169, ebt: 9740, taxExpense: 2373, netIncome: 7367,
        epsBasic: 16.59, epsDiluted: 16.56, sharesBasic: 444, sharesDiluted: 445
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-09-03',
        revenue: 242290, costOfRevenue: 212586, grossProfit: 29704,
        researchAndDevelopment: 0, sellingGeneralAndAdmin: 21590,
        operatingIncome: 8114, ebit: 8114, depreciation: 2077, ebitda: 10191,
        interestExpense: 160, ebt: 8487, taxExpense: 2195, netIncome: 6292,
        epsBasic: 14.18, epsDiluted: 14.16, sharesBasic: 444, sharesDiluted: 444
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-08-28',
        revenue: 226954, costOfRevenue: 199382, grossProfit: 27572,
        researchAndDevelopment: 0, sellingGeneralAndAdmin: 19779,
        operatingIncome: 7793, ebit: 7793, depreciation: 1900, ebitda: 9693,
        interestExpense: 158, ebt: 7840, taxExpense: 1996, netIncome: 5844,
        epsBasic: 13.17, epsDiluted: 13.14, sharesBasic: 444, sharesDiluted: 445
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-08-29',
        revenue: 195929, costOfRevenue: 170684, grossProfit: 25245,
        researchAndDevelopment: 0, sellingGeneralAndAdmin: 18537,
        operatingIncome: 6708, ebit: 6708, depreciation: 1781, ebitda: 8489,
        interestExpense: 171, ebt: 6680, taxExpense: 1673, netIncome: 5007,
        epsBasic: 11.30, epsDiluted: 11.27, sharesBasic: 443, sharesDiluted: 444
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-08-30',
        revenue: 166761, costOfRevenue: 144939, grossProfit: 21822,
        researchAndDevelopment: 0, sellingGeneralAndAdmin: 16387,
        operatingIncome: 5435, ebit: 5435, depreciation: 1645, ebitda: 7080,
        interestExpense: 160, ebt: 5367, taxExpense: 1365, netIncome: 4002,
        epsBasic: 9.05, epsDiluted: 9.02, sharesBasic: 442, sharesDiluted: 444
      }
    ],
    balanceSheets: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-09-01',
        totalAssets: 69831, currentAssets: 34246, cash: 9906, shortTermInvestments: 1238,
        accountsReceivable: 2721, inventory: 18647, propertyPlantEquipment: 29032,
        goodwill: 994, intangibleAssets: 0, totalLiabilities: 46209, currentLiabilities: 35464,
        accountsPayable: 19421, shortTermDebt: 103, longTermDebt: 5794,
        totalDebt: 5897, netDebt: -5247, totalEquity: 23622, retainedEarnings: 19791,
        treasuryStock: 0, sharesOutstanding: 443
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-09-03',
        totalAssets: 68994, currentAssets: 35879, cash: 13700, shortTermInvestments: 1534,
        accountsReceivable: 2285, inventory: 16651, propertyPlantEquipment: 26684,
        goodwill: 994, intangibleAssets: 0, totalLiabilities: 43936, currentLiabilities: 33583,
        accountsPayable: 17483, shortTermDebt: 1081, longTermDebt: 5377,
        totalDebt: 6458, netDebt: -8776, totalEquity: 25058, retainedEarnings: 21055,
        treasuryStock: 0, sharesOutstanding: 443
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-08-28',
        totalAssets: 64166, currentAssets: 32696, cash: 10203, shortTermInvestments: 846,
        accountsReceivable: 2241, inventory: 17907, propertyPlantEquipment: 24646,
        goodwill: 993, intangibleAssets: 0, totalLiabilities: 43519, currentLiabilities: 31998,
        accountsPayable: 17848, shortTermDebt: 73, longTermDebt: 6484,
        totalDebt: 6557, netDebt: -4492, totalEquity: 20647, retainedEarnings: 16695,
        treasuryStock: 0, sharesOutstanding: 443
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-08-29',
        totalAssets: 59268, currentAssets: 29505, cash: 11258, shortTermInvestments: 917,
        accountsReceivable: 1803, inventory: 14215, propertyPlantEquipment: 23492,
        goodwill: 996, intangibleAssets: 0, totalLiabilities: 41190, currentLiabilities: 29441,
        accountsPayable: 16278, shortTermDebt: 799, longTermDebt: 6692,
        totalDebt: 7491, netDebt: -4684, totalEquity: 18078, retainedEarnings: 13831,
        treasuryStock: 0, sharesOutstanding: 443
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-08-30',
        totalAssets: 55556, currentAssets: 28120, cash: 12277, shortTermInvestments: 1028,
        accountsReceivable: 1550, inventory: 12242, propertyPlantEquipment: 21807,
        goodwill: 995, intangibleAssets: 0, totalLiabilities: 36851, currentLiabilities: 24844,
        accountsPayable: 14172, shortTermDebt: 95, longTermDebt: 7514,
        totalDebt: 7609, netDebt: -5696, totalEquity: 18705, retainedEarnings: 14191,
        treasuryStock: 0, sharesOutstanding: 442
      }
    ],
    cashFlows: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-09-01',
        operatingCashFlow: 11339, investingCashFlow: -4409, financingCashFlow: -10762,
        capitalExpenditures: 4710, freeCashFlow: 6629, depreciation: 2237,
        dividendsPaid: 9041, shareBuybacks: 700, debtIssued: 0, debtRepaid: 1000
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-09-03',
        operatingCashFlow: 11068, investingCashFlow: -4972, financingCashFlow: -2614,
        capitalExpenditures: 4323, freeCashFlow: 6745, depreciation: 2077,
        dividendsPaid: 1711, shareBuybacks: 676, debtIssued: 0, debtRepaid: 75
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-08-28',
        operatingCashFlow: 7392, investingCashFlow: -3915, financingCashFlow: -4283,
        capitalExpenditures: 3891, freeCashFlow: 3501, depreciation: 1900,
        dividendsPaid: 1498, shareBuybacks: 439, debtIssued: 0, debtRepaid: 800
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-08-29',
        operatingCashFlow: 8958, investingCashFlow: -3535, financingCashFlow: -6488,
        capitalExpenditures: 3588, freeCashFlow: 5370, depreciation: 1781,
        dividendsPaid: 5748, shareBuybacks: 495, debtIssued: 0, debtRepaid: 94
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-08-30',
        operatingCashFlow: 8861, investingCashFlow: -3891, financingCashFlow: -1147,
        capitalExpenditures: 2810, freeCashFlow: 6051, depreciation: 1645,
        dividendsPaid: 1479, shareBuybacks: 198, debtIssued: 3982, debtRepaid: 3200
      }
    ]
  },

  CAT: {
    ticker: 'CAT',
    name: 'Caterpillar Inc.',
    cik: '0000018230',
    sector: 'Heavy Industrial Machinery',
    archetype: 'Capital-Intensive Industrial Cyclical & Financial Leverage',
    description: 'Global construction and mining equipment manufacturer illustrating operating leverage, inventory/receivable working capital cycles, and captive finance debt.',
    formType: '10-K',
    source: 'snapshot',
    profile: {
      price: 382.00,
      beta: 1.12,
      sharesOutstanding: 485,
      marketCap: 185270,
      riskFreeRate: 0.042,
      equityRiskPremium: 0.05,
      peerMultiples: { pe: 17.5, evEbitda: 12.5, pb: 8.5, pfcf: 18.0 }
    },
    incomeStatements: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-12-31',
        revenue: 64809, costOfRevenue: 41478, grossProfit: 23331,
        researchAndDevelopment: 2108, sellingGeneralAndAdmin: 6515,
        operatingIncome: 13072, ebit: 13072, depreciation: 2152, ebitda: 15224,
        interestExpense: 590, ebt: 13440, taxExpense: 2648, netIncome: 10792,
        epsBasic: 22.17, epsDiluted: 22.05, sharesBasic: 487, sharesDiluted: 489
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-12-31',
        revenue: 67060, costOfRevenue: 43934, grossProfit: 23126,
        researchAndDevelopment: 2108, sellingGeneralAndAdmin: 6320,
        operatingIncome: 12966, ebit: 12966, depreciation: 2201, ebitda: 15167,
        interestExpense: 511, ebt: 13050, taxExpense: 2715, netIncome: 10335,
        epsBasic: 20.23, epsDiluted: 20.12, sharesBasic: 511, sharesDiluted: 514
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-12-31',
        revenue: 59427, costOfRevenue: 41550, grossProfit: 17877,
        researchAndDevelopment: 1933, sellingGeneralAndAdmin: 5669,
        operatingIncome: 7904, ebit: 7904, depreciation: 2219, ebitda: 10123,
        interestExpense: 443, ebt: 8752, taxExpense: 2048, netIncome: 6704,
        epsBasic: 12.72, epsDiluted: 12.64, sharesBasic: 527, sharesDiluted: 530
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-12-31',
        revenue: 50971, costOfRevenue: 35513, grossProfit: 15458,
        researchAndDevelopment: 1686, sellingGeneralAndAdmin: 5365,
        operatingIncome: 6878, ebit: 6878, depreciation: 2352, ebitda: 9230,
        interestExpense: 488, ebt: 8231, taxExpense: 1742, netIncome: 6489,
        epsBasic: 11.93, epsDiluted: 11.83, sharesBasic: 544, sharesDiluted: 548
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-12-31',
        revenue: 41748, costOfRevenue: 29592, grossProfit: 12156,
        researchAndDevelopment: 1415, sellingGeneralAndAdmin: 4642,
        operatingIncome: 4553, ebit: 4553, depreciation: 2432, ebitda: 6985,
        interestExpense: 514, ebt: 3995, taxExpense: 997, netIncome: 2998,
        epsBasic: 5.51, epsDiluted: 5.46, sharesBasic: 544, sharesDiluted: 549
      }
    ],
    balanceSheets: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-12-31',
        totalAssets: 87764, currentAssets: 43120, cash: 6890, shortTermInvestments: 0,
        accountsReceivable: 19450, inventory: 16210, propertyPlantEquipment: 12650,
        goodwill: 5310, intangibleAssets: 610, totalLiabilities: 68274, currentLiabilities: 31180,
        accountsPayable: 7940, shortTermDebt: 11420, longTermDebt: 26350,
        totalDebt: 37770, netDebt: 30880, totalEquity: 19490, retainedEarnings: 51420,
        treasuryStock: 36800, sharesOutstanding: 485
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-12-31',
        totalAssets: 87476, currentAssets: 43691, cash: 6978, shortTermInvestments: 0,
        accountsReceivable: 19225, inventory: 16565, propertyPlantEquipment: 12369,
        goodwill: 5308, intangibleAssets: 709, totalLiabilities: 67973, currentLiabilities: 31157,
        accountsPayable: 7906, shortTermDebt: 11267, longTermDebt: 25714,
        totalDebt: 36981, netDebt: 30003, totalEquity: 19503, retainedEarnings: 47395,
        treasuryStock: 31800, sharesOutstanding: 500
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-12-31',
        totalAssets: 81943, currentAssets: 40755, cash: 7004, shortTermInvestments: 0,
        accountsReceivable: 17565, inventory: 16270, propertyPlantEquipment: 11859,
        goodwill: 5288, intangibleAssets: 858, totalLiabilities: 66052, currentLiabilities: 29548,
        accountsPayable: 8689, shortTermDebt: 10942, longTermDebt: 25714,
        totalDebt: 36656, netDebt: 29652, totalEquity: 15891, retainedEarnings: 43195,
        treasuryStock: 27100, sharesOutstanding: 516
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-12-31',
        totalAssets: 82793, currentAssets: 41684, cash: 9254, shortTermInvestments: 0,
        accountsReceivable: 17205, inventory: 14038, propertyPlantEquipment: 12090,
        goodwill: 6324, intangibleAssets: 1142, totalLiabilities: 66277, currentLiabilities: 28067,
        accountsPayable: 8154, shortTermDebt: 10432, longTermDebt: 26033,
        totalDebt: 36465, netDebt: 27211, totalEquity: 16516, retainedEarnings: 39082,
        treasuryStock: 23000, sharesOutstanding: 535
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-12-31',
        totalAssets: 78324, currentAssets: 39464, cash: 9352, shortTermInvestments: 0,
        accountsReceivable: 16199, inventory: 11402, propertyPlantEquipment: 12401,
        goodwill: 6394, intangibleAssets: 1398, totalLiabilities: 62946, currentLiabilities: 25717,
        accountsPayable: 6128, shortTermDebt: 9920, longTermDebt: 25999,
        totalDebt: 35919, netDebt: 26567, totalEquity: 15378, retainedEarnings: 35167,
        treasuryStock: 20400, sharesOutstanding: 545
      }
    ],
    cashFlows: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-12-31',
        operatingCashFlow: 12035, investingCashFlow: -2840, financingCashFlow: -9280,
        capitalExpenditures: 2610, freeCashFlow: 9425, depreciation: 2152,
        dividendsPaid: 2640, shareBuybacks: 7710, debtIssued: 6200, debtRepaid: 5410
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-12-31',
        operatingCashFlow: 12888, investingCashFlow: -3482, financingCashFlow: -9432,
        capitalExpenditures: 3092, freeCashFlow: 9796, depreciation: 2201,
        dividendsPaid: 2563, shareBuybacks: 4978, debtIssued: 5890, debtRepaid: 5565
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-12-31',
        operatingCashFlow: 7766, investingCashFlow: -2936, financingCashFlow: -7080,
        capitalExpenditures: 2608, freeCashFlow: 5158, depreciation: 2219,
        dividendsPaid: 2440, shareBuybacks: 4230, debtIssued: 5100, debtRepaid: 4910
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-12-31',
        operatingCashFlow: 7198, investingCashFlow: -2482, financingCashFlow: -4814,
        capitalExpenditures: 2472, freeCashFlow: 4726, depreciation: 2352,
        dividendsPaid: 2332, shareBuybacks: 2668, debtIssued: 5200, debtRepaid: 4654
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-12-31',
        operatingCashFlow: 6327, investingCashFlow: -2115, financingCashFlow: -3140,
        capitalExpenditures: 2115, freeCashFlow: 4212, depreciation: 2432,
        dividendsPaid: 2243, shareBuybacks: 1130, debtIssued: 4800, debtRepaid: 4570
      }
    ]
  },

  NEE: {
    ticker: 'NEE',
    name: 'NextEra Energy, Inc.',
    cik: '0000753308',
    sector: 'Regulated Electric Utility & Renewables',
    archetype: 'Capital-Intensive Regulated Infrastructure & Debt Tax Shield',
    description: 'High-CapEx utility and renewable power operator demonstrating negative free cash flow during expansion, low asset beta, and optimal debt tax-shield leverage.',
    formType: '10-K',
    source: 'snapshot',
    profile: {
      price: 78.00,
      beta: 0.56,
      sharesOutstanding: 2055,
      marketCap: 160290,
      riskFreeRate: 0.042,
      equityRiskPremium: 0.05,
      peerMultiples: { pe: 21.0, evEbitda: 14.5, pb: 3.1, pfcf: 25.0 }
    },
    incomeStatements: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-12-31',
        revenue: 27450, costOfRevenue: 11240, grossProfit: 16210,
        researchAndDevelopment: 0, sellingGeneralAndAdmin: 3920,
        operatingIncome: 8420, ebit: 8420, depreciation: 5890, ebitda: 14310,
        interestExpense: 3180, ebt: 7890, taxExpense: 945, netIncome: 6945,
        epsBasic: 3.38, epsDiluted: 3.37, sharesBasic: 2055, sharesDiluted: 2061
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-12-31',
        revenue: 28114, costOfRevenue: 11890, grossProfit: 16224,
        researchAndDevelopment: 0, sellingGeneralAndAdmin: 3810,
        operatingIncome: 8950, ebit: 8950, depreciation: 5460, ebitda: 14410,
        interestExpense: 2940, ebt: 8320, taxExpense: 1010, netIncome: 7310,
        epsBasic: 3.61, epsDiluted: 3.60, sharesBasic: 2025, sharesDiluted: 2030
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-12-31',
        revenue: 20956, costOfRevenue: 9820, grossProfit: 11136,
        researchAndDevelopment: 0, sellingGeneralAndAdmin: 3420,
        operatingIncome: 5210, ebit: 5210, depreciation: 4780, ebitda: 9990,
        interestExpense: 1980, ebt: 4820, taxExpense: 673, netIncome: 4147,
        epsBasic: 2.11, epsDiluted: 2.10, sharesBasic: 1968, sharesDiluted: 1975
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-12-31',
        revenue: 17069, costOfRevenue: 8140, grossProfit: 8929,
        researchAndDevelopment: 0, sellingGeneralAndAdmin: 3110,
        operatingIncome: 3980, ebit: 3980, depreciation: 4320, ebitda: 8300,
        interestExpense: 1620, ebt: 4110, taxExpense: 537, netIncome: 3573,
        epsBasic: 1.82, epsDiluted: 1.81, sharesBasic: 1962, sharesDiluted: 1970
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-12-31',
        revenue: 17997, costOfRevenue: 8290, grossProfit: 9707,
        researchAndDevelopment: 0, sellingGeneralAndAdmin: 2980,
        operatingIncome: 4410, ebit: 4410, depreciation: 4050, ebitda: 8460,
        interestExpense: 1750, ebt: 3340, taxExpense: 421, netIncome: 2919,
        epsBasic: 1.49, epsDiluted: 1.48, sharesBasic: 1958, sharesDiluted: 1966
      }
    ],
    balanceSheets: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-12-31',
        totalAssets: 186400, currentAssets: 14820, cash: 2140, shortTermInvestments: 0,
        accountsReceivable: 4680, inventory: 2390, propertyPlantEquipment: 138400,
        goodwill: 5120, intangibleAssets: 1180, totalLiabilities: 134200, currentLiabilities: 28900,
        accountsPayable: 6420, shortTermDebt: 13450, longTermDebt: 68900,
        totalDebt: 82350, netDebt: 80210, totalEquity: 52200, retainedEarnings: 32900,
        treasuryStock: 0, sharesOutstanding: 2055
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-12-31',
        totalAssets: 177489, currentAssets: 14310, cash: 2690, shortTermInvestments: 0,
        accountsReceivable: 4420, inventory: 2210, propertyPlantEquipment: 129800,
        goodwill: 5090, intangibleAssets: 1240, totalLiabilities: 128140, currentLiabilities: 27400,
        accountsPayable: 6180, shortTermDebt: 12900, longTermDebt: 61400,
        totalDebt: 74300, netDebt: 71610, totalEquity: 49349, retainedEarnings: 29850,
        treasuryStock: 0, sharesOutstanding: 2052
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-12-31',
        totalAssets: 158935, currentAssets: 13490, cash: 1601, shortTermInvestments: 0,
        accountsReceivable: 4310, inventory: 1980, propertyPlantEquipment: 115400,
        goodwill: 4890, intangibleAssets: 1310, totalLiabilities: 116890, currentLiabilities: 25800,
        accountsPayable: 5890, shortTermDebt: 11400, longTermDebt: 55200,
        totalDebt: 66600, netDebt: 64999, totalEquity: 42045, retainedEarnings: 26240,
        treasuryStock: 0, sharesOutstanding: 1987
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-12-31',
        totalAssets: 140912, currentAssets: 11240, cash: 639, shortTermInvestments: 0,
        accountsReceivable: 3580, inventory: 1640, propertyPlantEquipment: 103200,
        goodwill: 4840, intangibleAssets: 1380, totalLiabilities: 103700, currentLiabilities: 21900,
        accountsPayable: 4920, shortTermDebt: 9800, longTermDebt: 50900,
        totalDebt: 60700, netDebt: 60061, totalEquity: 37212, retainedEarnings: 25410,
        treasuryStock: 0, sharesOutstanding: 1964
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-12-31',
        totalAssets: 127684, currentAssets: 9840, cash: 1105, shortTermInvestments: 0,
        accountsReceivable: 3120, inventory: 1510, propertyPlantEquipment: 93800,
        goodwill: 4210, intangibleAssets: 1420, totalLiabilities: 91200, currentLiabilities: 19400,
        accountsPayable: 4310, shortTermDebt: 8900, longTermDebt: 44600,
        totalDebt: 53500, netDebt: 52395, totalEquity: 36484, retainedEarnings: 24890,
        treasuryStock: 0, sharesOutstanding: 1959
      }
    ],
    cashFlows: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-12-31',
        operatingCashFlow: 13240, investingCashFlow: -21400, financingCashFlow: 7610,
        capitalExpenditures: 19800, freeCashFlow: -6560, depreciation: 5890,
        dividendsPaid: 4230, shareBuybacks: 0, debtIssued: 14200, debtRepaid: 6150
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-12-31',
        operatingCashFlow: 11300, investingCashFlow: -20100, financingCashFlow: 9889,
        capitalExpenditures: 18900, freeCashFlow: -7600, depreciation: 5460,
        dividendsPaid: 3780, shareBuybacks: 0, debtIssued: 13500, debtRepaid: 5800
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-12-31',
        operatingCashFlow: 8260, investingCashFlow: -17800, financingCashFlow: 10502,
        capitalExpenditures: 16400, freeCashFlow: -8140, depreciation: 4780,
        dividendsPaid: 3360, shareBuybacks: 0, debtIssued: 11900, debtRepaid: 6000
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-12-31',
        operatingCashFlow: 7550, investingCashFlow: -15200, financingCashFlow: 7184,
        capitalExpenditures: 14100, freeCashFlow: -6550, depreciation: 4320,
        dividendsPaid: 3020, shareBuybacks: 0, debtIssued: 11200, debtRepaid: 4000
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-12-31',
        operatingCashFlow: 7980, investingCashFlow: -13900, financingCashFlow: 6425,
        capitalExpenditures: 12800, freeCashFlow: -4820, depreciation: 4050,
        dividendsPaid: 2740, shareBuybacks: 0, debtIssued: 10400, debtRepaid: 3800
      }
    ]
  },

  SAAS: {
    ticker: 'SAAS',
    name: 'CloudScale SaaS Corp. (Archetype)',
    cik: '0009999001',
    sector: 'High-Growth B2B Cloud Software',
    archetype: 'High SBC, Deferred Revenue & Rule-of-40 SaaS Archetype',
    description: 'High-growth enterprise SaaS archetype with 78% gross margins, upfront annual billings (negative WCR via deferred revenue), and significant ASC 718 stock-based compensation.',
    formType: '10-K',
    source: 'snapshot',
    profile: {
      price: 145.00,
      beta: 1.45,
      sharesOutstanding: 340,
      marketCap: 49300,
      riskFreeRate: 0.042,
      equityRiskPremium: 0.055,
      peerMultiples: { pe: 55.0, evEbitda: 38.0, pb: 12.0, pfcf: 32.0 }
    },
    incomeStatements: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-01-31',
        revenue: 3650, costOfRevenue: 803, grossProfit: 2847,
        researchAndDevelopment: 985, sellingGeneralAndAdmin: 1350,
        operatingIncome: 512, ebit: 512, depreciation: 148, ebitda: 660,
        interestExpense: 18, ebt: 640, taxExpense: 115, netIncome: 525,
        epsBasic: 1.56, epsDiluted: 1.54, sharesBasic: 336, sharesDiluted: 340
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-01-31',
        revenue: 2890, costOfRevenue: 665, grossProfit: 2225,
        researchAndDevelopment: 840, sellingGeneralAndAdmin: 1155,
        operatingIncome: 230, ebit: 230, depreciation: 122, ebitda: 352,
        interestExpense: 18, ebt: 295, taxExpense: 53, netIncome: 242,
        epsBasic: 0.74, epsDiluted: 0.72, sharesBasic: 328, sharesDiluted: 334
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-01-31',
        revenue: 2180, costOfRevenue: 523, grossProfit: 1657,
        researchAndDevelopment: 698, sellingGeneralAndAdmin: 960,
        operatingIncome: -1, ebit: -1, depreciation: 98, ebitda: 97,
        interestExpense: 15, ebt: 12, taxExpense: 10, netIncome: 2,
        epsBasic: 0.01, epsDiluted: 0.01, sharesBasic: 318, sharesDiluted: 324
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-01-31',
        revenue: 1560, costOfRevenue: 390, grossProfit: 1170,
        researchAndDevelopment: 546, sellingGeneralAndAdmin: 764,
        operatingIncome: -140, ebit: -140, depreciation: 75, ebitda: -65,
        interestExpense: 12, ebt: -145, taxExpense: 5, netIncome: -150,
        epsBasic: -0.49, epsDiluted: -0.49, sharesBasic: 308, sharesDiluted: 308
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-01-31',
        revenue: 1080, costOfRevenue: 281, grossProfit: 799,
        researchAndDevelopment: 410, sellingGeneralAndAdmin: 572,
        operatingIncome: -183, ebit: -183, depreciation: 55, ebitda: -128,
        interestExpense: 10, ebt: -188, taxExpense: 4, netIncome: -192,
        epsBasic: -0.64, epsDiluted: -0.64, sharesBasic: 298, sharesDiluted: 298
      }
    ],
    balanceSheets: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-01-31',
        totalAssets: 8420, currentAssets: 5890, cash: 2450, shortTermInvestments: 2180,
        accountsReceivable: 940, inventory: 0, propertyPlantEquipment: 480,
        goodwill: 1420, intangibleAssets: 310, totalLiabilities: 3820, currentLiabilities: 2680,
        accountsPayable: 210, shortTermDebt: 0, longTermDebt: 750,
        totalDebt: 750, netDebt: -3880, totalEquity: 4600, retainedEarnings: 120,
        treasuryStock: 0, sharesOutstanding: 340
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-01-31',
        totalAssets: 6980, currentAssets: 4690, cash: 1920, shortTermInvestments: 1780,
        accountsReceivable: 760, inventory: 0, propertyPlantEquipment: 410,
        goodwill: 1380, intangibleAssets: 290, totalLiabilities: 3340, currentLiabilities: 2210,
        accountsPayable: 175, shortTermDebt: 0, longTermDebt: 750,
        totalDebt: 750, netDebt: -2950, totalEquity: 3640, retainedEarnings: -405,
        treasuryStock: 0, sharesOutstanding: 332
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-01-31',
        totalAssets: 5640, currentAssets: 3720, cash: 1580, shortTermInvestments: 1390,
        accountsReceivable: 580, inventory: 0, propertyPlantEquipment: 340,
        goodwill: 1120, intangibleAssets: 260, totalLiabilities: 2790, currentLiabilities: 1760,
        accountsPayable: 140, shortTermDebt: 0, longTermDebt: 750,
        totalDebt: 750, netDebt: -2220, totalEquity: 2850, retainedEarnings: -647,
        treasuryStock: 0, sharesOutstanding: 322
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-01-31',
        totalAssets: 4410, currentAssets: 2940, cash: 1320, shortTermInvestments: 1080,
        accountsReceivable: 410, inventory: 0, propertyPlantEquipment: 270,
        goodwill: 840, intangibleAssets: 210, totalLiabilities: 2190, currentLiabilities: 1320,
        accountsPayable: 105, shortTermDebt: 0, longTermDebt: 600,
        totalDebt: 600, netDebt: -1800, totalEquity: 2220, retainedEarnings: -649,
        treasuryStock: 0, sharesOutstanding: 312
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-01-31',
        revenue: 1080,
        totalAssets: 3420, currentAssets: 2280, cash: 1050, shortTermInvestments: 820,
        accountsReceivable: 295, inventory: 0, propertyPlantEquipment: 210,
        goodwill: 680, intangibleAssets: 170, totalLiabilities: 1690, currentLiabilities: 980,
        accountsPayable: 80, shortTermDebt: 0, longTermDebt: 500,
        totalDebt: 500, netDebt: -1370, totalEquity: 1730, retainedEarnings: -499,
        treasuryStock: 0, sharesOutstanding: 300
      }
    ],
    cashFlows: [
      {
        period: 'FY2024', fy: 2024, fp: 'FY', end: '2024-01-31',
        operatingCashFlow: 1290, investingCashFlow: -520, financingCashFlow: 180,
        capitalExpenditures: 140, freeCashFlow: 1150, depreciation: 148,
        stockBasedCompensation: 690,
        dividendsPaid: 0, shareBuybacks: 0, debtIssued: 0, debtRepaid: 0
      },
      {
        period: 'FY2023', fy: 2023, fp: 'FY', end: '2023-01-31',
        operatingCashFlow: 940, investingCashFlow: -460, financingCashFlow: 150,
        capitalExpenditures: 115, freeCashFlow: 825, depreciation: 122,
        stockBasedCompensation: 560,
        dividendsPaid: 0, shareBuybacks: 0, debtIssued: 0, debtRepaid: 0
      },
      {
        period: 'FY2022', fy: 2022, fp: 'FY', end: '2022-01-31',
        operatingCashFlow: 640, investingCashFlow: -390, financingCashFlow: 190,
        capitalExpenditures: 90, freeCashFlow: 550, depreciation: 98,
        stockBasedCompensation: 440,
        dividendsPaid: 0, shareBuybacks: 0, debtIssued: 150, debtRepaid: 0
      },
      {
        period: 'FY2021', fy: 2021, fp: 'FY', end: '2021-01-31',
        operatingCashFlow: 390, investingCashFlow: -290, financingCashFlow: 170,
        capitalExpenditures: 70, freeCashFlow: 320, depreciation: 75,
        stockBasedCompensation: 330,
        dividendsPaid: 0, shareBuybacks: 0, debtIssued: 100, debtRepaid: 0
      },
      {
        period: 'FY2020', fy: 2020, fp: 'FY', end: '2020-01-31',
        operatingCashFlow: 210, investingCashFlow: -180, financingCashFlow: 110,
        capitalExpenditures: 50, freeCashFlow: 160, depreciation: 55,
        stockBasedCompensation: 230,
        dividendsPaid: 0, shareBuybacks: 0, debtIssued: 0, debtRepaid: 0
      }
    ]
  }
};

export const SNAPSHOTS = BENCHMARK_SNAPSHOTS;
export const SNAPSHOT_LIST = Object.values(BENCHMARK_SNAPSHOTS);

export function getSnapshot(ticker) {
  const key = (ticker || 'AAPL').toUpperCase().trim();
  const snap = BENCHMARK_SNAPSHOTS[key] || BENCHMARK_SNAPSHOTS.AAPL;
  return JSON.parse(JSON.stringify(snap));
}

export function listSnapshots() {
  return Object.values(BENCHMARK_SNAPSHOTS).map(s => ({
    ticker: s.ticker,
    name: s.name,
    sector: s.sector,
    archetype: s.archetype,
    description: s.description,
    price: s.profile.price,
    marketCap: s.profile.marketCap
  }));
}
