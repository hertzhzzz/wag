// app/data/locations.ts
// City landing-page data. Each city carries genuinely unique local data (port,
// throughput, transit times, local industries, local angle) — NOT a template with
// the city name swapped. A prior batch of templated city pages was 410'd for thin
// content; this data is the anti-thin-content guardrail. All figures are sourced
// from real port/freight data (Infrastructure Australia, port authorities, freight
// forwarder transit tables) — see commit notes.

export interface LocationStat {
  value: string
  label: string
}

export interface LocationFaq {
  question: string
  answer: string
}

export interface LocationData {
  slug: string // matches nav-links href: /locations/<slug>
  city: string
  state: string
  stateAbbr: string
  // Hero
  heroTagline: string
  heroHeading: string
  heroIntro: string
  // Trust strip — real port data
  stats: LocationStat[]
  // "Why <city> importers work with us" — local port/logistics reality
  portName: string
  whyHeading: string
  whyBody: string
  localPoints: string[]
  // Local logistics — China port → this city, real transit times
  transitRows: { route: string; days: string }[]
  transitNote: string
  // Local industries the city actually imports
  industries: string[]
  industriesIntro: string
  // City-specific FAQ (1-2 unique questions each)
  faqs: LocationFaq[]
  // Whether the page is built/published (mirrors nav-links live flag)
  live: boolean
}

export const LOCATIONS: LocationData[] = [
  {
    slug: 'adelaide',
    city: 'Adelaide',
    state: 'South Australia',
    stateAbbr: 'SA',
    live: true,
    heroTagline: 'Australia-based · Headquartered in Adelaide',
    heroHeading: 'China Sourcing Agent for Adelaide Importers',
    heroIntro:
      'We are based in North Adelaide — not a call centre, not an overseas reseller. We verify factories in China on the ground and report back to you here in South Australia. Book a free consult and tell us what you are sourcing.',
    portName: 'Port Adelaide (Outer Harbor)',
    stats: [
      { value: '413K', label: 'TEU/yr through Port Adelaide' },
      { value: '+204%', label: 'Forecast container growth (highest in Australia)' },
      { value: 'North Adelaide', label: 'Our office location' },
      { value: '1,200+', label: 'Pre-screened factories in our network' },
    ],
    whyHeading: 'A China sourcing partner that is actually in South Australia',
    whyBody:
      'South Australia\'s container trade runs through the Flinders Adelaide Container Terminal at Outer Harbor — the state\'s only dedicated container terminal, with a 660-metre quay handling direct services to Asia. Port Adelaide moves around 413,000 TEU a year, and Infrastructure Australia forecasts its container trade will grow 204% — the highest projected growth of any Australian port. For SA importers, that means more competition for terminal capacity and more reason to get sourcing right the first time. We are headquartered in North Adelaide, so when you work with us you are dealing with a South Australian business that happens to have people on the ground in China — not the other way around.',
    localPoints: [
      'Headquartered at North Adelaide (5/54 Melbourne St) — a registered South Australian company, ABN 94 697 886 150 / ACN 697 886 150.',
      'Port Adelaide is SA\'s only dedicated container terminal (Flinders Adelaide Container Terminal, Outer Harbor Berths 6 & 7).',
      'SA\'s overseas goods exports totalled A$16.6 billion in the year to September 2025 — a trade-active economy that imports machinery, components, and materials to match.',
    ],
    transitRows: [
      { route: 'Shanghai → Port Adelaide', days: '25–30 days' },
      { route: 'Ningbo → Port Adelaide', days: '~25 days' },
      { route: 'Air freight (China → Adelaide)', days: '10–15 days' },
    ],
    transitNote:
      'Adelaide sits further from the main China–Australia shipping lanes than Sydney or Melbourne, so ocean transit runs a little longer. That makes getting the order right before it ships — verified supplier, audited factory, inspected goods — even more valuable: a failed shipment is a longer, costlier round trip to fix.',
    industriesIntro:
      'Common South Australian import categories that move through Port Adelaide — and the product types we most often verify for SA clients:',
    industries: [
      'Machinery & equipment',
      'Building materials',
      'Furniture & home goods',
      'Retail & eCommerce inventory',
      'Industrial components',
      'Automotive parts',
      'Consumer products',
      'Food & beverage products',
    ],
    faqs: [
      {
        question: 'Are you really based in Adelaide?',
        answer:
          'Yes. Winning Adventure Global is a registered South Australian company headquartered at North Adelaide (5/54 Melbourne St), ABN 94 697 886 150 / ACN 697 886 150. We are not an overseas agency with an Australian phone number — we are an Adelaide business with verification staff on the ground in China.',
      },
      {
        question: 'How long does it take to ship from China to Adelaide?',
        answer:
          'Ocean freight to Port Adelaide typically runs 25–30 days from Shanghai and around 25 days from Ningbo, port to port. Door to door, allow 30–40 days for trucking, customs, and any port congestion. Air freight is 10–15 days. Because Adelaide transit is longer than the eastern capitals, verifying the supplier and inspecting goods before they ship saves the most time.',
      },
    ],
  },
  {
    slug: 'sydney',
    city: 'Sydney',
    state: 'New South Wales',
    stateAbbr: 'NSW',
    live: true,
    heroTagline: 'Australia-based · Serving Sydney & NSW importers',
    heroHeading: 'China Sourcing Agent for Sydney Importers',
    heroIntro:
      'Sydney is Australia\'s busiest import gateway — and the fastest shipping lane from China. We verify factories on the ground in China and report back to you in NSW, so you can buy direct with confidence. Book a free consult and tell us your supplier.',
    portName: 'Port Botany',
    stats: [
      { value: '2.82M', label: 'TEU/yr through Port Botany' },
      { value: '#2', label: 'Largest container port in Australia' },
      { value: '12–18', label: 'Days from China (fastest lane)' },
      { value: '1,200+', label: 'Pre-screened factories in our network' },
    ],
    whyHeading: 'The busiest import hub deserves the tightest due diligence',
    whyBody:
      'Port Botany is Australia\'s busiest container import gateway, moving around 2.82 million TEU a year under a 99-year lease held by NSW Ports. It is dominated by containerised manufactured goods — exactly the products NSW businesses source from China — alongside bulk liquids like petroleum and chemicals. Sydney also sits on the fastest shipping lane from China: Shenzhen to Sydney runs as little as 12–15 days. Faster lead times are an advantage, but they also mean less time to catch a problem once goods are on the water. That is why we verify the supplier and inspect the goods before the container leaves China.',
    localPoints: [
      'Port Botany is Australia\'s busiest import hub and the second-largest container port nationally (~2.82M TEU/yr).',
      'Dominated by containerised manufactured products — the categories NSW businesses most commonly import from China.',
      'Shenzhen → Sydney is among the fastest China–Australia ocean routes at 12–15 days, ideal for time-sensitive replenishment.',
    ],
    transitRows: [
      { route: 'Shenzhen → Sydney', days: '12–15 days' },
      { route: 'Shanghai → Sydney', days: '14–18 days' },
      { route: 'Air freight (China → Sydney)', days: '3–5 days' },
    ],
    transitNote:
      'Sydney\'s fast lanes make it the natural choice for replenishment-driven importers. But a fast shipment of the wrong goods is still a wrong shipment — verification and pre-shipment inspection are what turn speed into reliability.',
    industriesIntro:
      'NSW imports a broad mix of containerised manufactured goods through Port Botany. The product categories we most often source and verify for Sydney clients:',
    industries: [
      'Consumer electronics & appliances',
      'Manufactured retail goods',
      'Machinery & industrial equipment',
      'Furniture & homewares',
      'Packaging & POS displays',
      'Apparel & textiles',
      'Building & construction products',
      'eCommerce inventory',
    ],
    faqs: [
      {
        question: 'How fast can goods reach Sydney from China?',
        answer:
          'Port Botany is on the fastest China–Australia lanes. Shenzhen to Sydney runs 12–15 days and Shanghai to Sydney 14–18 days, port to port. Air freight is 3–5 days. Door to door, allow around 30 days for ocean freight including customs and delivery across Greater Sydney.',
      },
      {
        question: 'Do you only work with Sydney businesses?',
        answer:
          'We are an Australia-based sourcing agent serving importers nationwide, with strong coverage for NSW given Port Botany\'s role as the country\'s busiest import hub. Whether you are in the Sydney CBD, Western Sydney, or regional NSW, the service is the same: we verify and inspect on the ground in China and report back to you.',
      },
    ],
  },
  {
    slug: 'melbourne',
    city: 'Melbourne',
    state: 'Victoria',
    stateAbbr: 'VIC',
    live: true,
    heroTagline: 'Australia-based · Serving Melbourne & VIC importers',
    heroHeading: 'China Sourcing Agent for Melbourne Importers',
    heroIntro:
      'Melbourne is Australia\'s largest container port and its biggest manufacturing and logistics hub. We verify factories on the ground in China and report back to you in Victoria, so you can source direct with confidence. Book a free consult and tell us your supplier.',
    portName: 'Port of Melbourne',
    stats: [
      { value: '3.39M', label: 'TEU/yr through Port of Melbourne' },
      { value: '#1', label: 'Largest container port in Australia' },
      { value: '15–20', label: 'Days from China' },
      { value: '1,200+', label: 'Pre-screened factories in our network' },
    ],
    whyHeading: 'Australia\'s largest port, and its biggest manufacturing base',
    whyBody:
      'The Port of Melbourne is the largest container port in Australia, handling around 3.39 million TEU a year — and Victoria is the country\'s largest manufacturing and logistics hub. That combination means Melbourne importers are often not just reselling finished goods but sourcing components, materials, and machinery to feed local production. Those are exactly the categories where factory capability and quality verification matter most. We verify suppliers and audit factories in China on your behalf, so the components arriving at Webb Dock and Swanson Dock are what you actually ordered.',
    localPoints: [
      'Port of Melbourne is Australia\'s largest container port (~3.39M TEU/yr) and the nation\'s primary manufacturing and logistics gateway.',
      'Victoria\'s manufacturing base means many Melbourne importers source components and machinery — not just finished goods — where factory audits matter most.',
      'Coverage across Greater Melbourne and regional Victoria including Dandenong, Laverton, and Geelong.',
    ],
    transitRows: [
      { route: 'Shenzhen → Melbourne', days: '15–19 days' },
      { route: 'Shanghai → Melbourne', days: '16–20 days' },
      { route: 'Air freight (China → Melbourne)', days: '3–5 days' },
    ],
    transitNote:
      'Melbourne\'s transit times sit just behind Sydney\'s. For Victorian manufacturers importing components, a late or defective shipment stalls a whole production line — which is why pre-shipment inspection and factory audits pay for themselves.',
    industriesIntro:
      'As Australia\'s manufacturing capital, Victoria imports a heavy mix of production inputs alongside finished goods. The categories we most often source and verify for Melbourne clients:',
    industries: [
      'Industrial machinery & components',
      'Manufacturing raw materials',
      'Consumer goods & retail inventory',
      'Food & beverage products',
      'Packaging & materials',
      'Furniture & fixtures',
      'Automotive & transport parts',
      'Event & venue equipment',
    ],
    faqs: [
      {
        question: 'Can you help source manufacturing components, not just finished goods?',
        answer:
          'Yes — and for Melbourne this is one of our most common requests. Victoria\'s manufacturing base means many importers need reliable component and material supply. We verify the factory\'s production capability (not just that the company exists) through on-site factory audits, so the parts feeding your production line meet specification and arrive on schedule.',
      },
      {
        question: 'How long does shipping from China to Melbourne take?',
        answer:
          'Ocean freight to the Port of Melbourne runs 15–19 days from Shenzhen and 16–20 days from Shanghai, port to port. Air freight is 3–5 days. Door to door, allow around 30 days for ocean freight including customs and delivery across Greater Melbourne and regional Victoria.',
      },
    ],
  },
]

export function getLiveLocations(): LocationData[] {
  return LOCATIONS.filter((l) => l.live)
}

export function getLocation(slug: string): LocationData | undefined {
  return LOCATIONS.find((l) => l.slug === slug && l.live)
}
