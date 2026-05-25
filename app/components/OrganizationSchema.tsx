export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Winning Adventure Global",
    "url": "https://www.winningadventure.com.au",
    "logo": "https://www.winningadventure.com.au/og-image.jpg",
    "email": "mark@winningadventure.com.au",
    "areaServed": "Australia",
    "foundingDate": "2026",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "5/54 Melbourne St",
      "addressLocality": "North Adelaide",
      "addressRegion": "SA",
      "postalCode": "5006",
      "addressCountry": "AU"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}