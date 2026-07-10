import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("target");

  if (!target) {
    return NextResponse.json({ error: "Missing target URL" }, { status: 400 });
  }

  try {
    const response = await fetch(target, {
      headers: {
        Accept: "application/json",
      },
    });

    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to reach target" }, { status: 502 });
  }
}
