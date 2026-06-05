import { NextRequest, NextResponse } from "next/server"
import { getAnnotations, addAnnotation, analyzePatterns } from "@/lib/factory-annotations"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const analyze = url.searchParams.get("analyze") === "1"

    if (analyze) {
      const patterns = await analyzePatterns()
      const annotations = await getAnnotations()
      const open = annotations.filter((a) => a.status === "open")
      return NextResponse.json({
        patterns,
        summary: {
          total: annotations.length,
          open: open.length,
          analyzed: annotations.filter((a) => a.status === "analyzed").length,
          fixed: annotations.filter((a) => a.status === "script_fixed").length,
          verified: annotations.filter((a) => a.status === "verified").length,
        },
      })
    }

    const annotations = await getAnnotations()
    return NextResponse.json({ annotations })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch annotations" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId, slug, companyName, fieldName, fieldLabel, issueType, expectedValue, actualValue, comment } = body

    if (!memberId || !fieldName) {
      return NextResponse.json(
        { error: "memberId and fieldName are required" },
        { status: 400 }
      )
    }

    const annotation = await addAnnotation({
      memberId,
      slug: slug || memberId,
      companyName: companyName || "",
      fieldName,
      fieldLabel: fieldLabel || fieldName,
      issueType: issueType || "other",
      expectedValue: expectedValue || "",
      actualValue: actualValue || "",
      comment: comment || "",
    })

    return NextResponse.json({ annotation }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create annotation" },
      { status: 500 }
    )
  }
}
