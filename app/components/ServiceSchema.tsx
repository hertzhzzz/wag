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
    "description": "Expert China sourcing services for Australian businesses including guided factory tours in China, supplier verification, quality inspections, and end-to-end procurement coordination. As a China sourcing agent in Australia, we help businesses visit Chinese factories with pre-screened suppliers, bilingual guides, and 12-point verification process.",
    "serviceType": ["China Sourcing Agent", "Factory Tour", "Supplier Verification", "Quality Inspection", "Procurement Support", "China Business Tour"],
    "priceRange": "Contact for quote",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "China Sourcing Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "China Factory Tour",
            "description": "Guided factory visits in China with pre-screened suppliers, bilingual guide, and transportation"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Supplier Verification",
            "description": "12-point supplier verification process for Chinese manufacturers"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Procurement Trip Package",
            "description": "Complete China business trip package with supplier introductions and logistics coordination"
          }
        }
      ]
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
