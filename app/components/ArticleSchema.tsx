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
      "url": "https://www.winningadventure.com.au/about",
      "worksFor": {
        "@type": "Organization",
        "name": "Winning Adventure Global",
        "url": "https://www.winningadventure.com.au"
      },
      "sameAs": [
        "https://www.linkedin.com/company/winning-adventure-global"
      ]
    },
    "publisher": {
      "@type": "Organization",
      "name": "Winning Adventure Global",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.winningadventure.com.au/logos/logo.png"
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
    } : undefined
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
