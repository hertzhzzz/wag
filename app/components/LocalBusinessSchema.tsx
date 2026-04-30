export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Winning Adventure Global",
    "url": "https://www.winningadventure.com.au",
    "image": "https://www.winningadventure.com.au/logos/logo.png",
    "telephone": "+61-416588198",
    "priceRange": "Contact for quote",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "5, 54 Melbourne St",
      "addressLocality": "North Adelaide",
      "addressRegion": "SA",
      "postalCode": "5006",
      "addressCountry": "AU"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -34.9067,
      "longitude": 138.5765
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "description": "Winning Adventure Global is an Adelaide-based China sourcing agency. We guide Australian businesses through guided factory visits in China, supplier verification, and end-to-end procurement coordination.",
    "areaServed": {
      "@type": "Country",
      "name": "Australia"
    },
    "sameAs": [
      "https://www.linkedin.com/company/winning-adventure-global"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
