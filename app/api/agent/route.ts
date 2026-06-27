import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Market research does live web search and can take a while.
export const maxDuration = 120;

const AGENT_SERVICE_URL =
  process.env.AGENT_SERVICE_URL || "http://127.0.0.1:8001";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${AGENT_SERVICE_URL}/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: body.messages ?? [] }),
      // Give the web-search-grounded tool plenty of time.
      signal: AbortSignal.timeout(110_000),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Agent service error (${res.status}): ${text}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to reach the agent service";
    return NextResponse.json(
      {
        error: message,
        hint: "Is the Python agent running? Start it with `npm run agent`.",
      },
      { status: 500 }
    );
  }
}
