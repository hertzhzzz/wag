'use client'

import FAQ from '@/components/FAQ'

// SEO FAQ copy stays English (not translated) — same pattern as other service landings.
const faqs: Array<{ question: string; answer: string }> = [
  {
    question: 'What industries do you work with?',
    answer:
      'We cover 50+ industries including AV equipment, automotive parts, engineering machinery, agricultural equipment, precision manufacturing, and heavy equipment. If you are importing from China, we can help.',
  },
  {
    question: 'How do you verify factories?',
    answer:
      'Our 12-point verification process covers: SAMR business registration check, export history verification, production capacity assessment, quality certification authentication, sample evaluation, and financial stability review — all before your visit.',
  },
  {
    question: 'What does the service cost?',
    answer:
      'A deposit is required to begin. Service fees are discussed after we understand your product and requirements. You receive a clear scope and fee proposal before any engagement begins.',
  },
  {
    question: 'Do you handle logistics and shipping?',
    answer:
      'Yes. We coordinate freight forwarding, customs clearance documentation, and shipping from the factory to your door in Australia. We work with established freight partners to ensure competitive rates.',
  },
  {
    question: 'Can you help if I have already found a supplier on Alibaba or 1688?',
    answer:
      'Absolutely. Many Australian businesses come to us after a frustrating DIY experience on Alibaba or 1688. We can verify your existing shortlist, conduct independent audits, and help you make a decision — before you commit.',
  },
  {
    question: 'Do I need to travel to China?',
    answer:
      'Factory visits are strongly recommended — they give you the best insight into whether a supplier is genuine and capable. However, if travel is not possible, we can conduct full on-site assessments on your behalf and provide detailed written reports.',
  },
  {
    question: 'What if a factory fails quality expectations after shipment?',
    answer:
      'We provide post-delivery support including dispute resolution with your supplier, re-inspection coordination, and follow-up factory visits if needed. Our relationship with your supplier does not end at delivery.',
  },
  {
    question: 'How is this different from using a generic sourcing agent?',
    answer:
      'Winning Adventure Global is Australia-based with a China-based operations team. We do not take factory commissions, our incentives align with your outcome, and our 12-point verification process is specifically designed for Australian import requirements. We also provide full post-trip written assessments.',
  },
]

/** Client island: accordion only. FAQ Q/A HTML still SSR via this client component. */
export default function ChinaSourcingAgentFAQ() {
  return <FAQ faqs={faqs} />
}
