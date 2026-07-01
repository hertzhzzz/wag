import { buildArticleSchema, type ArticleSchemaInput } from '@/lib/schema'

export default function ArticleSchema(props: ArticleSchemaInput) {
  const schema = buildArticleSchema(props)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
