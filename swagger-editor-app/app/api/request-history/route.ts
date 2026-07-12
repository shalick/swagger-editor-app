import { NextRequest, NextResponse } from 'next/server';

interface RequestHistoryEntry {
  method: string;
  path: string;
  url: string;
  parameters: Record<string, string>;
  request: {
    headers: Record<string, string>;
    body?: string;
  };
  response: {
    status: number;
    headers: Record<string, string>;
    body: string;
  };
  timestamp: string;
}

// In-memory storage (would be replaced with a database in production)
const requestHistory = new Map<string, RequestHistoryEntry[]>();

export async function POST(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);

    // Parse request body
    const entry = await request.json() as RequestHistoryEntry;

    // Store request history
    if (!requestHistory.has(token)) {
      requestHistory.set(token, []);
    }

    const history = requestHistory.get(token)!;
    history.push(entry);

    // Keep only the last 100 requests per user
    if (history.length > 100) {
      history.shift();
    }

    return NextResponse.json(
      { success: true, count: history.length },
      { status: 201 }
    );
  } catch (error) {
    console.error('Request history error:', error);
    return NextResponse.json(
      { error: 'Failed to save request history' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);

    // Retrieve request history
    const history = requestHistory.get(token) || [];

    return NextResponse.json({
      success: true,
      count: history.length,
      entries: history,
    });
  } catch (error) {
    console.error('Request history error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve request history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);

    // Clear request history for this user
    requestHistory.delete(token);

    return NextResponse.json({
      success: true,
      message: 'Request history cleared',
    });
  } catch (error) {
    console.error('Request history error:', error);
    return NextResponse.json(
      { error: 'Failed to clear request history' },
      { status: 500 }
    );
  }
}
