// app/data/industries.ts
// By-Industry landing-page data. Each industry carries genuinely unique, real
// compliance/sourcing data (Australian Standards, certifications, biosecurity,
// industry-specific risks) — NOT a template with the industry name swapped. The
// compliance-standards table is the industry equivalent of the city pages' port
// data: the data-rich, E-E-A-T differentiator. All standards/certs are real and
// sourced from research (Standards Australia, DAFF/BICON, EESS/ACMA, NCC, ChAFTA).

export interface IndustryStat {
  value: string
  label: string
}

export interface IndustryStandard {
  code: string // e.g. "AS 2294.1" or "RCM"
  name: string // what it covers
}

export interface IndustryFaq {
  question: string
  answer: string
}

export interface IndustryData {
  slug: string // matches nav-links href: /industries/<slug>
  industry: string // display name, e.g. "Mining Equipment"
  navLabel: string // must match the nav-links label so menu + page agree
  heroTagline: string
  heroHeading: string
  heroIntro: string
  stats: IndustryStat[]
  whyHeading: string
  whyBody: string
  riskPoints: string[] // industry-specific pitfalls
  // Compliance & standards — the data-rich differentiator
  standardsIntro: string
  standards: IndustryStandard[]
  standardsNote: string
  // What we source
  productsIntro: string
  products: string[]
  faqs: IndustryFaq[]
  live: boolean
  heroImage?: string // optional remote hero URL (unsplash/pexels/pixabay allow-listed); falls back to /industry-<slug>.webp
}

export const INDUSTRIES: IndustryData[] = [
  {
    slug: 'mining',
    industry: 'Mining Equipment',
    navLabel: 'Mining',
    live: true,
    heroTagline: 'Australia-based · Mining & resources sourcing',
    heroHeading: 'China Sourcing for Mining Equipment & Components',
    heroIntro:
      'Mining equipment is high-value, specification-critical, and tightly regulated for safety. We verify factories on the ground in China — production capability, safety standards, and compliance — and inspect before shipment. Book a free consult and tell us what you need.',
    stats: [
      { value: '0%', label: 'ChAFTA duty on most machinery' },
      { value: '12–20', label: 'Days sea freight from China' },
      { value: 'AS 2294', label: 'ROPS/FOPS safety compliance' },
      { value: '1,200+', label: 'Pre-screened factories in our network' },
    ],
    whyHeading: 'In mining, a non-compliant component is a safety and shutdown risk',
    whyBody:
      'Mining equipment sits in one of Australia\'s most demanding regulatory environments. Heavy machinery must meet Work Health and Safety (WHS) law — guarding, emergency stops, and in many cases design registration before it can be used on site. Protective structures follow AS 2294.1 (roll-over and falling-object protection), risk is managed under AS ISO 31000, and automated systems fall under the AS 61508 functional-safety series. On top of that, Australia enforces a zero-tolerance asbestos ban — and asbestos is still found in brake pads, gaskets, and seals on some Chinese-made machinery. Get any of this wrong and equipment can be seized, destroyed, or ordered for re-export. We verify the factory and inspect the equipment against these requirements before it ships.',
    riskPoints: [
      'Asbestos is banned outright in Australia but still appears in some imported brake pads, gaskets, and seals — we screen for it before shipment.',
      'WHS law requires appropriate guarding, emergency stops, and sometimes design registration before equipment can be operated on an Australian site.',
      'Used machinery faces strict DAFF biosecurity cleaning — soil, seeds, or grease can trigger costly re-cleaning or re-export.',
    ],
    standardsIntro:
      'The key Australian standards and controls we verify against when sourcing mining equipment from China:',
    standards: [
      { code: 'AS 2294.1', name: 'Earth-moving machinery — ROPS/FOPS protective structures' },
      { code: 'AS ISO 31000', name: 'Risk management guidelines' },
      { code: 'AS 61508', name: 'Functional safety for automated & electronic systems' },
      { code: 'WHS Act', name: 'Guarding, emergency stops, design registration' },
      { code: 'Asbestos ban', name: 'Zero-tolerance — components screened pre-shipment' },
      { code: 'ChAFTA', name: '0% duty on most machinery with valid Certificate of Origin' },
    ],
    standardsNote:
      'Australia\'s machinery import regime is unforgiving — non-compliant equipment can be detained at the border or ordered for re-export at your cost. We confirm compliance evidence at the factory, not at the wharf.',
    productsIntro:
      'Mining and resources equipment categories we most often source and verify for Australian clients:',
    products: [
      'Excavator & loader attachments',
      'Conveyor systems & components',
      'Crushing & screening equipment',
      'Drilling components & consumables',
      'Hydraulic systems & cylinders',
      'Ground-engaging tools & wear parts',
      'Safety & PPE equipment',
      'Material handling equipment',
    ],
    faqs: [
      {
        question: 'How do you handle the asbestos risk in Chinese machinery?',
        answer:
          'Australia has a zero-tolerance asbestos ban, and asbestos still appears in some Chinese-made brake pads, gaskets, and seals. As part of our factory audit and pre-shipment inspection, we verify materials and request asbestos-free declarations and, where needed, third-party test reports — before the equipment ships, not after it is detained at the border.',
      },
      {
        question: 'What compliance does mining equipment need to be used in Australia?',
        answer:
          'Imported machinery must meet Work Health and Safety law — appropriate guarding, emergency stops, and electrical compliance — and some equipment requires design registration before operation. Protective structures follow AS 2294.1 and risk management AS ISO 31000. We confirm the relevant evidence with the factory before shipment so the equipment is usable on arrival.',
      },
    ],
  },
  {
    slug: 'agricultural-machinery',
    industry: 'Agricultural Machinery',
    navLabel: 'Agricultural Machinery',
    live: true,
    heroTagline: 'Australia-based · Farm & ag-machinery sourcing',
    heroHeading: 'China Sourcing for Agricultural Machinery',
    heroIntro:
      'Farm machinery faces Australia\'s strictest biosecurity controls — get the cleaning and documentation wrong and your shipment is held, re-cleaned, or re-exported. We verify factories in China and manage compliance before goods ship. Book a free consult.',
    stats: [
      { value: '80°C', label: 'Min. cleaning temp for biosecurity' },
      { value: 'BICON', label: 'DAFF import-permit system' },
      { value: '0%', label: 'ChAFTA duty on most machinery' },
      { value: '1,200+', label: 'Pre-screened factories in our network' },
    ],
    whyHeading: 'Agricultural machinery lives or dies on biosecurity compliance',
    whyBody:
      'No category is scrutinised harder at the Australian border than agricultural machinery. Under the Biosecurity Act 2015, the Department of Agriculture, Fisheries and Forestry (DAFF) requires equipment to arrive completely free of soil, seeds, plant and animal material. Used machinery must be cleaned by hot-water high-pressure wash (minimum 80°C) or steam, with photographic evidence and, increasingly, third-party inspection reports. The 2026 BICON update added enhanced requirements for machinery from regions affected by Khapra beetle and brown marmorated stink bug. A single seed in a radiator can trigger re-cleaning costs in the thousands — or re-export. We verify the factory and coordinate compliant cleaning and documentation before anything ships.',
    riskPoints: [
      'DAFF enforces zero-tolerance biosecurity: soil, seeds, or organic matter triggers re-cleaning, fines, or re-export at your cost.',
      'Used machinery requires documented hot-water (80°C+) or steam cleaning with photographic evidence — and 2026 BICON adds Khapra-beetle scrutiny.',
      'Import permits must be secured through DAFF\'s BICON system before goods arrive, with detailed equipment and origin documentation.',
    ],
    standardsIntro:
      'The key controls and Australian requirements we manage when sourcing agricultural machinery from China:',
    standards: [
      { code: 'Biosecurity Act 2015', name: 'DAFF framework — inspect, treat, or destroy non-compliant imports' },
      { code: 'BICON', name: 'Biosecurity Import Conditions — mandatory import permits' },
      { code: 'Cleaning standard', name: 'Hot-water 80°C+ / steam wash with photographic evidence' },
      { code: 'WHS Act', name: 'Guarding, emergency stops, design registration' },
      { code: 'Asbestos ban', name: 'Zero-tolerance — components screened pre-shipment' },
      { code: 'ChAFTA', name: '0% duty on most machinery with valid Certificate of Origin' },
    ],
    standardsNote:
      'Biosecurity is where agricultural-machinery imports most often fail — and it fails at the Australian wharf, where fixing it is most expensive. We get the cleaning and documentation right at origin.',
    productsIntro:
      'Agricultural machinery and components we most often source and verify for Australian clients:',
    products: [
      'Tractor implements & attachments',
      'Tillage & cultivation equipment',
      'Irrigation systems & components',
      'Harvesting machinery parts',
      'Spraying & spreading equipment',
      'Greenhouse & growing systems',
      'Livestock & handling equipment',
      'Spare parts & consumables',
    ],
    faqs: [
      {
        question: 'Why is biosecurity such a big deal for agricultural machinery?',
        answer:
          'Australia has some of the world\'s strictest biosecurity laws to protect its agriculture from foreign pests and diseases. Under the Biosecurity Act 2015, DAFF requires machinery to arrive free of all soil, seeds, and organic matter — verified by hot-water (80°C+) or steam cleaning with photographic evidence. Non-compliance means re-cleaning, fines, or re-export. We manage compliant cleaning and documentation at origin so your equipment clears on arrival.',
      },
      {
        question: 'Do I need an import permit for farm machinery from China?',
        answer:
          'Most agricultural machinery requires an import permit secured through DAFF\'s BICON system before the goods arrive, with detailed equipment specifications, origin documentation, and cleaning declarations. As of 2026, BICON added enhanced requirements for Khapra beetle and brown marmorated stink bug. We help confirm the correct permit pathway as part of the sourcing process.',
      },
    ],
  },
  {
    slug: 'activewear',
    industry: 'Activewear',
    navLabel: 'Activewear',
    live: true,
    heroTagline: 'Australia-based · Activewear & apparel sourcing',
    heroHeading: 'China Sourcing for Activewear & Performance Apparel',
    heroIntro:
      'Activewear lives and dies on fabric quality — and factories sometimes swap materials without telling you. We verify suppliers, check fabric against your approved samples, and inspect during production, not just at the end. Book a free consult.',
    stats: [
      { value: '200–500', label: 'Typical MOQ per style' },
      { value: 'Oeko-Tex', label: 'Standard 100 fabric certification' },
      { value: 'GRS', label: 'Global Recycled Standard available' },
      { value: '1,200+', label: 'Pre-screened factories in our network' },
    ],
    whyHeading: 'The biggest activewear risk is the fabric you can\'t see in a photo',
    whyBody:
      'Activewear is a performance product: breathability, stretch, moisture-wicking, and UV protection are the whole proposition. The most common failure is fabric substitution — a factory quietly swaps the approved technical fabric for a cheaper blend, and the problem only surfaces when bulk stock arrives in Australia. The fix is verification on the ground: confirming fabric specs against your approved samples before production completes, and running during-production inspections rather than waiting for the pre-shipment check. Reputable manufacturers carry Oeko-Tex Standard 100 (harmful-substance testing), GRS for recycled content, and ISO 9001 / BSCI for quality and social compliance. We confirm those, negotiate workable MOQs, and catch fabric issues while they are still fixable.',
    riskPoints: [
      'Fabric substitution: factories sometimes swap the approved technical fabric for a cheaper blend — we verify fabric against your samples before production completes.',
      'MOQ pressure: minimums of 200–500 units per style are common; we negotiate workable first-run quantities for newer brands.',
      'Quality drift in bulk: we run during-production inspections, not just pre-shipment checks, so issues are caught before they compound across the run.',
    ],
    standardsIntro:
      'The key certifications and quality controls we verify when sourcing activewear from China:',
    standards: [
      { code: 'Oeko-Tex 100', name: 'Tested for harmful substances in textiles' },
      { code: 'GRS', name: 'Global Recycled Standard — recycled fabric content' },
      { code: 'ISO 9001', name: 'Quality management system' },
      { code: 'BSCI / SMETA', name: 'Social compliance & ethical manufacturing' },
      { code: 'Fibre labelling', name: 'Accurate fibre composition & care labelling' },
      { code: 'ChAFTA', name: '0% duty on most apparel with valid Certificate of Origin' },
    ],
    standardsNote:
      'For activewear, performance claims (UV protection, moisture-wicking, four-way stretch) are only as good as the fabric actually used — which is why we verify the material, not just the spec sheet.',
    productsIntro:
      'Activewear and performance-apparel categories we most often source and verify:',
    products: [
      'Leggings & compression tights',
      'Running & training tops',
      'Sports bras',
      'Shorts & joggers',
      'Jackets & performance outerwear',
      'Swimwear',
      'Accessories (caps, bags, socks)',
      'Custom team & club wear',
    ],
    faqs: [
      {
        question: 'How do you stop factories swapping the fabric?',
        answer:
          'Fabric substitution is the single most common activewear problem. We verify the fabric against your approved sample before production completes, and run during-production inspections rather than only a pre-shipment check. That catches a material swap while it is still fixable, instead of when a container of the wrong stock lands in Australia.',
      },
      {
        question: 'What is the minimum order for activewear from China?',
        answer:
          'Most factories start at 200–500 units per style, sometimes up to 1,000 for technical fabrics. We negotiate workable minimums for brands launching their first run, and can match you with suppliers whose MOQ structure suits your volume and budget.',
      },
    ],
  },
  {
    slug: 'construction',
    industry: 'Construction Materials',
    navLabel: 'Construction',
    live: true,
    heroTagline: 'Australia-based · Construction & building materials',
    heroHeading: 'China Sourcing for Construction & Building Materials',
    heroIntro:
      'Building materials carry a compliance layer general goods don\'t — Australian Standards, the NCC, WaterMark, and anti-dumping duties on steel. We verify factories and confirm compliance evidence before goods ship. Book a free consult.',
    stats: [
      { value: 'AS/NZS', label: 'Standards for every material class' },
      { value: 'WaterMark', label: 'Mandatory for plumbing products' },
      { value: '0%', label: 'ChAFTA duty (ex-anti-dumping steel)' },
      { value: '1,200+', label: 'Pre-screened factories in our network' },
    ],
    whyHeading: 'China makes excellent building materials — Australia tests them hard',
    whyBody:
      'China is the dominant source for Australian construction imports — steel, ceramic tiles, glass, aluminium profiles, timber, bathroom fixtures, and PVC. The supply chain is mature, but building materials carry a compliance layer that general merchandise does not. Every material class has an Australian Standard (AS/NZS), and the National Construction Code (NCC) governs what can legally be installed — even though NCC compliance is not checked at customs. Plumbing products need WaterMark certification, which many Chinese factories do not produce by default unless requested. And anti-dumping duties apply to several steel categories (a 10% tariff was imposed on steel ceiling frames in February 2026) independently of ChAFTA. We confirm the right standards evidence — ideally third-party tested — before production, so what arrives can actually be used on site.',
    riskPoints: [
      'NCC compliance isn\'t checked at customs but determines what can legally be installed — non-compliant materials can clear the border yet be unusable on site.',
      'WaterMark certification for plumbing products is not produced by default — it must be specified and verified before production starts.',
      'Anti-dumping duties apply to several steel categories (e.g. ceiling frames, 10% from Feb 2026) on top of, and independent of, ChAFTA rates.',
    ],
    standardsIntro:
      'The key Australian Standards and certifications we verify when sourcing construction materials from China:',
    standards: [
      { code: 'AS 3958', name: 'Ceramic tiles — residential & commercial' },
      { code: 'AS/NZS 2208', name: 'Safety glass — toughened/laminated glazing' },
      { code: 'AS/NZS 3678/3679', name: 'Structural steel — grade, yield, weld quality' },
      { code: 'AS 2047', name: 'Windows & external glazed doors' },
      { code: 'WaterMark', name: 'Mandatory certification for plumbing products' },
      { code: 'AS/NZS 4266', name: 'Formaldehyde limits — MDF & particleboard' },
    ],
    standardsNote:
      'A product can clear customs and still be illegal to install if it doesn\'t meet the relevant AS/NZS standard and NCC. We confirm standards evidence — ideally independent lab testing — before production, not after delivery.',
    productsIntro:
      'Construction and building-material categories we most often source and verify:',
    products: [
      'Ceramic & porcelain tiles',
      'Structural & profile steel',
      'Aluminium systems & glazing',
      'Tapware & sanitaryware (WaterMark)',
      'Timber & engineered wood',
      'Architectural hardware & fittings',
      'Insulation & cladding',
      'PVC fittings & fixtures',
    ],
    faqs: [
      {
        question: 'Do building materials from China meet Australian Standards?',
        answer:
          'They can — but it must be verified, not assumed. Every material class has an Australian Standard (tiles AS 3958, safety glass AS/NZS 2208, structural steel AS/NZS 3678/3679, and so on), and the National Construction Code governs installation. Many Chinese factories can meet these standards but do not by default. We confirm compliance evidence — ideally independent lab testing — before production, so your materials are legal to install.',
      },
      {
        question: 'What about anti-dumping duties on steel from China?',
        answer:
          'Anti-dumping duties apply to several steel categories independently of ChAFTA — for example, a 10% tariff was imposed on steel ceiling frames in February 2026. These apply on top of standard rates. We help verify the correct HS code and check the Australian anti-dumping register so there are no surprises on landed cost.',
      },
    ],
  },
  {
    slug: 'electronics',
    industry: 'Electronics',
    navLabel: 'Electronics',
    live: true,
    heroTagline: 'Australia-based · Electronics & technology sourcing',
    heroHeading: 'China Sourcing for Electronics & Technology',
    heroIntro:
      'Electronics face Australia\'s RCM and EESS safety regime — non-compliant products are detained or destroyed at the border. We verify factories that understand Australian compliance and confirm test evidence before goods ship. Book a free consult.',
    stats: [
      { value: 'RCM', label: 'Mandatory compliance mark' },
      { value: 'EESS', label: '3 risk levels — L2/L3 registered' },
      { value: 'A$15.7B', label: 'AU electronics imports from China (2024)' },
      { value: '1,200+', label: 'Pre-screened factories in our network' },
    ],
    whyHeading: 'The RCM mark is the importer\'s responsibility — so verification protects you',
    whyBody:
      'Australia imported around A$15.7 billion of electronics from China in 2024 — but not every Chinese manufacturer understands Australian compliance, and the legal responsibility sits with the importer. Electrical and electronic products must carry the Regulatory Compliance Mark (RCM) and, depending on risk level, be registered in the Electrical Equipment Safety System (EESS). The supplier provides AS/NZS test reports and EMC evidence; the Australian importer applies the RCM and signs the Supplier Declaration of Conformity. Get it wrong and products can be detained or destroyed at the border. The most important thing we verify is whether a factory genuinely understands Australian requirements — holds ISO 9001, has exported to Australia, and can supply test reports from accredited labs — versus one that has never heard of RCM.',
    riskPoints: [
      'RCM is applied by the Australian importer, but it relies on the factory supplying valid AS/NZS test reports and EMC evidence — we confirm the factory can actually provide them.',
      'EESS registration is mandatory for medium- and high-risk equipment (Level 2/3); missing it means non-compliant goods can be detained at the border.',
      'Suppliers unfamiliar with RCM, or reluctant to provide compliance documentation, are a red flag we screen for during verification.',
    ],
    standardsIntro:
      'The key compliance requirements we verify when sourcing electronics from China:',
    standards: [
      { code: 'RCM', name: 'Regulatory Compliance Mark — mandatory electrical/electronic mark' },
      { code: 'EESS', name: 'Electrical Equipment Safety System — 3 risk levels' },
      { code: 'ACMA / EMC', name: 'Electromagnetic compatibility & radiocommunications' },
      { code: 'AS/NZS', name: 'Safety standards + accredited-lab test reports' },
      { code: 'ISO 9001', name: 'Quality management — prioritised in supplier selection' },
      { code: 'RoHS', name: 'Restriction of hazardous substances' },
    ],
    standardsNote:
      'The single most valuable check for electronics is whether the factory genuinely understands Australian compliance and can supply accredited test reports — not just whether the product works on the bench.',
    productsIntro:
      'Electronics and technology categories we most often source and verify:',
    products: [
      'Consumer electronics & appliances',
      'LED lighting & systems',
      'Solar & battery storage',
      'PCB & electronic components',
      'Industrial automation components',
      'Smart home & IoT devices',
      'Power supplies & adapters',
      'AV & broadcast equipment',
    ],
    faqs: [
      {
        question: 'Who is responsible for RCM compliance — me or the factory?',
        answer:
          'In Australia, the importer is responsible for applying the RCM mark and signing the Supplier Declaration of Conformity — but it relies on the factory supplying valid AS/NZS test reports and EMC evidence. That\'s why supplier verification matters so much for electronics: we confirm the factory genuinely understands Australian requirements and can provide accredited-lab test reports, rather than discovering at the border that they can\'t.',
      },
      {
        question: 'What happens if electronics fail Australian compliance?',
        answer:
          'Non-compliant electrical products can be detained or destroyed at the Australian border, and market-surveillance authorities can run compliance checks even after goods clear customs. Medium- and high-risk equipment (EESS Level 2/3) must be registered in the EESS database. We screen suppliers for RCM/EESS understanding before you order, so compliance is confirmed at the factory rather than discovered at the wharf.',
      },
    ],
  },
  {
    slug: 'av-lighting',
    industry: 'AV & Lighting',
    navLabel: 'AV & Lighting',
    live: true,
    heroImage:
      'https://images.unsplash.com/photo-1727096857692-e9dadf2bc92e?auto=format&fit=crop&w=1600&q=80',
    heroTagline: 'Australia-based · AV & lighting sourcing',
    heroHeading: 'China Sourcing for AV & Lighting Equipment',
    heroIntro:
      'Lighting and AV gear must clear Australia on two fronts general goods don\'t — electrical safety and energy efficiency. We verify factories that understand RCM, EESS, GEMS, and EMC, and confirm test evidence before goods ship. Book a free consult.',
    stats: [
      { value: 'RCM', label: 'Mandatory electrical + EMC mark' },
      { value: 'EESS', label: 'Mains lighting is often Level 2 — registered' },
      { value: 'GEMS', label: 'Energy-efficiency registration & labelling' },
      { value: '1,200+', label: 'Pre-screened factories in our network' },
    ],
    whyHeading: 'LED and AV gear fail Australia on two fronts — safety and energy',
    whyBody:
      'China dominates global lighting and AV manufacturing, but this category carries two compliance layers general merchandise does not. First, safety and EMC: electrical products must carry the Regulatory Compliance Mark (RCM), mains-powered luminaires are commonly medium-risk under the Electrical Equipment Safety System (EESS Level 2) and must be registered, and cheap LED drivers are a notorious source of electromagnetic interference that fails AS/NZS CISPR limits enforced by the ACMA. Second, energy: many lamps, displays, and external power supplies must be registered under the Greenhouse and Energy Minimum Standards (GEMS) and carry an energy-rating label before they can legally be sold. On top of that, recessed downlights must carry the correct IC/abutment rating (AS/NZS 60598.2.2) or they are a ceiling-fire risk and cannot be installed to the NCC. We confirm the factory can supply accredited-lab safety, EMC, and energy evidence — before production, not at the wharf.',
    riskPoints: [
      'LED drivers and lighting are common EMC failures — low-cost drivers radiate interference and fail AS/NZS CISPR limits; we confirm EMC test evidence before shipment.',
      'GEMS registration and energy labelling are mandatory for certain lamps, TVs, and external power supplies — factories do not provide this by default and it must be arranged before sale.',
      'Recessed downlights must carry the correct IC/IC-4 abutment rating; the wrong rating is a ceiling-fire hazard and cannot be installed under the NCC.',
    ],
    standardsIntro:
      'The key Australian standards and controls we verify against when sourcing AV & lighting from China:',
    standards: [
      { code: 'RCM', name: 'Regulatory Compliance Mark — mandatory electrical + EMC mark' },
      { code: 'EESS', name: 'Electrical Equipment Safety System — mains lighting often Level 2' },
      { code: 'AS/NZS 60598', name: 'Luminaires — safety (incl. IC rating for downlights)' },
      { code: 'AS/NZS 61347', name: 'Lamp controlgear — LED drivers & ballasts' },
      { code: 'GEMS', name: 'Energy-efficiency registration & rating label' },
      { code: 'AS/NZS CISPR / EMC', name: 'Electromagnetic compatibility (ACMA)' },
    ],
    standardsNote:
      'For lighting and AV the two checks that catch most importers are EMC (cheap LED drivers failing CISPR limits) and GEMS energy registration — both must be confirmed with accredited-lab evidence at the factory, not discovered after delivery.',
    productsIntro:
      'AV and lighting categories we most often source and verify:',
    products: [
      'LED downlights & panels',
      'Commercial & architectural lighting',
      'LED drivers & controlgear',
      'Stage, studio & event lighting',
      'Outdoor & landscape lighting (IP-rated)',
      'Displays, projectors & digital signage',
      'Audio, PA & conferencing systems',
      'Smart lighting & DALI controls',
    ],
    faqs: [
      {
        question: 'Why do LED lights from China often fail Australian compliance?',
        answer:
          'Three reasons. Electromagnetic compatibility (EMC) — low-cost LED drivers radiate interference and fail the AS/NZS CISPR limits the ACMA enforces. Electrical safety — mains luminaires are commonly EESS Level 2 and must be registered, with the RCM mark applied by the importer against valid AS/NZS test reports. And energy — certain lamps must be GEMS-registered and carry an energy label. We verify the factory can supply accredited-lab EMC, safety, and energy evidence before you order.',
      },
      {
        question: 'Do commercial lights and AV products need energy-efficiency registration?',
        answer:
          'Some do. The Greenhouse and Energy Minimum Standards (GEMS) cover a defined list of products — including certain lamps, televisions, and external power supplies — which must be registered and labelled before they can legally be sold in Australia. Factories rarely provide GEMS registration by default. We confirm whether your specific product is in-scope and that the required evidence and labelling can be arranged before shipment.',
      },
    ],
  },
]

export function getLiveIndustries(): IndustryData[] {
  return INDUSTRIES.filter((i) => i.live)
}

export function getIndustry(slug: string): IndustryData | undefined {
  return INDUSTRIES.find((i) => i.slug === slug && i.live)
}
