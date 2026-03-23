'use client'

/* TODO: Replace with actual client testimonials */

const reviews = [
  {
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "5",
      "bestRating": "5"
    },
    "author": {
      "@type": "Person",
      "name": "James Mitchell"
    },
    "reviewBody": "WAG helped us verify and onboard 3 suppliers in Shenzhen. The factory tour experience was invaluable.",
    "itemReviewed": {
      "@type": "Service",
      "name": "China Factory Tour",
      "provider": {
        "@type": "Organization",
        "name": "Winning Adventure Global"
      }
    }
  },
  {
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "5",
      "bestRating": "5"
    },
    "author": {
      "@type": "Person",
      "name": "Sarah Chen"
    },
    "reviewBody": "Professional, thorough, and incredibly helpful. They removed all the guesswork from our first China sourcing trip.",
    "itemReviewed": {
      "@type": "Service",
      "name": "Bulk Purchase Procurement Trip",
      "provider": {
        "@type": "Organization",
        "name": "Winning Adventure Global"
      }
    }
  }
]

export default function ReviewSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": reviews
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
