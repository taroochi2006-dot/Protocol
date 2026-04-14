// Comprehensive list of US stocks for autocomplete
export interface StockEntry { symbol: string; name: string; sector?: string }

export const ALL_STOCKS: StockEntry[] = [
  // Mega-cap Tech
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', sector: 'Technology' },
  { symbol: 'GOOG', name: 'Alphabet Inc. (Class C)', sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Auto/EV' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology' },
  { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology' },

  // Software
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology' },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology' },
  { symbol: 'NOW', name: 'ServiceNow Inc.', sector: 'Technology' },
  { symbol: 'INTU', name: 'Intuit Inc.', sector: 'Technology' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology' },
  { symbol: 'PLTR', name: 'Palantir Technologies', sector: 'Technology' },
  { symbol: 'SHOP', name: 'Shopify Inc.', sector: 'Technology' },
  { symbol: 'CRWD', name: 'CrowdStrike Holdings', sector: 'Technology' },
  { symbol: 'PANW', name: 'Palo Alto Networks', sector: 'Technology' },
  { symbol: 'FTNT', name: 'Fortinet Inc.', sector: 'Technology' },
  { symbol: 'ZS', name: 'Zscaler Inc.', sector: 'Technology' },
  { symbol: 'DDOG', name: 'Datadog Inc.', sector: 'Technology' },
  { symbol: 'NET', name: 'Cloudflare Inc.', sector: 'Technology' },
  { symbol: 'MDB', name: 'MongoDB Inc.', sector: 'Technology' },
  { symbol: 'WDAY', name: 'Workday Inc.', sector: 'Technology' },
  { symbol: 'TEAM', name: 'Atlassian Corporation', sector: 'Technology' },
  { symbol: 'ZM', name: 'Zoom Video Communications', sector: 'Technology' },
  { symbol: 'DOCU', name: 'DocuSign Inc.', sector: 'Technology' },
  { symbol: 'OKTA', name: 'Okta Inc.', sector: 'Technology' },
  { symbol: 'TWLO', name: 'Twilio Inc.', sector: 'Technology' },
  { symbol: 'U', name: 'Unity Software Inc.', sector: 'Technology' },
  { symbol: 'PATH', name: 'UiPath Inc.', sector: 'Technology' },
  { symbol: 'AI', name: 'C3.ai Inc.', sector: 'Technology' },
  { symbol: 'BBAI', name: 'BigBear.ai Holdings', sector: 'Technology' },

  // Semiconductors
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Semiconductors' },
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Semiconductors' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', sector: 'Semiconductors' },
  { symbol: 'ARM', name: 'Arm Holdings plc', sector: 'Semiconductors' },
  { symbol: 'TSM', name: 'Taiwan Semiconductor (ADR)', sector: 'Semiconductors' },
  { symbol: 'ASML', name: 'ASML Holding N.V.', sector: 'Semiconductors' },
  { symbol: 'MU', name: 'Micron Technology', sector: 'Semiconductors' },
  { symbol: 'SMCI', name: 'Super Micro Computer', sector: 'Semiconductors' },
  { symbol: 'AMAT', name: 'Applied Materials Inc.', sector: 'Semiconductors' },
  { symbol: 'LRCX', name: 'Lam Research Corporation', sector: 'Semiconductors' },
  { symbol: 'KLAC', name: 'KLA Corporation', sector: 'Semiconductors' },
  { symbol: 'TXN', name: 'Texas Instruments', sector: 'Semiconductors' },
  { symbol: 'MRVL', name: 'Marvell Technology', sector: 'Semiconductors' },
  { symbol: 'ON', name: 'ON Semiconductor', sector: 'Semiconductors' },
  { symbol: 'WOLF', name: 'Wolfspeed Inc.', sector: 'Semiconductors' },
  { symbol: 'IONQ', name: 'IonQ Inc.', sector: 'Quantum Computing' },

  // Financials
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Finance' },
  { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Finance' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', sector: 'Finance' },
  { symbol: 'GS', name: 'Goldman Sachs Group', sector: 'Finance' },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'Finance' },
  { symbol: 'C', name: 'Citigroup Inc.', sector: 'Finance' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway B', sector: 'Finance' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Payments' },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Payments' },
  { symbol: 'AXP', name: 'American Express Company', sector: 'Finance' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', sector: 'Fintech' },
  { symbol: 'SQ', name: 'Block Inc. (Square)', sector: 'Fintech' },
  { symbol: 'COIN', name: 'Coinbase Global Inc.', sector: 'Crypto' },
  { symbol: 'HOOD', name: 'Robinhood Markets Inc.', sector: 'Fintech' },
  { symbol: 'SOFI', name: 'SoFi Technologies Inc.', sector: 'Fintech' },
  { symbol: 'AFRM', name: 'Affirm Holdings Inc.', sector: 'Fintech' },
  { symbol: 'UPST', name: 'Upstart Holdings Inc.', sector: 'Fintech' },
  { symbol: 'MSTR', name: 'Strategy Inc. (Bitcoin)', sector: 'Crypto' },
  { symbol: 'SCHW', name: 'Charles Schwab Corp.', sector: 'Finance' },
  { symbol: 'BX', name: 'Blackstone Inc.', sector: 'Finance' },
  { symbol: 'KKR', name: 'KKR & Co. Inc.', sector: 'Finance' },
  { symbol: 'APO', name: 'Apollo Global Management', sector: 'Finance' },

  // Healthcare
  { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare' },
  { symbol: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', sector: 'Healthcare' },
  { symbol: 'DHR', name: 'Danaher Corporation', sector: 'Healthcare' },
  { symbol: 'MDT', name: 'Medtronic plc', sector: 'Healthcare' },
  { symbol: 'ISRG', name: 'Intuitive Surgical Inc.', sector: 'Healthcare' },
  { symbol: 'SYK', name: 'Stryker Corporation', sector: 'Healthcare' },
  { symbol: 'AMGN', name: 'Amgen Inc.', sector: 'Biotech' },
  { symbol: 'GILD', name: 'Gilead Sciences Inc.', sector: 'Biotech' },
  { symbol: 'BIIB', name: 'Biogen Inc.', sector: 'Biotech' },
  { symbol: 'REGN', name: 'Regeneron Pharmaceuticals', sector: 'Biotech' },
  { symbol: 'VRTX', name: 'Vertex Pharmaceuticals', sector: 'Biotech' },
  { symbol: 'MRNA', name: 'Moderna Inc.', sector: 'Biotech' },
  { symbol: 'BNTX', name: 'BioNTech SE', sector: 'Biotech' },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', sector: 'Healthcare' },
  { symbol: 'BMY', name: 'Bristol-Myers Squibb', sector: 'Healthcare' },
  { symbol: 'NVO', name: 'Novo Nordisk A/S', sector: 'Healthcare' },
  { symbol: 'HIMS', name: 'Hims & Hers Health', sector: 'Healthcare' },
  { symbol: 'TDOC', name: 'Teladoc Health Inc.', sector: 'Healthcare' },
  { symbol: 'CVS', name: 'CVS Health Corporation', sector: 'Healthcare' },
  { symbol: 'CI', name: 'Cigna Group', sector: 'Healthcare' },

  // Consumer
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Retail' },
  { symbol: 'COST', name: 'Costco Wholesale Corp.', sector: 'Retail' },
  { symbol: 'TGT', name: 'Target Corporation', sector: 'Retail' },
  { symbol: 'HD', name: 'The Home Depot Inc.', sector: 'Retail' },
  { symbol: 'LOW', name: 'Lowe\'s Companies Inc.', sector: 'Retail' },
  { symbol: 'MCD', name: 'McDonald\'s Corporation', sector: 'Consumer' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', sector: 'Consumer' },
  { symbol: 'NKE', name: 'Nike Inc.', sector: 'Consumer' },
  { symbol: 'KO', name: 'Coca-Cola Company', sector: 'Consumer' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer' },
  { symbol: 'CELH', name: 'Celsius Holdings Inc.', sector: 'Consumer' },
  { symbol: 'MNST', name: 'Monster Beverage Corp.', sector: 'Consumer' },
  { symbol: 'LULU', name: 'Lululemon Athletica', sector: 'Consumer' },
  { symbol: 'DECK', name: 'Deckers Outdoor Corp.', sector: 'Consumer' },
  { symbol: 'TPR', name: 'Tapestry Inc.', sector: 'Consumer' },
  { symbol: 'ETSY', name: 'Etsy Inc.', sector: 'E-commerce' },
  { symbol: 'EBAY', name: 'eBay Inc.', sector: 'E-commerce' },
  { symbol: 'W', name: 'Wayfair Inc.', sector: 'E-commerce' },

  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy' },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy' },
  { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy' },
  { symbol: 'SLB', name: 'SLB (Schlumberger)', sector: 'Energy' },
  { symbol: 'OXY', name: 'Occidental Petroleum', sector: 'Energy' },
  { symbol: 'PSX', name: 'Phillips 66', sector: 'Energy' },
  { symbol: 'MPC', name: 'Marathon Petroleum Corp.', sector: 'Energy' },
  { symbol: 'NEE', name: 'NextEra Energy Inc.', sector: 'Utilities' },
  { symbol: 'ENPH', name: 'Enphase Energy Inc.', sector: 'Clean Energy' },
  { symbol: 'FSLR', name: 'First Solar Inc.', sector: 'Clean Energy' },
  { symbol: 'PLUG', name: 'Plug Power Inc.', sector: 'Clean Energy' },

  // Auto / EV
  { symbol: 'F', name: 'Ford Motor Company', sector: 'Auto' },
  { symbol: 'GM', name: 'General Motors Company', sector: 'Auto' },
  { symbol: 'RIVN', name: 'Rivian Automotive Inc.', sector: 'EV' },
  { symbol: 'LCID', name: 'Lucid Group Inc.', sector: 'EV' },
  { symbol: 'TM', name: 'Toyota Motor Corp.', sector: 'Auto' },
  { symbol: 'HMC', name: 'Honda Motor Co.', sector: 'Auto' },

  // Media / Entertainment
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Streaming' },
  { symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Entertainment' },
  { symbol: 'PARA', name: 'Paramount Global', sector: 'Entertainment' },
  { symbol: 'WBD', name: 'Warner Bros. Discovery', sector: 'Entertainment' },
  { symbol: 'SPOT', name: 'Spotify Technology S.A.', sector: 'Streaming' },
  { symbol: 'RBLX', name: 'Roblox Corporation', sector: 'Gaming' },
  { symbol: 'EA', name: 'Electronic Arts Inc.', sector: 'Gaming' },
  { symbol: 'TTWO', name: 'Take-Two Interactive', sector: 'Gaming' },
  { symbol: 'ATVI', name: 'Activision Blizzard', sector: 'Gaming' },
  { symbol: 'NTES', name: 'NetEase Inc.', sector: 'Gaming' },

  // Transport / Travel
  { symbol: 'UBER', name: 'Uber Technologies Inc.', sector: 'Mobility' },
  { symbol: 'LYFT', name: 'Lyft Inc.', sector: 'Mobility' },
  { symbol: 'ABNB', name: 'Airbnb Inc.', sector: 'Travel' },
  { symbol: 'BKNG', name: 'Booking Holdings Inc.', sector: 'Travel' },
  { symbol: 'EXPE', name: 'Expedia Group Inc.', sector: 'Travel' },
  { symbol: 'DAL', name: 'Delta Air Lines Inc.', sector: 'Airlines' },
  { symbol: 'UAL', name: 'United Airlines Holdings', sector: 'Airlines' },
  { symbol: 'AAL', name: 'American Airlines Group', sector: 'Airlines' },
  { symbol: 'LUV', name: 'Southwest Airlines Co.', sector: 'Airlines' },
  { symbol: 'CCL', name: 'Carnival Corporation', sector: 'Travel' },

  // Industrials / Defense
  { symbol: 'BA', name: 'Boeing Company', sector: 'Aerospace' },
  { symbol: 'LMT', name: 'Lockheed Martin Corp.', sector: 'Defense' },
  { symbol: 'RTX', name: 'RTX Corporation (Raytheon)', sector: 'Defense' },
  { symbol: 'NOC', name: 'Northrop Grumman Corp.', sector: 'Defense' },
  { symbol: 'GD', name: 'General Dynamics Corp.', sector: 'Defense' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrial' },
  { symbol: 'DE', name: 'Deere & Company', sector: 'Industrial' },
  { symbol: 'MMM', name: '3M Company', sector: 'Industrial' },
  { symbol: 'GE', name: 'GE Aerospace', sector: 'Aerospace' },
  { symbol: 'HON', name: 'Honeywell International', sector: 'Industrial' },
  { symbol: 'RKLB', name: 'Rocket Lab USA Inc.', sector: 'Space' },
  { symbol: 'SPCE', name: 'Virgin Galactic Holdings', sector: 'Space' },

  // Real Estate / REITs
  { symbol: 'AMT', name: 'American Tower Corp.', sector: 'REIT' },
  { symbol: 'PLD', name: 'Prologis Inc.', sector: 'REIT' },
  { symbol: 'EQIX', name: 'Equinix Inc.', sector: 'REIT' },
  { symbol: 'SPG', name: 'Simon Property Group', sector: 'REIT' },
  { symbol: 'O', name: 'Realty Income Corporation', sector: 'REIT' },
  { symbol: 'CCI', name: 'Crown Castle Inc.', sector: 'REIT' },

  // International
  { symbol: 'BABA', name: 'Alibaba Group Holding', sector: 'China Tech' },
  { symbol: 'JD', name: 'JD.com Inc.', sector: 'China Tech' },
  { symbol: 'PDD', name: 'PDD Holdings (Temu)', sector: 'China Tech' },
  { symbol: 'BIDU', name: 'Baidu Inc.', sector: 'China Tech' },
  { symbol: 'SE', name: 'Sea Limited', sector: 'Southeast Asia' },
  { symbol: 'MELI', name: 'MercadoLibre Inc.', sector: 'Latin America' },
  { symbol: 'SAP', name: 'SAP SE', sector: 'Germany Tech' },

  // ETFs
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', sector: 'ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq-100)', sector: 'ETF' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', sector: 'ETF' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', sector: 'ETF' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', sector: 'ETF' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial ETF', sector: 'ETF' },
  { symbol: 'GLD', name: 'SPDR Gold Shares ETF', sector: 'ETF' },
  { symbol: 'SLV', name: 'iShares Silver Trust ETF', sector: 'ETF' },
  { symbol: 'ARKK', name: 'ARK Innovation ETF', sector: 'ETF' },
  { symbol: 'SQQQ', name: 'ProShares UltraPro Short QQQ', sector: 'ETF (Inverse)' },
  { symbol: 'TQQQ', name: 'ProShares UltraPro QQQ (3x)', sector: 'ETF (Leveraged)' },
  { symbol: 'SOXL', name: 'Direxion Semi Bull 3X ETF', sector: 'ETF (Leveraged)' },
  { symbol: 'SOXX', name: 'iShares Semiconductor ETF', sector: 'ETF' },
  { symbol: 'XLF', name: 'Financial Select Sector SPDR', sector: 'ETF' },
  { symbol: 'XLE', name: 'Energy Select Sector SPDR', sector: 'ETF' },
  { symbol: 'XLK', name: 'Technology Select Sector SPDR', sector: 'ETF' },
  { symbol: 'XLV', name: 'Health Care Select Sector SPDR', sector: 'ETF' },
  { symbol: 'IBIT', name: 'iShares Bitcoin Trust ETF', sector: 'ETF (Crypto)' },
  { symbol: 'FBTC', name: 'Fidelity Wise Origin Bitcoin ETF', sector: 'ETF (Crypto)' },
]

export function searchStocks(query: string, limit = 8): StockEntry[] {
  if (!query || query.length < 1) return []
  const q = query.toUpperCase()
  const exact: StockEntry[] = []
  const startsWith: StockEntry[] = []
  const contains: StockEntry[] = []

  for (const s of ALL_STOCKS) {
    if (s.symbol === q) exact.push(s)
    else if (s.symbol.startsWith(q)) startsWith.push(s)
    else if (s.symbol.includes(q) || s.name.toUpperCase().includes(q)) contains.push(s)
  }

  return [...exact, ...startsWith, ...contains].slice(0, limit)
}
