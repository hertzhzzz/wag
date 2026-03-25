export default function PersonSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Andy Liu",
    "jobTitle": "Founder",
    "description": "China sourcing expert helping Australian businesses connect with verified Chinese manufacturers",
    "url": "https://www.winningadventure.com.au/about",
    "image": "https://www.winningadventure.com.au/andy-liu.jpg",
    "telephone": "+61-416588198",
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
    "sameAs": [],
    "knowsAbout": ["China manufacturing", "Supplier verification", "B2B procurement", "Factory tours"],
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
