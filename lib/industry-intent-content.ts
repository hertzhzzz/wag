/**
 * Industry Intent Page content model (C4).
 * Shared dual-path skeleton + per-industry rewrites.
 * Ticket 02 ships AV; construction and ag follow in 03/04.
 */

import { buildIndustryQualifiedIntake } from './industry-qualified-intake'

export const INDUSTRY_PRIMARY_CTA = buildIndustryQualifiedIntake.defaultCta
export const INDUSTRY_PRIMARY_PATH_LABEL = 'Find and vet new suppliers'
export const INDUSTRY_SECONDARY_PATH_LABEL = 'Visit or verify an existing supplier'

export type IndustryIntentFaq = {
  question: string
  answer: string
}

export type IndustryIntentSections = {
  whoFor: {
    heading: string
    body: string
    bullets: string[]
  }
  twoPaths: {
    heading: string
    primary: { title: string; body: string }
    secondary: { title: string; body: string }
  }
  deliver: {
    heading: string
    claims: string[]
    nonClaims: string[]
  }
  proof: {
    heading: string
    body: string
    risks: string[]
    standards: { code: string; name: string }[]
    standardsNote: string
    productsIntro: string
    products: string[]
  }
  engagement: {
    heading: string
    body: string
    steps: { title: string; body: string }[]
  }
  beforeContact: {
    heading: string
    checklist: string[]
  }
  faqs: IndustryIntentFaq[]
  finalCta: {
    heading: string
    body: string
    ctaLabel: typeof INDUSTRY_PRIMARY_CTA
  }
}

export type IndustryIntentPage = {
  slug: string
  industry: string
  navLabel: string
  title: string
  h1: string
  metaDescription: string
  heroTagline: string
  heroIntro: string
  heroImage?: string
  stats: { value: string; label: string }[]
  primaryPathLabel: typeof INDUSTRY_PRIMARY_PATH_LABEL
  secondaryPathLabel: typeof INDUSTRY_SECONDARY_PATH_LABEL
  sections: IndustryIntentSections
}

export function buildIndustryPageTitle(industryDisplayName: string): string {
  return `${industryDisplayName} China Sourcing for Australian Businesses`
}

const AV_LIGHTING: IndustryIntentPage = {
  slug: 'av-lighting',
  industry: 'AV & Lighting',
  navLabel: 'AV & Lighting',
  title: buildIndustryPageTitle('AV & Lighting'),
  h1: 'Find and Vet AV & Lighting Suppliers in China',
  metaDescription:
    'Australia-based China sourcing for AV and lighting: find and shortlist suppliers, due diligence, visit planning, and on-ground coordination. RCM, EESS, GEMS and EMC evidence checked before you commit.',
  heroTagline: 'Australia-based · AV & lighting China sourcing',
  heroIntro:
    'For Australian integrators, distributors, and project buyers who need reliable AV and lighting supply from China — not a generic factory list. Primary path: find and vet new suppliers. Secondary path: visit or verify a factory you already know.',
  heroImage:
    'https://images.unsplash.com/photo-1727096857692-e9dadf2bc92e?auto=format&fit=crop&w=1600&q=80',
  stats: [
    { value: 'RCM', label: 'Mandatory electrical + EMC mark' },
    { value: 'EESS', label: 'Mains lighting often Level 2 registered' },
    { value: 'GEMS', label: 'Energy registration where in-scope' },
    { value: '2 paths', label: 'Find new or verify existing' },
  ],
  primaryPathLabel: INDUSTRY_PRIMARY_PATH_LABEL,
  secondaryPathLabel: INDUSTRY_SECONDARY_PATH_LABEL,
  sections: {
    whoFor: {
      heading: 'Who this is for',
      body:
        'Australian AV integrators, lighting distributors, commercial fit-out buyers, and project owners who need China supply they can defend to clients, insurers, and inspectors. Ideal if you are specifying LED, controlgear, displays, audio, or event lighting and need more than Alibaba screenshots.',
      bullets: [
        'You are building or refreshing a supplier shortlist for AV or lighting',
        'You need Australian electrical, EMC, and energy evidence — not export claims alone',
        'You want a decision-grade briefing before deposits, tooling, or factory travel',
      ],
    },
    twoPaths: {
      heading: 'Two paths for AV & lighting buyers',
      primary: {
        title: INDUSTRY_PRIMARY_PATH_LABEL,
        body:
          'We shortlist factories that can actually make your product class, then vet capability, export history, and Australian-facing compliance evidence (RCM pathway, EESS risk level, EMC, and GEMS where relevant). You get a shortlist you can act on — not a directory dump.',
      },
      secondary: {
        title: INDUSTRY_SECONDARY_PATH_LABEL,
        body:
          'Already have a factory contact or a preferred OEM? We help you visit or verify that supplier: licence and entity checks, capability review, and trip coordination so you do not fly blind or wire money on trust alone.',
      },
    },
    deliver: {
      heading: 'What we deliver — and what we do not claim',
      claims: [
        'Find and shortlist AV & lighting factories matched to your product class',
        'Due diligence on entity legitimacy, capability, and compliance evidence',
        'Visit planning for factory meetings in China',
        'On-ground coordination with Australia-based and China-based teams',
      ],
      nonClaims: [
        'We do not place orders or pay suppliers on your behalf',
        'We do not run commercial negotiation as the primary offer',
        'Quality inspection is not the primary product on this page',
        'We do not handle international freight, customs clearance, or turnkey installation',
      ],
    },
    proof: {
      heading: 'AV & lighting risks Australian buyers actually face',
      body:
        'China dominates global lighting and AV manufacturing, but Australian sales fail on two layers general merchandise does not: electrical safety/EMC, and energy registration. Cheap LED drivers are a common EMC failure under AS/NZS CISPR limits. Mains luminaires are often EESS Level 2 and must be registered. Certain lamps, displays, and external power supplies need GEMS registration and labelling. Recessed downlights with the wrong IC rating are a ceiling-fire and NCC installation risk.',
      risks: [
        'LED drivers and lighting are frequent EMC failures — low-cost drivers radiate interference and fail AS/NZS CISPR limits enforced by ACMA.',
        'GEMS registration and energy labelling are mandatory for in-scope lamps, TVs, and external power supplies; factories rarely arrange this by default.',
        'Recessed downlights need the correct IC/IC-4 abutment rating under AS/NZS 60598.2.2 or they cannot be installed to the NCC.',
        'The importer applies RCM in Australia, but only if the factory can supply valid AS/NZS safety and EMC evidence from accredited labs.',
      ],
      standards: [
        { code: 'RCM', name: 'Regulatory Compliance Mark — electrical + EMC' },
        { code: 'EESS', name: 'Electrical Equipment Safety System — mains lighting often Level 2' },
        { code: 'AS/NZS 60598', name: 'Luminaires safety (including IC rating for downlights)' },
        { code: 'AS/NZS 61347', name: 'Lamp controlgear — LED drivers and ballasts' },
        { code: 'GEMS', name: 'Energy-efficiency registration and rating label' },
        { code: 'AS/NZS CISPR / EMC', name: 'Electromagnetic compatibility (ACMA)' },
      ],
      standardsNote:
        'The two checks that catch most AV and lighting importers are EMC (cheap LED drivers failing CISPR limits) and GEMS energy registration — both need accredited-lab evidence confirmed at origin, not after a container lands.',
      productsIntro: 'AV and lighting categories we most often help Australian buyers source and vet:',
      products: [
        'LED downlights and panels',
        'Commercial and architectural lighting',
        'LED drivers and controlgear',
        'Stage, studio, and event lighting',
        'Outdoor and landscape lighting (IP-rated)',
        'Displays, projectors, and digital signage',
        'Audio, PA, and conferencing systems',
        'Smart lighting and DALI controls',
      ],
    },
    engagement: {
      heading: 'How engagement works',
      body:
        'One commercial conversation, two procurement paths. We scope find-new vs verify-existing first, then only deepen the work that matches your timeline and risk.',
      steps: [
        {
          title: 'Scope the path',
          body: 'You tell us product class, volumes, and whether you need new suppliers or help with an existing factory.',
        },
        {
          title: 'Shortlist or target review',
          body: 'Find-new: shortlist factories with relevant production. Verify-existing: review the supplier you already have.',
        },
        {
          title: 'Due diligence',
          body: 'Entity, capability, export history, and Australian-facing compliance evidence for AV and lighting.',
        },
        {
          title: 'Visit planning',
          body: 'If travel makes sense, we plan factory meetings and logistics with on-ground coordination.',
        },
        {
          title: 'You own the commercial relationship',
          body: 'You buy direct. We do not insert ourselves as the importer of record or the negotiating principal.',
        },
      ],
    },
    beforeContact: {
      heading: 'What you need before contacting us',
      checklist: [
        'Product class and rough specification (e.g. commercial downlights, LED drivers, PA system)',
        'Approximate volume or project scale',
        'Whether you are finding new suppliers or verifying an existing one',
        'Target timeline (within 3 months, 3–6 months, later, or still exploring)',
        'Any must-have compliance constraints (RCM/EESS pathway, GEMS, IP rating, IC rating)',
      ],
    },
    faqs: [
      {
        question: 'Do you only verify factories, or can you help me find new AV suppliers?',
        answer:
          'Finding and vetting new suppliers is the primary path on this page. Verification of an existing factory is the secondary path. Both use the same Australia-based / China-based operating model; the difference is whether we shortlist new factories or assess a supplier you already know.',
      },
      {
        question: 'Why do LED lights from China often fail Australian compliance?',
        answer:
          'Three common failure modes: electromagnetic compatibility (cheap LED drivers failing AS/NZS CISPR limits), electrical safety/EESS registration for mains luminaires, and GEMS energy registration for in-scope products. We confirm whether a factory can supply accredited-lab safety, EMC, and energy evidence before you commit.',
      },
      {
        question: 'Do commercial lights and AV products need energy-efficiency registration?',
        answer:
          'Some do. GEMS covers a defined list including certain lamps, televisions, and external power supplies. Factories rarely provide GEMS registration by default. We help you confirm whether your product is in-scope and whether the required evidence and labelling can be arranged before sale in Australia.',
      },
      {
        question: 'What do you not do for AV and lighting projects?',
        answer:
          'We do not place orders, pay suppliers, act as commercial negotiator of record, run quality inspection as the primary product, handle international freight or customs, or deliver turnkey installation. Our scope is find, shortlist, due diligence, visit planning, and on-ground coordination.',
      },
    ],
    finalCta: {
      heading: 'Discuss your AV & lighting sourcing project',
      body:
        'Tell us whether you need new suppliers or help with an existing factory, your timeline, and a short project brief. We respond within 4 business hours.',
      ctaLabel: INDUSTRY_PRIMARY_CTA,
    },
  },
}

const INTENT_PAGES: Record<string, IndustryIntentPage> = {
  'av-lighting': AV_LIGHTING,
}

export function getIndustryIntentPage(slug: string): IndustryIntentPage | undefined {
  return INTENT_PAGES[slug]
}

export function listIndustryIntentSlugs(): string[] {
  return Object.keys(INTENT_PAGES)
}
