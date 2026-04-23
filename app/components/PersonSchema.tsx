export default function PersonSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Andy Liu",
    "jobTitle": "Founder",
    "description": "Founder of Winning Adventure Global. Based in Adelaide, helping Australian businesses find verified manufacturers in China with local accountability and direct access to WAG's factory network.",
    "url": "https://www.winningadventure.com.au/about",
    "image": "https://www.winningadventure.com.au/og-image.jpg",
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
    "sameAs": [
      "https://www.linkedin.com/company/winning-adventure-global",
      "https://www.facebook.com/winningadventureglobal",
      "https://www.youtube.com/@winningadventure",
      "https://www.instagram.com/winningadventureglobal"
    ],
    "knowsAbout": ["China manufacturing", "Supply Chain Management", "Factory Verification", "International Trade", "Pearl River Delta Manufacturing", "Australian B2B procurement"],
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
