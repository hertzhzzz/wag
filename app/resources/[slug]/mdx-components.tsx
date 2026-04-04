import Link from 'next/link'
import { slugify } from './string-utils'
import { FAQ } from './FAQ'
import type { TipProps, InlineCTAProps } from './types'

// ============================================
// MDX CUSTOM COMPONENTS
// ============================================

export function Tip({ children }: TipProps) {
  return (
    <div className="bg-[#f8f9fb] border border-gray-200 p-5 my-6">
      <p className="text-sm font-semibold text-[#0F2D5E] mb-1">What to do</p>
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  )
}

export function InlineCTA({ ctaTitle, ctaText, ctaButtonText }: InlineCTAProps) {
  return (
    <div className="my-10 bg-[#f8f9fb] border-l-4 border-[#F59E0B] p-6">
      <p className="text-sm font-semibold text-[#0F2D5E] mb-1">{ctaTitle}</p>
      <p className="text-sm text-gray-600 mb-4">{ctaText}</p>
      <Link
        href="/enquiry"
        className="inline-block bg-[#0F2D5E] text-white text-sm font-semibold px-6 py-3 hover:bg-[#F59E0B] hover:text-[#0F2D5E] transition-colors"
      >
        {ctaButtonText}
      </Link>
    </div>
  )
}

export function EnhancedTip({ children, title = 'Pro Tip' }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="bg-gradient-to-r from-[#0F2D5E]/5 to-transparent border-l-4 border-[#F59E0B] p-5 my-6 rounded-r-lg">
      <p className="text-xs font-bold tracking-wider text-[#F59E0B] uppercase mb-2">{title}</p>
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  )
}

// ============================================
// HELPER FACTORIES
// ============================================

function createHeadingComponent(level: 2 | 3) {
  const className = level === 2
    ? 'font-serif text-2xl font-bold text-[#0F2D5E] mb-4 mt-12 scroll-mt-20'
    : 'font-serif text-xl font-bold text-[#0F2D5E] mb-3 mt-8 scroll-mt-20'
  const Tag = `h${level}` as 'h2' | 'h3'

  return function Heading({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { children?: React.ReactNode }) {
    const id = slugify(String(children))
    return <Tag id={id} className={className} {...props}>{children}</Tag>
  }
}

function createListComponent(type: 'ul' | 'ol') {
  const baseClass = type === 'ul'
    ? 'list-disc pl-6 mb-4 space-y-2 text-gray-700'
    : 'list-decimal pl-6 mb-4 space-y-2 text-gray-700'

  return function List(props: React.HTMLAttributes<HTMLUListElement> & { children?: React.ReactNode }) {
    return type === 'ul'
      ? <ul className={baseClass} {...props} />
      : <ol className={baseClass} {...props} />
  }
}

// ============================================
// MDX COMPONENTS FACTORY
// ============================================

export function createMdxComponents(ctaTitle: string, ctaText: string, ctaButtonText: string) {
  return {
    // Custom components
    Tip,
    InlineCTA: () => <InlineCTA ctaTitle={ctaTitle} ctaText={ctaText} ctaButtonText={ctaButtonText} />,
    FAQ,
    EnhancedTip,

    // Heading overrides
    h2: createHeadingComponent(2),
    h3: createHeadingComponent(3),

    // Text element overrides
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="text-gray-700 leading-relaxed mb-4" {...props} />
    ),
    li: (props: React.HTMLAttributes<HTMLLIElement>) => (
      <li className="text-gray-700 leading-relaxed" {...props} />
    ),
    ul: createListComponent('ul'),
    ol: createListComponent('ol'),

    // Table element overrides
    table: (props: React.HTMLAttributes<HTMLTableElement>) => (
      <table className="w-full border-collapse my-6 table-auto" {...props} />
    ),
    thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
      <thead className="bg-[#0F2D5E] text-white" {...props} />
    ),
    tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
      <tbody className="bg-white" {...props} />
    ),
    tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
      <tr className="border-b border-gray-200" {...props} />
    ),
    th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold" {...props} />
    ),
    td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
      <td className="border border-gray-200 px-4 py-3 text-sm" {...props} />
    ),

    // Inline element overrides
    sup: (props: React.HTMLAttributes<HTMLElement>) => (
      <sup className="text-[#F59E0B] font-semibold cursor-pointer" {...props} />
    ),
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a className="text-[#0F2D5E] underline hover:text-[#F59E0B] transition-colors" {...props} />
    ),
    blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote className="border-l-4 border-[#F59E0B] pl-4 my-4 italic text-gray-600" {...props} />
    ),
  }
}
