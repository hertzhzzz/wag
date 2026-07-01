import { buildServiceSchema, type ServiceSchemaInput } from '@/lib/schema'

export default function ServiceSchema(props: ServiceSchemaInput) {
  const schema = buildServiceSchema(props)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
