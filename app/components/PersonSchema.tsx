export default function PersonSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Andy Liu",
    "jobTitle": "Founder",
    "description": "Founder of Winning Adventure Global. Moved from China to Adelaide. Spent years inside Chinese manufacturing hubs — Shenzhen, Foshan, Guangzhou — helping Australian businesses source with confidence.",
    "url": "https://www.winningadventure.com.au/about",
    "image": "https://www.winningadventure.com.au/og-image.jpg",
    "telephone": "+61-416588198",
    "nationality": {
      "@type": "Country",
      "name": "Australia"
    },
    "birthPlace": {
      "@type": "Place",
      "name": "China"
    },
    "worksFor": {
      "@type": "Organization",
      "name": "Winning Adventure Global",
      "url": "https://www.winningadventure.com.au",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "5, 54 Melbourne St",
        "addressLocality": "North Adelaide",
        "addressRegion": "SA",
        "postalCode": "5006",
        "addressCountry": "AU"
      }
    },
    "hasCredential": [
      {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "professional certification",
        "description": "12-point factory verification methodology developed through years operating inside Chinese manufacturing hubs"
      }
    ],
    "sameAs": [
      "https://www.linkedin.com/company/winning-adventure-global",
      "https://www.facebook.com/winningadventureglobal",
      "https://www.youtube.com/@winningadventure",
      "https://www.instagram.com/winningadventureglobal",
      "https://share.google/qQBUJkAAn1ZChq7Mc"
    ],
    "knowsAbout": [
      "China manufacturing",
      "Shenzhen",
      "Foshan",
      "Guangzhou",
      "Supply Chain Management",
      "Factory Verification",
      "International Trade",
      "Pearl River Delta Manufacturing",
      "Australian B2B procurement"
    ],
    "areaServed": {
      "@type": "Country",
      "name": "Australia"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
