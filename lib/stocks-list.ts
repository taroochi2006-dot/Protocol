export interface StockOfDay {
  symbol: string
  name: string
  sector: string
  industry: string
  description: string
  whyWatch: string
  tags: string[]
  founded?: string
  hq?: string
}

export const STOCKS_LIST: StockOfDay[] = [
  {
    symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics',
    description: 'Apple designs and sells consumer electronics, software, and services. The iPhone drives ~50% of revenue, supported by a growing high-margin Services segment including the App Store, Apple TV+, and iCloud.',
    whyWatch: 'Apple\'s services business is becoming a profit powerhouse with ~74% gross margins, while its hardware ecosystem locks in over 2 billion active devices worldwide.',
    tags: ['Mega-cap', 'Dividend', 'Services Growth'], founded: '1976', hq: 'Cupertino, CA'
  },
  {
    symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors',
    description: 'NVIDIA designs graphics processing units (GPUs) and system-on-chip units. Originally for gaming, NVIDIA\'s chips have become essential infrastructure for AI training and inference workloads.',
    whyWatch: 'NVIDIA\'s H100/H200/B100 GPUs are the picks-and-shovels of the AI revolution. Data center revenue has grown over 400% YoY at peak, making it the world\'s most valuable chip company.',
    tags: ['AI Infrastructure', 'High Growth', 'Volatile'], founded: '1993', hq: 'Santa Clara, CA'
  },
  {
    symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software',
    description: 'Microsoft operates across cloud (Azure), productivity software (Office 365), gaming (Xbox/Activision), and enterprise tools. Azure is the #2 cloud provider globally with strong enterprise relationships.',
    whyWatch: 'Azure\'s AI-powered growth, Copilot integration across the Office suite, and a $69B Activision acquisition signal Microsoft\'s ambition to dominate enterprise and consumer tech for decades.',
    tags: ['Dividend', 'Cloud', 'AI Plays'], founded: '1975', hq: 'Redmond, WA'
  },
  {
    symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Communication Services', industry: 'Internet Content',
    description: 'Alphabet is the parent of Google, YouTube, and Google Cloud. Search advertising generates the majority of revenue, with Cloud growing rapidly. Alphabet also holds moonshots like Waymo (autonomous vehicles) and DeepMind.',
    whyWatch: 'Alphabet sits on a dominant search moat, a fast-growing cloud business, and an undervalued portfolio of moonshots. YouTube alone would rank among the world\'s most valuable media companies.',
    tags: ['Advertising', 'Cloud', 'AI'], founded: '1998', hq: 'Mountain View, CA'
  },
  {
    symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary', industry: 'Internet Retail',
    description: 'Amazon runs the world\'s largest e-commerce marketplace alongside AWS (Amazon Web Services), the dominant cloud platform. It also operates Prime Video, Alexa, and a massive advertising network.',
    whyWatch: 'AWS holds ~31% of the global cloud market and generates the majority of Amazon\'s operating profit, subsidizing its retail expansion. Ad revenue is growing at 20%+ YoY.',
    tags: ['Cloud Leader', 'E-commerce', 'Advertising'], founded: '1994', hq: 'Seattle, WA'
  },
  {
    symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary', industry: 'Automobiles',
    description: 'Tesla manufactures electric vehicles, energy storage, and solar products. It operates Gigafactories across the US, China, and Europe. Tesla\'s self-driving software (FSD) and Optimus humanoid robot are major future bets.',
    whyWatch: 'Tesla is valued more as a tech company than automaker — FSD, Robotaxi, and Optimus could redefine its revenue model. Elon Musk\'s vision (and controversy) makes it one of the most-watched stocks.',
    tags: ['EV', 'High Volatility', 'AI/Robotics'], founded: '2003', hq: 'Austin, TX'
  },
  {
    symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Communication Services', industry: 'Internet Content',
    description: 'Meta owns Facebook, Instagram, WhatsApp, and Threads — platforms used by over 3.2 billion people daily. Advertising is the core revenue engine. Reality Labs (VR/AR) is a long-term moonshot currently losing billions.',
    whyWatch: 'Meta\'s "year of efficiency" transformed it from a bloated organization into a lean, highly profitable machine. Its AI-driven ad platform continues to improve ROAS for advertisers.',
    tags: ['Social Media', 'Advertising', 'AI'], founded: '2004', hq: 'Menlo Park, CA'
  },
  {
    symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services', industry: 'Entertainment',
    description: 'Netflix is the world\'s largest streaming service with 270M+ subscribers. It produces original content across film, TV, and live events. A new ad-supported tier is driving subscriber growth in cost-sensitive markets.',
    whyWatch: 'Netflix has cracked the code on profitable streaming while rivals struggle. Password sharing crackdown added tens of millions of subscribers. Live events (NFL, boxing) could unlock a new growth chapter.',
    tags: ['Streaming', 'Content', 'Profitability'], founded: '1997', hq: 'Los Gatos, CA'
  },
  {
    symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financials', industry: 'Diversified Banks',
    description: 'JPMorgan is the largest US bank by assets (~$3.9 trillion). It operates across consumer banking, investment banking, commercial banking, and asset management. Led by Jamie Dimon, considered the world\'s best bank CEO.',
    whyWatch: 'In a higher-rate environment, JPM\'s net interest income soared. Its fortress balance sheet, diversified revenue, and disciplined management make it the benchmark for global banking.',
    tags: ['Dividend', 'Financial Sector', 'Blue Chip'], founded: '1799', hq: 'New York, NY'
  },
  {
    symbol: 'V', name: 'Visa Inc.', sector: 'Financials', industry: 'Transaction Processing',
    description: 'Visa operates the world\'s largest payment network, processing over $14 trillion in transactions annually. It does not take credit risk — it simply charges a small fee on every card transaction made on its network.',
    whyWatch: 'Visa is essentially a toll booth on global commerce. As digital payments grow and cash usage declines globally, Visa\'s network becomes more valuable. Capital-light with 50%+ profit margins.',
    tags: ['Payments', 'Capital Light', 'Global Growth'], founded: '1958', hq: 'San Francisco, CA'
  },
  {
    symbol: 'BRK.B', name: 'Berkshire Hathaway B', sector: 'Financials', industry: 'Multi-Sector Holdings',
    description: 'Warren Buffett\'s conglomerate owns GEICO (insurance), BNSF Railway, Berkshire Hathaway Energy, and stakes in Apple, Bank of America, Coca-Cola, and dozens more. A $900B+ holding company.',
    whyWatch: 'Berkshire\'s $160B+ cash pile positions it perfectly to acquire companies or buy equities during market crashes. Often called the ultimate defensive investment for uncertain times.',
    tags: ['Value Investing', 'Dividend', 'Defensive'], founded: '1839', hq: 'Omaha, NE'
  },
  {
    symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', industry: 'Managed Care',
    description: 'UnitedHealth is the largest US health insurer, serving 50M+ people. Its Optum subsidiary provides pharmacy benefits, data analytics, and care delivery. Combined, UNH is the 7th largest company in the US by revenue.',
    whyWatch: 'Optum\'s tech-driven healthcare services create diversified, recurring revenue streams. UNH has compounded earnings at ~14% annually for a decade, making it a healthcare compounder.',
    tags: ['Healthcare', 'Dividend', 'Compounder'], founded: '1977', hq: 'Minnetonka, MN'
  },
  {
    symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', industry: 'Integrated Oil & Gas',
    description: 'ExxonMobil is one of the world\'s largest publicly traded oil and gas companies. It operates across upstream (exploration/production), downstream (refining), and chemicals. The Pioneer acquisition added huge Permian Basin assets.',
    whyWatch: 'ExxonMobil\'s Permian Basin position (post-Pioneer deal) gives it one of the lowest-cost oil barrels in North America. Strong free cash flow funds a growing dividend and buyback program.',
    tags: ['Energy', 'Dividend', 'Commodity Play'], founded: '1870', hq: 'Spring, TX'
  },
  {
    symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare', industry: 'Drug Manufacturers',
    description: 'Eli Lilly produces pharmaceuticals across diabetes, oncology, immunology, and neuroscience. Its GLP-1 drugs Mounjaro (diabetes) and Zepbound (obesity) have become blockbusters, driving massive revenue growth.',
    whyWatch: 'The obesity drug market could be worth $100B+ annually. Lilly\'s manufacturing expansion and pipeline depth make it the consensus favorite in the GLP-1 race against Novo Nordisk.',
    tags: ['Biotech', 'High Growth', 'Obesity Market'], founded: '1876', hq: 'Indianapolis, IN'
  },
  {
    symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', industry: 'Semiconductors',
    description: 'AMD designs high-performance CPUs (Ryzen, EPYC), GPUs (Radeon), and AI accelerators (Instinct MI300X). It competes directly with Intel in CPUs and NVIDIA in AI chips, holding significant market share gains in both.',
    whyWatch: 'AMD\'s EPYC server CPUs have taken significant share from Intel in data centers. Its MI300X AI accelerator is gaining traction as an alternative to NVIDIA\'s expensive H100 chips.',
    tags: ['Semiconductors', 'AI Chips', 'Growth'], founded: '1969', hq: 'Santa Clara, CA'
  },
  {
    symbol: 'COST', name: 'Costco Wholesale', sector: 'Consumer Staples', industry: 'Retail',
    description: 'Costco operates a membership-based warehouse club model. Members pay annual fees for access to bulk goods at near-cost prices. The membership model creates highly predictable, recurring revenue with 90%+ renewal rates.',
    whyWatch: 'Costco\'s business model is nearly recession-proof — members keep paying dues, and the value proposition strengthens during inflation. Its stock trades at a premium, and investors argue it\'s worth it.',
    tags: ['Retail', 'Dividend', 'Recession Resistant'], founded: '1976', hq: 'Issaquah, WA'
  },
  {
    symbol: 'COIN', name: 'Coinbase Global Inc.', sector: 'Financials', industry: 'Crypto Exchange',
    description: 'Coinbase is the largest regulated cryptocurrency exchange in the US, serving 110M+ verified users. Revenue is heavily tied to crypto trading volumes, making it highly cyclical. It also earns from staking, custody, and Base (L2 network).',
    whyWatch: 'Coinbase is a direct proxy for the crypto market cycle. In bull markets, trading volume and revenue surge. Its regulated status and institutional custody business differentiate it from offshore competitors.',
    tags: ['Crypto', 'High Volatility', 'Cyclical'], founded: '2012', hq: 'San Francisco, CA'
  },
  {
    symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', sector: 'ETF', industry: 'Broad Market',
    description: 'SPY tracks the S&P 500 index — the 500 largest US companies by market cap. It is the world\'s largest and most liquid ETF, with $500B+ in assets. Often used as the benchmark for US equity performance.',
    whyWatch: 'Owning SPY means owning a slice of Apple, Microsoft, Amazon, Google, and 496 other top US companies in one trade. It\'s the simplest way to participate in long-term US economic growth.',
    tags: ['ETF', 'Diversified', 'Index'], founded: '1993', hq: 'N/A'
  },
  {
    symbol: 'QQQ', name: 'Invesco QQQ Trust', sector: 'ETF', industry: 'Tech-Heavy',
    description: 'QQQ tracks the Nasdaq-100 index — the 100 largest non-financial companies on the Nasdaq exchange. It is heavily weighted toward tech giants (Apple, Microsoft, NVIDIA, Amazon, Meta) and has historically outperformed the S&P 500.',
    whyWatch: 'QQQ is a high-beta play on technology and innovation. In bull markets, it typically outperforms SPY significantly. Understanding QQQ helps you understand how professional traders view tech sector risk.',
    tags: ['ETF', 'Tech', 'High Beta'], founded: '1999', hq: 'N/A'
  },
  {
    symbol: 'GS', name: 'Goldman Sachs Group', sector: 'Financials', industry: 'Investment Banking',
    description: 'Goldman Sachs is a premier global investment bank operating in investment banking, trading, asset management, and consumer banking. Known for its elite culture and dominance in M&A advisory and capital markets.',
    whyWatch: 'M&A and IPO activity is rebounding after a two-year drought. As deal-making recovers, Goldman\'s investment banking revenue should surge. Its asset management business provides more stable recurring income.',
    tags: ['Investment Banking', 'Cyclical', 'Financials'], founded: '1869', hq: 'New York, NY'
  },
  {
    symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Communication Services', industry: 'Entertainment',
    description: 'Disney owns iconic IP (Marvel, Star Wars, Pixar, Disney classics), operates theme parks on four continents, runs ESPN and linear TV networks, and operates Disney+ streaming. Under CEO Bob Iger, it\'s pivoting back to profitability.',
    whyWatch: 'Disney\'s theme park segment generates massive cash flow while streaming finally reached profitability. The IP library — Marvel, Star Wars, Pixar — is unrivaled. A turnaround story worth watching.',
    tags: ['Entertainment', 'IP', 'Turnaround'], founded: '1923', hq: 'Burbank, CA'
  },
  {
    symbol: 'NVO', name: 'Novo Nordisk', sector: 'Healthcare', industry: 'Drug Manufacturers',
    description: 'Denmark-based Novo Nordisk is the world\'s largest insulin maker and a pioneer in GLP-1 drugs. Ozempic (diabetes) and Wegovy (obesity) made it Europe\'s most valuable company briefly, with demand far outstripping supply.',
    whyWatch: 'Novo Nordisk essentially created the modern obesity drug market. Ozempic and Wegovy have millions on waiting lists worldwide. Investors debate whether the GLP-1 opportunity is still in its early innings.',
    tags: ['Healthcare', 'GLP-1', 'International'], founded: '1923', hq: 'Bagsværd, Denmark'
  },
  {
    symbol: 'TSM', name: 'Taiwan Semiconductor Mfg.', sector: 'Technology', industry: 'Semiconductors',
    description: 'TSMC manufactures the world\'s most advanced chips for Apple, NVIDIA, AMD, Qualcomm, and hundreds more. Its 3nm and 2nm process nodes are years ahead of competitors. No company can match its scale or yield rates.',
    whyWatch: 'TSMC is the chokepoint of the global AI supply chain — without its chips, NVIDIA and Apple cannot build their products. Its Arizona fabs reduce geopolitical concentration risk while maintaining technology leadership.',
    tags: ['Foundry', 'AI Supply Chain', 'Geopolitical Risk'], founded: '1987', hq: 'Hsinchu, Taiwan'
  },
  {
    symbol: 'PLTR', name: 'Palantir Technologies', sector: 'Technology', industry: 'Data Analytics',
    description: 'Palantir builds data integration and AI platforms for governments (Gotham) and enterprises (Foundry, AIP). Its software helps organizations turn fragmented data into actionable intelligence for military, intelligence, and commercial use.',
    whyWatch: 'Palantir\'s AIP (Artificial Intelligence Platform) is gaining rapid commercial adoption. US government contracts and the AI boom have pushed it to profitability, reversing years of heavy losses.',
    tags: ['AI/Data', 'Government', 'High Valuation'], founded: '2003', hq: 'Denver, CO'
  },
  {
    symbol: 'SHOP', name: 'Shopify Inc.', sector: 'Technology', industry: 'E-commerce Software',
    description: 'Shopify is the operating system for commerce — providing merchants with tools to sell online, in-person, and internationally. It powers 10%+ of all US e-commerce. Revenue grows via subscriptions and merchant solutions (payments, loans).',
    whyWatch: 'Shopify\'s merchant solutions (payments, capital, logistics) are growing faster than subscriptions, improving unit economics. As global e-commerce penetration grows, Shopify\'s total addressable market is enormous.',
    tags: ['E-commerce', 'SaaS', 'High Growth'], founded: '2006', hq: 'Ottawa, Canada'
  },
  {
    symbol: 'ABNB', name: 'Airbnb Inc.', sector: 'Consumer Discretionary', industry: 'Travel & Lodging',
    description: 'Airbnb operates a two-sided marketplace connecting travelers with hosts offering short-term accommodations and experiences. It generates revenue by charging service fees to both guests and hosts on each booking.',
    whyWatch: 'Airbnb has achieved consistent profitability faster than any marketplace company in history. International expansion (especially in underpenetrated Asian markets) and Experiences are major growth levers.',
    tags: ['Marketplace', 'Travel', 'Profitability'], founded: '2008', hq: 'San Francisco, CA'
  },
  {
    symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology', industry: 'Semiconductors',
    description: 'Intel designs and manufactures CPUs for PCs and servers. After a decade of manufacturing setbacks that ceded leadership to TSMC, new CEO Pat Gelsinger launched IDM 2.0 — a plan to rebuild fabs and re-enter contract manufacturing.',
    whyWatch: 'Intel is a classic turnaround story with massive uncertainty. Government subsidies (CHIPS Act) could fund its comeback. If manufacturing catches up to TSMC, the upside is enormous. If it fails, the downside is severe.',
    tags: ['Turnaround', 'Semiconductors', 'Risky'], founded: '1968', hq: 'Santa Clara, CA'
  },
  {
    symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples', industry: 'Retail',
    description: 'Walmart is the world\'s largest retailer by revenue ($640B+), operating 10,500+ stores globally and a growing e-commerce platform. Walmart+ membership and advertising business are emerging high-margin revenue streams.',
    whyWatch: 'Walmart\'s scale gives it unmatched pricing power in a cost-conscious consumer environment. Its ad network and marketplace are growing at 20%+ YoY, adding a higher-margin revenue mix to its traditional low-margin retail.',
    tags: ['Retail', 'Dividend', 'Defensive'], founded: '1962', hq: 'Bentonville, AR'
  },
  {
    symbol: 'PYPL', name: 'PayPal Holdings Inc.', sector: 'Financials', industry: 'Fintech',
    description: 'PayPal operates digital payment platforms including PayPal, Venmo, Braintree, and Honey. It processes $1.5T+ in annual payment volume. New CEO Alex Chriss is refocusing on core profitable products after years of overexpansion.',
    whyWatch: 'PayPal trades near historic lows despite generating billions in free cash flow. The question is whether its moat has been permanently eroded by Apple Pay and Cash App, or if a focused strategy can reignite growth.',
    tags: ['Fintech', 'Turnaround', 'Value Play'], founded: '1998', hq: 'San Jose, CA'
  },
  {
    symbol: 'UBER', name: 'Uber Technologies Inc.', sector: 'Technology', industry: 'Ride-Sharing',
    description: 'Uber operates ride-hailing, food delivery (Uber Eats), and freight logistics globally. After years of losses, it reached sustained profitability in 2023. Its network effect across mobility and delivery creates strong competitive barriers.',
    whyWatch: 'Uber is finally printing cash after years of investment. Autonomous vehicle partnerships could dramatically cut driver costs. Its advertising business is emerging as a high-margin revenue add-on.',
    tags: ['Mobility', 'Profitability', 'Growth'], founded: '2009', hq: 'San Francisco, CA'
  },
  {
    symbol: 'BA', name: 'The Boeing Company', sector: 'Industrials', industry: 'Aerospace & Defense',
    description: 'Boeing designs and manufactures commercial jets (737, 777, 787), defense systems, and space vehicles. The 737 MAX crises and pandemic devastated it financially. Manufacturing quality issues continue to plague it under new leadership.',
    whyWatch: 'Boeing has a $500B+ order backlog — demand for aircraft is not the problem. Execution is. If new CEO Kelly Ortberg can fix the production and quality culture, the recovery could be dramatic.',
    tags: ['Aerospace', 'Turnaround', 'Defense'], founded: '1916', hq: 'Arlington, VA'
  },
  {
    symbol: 'SPOT', name: 'Spotify Technology S.A.', sector: 'Communication Services', industry: 'Audio Streaming',
    description: 'Spotify is the world\'s largest audio streaming platform with 600M+ users and 240M+ premium subscribers. It distributes music, podcasts, and audiobooks. Aggressive podcast investments have been partially reversed to focus on profitability.',
    whyWatch: 'Spotify finally turned profitable by raising subscription prices and cutting costs. Its machine learning-driven personalization (Discover Weekly, Daylist) is unmatched in audio. Podcast and audiobook expansions remain growth vectors.',
    tags: ['Streaming', 'Growth', 'Profitability'], founded: '2006', hq: 'Stockholm, Sweden'
  },
  {
    symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', industry: 'CRM Software',
    description: 'Salesforce pioneered cloud-based CRM software and has expanded via acquisitions (Slack, Tableau, MuleSoft) into a broad enterprise platform. Einstein AI is being embedded across its entire product suite.',
    whyWatch: 'Salesforce\'s Agentforce AI platform could redefine enterprise automation. After years of growth-at-all-costs, profitability has dramatically improved under activist investor pressure.',
    tags: ['Enterprise SaaS', 'AI', 'Profitability'], founded: '1999', hq: 'San Francisco, CA'
  },
  {
    symbol: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology', industry: 'Cloud Data',
    description: 'Snowflake provides a cloud-based data platform enabling companies to store, analyze, and share large datasets across multiple cloud providers. It uses a consumption-based pricing model where customers pay per query run.',
    whyWatch: 'Snowflake\'s Data Cloud positions it as essential infrastructure for AI workloads — you need clean, accessible data before you can train models. Its multi-cloud approach avoids vendor lock-in.',
    tags: ['Cloud Data', 'AI Infrastructure', 'High Valuation'], founded: '2012', hq: 'Bozeman, MT'
  },
  {
    symbol: 'HOOD', name: 'Robinhood Markets Inc.', sector: 'Financials', industry: 'Online Brokerage',
    description: 'Robinhood democratized investing by pioneering commission-free trading. It earns from payment for order flow, Gold subscriptions, and crypto trading. It has expanded into retirement accounts, credit cards, and prediction markets.',
    whyWatch: 'Robinhood is a direct play on retail investor sentiment and market activity. Its young user base is growing in wealth, and expansion into international markets (UK, EU) adds new addressable customers.',
    tags: ['Fintech', 'Retail Brokerage', 'Crypto'], founded: '2013', hq: 'Menlo Park, CA'
  },
  {
    symbol: 'SOFI', name: 'SoFi Technologies Inc.', sector: 'Financials', industry: 'Digital Banking',
    description: 'SoFi is a digital bank offering student loan refinancing, personal loans, mortgages, credit cards, investing, and checking/savings accounts. It obtained a bank charter in 2022, enabling it to hold deposits and improve margins.',
    whyWatch: 'SoFi\'s bank charter gives it a structural cost advantage over non-bank fintechs. Its cross-sell strategy — getting customers to use multiple products — drives lifetime value. A long-term bet on digital-first banking.',
    tags: ['Digital Bank', 'Fintech', 'Growth'], founded: '2011', hq: 'San Francisco, CA'
  },
  {
    symbol: 'ARM', name: 'Arm Holdings plc', sector: 'Technology', industry: 'Chip Design (IP)',
    description: 'Arm licenses chip architecture IP used in virtually every smartphone, and increasingly in data center and AI chips. Apple, Qualcomm, Amazon, and NVIDIA all build on Arm\'s instruction set. It earns royalties on every chip shipped.',
    whyWatch: 'Arm\'s architecture is the foundation of mobile computing and is invading the data center (AWS Graviton, Apple M-series). As AI inference moves to edge devices, every inference chip will likely use Arm.',
    tags: ['IP Licensing', 'AI Edge', 'High Valuation'], founded: '1990', hq: 'Cambridge, UK'
  },
  {
    symbol: 'MSTR', name: 'MicroStrategy / Strategy Inc.', sector: 'Technology', industry: 'Bitcoin Treasury',
    description: 'Originally a business intelligence software company, MicroStrategy (now "Strategy") has transformed into a Bitcoin treasury company under Michael Saylor. It holds 500,000+ BTC and continuously raises capital to buy more.',
    whyWatch: 'Strategy is essentially a leveraged Bitcoin ETF wrapped in equity. Its stock moves 2-3x the magnitude of BTC. It\'s highly controversial — some call it genius capital recycling, others call it reckless leverage.',
    tags: ['Bitcoin', 'High Volatility', 'Leveraged'], founded: '1989', hq: 'Tysons, VA'
  },
  {
    symbol: 'RKLB', name: 'Rocket Lab USA Inc.', sector: 'Industrials', industry: 'Space Launches',
    description: 'Rocket Lab provides small satellite launch services (Electron rocket) and spacecraft components. Its Neutron rocket, under development, targets medium-lift payloads. It also manufactures satellite components sold to other aerospace companies.',
    whyWatch: 'Rocket Lab is the #2 launch provider globally (behind SpaceX) for small satellites. As the satellite constellation market explodes (Starlink, Amazon Kuiper competitors), launch demand is structural.',
    tags: ['Space', 'High Growth', 'High Risk'], founded: '2006', hq: 'Long Beach, CA'
  },
  {
    symbol: 'IONQ', name: 'IonQ Inc.', sector: 'Technology', industry: 'Quantum Computing',
    description: 'IonQ builds quantum computers using trapped-ion technology. It offers cloud access to its quantum systems via AWS, Azure, and Google Cloud. Quantum computing promises to solve problems classical computers cannot.',
    whyWatch: 'Quantum computing is pre-commercial but attracting massive government and corporate investment. IonQ is one of the few publicly traded pure-play quantum companies. Very high risk, very high potential reward.',
    tags: ['Quantum', 'Early Stage', 'Speculative'], founded: '2015', hq: 'College Park, MD'
  },
  {
    symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Staples', industry: 'Household Products',
    description: 'P&G owns dozens of billion-dollar brands: Tide, Pampers, Gillette, Oral-B, Dawn, Crest, and more. It sells in 180+ countries. Pricing power and brand loyalty allow it to raise prices during inflation with minimal volume loss.',
    whyWatch: 'P&G is the textbook defensive dividend compounder. A Dividend King with 65+ consecutive years of dividend increases. When markets get scary, investors rotate into consumer staples giants like P&G.',
    tags: ['Consumer Staples', 'Dividend King', 'Defensive'], founded: '1837', hq: 'Cincinnati, OH'
  },
  {
    symbol: 'CRWD', name: 'CrowdStrike Holdings', sector: 'Technology', industry: 'Cybersecurity',
    description: 'CrowdStrike\'s Falcon platform uses AI to detect and prevent cyber threats across endpoints, cloud, and identity. It operates on a subscription model with very high switching costs once deployed across an enterprise.',
    whyWatch: 'Cyber threats are increasing in frequency and severity, making security spending recession-resistant. CrowdStrike\'s AI-native platform and platform consolidation trend position it as the dominant endpoint security vendor.',
    tags: ['Cybersecurity', 'SaaS', 'AI-Driven'], founded: '2011', hq: 'Austin, TX'
  },
  {
    symbol: 'NET', name: 'Cloudflare Inc.', sector: 'Technology', industry: 'Cloud Networking',
    description: 'Cloudflare operates a global network spanning 310+ cities that delivers faster, safer internet access. Products include CDN, DDoS protection, Zero Trust security, AI inference at the edge, and domain services.',
    whyWatch: 'Cloudflare\'s network is becoming critical infrastructure for the internet. Its Workers platform (serverless computing at the edge) and AI inference products position it at the intersection of security and AI.',
    tags: ['Cloud', 'Cybersecurity', 'Edge AI'], founded: '2009', hq: 'San Francisco, CA'
  },
  {
    symbol: 'SMCI', name: 'Super Micro Computer Inc.', sector: 'Technology', industry: 'AI Server Hardware',
    description: 'Super Micro builds high-performance, energy-efficient servers optimized for AI and cloud workloads. Its close partnership with NVIDIA allows it to be among the first to ship systems using new GPU generations.',
    whyWatch: 'SMCI is a picks-and-shovels play on AI infrastructure buildout. As hyperscalers and enterprises race to build AI capacity, demand for its GPU-dense servers has exploded — though accounting concerns add risk.',
    tags: ['AI Infrastructure', 'Servers', 'High Volatility'], founded: '1993', hq: 'San Jose, CA'
  },
  {
    symbol: 'RIVN', name: 'Rivian Automotive Inc.', sector: 'Consumer Discretionary', industry: 'Electric Vehicles',
    description: 'Rivian makes electric trucks (R1T), SUVs (R1S), and commercial delivery vans for Amazon. It is backed by Amazon and Ford (Ford later sold). Its vehicles are premium-priced and target adventure-oriented consumers.',
    whyWatch: 'Rivian is in the critical phase of scaling production and achieving cost efficiency. Its Amazon EDV contract provides a baseline commercial revenue floor. R2, its upcoming lower-cost SUV, is the key catalyst for mass market penetration.',
    tags: ['EV', 'Pre-Profit', 'High Risk'], founded: '2009', hq: 'Irvine, CA'
  },
  {
    symbol: 'HIMS', name: 'Hims & Hers Health Inc.', sector: 'Healthcare', industry: 'Telehealth',
    description: 'Hims & Hers is a telehealth platform offering prescription medications and personal care products for hair loss, ED, skincare, mental health, and weight loss (GLP-1). It sells through subscriptions with quick online doctor consultations.',
    whyWatch: 'Hims is riding the telehealth and GLP-1 obesity drug wave simultaneously. Subscription revenue is sticky and growing rapidly. The FDA\'s moves on compounded GLP-1 drugs create both opportunities and regulatory risk.',
    tags: ['Telehealth', 'GLP-1', 'DTC Health'], founded: '2017', hq: 'San Francisco, CA'
  },
  {
    symbol: 'MELI', name: 'MercadoLibre Inc.', sector: 'Consumer Discretionary', industry: 'Latin America E-commerce',
    description: 'MercadoLibre is the dominant e-commerce and fintech platform in Latin America, operating in 18 countries. MercadoPago, its payments arm, processes $50B+ annually and has become a standalone banking product for the underbanked.',
    whyWatch: 'Latin America has 650M+ people with growing internet penetration, rising middle class, and underpenetrated e-commerce. MercadoLibre has the brand trust, logistics network, and financial products to dominate for decades.',
    tags: ['Emerging Markets', 'E-commerce', 'Fintech'], founded: '1999', hq: 'Montevideo, Uruguay'
  },
  {
    symbol: 'SE', name: 'Sea Limited', sector: 'Technology', industry: 'Southeast Asia Tech',
    description: 'Sea operates three businesses across Southeast Asia and Latin America: Garena (gaming/Free Fire), Shopee (e-commerce), and SeaMoney (digital finance). It is the dominant player in the fastest-growing digital markets in the world.',
    whyWatch: 'Southeast Asia\'s 700M population is rapidly digitizing. Sea\'s integrated ecosystem of gaming, e-commerce, and financial services creates deep cross-sell opportunities. A high-risk bet on emerging market digital adoption.',
    tags: ['Emerging Markets', 'Gaming', 'E-commerce'], founded: '2009', hq: 'Singapore'
  },
  {
    symbol: 'CELH', name: 'Celsius Holdings Inc.', sector: 'Consumer Staples', industry: 'Energy Drinks',
    description: 'Celsius makes fitness-oriented energy drinks positioned as healthier alternatives to Monster and Red Bull. Its partnership with PepsiCo for US distribution has dramatically expanded shelf placement and brand awareness.',
    whyWatch: 'Celsius disrupted the energy drink duopoly (Monster/Red Bull) by targeting a health-conscious demographic. International expansion via PepsiCo distribution is the next growth leg. Highly volatile with strong brand momentum.',
    tags: ['Beverages', 'Growth', 'Consumer'], founded: '2004', hq: 'Boca Raton, FL'
  },
]

export function getStockOfTheDay(date: Date = new Date()): StockOfDay {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)
  return STOCKS_LIST[dayOfYear % STOCKS_LIST.length]
}
