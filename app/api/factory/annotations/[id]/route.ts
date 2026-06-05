import { NextRequest, NextResponse } from "next/server"
import { updateAnnotation } from "@/lib/factory-annotations"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, aiAnalysis, scriptFix, fixCommit } = body

    const updated = await updateAnnotation(id, { status, aiAnalysis, scriptFix, fixCommit })
    if (!updated) {
      return NextResponse.json(
        { error: "Annotation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ annotation: updated })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update annotation" },
      { status: 500 }
    )
  }
}
