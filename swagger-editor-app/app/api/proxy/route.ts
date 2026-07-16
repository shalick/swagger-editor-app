import { NextRequest, NextResponse } from "next/server";

async function proxyRequest(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("target");

  if (!target) {
    return NextResponse.json({ error: "Missing target URL" }, { status: 400 });
  }

  try {
    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("content-length");

    const method = request.method.toUpperCase();
    const init: RequestInit = {
      method,
      headers,
      redirect: "manual",
    };

    if (!['GET', 'HEAD'].includes(method)) {
      const body = await request.text();
      if (body) {
        init.body = body;
      }
    }

    const response = await fetch(target, init);
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: response.headers,
    });
  } catch {
    return NextResponse.json({ error: "Unable to reach target" }, { status: 502 });
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request);
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request);
}

export async function OPTIONS(request: NextRequest) {
  return proxyRequest(request);
}

export async function HEAD(request: NextRequest) {
  return proxyRequest(request);
}
