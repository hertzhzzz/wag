import { cookies, headers } from "next/headers"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { readFileSync } from "fs"
import { join } from "path"
import matter from "gray-matter"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import Image from "next/image"

import {
  getClientConfig,
  getProjectConfig,
  getReportPrevNext,
  slugify,
  getDeliverableTypeLabel,
} from "@/lib/clients"
import { logAccess } from "@/lib/access-log"
import { FeedbackForm } from "./FeedbackForm"
import { ReportTOC } from "./ReportTOC"
import { Sidebar } from "@/client/Sidebar"
import type { ExtendedDeliverable } from "@/lib/clients"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReportFrontmatter {
  title: string
  date?: string
  author?: string
  report_number?: string
  supplier?: string
  category?: string
  project?: string
  status?: string
  [key: string]: unknown
}

interface Heading {
  level: number
  text: string
  id: string
}

// ---------------------------------------------------------------------------
// MDX helpers
// ---------------------------------------------------------------------------

function extractHeadings(mdx: string): Heading[] {
  const headings: Heading[] = []
  const regex = /^(#{2,4})\s+(.+)$/gm
  let match: RegExpExecArray | null
  while ((match = regex.exec(mdx)) !== null) {
    const level = match[1].length
    const text = match[2].replace(/<[^>]*>/g, "").trim()
    const id = slugify(text)
    headings.push({ level, text, id })
  }
  return headings
}

function readReport(slug: string, id: string): {
  content: string
  frontmatter: ReportFrontmatter
  headings: Heading[]
} | null {
  try {
    const filePath = join(
      process.cwd(),
      "content/reports",
      slug,
      `${id}.mdx`,
    )
    const raw = readFileSync(filePath, "utf-8")
    const { data, content } = matter(raw)
    const headings = extractHeadings(content)
    return {
      content,
      frontmatter: data as ReportFrontmatter,
      headings,
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Custom MDX components
// ---------------------------------------------------------------------------

function Figure({
  src,
  alt,
  caption,
  number,
}: {
  src: string
  alt: string
  caption: string
  number: number
}) {
  const publicPath = src.startsWith("/") ? src : `/${src}`
  return (
    <figure className="my-8">
      <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        <Image
          src={publicPath}
          alt={alt}
          width={800}
          height={500}
          className="object-contain w-full"
          sizes="(max-width: 768px) 100vw, 700px"
          unoptimized
          loading="lazy"
        />
      </div>
      <figcaption className="text-sm text-gray-500 mt-2 text-center">
        Figure {number}: {caption}
      </figcaption>
    </figure>
  )
}

function Footnote({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  const noteId = `fn-${id}`
  return (
    <sup className="relative group" id={`fn-ref-${id}`}>
      <a
        href={`#${noteId}`}
        className="cursor-help text-amber-600 font-bold text-xs no-underline hover:text-amber-700"
        aria-describedby={noteId}
      >
        [{id}]
      </a>
      <span
        id={noteId}
        role="tooltip"
        className="invisible group-hover:visible group-focus-within:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-72"
      >
        <span className="block bg-navy text-white text-xs rounded-lg p-3 leading-relaxed shadow-lg">
          {children}
        </span>
        <span className="block w-2 h-2 bg-navy rotate-45 mx-auto -mt-1" />
      </span>
    </sup>
  )
}

function createMdxComponents() {
  return {
    Figure,
    Footnote,
    h2: ({
      children,
      id,
      ...props
    }: React.HTMLAttributes<HTMLHeadingElement> & {
      children?: React.ReactNode
    }) => {
      const text = typeof children === "string" ? children : ""
      const anchorId = id || slugify(text)
      return (
        <h2
          id={anchorId}
          className="font-serif text-xl font-bold text-navy mt-10 mb-4 scroll-mt-24"
          {...props}
        >
          {children}
        </h2>
      )
    },
    h3: ({
      children,
      id,
      ...props
    }: React.HTMLAttributes<HTMLHeadingElement> & {
      children?: React.ReactNode
    }) => {
      const text = typeof children === "string" ? children : ""
      const anchorId = id || slugify(text)
      return (
        <h3
          id={anchorId}
          className="font-serif text-lg font-semibold text-navy mt-6 mb-3 scroll-mt-24"
          {...props}
        >
          {children}
        </h3>
      )
    },
    h4: ({
      children,
      id,
      ...props
    }: React.HTMLAttributes<HTMLHeadingElement> & {
      children?: React.ReactNode
    }) => {
      const text = typeof children === "string" ? children : ""
      const anchorId = id || slugify(text)
      return (
        <h4
          id={anchorId}
          className="font-serif text-base font-semibold text-navy mt-4 mb-2 scroll-mt-24"
          {...props}
        >
          {children}
        </h4>
      )
    },
    table: (props: React.HTMLAttributes<HTMLTableElement>) => (
      <div className="overflow-x-auto my-6">
        <table
          className="min-w-full text-sm border-collapse"
          {...props}
        />
      </div>
    ),
    th: (props: React.HTMLAttributes<HTMLTableHeaderCellElement>) => (
      <th
        className="bg-gray-50 text-left px-4 py-2.5 font-medium text-gray-600 text-xs uppercase tracking-wide border border-gray-200"
        {...props}
      />
    ),
    td: (props: React.HTMLAttributes<HTMLTableDataCellElement>) => (
      <td
        className="px-4 py-2.5 border border-gray-200 text-gray-700"
        {...props}
      />
    ),
    hr: () => <hr className="my-8 border-gray-200" />,
    blockquote: (props: React.HTMLAttributes<HTMLElement>) => (
      <blockquote
        className="border-l-4 border-amber-400 bg-amber-50/50 pl-4 py-2 my-6 text-gray-700 italic"
        {...props}
      />
    ),
    a: (props: React.HTMLAttributes<HTMLAnchorElement>) => (
      <a
        className="text-amber-700 hover:text-amber-800 underline underline-offset-2"
        {...props}
      />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="text-gray-800 leading-relaxed mb-4" {...props} />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
      <ul className="list-disc list-inside space-y-1 mb-4 text-gray-800" {...props} />
    ),
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
      <ol className="list-decimal list-inside space-y-1 mb-4 text-gray-800" {...props} />
    ),
    li: (props: React.HTMLAttributes<HTMLLIElement>) => (
      <li className="text-gray-800" {...props} />
    ),
    strong: (props: React.HTMLAttributes<HTMLElement>) => (
      <strong className="font-semibold text-navy" {...props} />
    ),
    code: (props: React.HTMLAttributes<HTMLElement>) => (
      <code
        className="bg-gray-100 text-navy text-xs px-1.5 py-0.5 rounded"
        {...props}
      />
    ),
    pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
      <pre
        className="bg-gray-900 text-gray-100 text-sm rounded-lg p-4 overflow-x-auto my-6"
        {...props}
      />
    ),
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ReportHeader({ frontmatter }: { frontmatter: ReportFrontmatter }) {
  return (
    <header className="mb-8 pb-6 border-b border-gray-200">
      {frontmatter.report_number && (
        <p className="text-xs font-bold tracking-widest uppercase text-amber-600 mb-2">
          {frontmatter.report_number}
        </p>
      )}
      <h1 className="font-serif text-2xl font-bold text-navy leading-tight">
        {frontmatter.title}
      </h1>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {frontmatter.date && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="1" y="2" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M1 5h12" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {frontmatter.date}
          </span>
        )}
        {frontmatter.author && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M1 13c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {frontmatter.author}
          </span>
        )}
        {frontmatter.supplier && (
          <span className="flex items-center gap-1">
            Supplier: {frontmatter.supplier}
          </span>
        )}
        {frontmatter.category && (
          <span className="flex items-center gap-1">
            {frontmatter.category}
          </span>
        )}
      </div>
    </header>
  )
}

function ReportNavigation({
  prev,
  next,
  clientSlug,
  projectSlug,
}: {
  prev: ExtendedDeliverable | null
  next: ExtendedDeliverable | null
  clientSlug: string
  projectSlug: string
}) {
  return (
    <nav className="mt-12 pt-6 border-t border-gray-200 flex items-center justify-between">
      <div>
        {prev && prev.report_id && (
          <Link
            href={`/client/${clientSlug}/${projectSlug}/reports/${prev.report_id}`}
            className="group flex items-center gap-2 text-sm"
          >
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-navy transition"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 3l-5 5 5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-left">
              <p className="text-xs text-gray-400">Previous</p>
              <p className="text-navy group-hover:underline font-medium truncate max-w-[200px]">
                {prev.title}
              </p>
            </div>
          </Link>
        )}
      </div>
      <div className="text-center">
        <Link
          href={`/client/${clientSlug}/${projectSlug}`}
          className="text-xs text-gray-400 hover:text-navy transition"
        >
          Back to Dashboard
        </Link>
      </div>
      <div>
        {next && next.report_id && (
          <Link
            href={`/client/${clientSlug}/${projectSlug}/reports/${next.report_id}`}
            className="group flex items-center gap-2 text-sm text-right"
          >
            <div>
              <p className="text-xs text-gray-400">Next</p>
              <p className="text-navy group-hover:underline font-medium truncate max-w-[200px]">
                {next.title}
              </p>
            </div>
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-navy transition"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </div>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ slug: string; project: string; id: string }>
}) {
  const { slug: clientSlug, project: projectSlug, id: reportId } =
    await params

  // Auth check
  const cookieStore = await cookies()
  const authCookie = cookieStore.get(`client_auth_${clientSlug}`)
  if (!authCookie?.value) {
    redirect(`/client/${clientSlug}`)
  }

  // Verify project exists
  const project = getProjectConfig(clientSlug, projectSlug)
  if (!project) notFound()

  // Read MDX
  const report = readReport(clientSlug, reportId)
  if (!report) notFound()

  // Prev/next navigation
  const { prev, next } = getReportPrevNext(clientSlug, projectSlug, reportId)

  // Log access
  try {
    const headersList = await headers()
    logAccess(
      clientSlug,
      projectSlug,
      `/client/${clientSlug}/${projectSlug}/reports/${reportId}`,
      headersList.get("user-agent") || "",
    )
  } catch {
    // silent
  }

  const mdxComponents = createMdxComponents()
  const client = getClientConfig(clientSlug)
  const deliverables = ((project.deliverables || []) as ExtendedDeliverable[]).map((d) => ({ id: d.id, title: d.title, report_id: (d as ExtendedDeliverable).report_id ?? null }))

  return (
    <>
      <Sidebar clientSlug={clientSlug} projectSlug={projectSlug} projectName={project.name} clientCompany={client?.client_company || ""} deliverables={deliverables} />
      <div className="p-6 lg:p-8 max-w-6xl">
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href={`/client/${clientSlug}/${projectSlug}`} className="hover:text-navy transition">
            &larr; {project.name}
          </Link>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-[300px]">{report.frontmatter.title}</span>
        </nav>

        <div className="flex gap-8 lg:gap-12">
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <ReportTOC headings={report.headings} />
            </div>
          </aside>

          <main className="flex-1 min-w-0 max-w-[720px]">
            <article>
              <ReportHeader frontmatter={report.frontmatter} />
              <div className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-navy prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-th:bg-gray-50 prose-th:px-4 prose-th:py-2.5 prose-th:text-xs prose-th:font-medium prose-th:uppercase prose-th:tracking-wide prose-td:px-4 prose-td:py-2.5 prose-td:text-sm">
                <MDXRemote source={report.content} components={mdxComponents} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
              </div>
            </article>
            <ReportNavigation prev={prev} next={next} clientSlug={clientSlug} projectSlug={projectSlug} />
            <div className="mt-10 pt-6 border-t border-gray-200">
              <FeedbackForm clientSlug={clientSlug} projectSlug={projectSlug} reportId={reportId} />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
