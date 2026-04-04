import type { HowToArticle } from './types'

// ============================================
// HOW-TO SCHEMA DATA
// ============================================

export const HOW_TO_ARTICLES: Record<string, HowToArticle> = {
  'how-to-import-from-china': {
    name: 'How to Import from China: A Practical Guide for Australian Businesses',
    description: 'Complete guide covering Australian customs requirements, GST, quarantine rules, finding suppliers, and arranging factory visits for Australian businesses importing from China.',
    steps: [
      { name: 'Register for ABN and Import Client Account', text: 'Before importing, register for an Australian Business Number (ABN) and an Import Client Account with Australian Border Force (ABF).' },
      { name: 'Identify and Verify Suppliers', text: 'Research and verify Chinese suppliers through factory visits, 12-point verification, or trusted sourcing agents.' },
      { name: 'Negotiate Terms and Sign Contracts', text: 'Negotiate pricing, MOQ, payment terms, and quality standards. Always use written contracts with verified suppliers.' },
      { name: 'Arrange Production and Quality Inspection', text: 'Monitor production progress and conduct quality inspections before shipment to ensure compliance with Australian standards.' },
      { name: 'Navigate Australian Customs and Quarantine', text: 'Lodge import declarations, pay customs duties and GST, and meet quarantine requirements for your goods.' },
    ],
  },
  'how-to-verify-chinese-factories-1688': {
    name: 'How to Verify Chinese Factories on 1688',
    description: 'Step-by-step guide to verifying suppliers on 1688.com, including red flags to watch for and our 12-point factory verification process.',
    steps: [
      { name: 'Confirm Business License', text: "Request and verify the Chinese supplier's business license (营业执照) through official channels." },
      { name: 'Verify Factory Location', text: 'Use satellite imaging or third-party inspectors to confirm the factory address matches claimed location.' },
      { name: 'Assess Production Capacity', text: 'Request photos or videos of production lines, equipment, and worker count to verify capacity claims.' },
      { name: 'Check Export History', text: 'Ask for export records and verify previous overseas clients, particularly in your target market.' },
      { name: 'Conduct In-Person Visit', text: 'Arrange a factory tour with bilingual support to inspect facilities, quality systems, and meet key personnel.' },
    ],
  },
  'china-factory-tour-guide': {
    name: 'China Factory Tour Guide: Complete Planning Resource',
    description: 'Everything you need to know about planning and executing a productive factory tour in China, from itinerary planning to post-visit follow-up.',
    steps: [
      { name: 'Define Your Sourcing Objectives', text: 'Clarify what you want to achieve: verify suppliers, negotiate contracts, inspect quality, or explore new products.' },
      { name: 'Pre-Vet Suppliers Before Traveling', text: 'Use 1688 verification, third-party audits, or our pre-screening service to shortlist 3-5 factories before departure.' },
      { name: 'Plan Your Itinerary', text: 'Arrange visits geographically, book bilingual guides, and schedule 2-3 factory visits per day with travel buffer.' },
      { name: 'Execute Site Visits', text: 'Conduct thorough facility inspections, request samples, photograph production lines, and verify documentation.' },
      { name: 'Follow Up and Negotiate', text: 'Send follow-up emails within 48 hours, request formal quotes, and maintain relationships for future orders.' },
    ],
  },
  'bulk-procurement-china-guide': {
    name: 'Bulk Procurement from China: Complete Guide',
    description: 'Strategic guide to bulk purchasing from China, covering supplier negotiation, volume discounts, shipping logistics, and cost optimization.',
    steps: [
      { name: 'Calculate Total Landed Cost', text: 'Factor in product cost, tooling, shipping, customs duties, GST, handling, and quality control into your per-unit cost.' },
      { name: 'Negotiate Volume Discounts', text: 'Leverage MOQ flexibility, long-term contracts, and combined orders across product lines to secure better pricing.' },
      { name: 'Optimize Shipping and Logistics', text: 'Compare LCL vs FCL shipping, consolidation options, and choose Incoterms that balance risk and cost.' },
      { name: 'Implement Quality Control Processes', text: 'Establish QC checkpoints, accept/reject criteria, and consider third-party inspection services for large orders.' },
      { name: 'Manage Currency and Payment Risk', text: 'Use forward contracts or payment terms to hedge FX exposure, and structure payments to protect both parties.' },
    ],
  },
}
