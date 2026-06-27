import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const AGENT_SERVICE_URL =
  process.env.AGENT_SERVICE_URL || "http://127.0.0.1:8001";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${AGENT_SERVICE_URL}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: body.messages ?? [] }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Plan service error (${res.status}): ${text}` },
        { status: 502 }
      );
    }
    return NextResponse.json(await res.json());
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to reach the agent service";
    return NextResponse.json(
      { error: message, hint: "Is the Python agent running? Start it with `npm run agent`." },
      { status: 500 }
    );
  }
}
