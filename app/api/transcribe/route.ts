import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const AGENT_SERVICE_URL =
  process.env.AGENT_SERVICE_URL || "http://127.0.0.1:8001";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const res = await fetch(`${AGENT_SERVICE_URL}/transcribe`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(55_000),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Transcription service error (${res.status}): ${text}` },
        { status: 502 }
      );
    }

    return NextResponse.json(await res.json());
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to reach the transcription service";
    return NextResponse.json(
      { error: message, hint: "Is the Python agent running? Start it with `npm run agent`." },
      { status: 500 }
    );
  }
}
