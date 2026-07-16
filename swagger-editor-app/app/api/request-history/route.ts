import { NextRequest, NextResponse } from 'next/server';
import {
  getRequestHistoryEntries,
  saveRequestHistoryEntry,
  getTokenFromRequest,
} from './history-store';

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entry = await request.json();
    saveRequestHistoryEntry(token, entry);

    return NextResponse.json({ success: true, count: getRequestHistoryEntries(token).length }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to save request history' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entries = getRequestHistoryEntries(token);

    return NextResponse.json({ success: true, count: entries.length, entries }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to retrieve request history' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: 'Request history cleared' }, { status: 200 });
    response.cookies.delete("swagger-auth-token");
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to clear request history' }, { status: 500 });
  }
}
