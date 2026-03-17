'use client'

export default function ServiceSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "China Sourcing Services",
    "provider": {
      "@type": "Organization",
      "name": "Winning Adventure Global",
      "url": "https://www.winningadventure.com.au"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Australia"
    },
    "description": "Expert China sourcing services including factory tours, supplier verification, quality inspections, and procurement coordination for Australian businesses.",
    "serviceType": ["Factory Tour", "Supplier Verification", "Quality Inspection", "Procurement Support"],
    "priceRange": "AUD $2,000 - $50,000+"
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
