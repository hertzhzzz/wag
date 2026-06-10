import { NextResponse } from "next/server";

export function GET() {
  return new NextResponse("Gone", {
    status: 410,
    headers: { "Content-Type": "text/plain" },
  });
}

export const dynamic = "force-static";
