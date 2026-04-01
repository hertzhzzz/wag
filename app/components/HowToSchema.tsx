interface HowToStep {
  name: string
  text: string
  url?: string
}

interface HowToSchemaProps {
  name: string
  description: string
  image?: string
  steps: HowToStep[]
}

export default function HowToSchema({
  name,
  description,
  image,
  steps,
}: HowToSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "image": image ? {
      "@type": "ImageObject",
      "url": image,
      "width": 1200,
      "height": 630,
    } : undefined,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      "url": step.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
