import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hasAccessKey: Boolean(process.env.FACTORY_ACCESS_KEY),
    accessKeyLength: (process.env.FACTORY_ACCESS_KEY || "").length,
    hasAuthToken: Boolean(process.env.FACTORY_AUTH_TOKEN),
  })
}
