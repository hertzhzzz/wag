export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Winning Adventure Global",
    "url": "https://www.winningadventure.com.au",
    "image": "https://www.winningadventure.com.au/social/og-image.png",
    "telephone": "+61 0416 588 198",
    "email": "mark@winningadventure.com.au",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Unit 5, 54 Melbourne St",
      "addressLocality": "North Adelaide",
      "addressRegion": "SA",
      "postalCode": "5006",
      "addressCountry": "AU"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -34.9071,
      "longitude": 138.5986
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
        "closes": "17:30"
      }
    ],
    "description": "Winning Adventure Global is an Australian China sourcing agency based in North Adelaide. We guide Australian businesses through guided factory visits in China, supplier verification, and end-to-end procurement coordination.",
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
