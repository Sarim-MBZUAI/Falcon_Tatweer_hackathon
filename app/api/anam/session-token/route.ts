import { NextResponse } from "next/server";
import { ensureAgent, AVATAR_MODEL } from "@/lib/anam";

// Uses node APIs (fs, sharp) via ensureAgent().
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const agent = await ensureAgent();

    const res = await fetch("https://api.anam.ai/v1/auth/session-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ANAM_API_KEY}`,
      },
      body: JSON.stringify({
        // Stored persona already has llmId CUSTOMER_CLIENT_V1, so the brain is
        // client-driven and we render the structured tool output ourselves.
        personaConfig: { personaId: agent.personaId },
        sessionOptions: {
          videoQuality: "high",
          // Cara 4 landscape resolution for a crisp full-width avatar.
          videoWidth: 1152,
          videoHeight: 768,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json(
        { error: `Anam session-token failed (${res.status}): ${body}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { sessionToken: string };
    return NextResponse.json({
      sessionToken: data.sessionToken,
      avatarModel: AVATAR_MODEL,
      avatarIsFallback: Boolean(agent.avatarIsFallback),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
