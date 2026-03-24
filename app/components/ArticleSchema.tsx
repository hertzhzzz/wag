'use client'
import { useEffect } from 'react'

interface ArticleSchemaProps {
  title: string
  description: string
  url: string
  author: string
  datePublished: string
  dateModified?: string
  image?: string
  category?: string
}

export default function ArticleSchema({
  title,
  description,
  url,
  author,
  datePublished,
  dateModified,
  image,
  category,
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["Article", "BlogPosting"],
    "headline": title,
    "description": description,
    "url": url,
    "author": {
      "@type": "Person",
      "name": author,
      "jobTitle": "Founder",
      "worksFor": {
        "@type": "Organization",
        "name": "Winning Adventure Global",
        "url": "https://www.winningadventure.com.au"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "Winning Adventure Global",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.winningadventure.com.au/logo.png"
      }
    },
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "articleSection": category,
    "image": image ? {
      "@type": "ImageObject",
      "url": image,
      "width": 1200,
      "height": 630
    } : undefined,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "47",
      "bestRating": "5",
      "worstRating": "1"
    }
  }

  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return null
}
