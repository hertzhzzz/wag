'use client'

import { useState } from 'react'
import { Industry, MoreIndustryCategory } from './types'
import IndustryCard from './IndustryCard'
import FeaturedPanel from './FeaturedPanel'
import MoreIndustries from './MoreIndustries'

export const featured: Industry[] = [
  {
    num: '01', name: 'Aesthetics & Cosmetics', sub: 'Aesthetics / Cosmetic Raw Materials',
    desc: 'We connect Australian aesthetics clinics and cosmetics brands with verified Chinese raw material suppliers. From active ingredients to packaging, OEM and ODM options available with full compliance documentation.',
    tags: ['Active Ingredients', 'OEM/ODM', 'GMP Certified'],
    img: 'https://images.unsplash.com/photo-1766940095250-5c7715ab57ea?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '02', name: 'Agricultural Drones', sub: 'Agricultural / Commercial UAV',
    desc: 'Precision agriculture UAVs, commercial inspection drones, and custom payload platforms. Direct from Shenzhen manufacturers with CASA compliance support for Australian market entry.',
    tags: ['Ag Drones', 'Commercial UAV', 'CASA Support'],
    img: 'https://images.unsplash.com/photo-1589313331637-fa8ceb1fac0d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '03', name: 'Chemical & Industrial', sub: 'Chemical Raw Materials',
    desc: 'Bulk chemical supply with full MSDS documentation, factory audits, and compliance support. Sourced from verified manufacturers across Guangdong, Zhejiang, and Shandong.',
    tags: ['Bulk Supply', 'MSDS Docs', 'Factory Audit'],
    img: 'https://images.unsplash.com/photo-1579053335340-bbeb51aa27c3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '04', name: 'Fashion & Apparel', sub: 'Fashion, Footwear & Accessories',
    desc: "Private label manufacturing for clothing, footwear, and accessories. Flexible MOQ, end-to-end QC, and direct factory relationships in Guangzhou's garment districts.",
    tags: ['Private Label', 'Flexible MOQ', 'QC Included'],
    img: 'https://images.unsplash.com/photo-1542044801-30d3e45ae49a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '05', name: 'Food & Beverage', sub: 'Processed Foods, Beverages & Organic Products',
    desc: 'Connect with HACCP-certified Chinese food manufacturers for private label, bulk ingredient supply, and co-packing. Full export documentation and Australian import compliance support included.',
    tags: ['HACCP Certified', 'Private Label', 'Export Docs'],
    img: 'https://images.unsplash.com/photo-1558419358-1d40b2a5d5ed?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '06', name: 'Healthcare & Medical', sub: 'Medical Devices, Supplements & PPE',
    desc: 'Source TGA-pathway medical devices, health supplements, and PPE from verified Chinese manufacturers. We handle factory audits, compliance documentation, and quality inspections before shipment.',
    tags: ['TGA Pathway', 'Factory Audit', 'QC Inspection'],
    img: 'https://images.unsplash.com/photo-1666214282554-39104df48982?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '07', name: 'Construction & Building', sub: 'Tiles, Steel, Glass & Hardware',
    desc: 'Bulk construction materials sourced directly from Chinese manufacturers — tiles, flooring, steel profiles, aluminium systems, and glazing. Factory visits to verify quality before committing to volume orders.',
    tags: ['Bulk Orders', 'Quality Verified', 'Direct Factory'],
    img: 'https://images.unsplash.com/photo-1769284022654-66c6b07dae78?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '08', name: 'Technology & Electronics', sub: 'Consumer Electronics, Solar & LED',
    desc: 'From solar panels and LED systems to consumer electronics and industrial automation components. We connect you with verified Shenzhen and Guangdong manufacturers with full CE/RCM compliance support.',
    tags: ['Solar & LED', 'RCM Compliance', 'PCB & Electronics'],
    img: 'https://images.unsplash.com/photo-1771189956746-e96f8bf77d42?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '09', name: 'Furniture & Homewares', sub: 'Office, Outdoor & Home Décor',
    desc: "Custom and off-the-shelf furniture manufacturing from Foshan and Guangzhou — the world's furniture capital. Private label homewares, kitchenware, and storage solutions with flexible MOQ.",
    tags: ['Custom Manufacturing', 'Foshan Factories', 'Flexible MOQ'],
    img: 'https://images.unsplash.com/photo-1667584523303-5d9e6779382b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '10', name: 'CBD Retail & Commercial', sub: 'Chinese CBD Shopping Centres',
    desc: 'Connect with Chinese CBD property developers, anchor tenant networks, and fit-out suppliers for retail and commercial spaces in Guangzhou, Shenzhen, and Beijing prime commercial districts.',
    tags: ['Leasing', 'Fit-out', 'Anchor Tenants'],
    img: 'https://images.unsplash.com/photo-1761333482894-700fc6aebd47?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '11', name: 'Industrial Property', sub: 'Industrial Land & Commercial Property',
    desc: 'Factory, warehouse, and office space sourcing across key industrial zones in South and Central China. Ideal for Australian businesses establishing manufacturing or logistics bases.',
    tags: ['Factory', 'Warehouse', 'Office'],
    img: 'https://images.unsplash.com/photo-1669003750593-5cef469ce172?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '12', name: 'AV & Smart Systems', sub: 'AV, Lighting & Smart Building',
    desc: 'Full AV integration, smart building systems, and broadcast-grade equipment. Verified Chinese manufacturers with Australian standards compliance and local installation support.',
    tags: ['AV Integration', 'Smart Building', 'Broadcast'],
    img: 'https://images.unsplash.com/photo-1681263832106-40723a86886d?auto=format&fit=crop&w=1200&q=80',
  },
]

export const moreIndustries: MoreIndustryCategory[] = [
  {
    category: 'Packaging & Print',
    items: ['Custom Packaging', 'Label Printing', 'Display Stands', 'Corrugated Boxes', 'Eco Packaging', 'Retail POS'],
  },
  {
    category: 'Agriculture & Farming',
    items: ['Farm Equipment', 'Fertilisers', 'Greenhouse Systems', 'Irrigation', 'Cold Chain Logistics', 'Seeds & Plants'],
  },
  {
    category: 'Automotive & Transport',
    items: ['Auto Parts', 'EV Accessories', 'Tyres & Wheels', 'Fleet Equipment', 'Logistics Vehicles', 'Workshop Tools'],
  },
  {
    category: 'Energy & Environment',
    items: ['Solar Systems', 'Battery Storage', 'Water Treatment', 'Waste Management', 'EV Charging', 'Wind Components'],
  },
]

export default function Industries() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section id="industries" className="bg-[#f0f4f8] py-[72px] px-4 md:px-10">
      <div className="max-w-[1100px] mx-auto">
        <p className="uppercase tracking-[0.12em] text-xs text-amber font-semibold mb-3">
          Industries We Serve
        </p>
        <h2 className="font-serif text-4xl text-navy mb-2">
          Select Your Sector.
        </h2>
        <p className="text-sm text-[#64748b] mb-10">
          50+ industries covered across 8+ Chinese provinces — if you don&apos;t see yours, let&apos;s talk.
        </p>
      </div>

      {/* Featured panel */}
      <div className="flex flex-col md:grid-cols-[260px_1fr] rounded-lg overflow-hidden shadow-[0_4px_24px_rgba(15,45,94,0.08)] max-w-[1100px] mx-auto mb-4">
        {/* Left sidebar */}
        <div className="bg-navy flex flex-col">
          {featured.map((industry, idx) => (
            <IndustryCard
              key={idx}
              industry={industry}
              isActive={activeIndex === idx}
              onClick={() => setActiveIndex(idx)}
            />
          ))}
        </div>

        {/* Right panel */}
        <FeaturedPanel industries={featured} activeIndex={activeIndex} />
      </div>

      {/* More Industries */}
      <MoreIndustries categories={moreIndustries} />
    </section>
  )
}
