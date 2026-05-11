export default function MarkHeSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Mark He",
    "jobTitle": "Managing Director",
    "description": "Managing Director at Winning Adventure Global, helping Australian businesses source quality products from China with factory verification and procurement services.",
    "url": "https://www.winningadventure.com.au/about",
    "worksFor": {
      "@type": "Organization",
      "name": "Winning Adventure Global",
      "url": "https://www.winningadventure.com.au"
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
