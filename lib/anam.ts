/**
 * Anam agent provisioning (server-side only).
 *
 * Creates the Hakim AI avatar + persona once, on first use, and persists the
 * resulting ids to `anam-agent.json` so they are reused on every later run.
 *
 * The persona is created with `llmId: "CUSTOMER_CLIENT_V1"` which disables
 * Anam's built-in brain. We drive the conversation ourselves (client-side
 * custom LLM) so that the structured market-research output can be rendered in
 * the browser. Anam supplies only the face + voice.
 */

import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

const ANAM_BASE = "https://api.anam.ai";
const AGENT_FILE = path.join(process.cwd(), "anam-agent.json");
const SOURCE_IMAGE = path.join(process.cwd(), "public", "hakim.png");
export const AVATAR_MODEL = "cara-4";

export type AnamAgent = {
  avatarId: string;
  voiceId: string;
  personaId: string;
  createdAt: string;
  avatarIsFallback?: boolean;
};

export const HAKIM_PERSONA_DESCRIPTION =
  "Hakim AI, a bilingual (Arabic & English) market-research advisor that helps local entrepreneurs in the UAE decide what to build, sell, or focus on using real, cited data.";

// Stored on the persona record for completeness. At runtime the brain is
// client-driven (CUSTOMER_CLIENT_V1), so the live system prompt lives in the
// Python agent service instead.
export const HAKIM_SYSTEM_PROMPT = `You are Hakim AI, a warm, confident bilingual market-research advisor for local entrepreneurs in the United Arab Emirates. You speak fluent UAE Arabic and English, and you always reply in the same language the user used. You help people decide what to build, what to sell, and where to focus, using a market-research tool that returns real, web-grounded UAE data. Always ground your answers in that data and make clear that the sources are shown on screen. Keep spoken answers concise and conversational.`;

function apiKey(): string {
  const key = process.env.ANAM_API_KEY;
  if (!key) {
    throw new Error("ANAM_API_KEY is not set. Add it to your .env file.");
  }
  return key;
}

async function readAgentFile(): Promise<AnamAgent | null> {
  try {
    const raw = await fs.readFile(AGENT_FILE, "utf8");
    const data = JSON.parse(raw) as AnamAgent;
    if (data?.avatarId && data?.voiceId && data?.personaId) return data;
    return null;
  } catch {
    return null;
  }
}

/** Compress public/hakim.png to a JPEG comfortably under Anam's 4.5MB limit. */
async function compressedSourceImage(): Promise<Buffer> {
  return sharp(SOURCE_IMAGE)
    .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toBuffer();
}

async function createAvatar(key: string): Promise<{ id: string; fallback: boolean }> {
  const jpeg = await compressedSourceImage();

  const form = new FormData();
  form.append("displayName", "Hakim AI");
  form.append("avatarModel", AVATAR_MODEL);
  form.append(
    "imageFile",
    new Blob([new Uint8Array(jpeg)], { type: "image/jpeg" }),
    "hakim.jpg"
  );

  const res = await fetch(`${ANAM_BASE}/v1/avatars`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });

  if (res.ok) {
    const data = (await res.json()) as { id: string };
    return { id: data.id, fallback: false };
  }

  // Custom one-shot avatars can require an enterprise plan (403) or the image
  // may be unprocessable (422). Fall back to a stock avatar so the demo works.
  if (res.status === 403 || res.status === 422) {
    const stockId = await pickStockAvatar(key);
    console.warn(
      `[anam] Custom avatar creation returned ${res.status}; falling back to stock avatar ${stockId}.`
    );
    return { id: stockId, fallback: true };
  }

  const body = await res.text();
  throw new Error(`Anam create-avatar failed (${res.status}): ${body}`);
}

async function listJson(key: string, pathname: string): Promise<unknown[]> {
  const res = await fetch(`${ANAM_BASE}${pathname}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    throw new Error(`Anam GET ${pathname} failed (${res.status}): ${await res.text()}`);
  }
  const json = await res.json();
  if (Array.isArray(json)) return json;
  if (Array.isArray((json as { data?: unknown[] }).data)) return (json as { data: unknown[] }).data;
  if (Array.isArray((json as { voices?: unknown[] }).voices)) return (json as { voices: unknown[] }).voices;
  if (Array.isArray((json as { avatars?: unknown[] }).avatars)) return (json as { avatars: unknown[] }).avatars;
  return [];
}

async function pickStockAvatar(key: string): Promise<string> {
  const avatars = (await listJson(key, "/v1/avatars")) as Array<{ id: string }>;
  if (!avatars.length) throw new Error("No avatars available to fall back to.");
  return avatars[0].id;
}

// Preferred male voices by name, most "normal / natural" first. The account's
// voice catalog is mostly English (Cartesia); there is no native Arabic male
// voice available, so Arabic will carry a light accent. Override with
// ANAM_VOICE_ID in .env to force a specific voice.
const PREFERRED_MALE_VOICES = ["Cooper", "Laurent", "Corey", "Archie"];

/** Pick a natural-sounding male voice (overridable via ANAM_VOICE_ID). */
async function pickMaleVoice(key: string): Promise<string> {
  const override = process.env.ANAM_VOICE_ID;
  if (override) return override;

  const voices = (await listJson(key, "/v1/voices")) as Array<{
    id: string;
    name?: string;
    displayName?: string;
    gender?: string | null;
  }>;
  if (!voices.length) throw new Error("No voices available.");

  const nameOf = (v: { name?: string; displayName?: string }) =>
    (v.name || v.displayName || "").toLowerCase();
  const males = voices.filter((v) => (v.gender || "").toUpperCase() === "MALE");
  for (const preferred of PREFERRED_MALE_VOICES) {
    const match = males.find((v) => nameOf(v).includes(preferred.toLowerCase()));
    if (match) return match.id;
  }
  return males[0]?.id || voices[0].id;
}

async function createPersona(
  key: string,
  avatarId: string,
  voiceId: string
): Promise<string> {
  const res = await fetch(`${ANAM_BASE}/v1/personas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      name: "Hakim AI",
      description: HAKIM_PERSONA_DESCRIPTION,
      avatarId,
      avatarModel: AVATAR_MODEL,
      voiceId,
      // Disable Anam's brain; we drive the conversation client-side.
      llmId: "CUSTOMER_CLIENT_V1",
      systemPrompt: HAKIM_SYSTEM_PROMPT,
    }),
  });

  if (!res.ok) {
    throw new Error(`Anam create-persona failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { id: string };
  return data.id;
}

async function createAgent(): Promise<AnamAgent> {
  const key = apiKey();
  console.log("[anam] Creating Hakim AI avatar from public/hakim.png ...");
  const avatar = await createAvatar(key);
  console.log("[anam] Selecting a male voice ...");
  const voiceId = await pickMaleVoice(key);
  console.log("[anam] Creating Hakim AI persona ...");
  const personaId = await createPersona(key, avatar.id, voiceId);

  const agent: AnamAgent = {
    avatarId: avatar.id,
    voiceId,
    personaId,
    createdAt: new Date().toISOString(),
    avatarIsFallback: avatar.fallback,
  };
  await fs.writeFile(AGENT_FILE, JSON.stringify(agent, null, 2));
  console.log(`[anam] Saved agent ids to anam-agent.json`);
  return agent;
}

/**
 * Re-create the persona on the existing avatar with a freshly-picked voice and
 * rewrite anam-agent.json. Use this to change Hakim's voice without paying for a
 * new avatar. Returns the updated agent record.
 */
export async function reprovisionPersona(): Promise<AnamAgent> {
  const key = apiKey();
  const existing = await readAgentFile();
  if (!existing) {
    // Nothing to reuse; do a full first-time provision instead.
    return createAgent();
  }
  const voiceId = await pickMaleVoice(key);
  const personaId = await createPersona(key, existing.avatarId, voiceId);
  const agent: AnamAgent = {
    ...existing,
    voiceId,
    personaId,
    createdAt: new Date().toISOString(),
  };
  await fs.writeFile(AGENT_FILE, JSON.stringify(agent, null, 2));
  console.log(`[anam] Re-provisioned persona ${personaId} with voice ${voiceId}.`);
  return agent;
}

// In-memory guard so concurrent first-run requests don't create duplicates.
let pending: Promise<AnamAgent> | null = null;

/** Return the stored agent, creating it (avatar + persona) on first use. */
export async function ensureAgent(): Promise<AnamAgent> {
  const existing = await readAgentFile();
  if (existing) return existing;
  if (!pending) {
    pending = createAgent().finally(() => {
      pending = null;
    });
  }
  return pending;
}
