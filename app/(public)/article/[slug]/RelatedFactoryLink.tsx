"use client"

import Link from "next/link"
import { trackFactoryLinkClick } from "@/lib/analytics"

export function RelatedFactoryLink({
  slug,
  name,
  articleSlug,
}: {
  slug: string
  name: string
  articleSlug: string
}) {
  return (
    <Link
      href={`/factory/${slug}`}
      onClick={() => trackFactoryLinkClick(articleSlug, slug)}
      className="block bg-navy/3 rounded-lg p-3.5 hover:bg-navy/8 transition border border-navy/10"
    >
      <div className="text-xs text-gray-400 mb-0.5">Verified Factory</div>
      <div className="text-sm font-medium text-navy leading-snug">{name}</div>
    </Link>
  )
}
